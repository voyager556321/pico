import { NextResponse } from "next/server";
import { ACCOUNTS_SCHEMA, isoOrNull, safeErr, withDb } from "@/lib/db";
import { requireWallet } from "@/lib/auth";

export const dynamic = "force-dynamic";

type AccountRow = {
  wallet: string;
  role?: string;
  avail?: number | string;
  company?: string;
  email?: string;
  onboarded?: boolean;
  skills?: unknown;
  updated_at?: string | Date;
};

function shape(row: AccountRow) {
  return {
    wallet: row.wallet,
    role: row.role === "work" ? "work" : "hire",
    avail: row.avail == null ? 0 : Number(row.avail),
    company: row.company || "",
    email: row.email || "",
    onboarded: !!row.onboarded,
    skills: Array.isArray(row.skills) ? row.skills : [],
    updated_at: isoOrNull(row.updated_at),
  };
}

export async function GET(req: Request) {
  try {
    const wallet = new URL(req.url).searchParams.get("wallet") || "";
    if (wallet.length < 32) return NextResponse.json(null);
    const row = await withDb(ACCOUNTS_SCHEMA, async (client) => {
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
    const auth = requireWallet(req);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (auth.wallet !== wallet) return NextResponse.json({ error: "signer is not this wallet" }, { status: 403 });
    const row = await withDb(ACCOUNTS_SCHEMA, async (client) => {
      const prevQ = await client.query<AccountRow>("select * from pico_accounts where wallet = $1", [wallet]);
      const prev = prevQ.rows[0];
      const next = shape({
        wallet,
        role: patch.role ?? prev?.role ?? "hire",
        avail: patch.avail ?? prev?.avail ?? 0,
        company: patch.company ?? prev?.company ?? "",
        email: patch.email ?? prev?.email ?? "",
        onboarded: patch.onboarded ?? prev?.onboarded ?? false,
        skills: Array.isArray(patch.skills) ? patch.skills : prev?.skills,
      });
      await client.query(
        `insert into pico_accounts (wallet, role, avail, company, email, onboarded, skills, updated_at)
         values ($1, $2, $3, $4, $5, $6, $7::jsonb, now())
         on conflict (wallet) do update set
           role = excluded.role,
           avail = excluded.avail,
           company = excluded.company,
           email = excluded.email,
           onboarded = excluded.onboarded,
           skills = excluded.skills,
           updated_at = now()`,
        [next.wallet, next.role, next.avail, next.company, next.email, next.onboarded, JSON.stringify(next.skills)]
      );
      return next;
    });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: safeErr(e) }, { status: 500 });
  }
}
