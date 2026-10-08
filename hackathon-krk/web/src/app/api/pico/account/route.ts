import { Client } from "pg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AccountRow = {
  wallet: string;
  role?: string;
  avail?: number | string;
  company?: string;
  onboarded?: boolean;
  skills?: unknown;
  updated_at?: string | Date;
};

function dbUrl() {
  const all = [process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL, process.env.POSTGRES_URL_NON_POOLING].filter(
    (v): v is string => !!v
  );
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

function shape(row: AccountRow) {
  return {
    wallet: row.wallet,
    role: row.role === "work" ? "work" : "hire",
    avail: row.avail == null ? 0 : Number(row.avail),
    company: row.company || "",
    onboarded: !!row.onboarded,
    skills: Array.isArray(row.skills) ? row.skills : [],
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
    await client.query(`create table if not exists pico_accounts (
      wallet text primary key,
      role text not null default 'hire',
      avail numeric not null default 0,
      company text not null default '',
      onboarded boolean not null default false,
      skills jsonb not null default '[]'::jsonb,
      updated_at timestamptz not null default now()
    )`);
    await client.query(`alter table pico_accounts add column if not exists skills jsonb not null default '[]'::jsonb`);
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function GET(req: Request) {
  try {
    const wallet = new URL(req.url).searchParams.get("wallet") || "";
    if (wallet.length < 32) return NextResponse.json(null);
    const row = await withDb(async (client) => {
      const q = await client.query<AccountRow>("select * from pico_accounts where wallet = $1", [wallet]);
      return q.rows[0] ? shape(q.rows[0]) : null;
    });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: safeErr(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const patch = (await req.json()) as Partial<AccountRow>;
    const wallet = typeof patch.wallet === "string" ? patch.wallet : "";
    if (wallet.length < 32) return NextResponse.json({ error: "wallet is required" }, { status: 400 });
    const row = await withDb(async (client) => {
      const prevQ = await client.query<AccountRow>("select * from pico_accounts where wallet = $1", [wallet]);
      const prev = prevQ.rows[0];
      const next = shape({
        wallet,
        role: patch.role ?? prev?.role ?? "hire",
        avail: patch.avail ?? prev?.avail ?? 0,
        company: patch.company ?? prev?.company ?? "",
        onboarded: patch.onboarded ?? prev?.onboarded ?? false,
        skills: Array.isArray(patch.skills) ? patch.skills : prev?.skills,
      });
      await client.query(
        `insert into pico_accounts (wallet, role, avail, company, onboarded, skills, updated_at)
         values ($1, $2, $3, $4, $5, $6::jsonb, now())
         on conflict (wallet) do update set
           role = excluded.role,
           avail = excluded.avail,
           company = excluded.company,
           onboarded = excluded.onboarded,
           skills = excluded.skills,
           updated_at = now()`,
        [next.wallet, next.role, next.avail, next.company, next.onboarded, JSON.stringify(next.skills)]
      );
      return next;
    });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: safeErr(e) }, { status: 500 });
  }
}
