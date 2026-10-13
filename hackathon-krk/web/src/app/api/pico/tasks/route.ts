import type { Client } from "pg";
import { NextResponse } from "next/server";
import { TASKS_SCHEMA, inTx, isoOrNull, safeErr, withDb } from "@/lib/db";
import { requireWallet, taskWriteDenied } from "@/lib/auth";

export const dynamic = "force-dynamic";

type TaskRow = {
  id: string;
  title?: string;
  cat?: string;
  reward?: number | string;
  status?: string;
  client_wallet?: string | null;
  worker_wallet?: string | null;
  body?: Record<string, unknown>;
  updated_at?: string | Date;
};

function shape(row: TaskRow) {
  return {
    id: row.id,
    title: row.title || "",
    cat: row.cat || "",
    reward: row.reward == null ? 0 : Number(row.reward),
    status: row.status || "finding",
    client_wallet: row.client_wallet ?? null,
    worker_wallet: row.worker_wallet ?? null,
    body: row.body || {},
    updated_at: isoOrNull(row.updated_at),
  };
}

export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    const rows = await withDb(TASKS_SCHEMA, async (client) => {
      const q = id
        ? await client.query<TaskRow>("select * from pico_tasks where id = $1", [id])
        : await client.query<TaskRow>("select * from pico_tasks order by updated_at desc");
      return q.rows.map(shape);
    });
    if (id) return NextResponse.json(rows[0] || null);
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: safeErr(e) }, { status: 500 });
  }
}

const OPEN = ["finding", "draft"];

// Once a task leaves finding, only its worker_wallet may move it. The client may still complete or cancel it.
// The row lock makes two simultaneous claims resolve one after the other.
async function merge(client: Client, patch: Partial<TaskRow>, signer: string) {
  const prevQ = await client.query<TaskRow>("select * from pico_tasks where id = $1 for update", [patch.id]);
  const denied = taskWriteDenied(prevQ.rows[0] || null, patch, signer);
  if (denied) return { denied, taken: false, row: null };
  const prev: Partial<TaskRow> = prevQ.rows[0] || {};
  const held = !!prev.status && !OPEN.includes(prev.status) && !!prev.worker_wallet;
  const other = !!patch.worker_wallet && patch.worker_wallet !== prev.worker_wallet;
  if (held && other && patch.status !== "completed" && patch.status !== "cancelled") {
    return { denied: null, taken: true, row: shape(prev as TaskRow) };
  }
  const prevBody = prev.body && typeof prev.body === "object" ? prev.body : {};
  const patchBody = patch.body && typeof patch.body === "object" ? patch.body : {};
  let status = patch.status ?? prev.status ?? "finding";
  const late = ["review", "verification", "revision", "dispute", "completed", "cancelled"];
  const early = ["finding", "draft", "assigned", "progress"];
  if (prev.status && late.includes(prev.status) && early.includes(status)) status = prev.status;
  if ((prev.status === "completed" || prev.status === "cancelled") && status !== prev.status) status = prev.status;
  const next = shape({
    id: patch.id as string,
    title: patch.title ?? prev.title ?? "",
    cat: patch.cat ?? prev.cat ?? "",
    reward: patch.reward ?? prev.reward ?? 0,
    status,
    client_wallet: prev.client_wallet || patch.client_wallet || signer,
    worker_wallet: patch.worker_wallet || prev.worker_wallet || null,
    body: { ...prevBody, ...patchBody },
  });
  await client.query(
    `insert into pico_tasks (id, title, cat, reward, status, client_wallet, worker_wallet, body, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, now())
     on conflict (id) do update set
       title = excluded.title,
       cat = excluded.cat,
       reward = excluded.reward,
       status = excluded.status,
       client_wallet = excluded.client_wallet,
       worker_wallet = excluded.worker_wallet,
       body = excluded.body,
       updated_at = now()`,
    [next.id, next.title, next.cat, next.reward, next.status, next.client_wallet, next.worker_wallet, JSON.stringify(next.body)]
  );
  return { denied: null, taken: false, row: next };
}

export async function POST(req: Request) {
  try {
    const patch = (await req.json()) as Partial<TaskRow>;
    if (!patch.id || typeof patch.id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const auth = requireWallet(req);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
    const out = await withDb(TASKS_SCHEMA, (client) => inTx(client, () => merge(client, patch, auth.wallet)));
    if (out.denied) return NextResponse.json({ error: out.denied }, { status: 403 });
    if (out.taken) return NextResponse.json({ error: "taken", row: out.row }, { status: 409 });
    return NextResponse.json(out.row);
  } catch (e) {
    return NextResponse.json({ error: safeErr(e) }, { status: 500 });
  }
}
