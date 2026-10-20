import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { dbUrl, safeErr, withDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/*
  Pre-launch waitlist.
  POST { email, role: "client" | "worker", interest?, language?, source?: "hero" | "waitlist", consent: true }
    201 → saved
    409 → this email is already on the list
    400 → invalid input
    503 → no database configured in production
    500 → database error

  Storage:
  - POSTGRES_URL set (same env as the rest of the app) → table pico_waitlist, created on first use.
  - No database in local development → a JSON file in the OS temp folder, so the form
    can be tested on localhost. Never used in production.
*/

const WAITLIST_SCHEMA = [
  `create table if not exists pico_waitlist (
    id bigserial primary key,
    email text not null unique,
    role text not null,
    interest text not null default '',
    language text not null default 'en',
    source text not null default 'waitlist',
    consent boolean not null default false,
    created_at timestamptz not null default now()
  )`,
  // Block access through the public Supabase API; the server connects directly to Postgres.
  `alter table pico_waitlist enable row level security`,
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LANGUAGES = new Set(["en", "es", "pl", "de", "uk"]);
const LOCAL_FILE = path.join(os.tmpdir(), "pico-waitlist.local.json");

type Entry = {
  email: string;
  role: "client" | "worker";
  interest: string;
  language: string;
  source: "hero" | "waitlist";
  consent: true;
  created_at: string;
};

function parse(body: unknown): Entry | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) return null;
  if (b.role !== "client" && b.role !== "worker") return null;
  if (b.consent !== true) return null;
  return {
    email,
    role: b.role,
    interest: typeof b.interest === "string" ? b.interest.trim().slice(0, 160) : "",
    language: typeof b.language === "string" && LANGUAGES.has(b.language) ? b.language : "en",
    source: b.source === "hero" ? "hero" : "waitlist",
    consent: true,
    created_at: new Date().toISOString(),
  };
}

async function saveLocal(entry: Entry) {
  let list: Entry[] = [];
  try {
    list = JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    list = [];
  }
  if (list.some((item) => item.email === entry.email)) return "duplicate" as const;
  list.push(entry);
  await fs.writeFile(LOCAL_FILE, JSON.stringify(list, null, 2));
  return "saved" as const;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const entry = parse(body);
  if (!entry) return NextResponse.json({ error: "Invalid waitlist entry" }, { status: 400 });

  try {
    if (!dbUrl()) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Waitlist storage is not configured" }, { status: 503 });
      }
      const result = await saveLocal(entry);
      return result === "duplicate"
        ? NextResponse.json({ error: "Already on the waitlist" }, { status: 409 })
        : NextResponse.json({ ok: true, storage: "local" }, { status: 201 });
    }

    const inserted = await withDb(WAITLIST_SCHEMA, async (client) => {
      const q = await client.query(
        `insert into pico_waitlist (email, role, interest, language, source, consent)
         values ($1, $2, $3, $4, $5, $6)
         on conflict (email) do nothing
         returning id`,
        [entry.email, entry.role, entry.interest, entry.language, entry.source, entry.consent],
      );
      return q.rowCount === 1;
    });
    return inserted
      ? NextResponse.json({ ok: true }, { status: 201 })
      : NextResponse.json({ error: "Already on the waitlist" }, { status: 409 });
  } catch (e) {
    return NextResponse.json({ error: safeErr(e) }, { status: 500 });
  }
}
