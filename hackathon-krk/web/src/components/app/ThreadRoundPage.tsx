"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { DEMO_WORKER_PK } from "@/lib/demo";
import {
  formatRemain,
  gradeRound,
  loadEntries,
  markStarted,
  passers,
  placeOf,
  roundWindow,
  saveEntry,
  threadById,
  topicRating,
  windowOpen,
} from "@/lib/threads";
import { BtnPink, Panel } from "@/components/app/ui";

export function ThreadRoundPage() {
  const params = useParams();
  const threadId = typeof params.id === "string" ? params.id : "";
  const thread = threadById(threadId);
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? DEMO_WORKER_PK.toBase58();
  const round = thread?.round;
  const [draft, setDraft] = useState("");
  const [pasteNote, setPasteNote] = useState("");
  const [detail, setDetail] = useState("");
  const [entries, setEntries] = useState<ReturnType<typeof loadEntries>>([]);
  const [clock, setClock] = useState<ReturnType<typeof roundWindow> | null>(null);
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    if (!round) return;
    setDraft(round.stub);
    setEntries(loadEntries(round.id));
    setClock(roundWindow(round));
    setStartedAt(markStarted(round.id, wallet));
  }, [round, wallet]);
  const open = clock ? windowOpen(clock) : false;
  const rating = thread ? topicRating(wallet, thread.id) : 0;
  const mine = entries.find((entry) => entry.wallet === wallet);
  const ranked = passers(entries);

  function blockInsert(event: { preventDefault: () => void }) {
    event.preventDefault();
    setPasteNote("Paste is blocked. Write the solution in this round.");
  }

  function submit() {
    if (!round || !thread || !clock) return;
    if (!open) {
      setDetail("This window is closed.");
      return;
    }
    const grade = gradeRound(round, draft);
    const timeMs = Math.max(1, Date.now() - (startedAt || clock.opensAt));
    const next = saveEntry(round.id, thread.id, {
      wallet,
      name: "You",
      passed: grade.ok,
      timeMs,
      at: Date.now(),
    });
    setEntries(next);
    setDetail(grade.detail);
  }

  if (!thread || !round) {
    return (
      <Panel>
        <p className="text-sm">This thread is not open.</p>
        <Link href="/app/threads" className="mt-3 inline-block text-sm text-[var(--app-accent)]">
          All threads
        </Link>
      </Panel>
    );
  }

  if (!clock) {
    return <p className="text-sm text-[var(--app-muted)]">Opening the window…</p>;
  }

  const place = placeOf(entries, wallet);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/app/threads" className="text-xs font-medium text-[var(--app-accent)]">
        ← Threads
      </Link>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
          {thread.label} · {round.kind}
        </p>
        <h1 className="app-page-title mt-1.5 text-[2rem] leading-none">{round.title}</h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">
          {open ? `Shared window closes in ${formatRemain(clock.closesAt - Date.now())}` : "Window closed"}
          {" · "}topic rating {rating}
          {mine?.passed && place > 0 ? ` · place ${place} of ${ranked.length}` : ""}
        </p>
        <a
          href={round.source}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-semibold text-[var(--app-accent)]"
        >
          {round.sourceLabel}
        </a>
      </div>

      <Panel>
        <p className="text-sm leading-relaxed">{round.prompt}</p>
        <p className="mt-2 text-xs text-[var(--app-muted)]">
          Pico runs {round.fixtures.length} checks from this public task. Place is among people who passed, fastest first. A second pass in a row adds stability. A day without a pass drops the topic rating.
        </p>
      </Panel>

      <Panel>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onPaste={blockInsert}
          onDrop={blockInsert}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
              blockInsert(event);
            }
          }}
          spellCheck={false}
          className="mono min-h-40 w-full rounded-[10px] border border-[var(--app-border)] bg-black/30 p-3 text-[13px] leading-relaxed"
        />
        {pasteNote ? <p className="mt-2 text-sm text-[var(--warn)]">{pasteNote}</p> : null}
        {detail ? <p className="mt-2 text-sm">{detail}</p> : null}
        <BtnPink className="mt-4" disabled={!open} onClick={submit}>
          Run checks
        </BtnPink>
      </Panel>

      <Panel>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
          This window
        </p>
        <ol className="mt-3 space-y-1.5 text-sm">
          {ranked.map((entry, index) => (
            <li key={entry.wallet} className="flex justify-between gap-3">
              <span>
                {index + 1}. {entry.wallet === wallet ? "You" : entry.name}
              </span>
              <span className="tabular-nums text-[var(--app-muted)]">{Math.round(entry.timeMs / 1000)}s</span>
            </li>
          ))}
        </ol>
        {entries.some((entry) => entry.wallet === wallet && !entry.passed) ? (
          <p className="mt-3 text-sm text-[var(--app-muted)]">Your last submit did not pass, so it is off this board.</p>
        ) : null}
      </Panel>
    </div>
  );
}
