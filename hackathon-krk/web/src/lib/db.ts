import { Client } from "pg";

/** Pick the pooler URL (the direct db.* host is IPv6-only and Vercel cannot reach it) and drop params pg rejects. */
export function dbUrl() {
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

/** Error message safe to return to clients (connection strings stripped). */
export function safeErr(e: unknown) {
  const msg = e instanceof Error ? e.message : "Database error";
  return msg.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgres://…").slice(0, 300);
}

export function isoOrNull(v: string | Date | undefined | null) {
  return v instanceof Date ? v.toISOString() : v || null;
}

/** Open a client, run the schema statements, run fn, always close. */
export async function withDb<T>(schema: string[], fn: (client: Client) => Promise<T>) {
  const url = dbUrl();
  if (!url) throw new Error("Database is not configured.");
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await client.connect();
  try {
    for (const sql of schema) await client.query(sql);
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

/** Run fn inside begin/commit, rolling back on error. */
export async function inTx<T>(client: Client, fn: () => Promise<T>) {
  await client.query("begin");
  try {
    const out = await fn();
    await client.query("commit");
    return out;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  }
}

export const ACCOUNTS_SCHEMA = [
  `create table if not exists pico_accounts (
    wallet text primary key,
    role text not null default 'hire',
    avail numeric not null default 0,
    company text not null default '',
    onboarded boolean not null default false,
    skills jsonb not null default '[]'::jsonb,
    updated_at timestamptz not null default now()
  )`,
  `alter table pico_accounts add column if not exists skills jsonb not null default '[]'::jsonb`,
  `alter table pico_accounts add column if not exists email text not null default ''`,
];

export const TASKS_SCHEMA = [
  `create table if not exists pico_tasks (
    id text primary key,
    title text not null default '',
    cat text not null default '',
    reward numeric not null default 0,
    status text not null default 'finding',
    client_wallet text,
    worker_wallet text,
    body jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
  )`,
];
