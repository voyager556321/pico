"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { DEMO_WORKER_PK } from "@/lib/demo";
import {
  THREADS,
  formatRemain,
  loadNotices,
  loadSubscription,
  pushNotice,
  roundWindow,
  saveSubscription,
  topicRating,
  windowOpen,
  type Channel,
  type ThreadId,
} from "@/lib/threads";
import { Panel } from "@/components/app/ui";

const CHANNELS: { id: Channel; label: string; placeholder: string }[] = [
  { id: "email", label: "Email", placeholder: "you@domain.com" },
  { id: "telegram", label: "Telegram", placeholder: "@handle" },
  { id: "discord", label: "Discord", placeholder: "name" },
];

export function ThreadsPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? DEMO_WORKER_PK.toBase58();
  const [sub, setSub] = useState<ReturnType<typeof loadSubscription>>({
    threads: [],
    channel: "email",
    destination: "",
  });
  const [notices, setNotices] = useState<ReturnType<typeof loadNotices>>([]);
  const [hint, setHint] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSub(loadSubscription());
    setNotices(loadNotices());
    setReady(true);
  }, []);

  function persist(next: typeof sub, thread?: ThreadId, joined?: boolean) {
    saveSubscription(next);
    setSub(next);
    if (joined && thread) {
      const def = THREADS.find((item) => item.id === thread);
      if (!def) return;
      const destination = next.destination.trim();
      const text = destination
        ? `${def.label} round is open: ${def.round.title}. Pico will send this to ${next.channel} ${destination}.`
        : `${def.label} is on. Add an email or a handle so the next open round can reach you.`;
      const notice = pushNotice({
        threadId: thread,
        text,
        channel: next.channel,
        destination,
      });
      setNotices((list) => [notice, ...list].slice(0, 12));
      setHint(text);
    }
  }

  function toggle(thread: ThreadId) {
    const on = sub.threads.includes(thread);
    const threads = on ? sub.threads.filter((id) => id !== thread) : [...sub.threads, thread];
    persist({ ...sub, threads }, thread, !on);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
        Topic rounds
      </p>
      <h1 className="app-page-title mt-1.5 text-[2rem] leading-none">Threads</h1>
      <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-[var(--app-muted)]">
        Each thread runs one public task in a shared window. Pico grades the checks that
        ship with the task and ranks whoever entered. A passed place raises that topic&apos;s
        rating. Expensive tasks in the topic stay closed until the rating is high enough.
      </p>

      <Panel className="mt-6">
        <p className="text-sm font-medium">Where to send a round</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              type="button"
              className={sub.channel === channel.id ? "chip chip-active" : "chip"}
              onClick={() => persist({ ...sub, channel: channel.id })}
            >
              {channel.label}
            </button>
          ))}
        </div>
        <input
          className="mono mt-3 w-full rounded-[10px] border border-[var(--app-border)] bg-black/30 px-3 py-2 text-sm"
          value={sub.destination}
          placeholder={CHANNELS.find((channel) => channel.id === sub.channel)?.placeholder}
          onChange={(event) => persist({ ...sub, destination: event.target.value })}
        />
        {hint ? <p className="mt-3 text-sm leading-relaxed">{hint}</p> : null}
      </Panel>

      <ul className="mt-4 grid gap-3">
        {THREADS.map((thread) => {
          const clock = ready ? roundWindow(thread.round) : null;
          const open = clock ? windowOpen(clock) : false;
          const rating = ready ? topicRating(wallet, thread.id) : 1000;
          const joined = sub.threads.includes(thread.id);
          return (
            <li key={thread.id}>
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold">{thread.label}</p>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">{thread.blurb}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">Rating {rating}</p>
                </div>
                <p className="mt-3 text-sm">
                  {thread.round.title}
                  <span className="text-[var(--app-muted)]">
                    {" "}
                    · {clock && open ? `closes in ${formatRemain(clock.closesAt - Date.now())}` : ready ? "window closed" : "opening"}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/app/threads/${thread.id}`} className="app-cta">
                    Enter round
                  </Link>
                  <button
                    type="button"
                    className={joined ? "chip chip-active" : "chip"}
                    onClick={() => toggle(thread.id)}
                  >
                    {joined ? "Subscribed" : "Subscribe"}
                  </button>
                </div>
              </Panel>
            </li>
          );
        })}
      </ul>

      {notices.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
            Sent to your channel
          </p>
          <ul className="mt-2 space-y-2">
            {notices.map((notice) => (
              <li key={notice.id} className="text-sm leading-relaxed text-[var(--app-muted)]">
                {notice.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
