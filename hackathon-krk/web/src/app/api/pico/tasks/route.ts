import { Client } from "pg";
import { NextResponse } from "next/server";

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

function dbUrl() {
  const all = [process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL, process.env.POSTGRES_URL_NON_POOLING].filter(
    (v): v is string => !!v
  );
  // The direct db.* host is IPv6-only. Vercel reaches the pooler.
  const raw = all.find((u) => u.includes("pooler.")) || all[0] || "";
  if (!raw) return "";
  const q = raw.indexOf("?");
  if (q < 0) return raw;
  const params = new URLSearchParams(raw.slice(q + 1));
  for (const key of ["pgbouncer", "connection_limit", "sslmode"]) params.delete(key);
  const rest = params.toString();
  return rest ? raw.slice(0, q) + "?" + rest : raw.slice(0, q);
}

function safeErr(e: unknown) {
  const msg = e instanceof Error ? e.message : "Database error";
  return msg.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgres://…").slice(0, 300);
}

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
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at || null,
  };
}

async function withDb<T>(fn: (client: Client) => Promise<T>) {
  const url = dbUrl();
  if (!url) throw new Error("Database is not configured.");
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await client.connect();
  try {
    await client.query(`create table if not exists pico_tasks (
      id text primary key,
      title text not null default '',
      cat text not null default '',
      reward numeric not null default 0,
      status text not null default 'finding',
      client_wallet text,
      worker_wallet text,
      body jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    )`);
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    const rows = await withDb(async (client) => {
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

export async function POST(req: Request) {
  try {
    const patch = (await req.json()) as Partial<TaskRow>;
    if (!patch.id || typeof patch.id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const row = await withDb(async (client) => {
      const prevQ = await client.query<TaskRow>("select * from pico_tasks where id = $1", [patch.id]);
      const prev = prevQ.rows[0] || {};
      const next = shape({
        id: patch.id as string,
        title: patch.title ?? prev.title ?? "",
        cat: patch.cat ?? prev.cat ?? "",
        reward: patch.reward ?? prev.reward ?? 0,
        status: patch.status ?? prev.status ?? "finding",
        client_wallet: patch.client_wallet ?? prev.client_wallet ?? null,
        worker_wallet: patch.worker_wallet ?? prev.worker_wallet ?? null,
        body: patch.body ?? prev.body ?? {},
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
      return next;
    });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: safeErr(e) }, { status: 500 });
  }
}
