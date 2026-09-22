"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { simulate } from "@/domain/workflow/simulate";

export default function ModelPage() {
  const [seed, setSeed] = useState(7);
  const [botCount, setBotCount] = useState(8);
  const [taskCount, setTaskCount] = useState(4);
  const [rounds, setRounds] = useState(3);
  const report = useMemo(
    () => simulate({ seed, botCount, taskCount, rounds }),
    [seed, botCount, taskCount, rounds]
  );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        Pico model
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Симуляція ботів
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Боти самі натискають Enter, якщо рейтинг пускає. Кожен прогін — новий розклад.
        Раунди йдуть по колу: тренування піднімає рівень, далі відкриваються дорожчі задачі.
      </p>

      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSeed((value) => value + 1 + Math.floor(Math.random() * 99));
        }}
      >
        <label className="text-sm">
          <span className="block text-[var(--muted)]">Боти</span>
          <input
            type="number"
            min={2}
            max={24}
            value={botCount}
            onChange={(event) => setBotCount(Number(event.target.value) || 2)}
            className="mt-1 w-20 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="block text-[var(--muted)]">Задачі</span>
          <input
            type="number"
            min={1}
            max={8}
            value={taskCount}
            onChange={(event) => setTaskCount(Number(event.target.value) || 1)}
            className="mt-1 w-20 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="block text-[var(--muted)]">Раунди</span>
          <input
            type="number"
            min={1}
            max={8}
            value={rounds}
            onChange={(event) => setRounds(Number(event.target.value) || 1)}
            className="mt-1 w-20 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Прогнати ще раз
        </button>
        <span className="pb-2 text-sm text-[var(--muted)]">seed {report.seed}</span>
      </form>

      <div className="mt-8 space-y-8">
        {report.rounds.map((round) => (
          <section key={round.index}>
            <h2 className="text-xl font-semibold tracking-tight">
              Раунд {round.index}
            </h2>
            <div className="mt-3 space-y-3">
              {round.tasks.map((task) => (
                <article
                  key={`${round.index}-${task.id}`}
                  className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{task.id}</h3>
                    <p className="text-sm text-[var(--muted)]">
                      {task.kind === "PRACTICE" ? "тренування" : "платна"} · рейтинг{" "}
                      {task.requiredRating}+ · рев’ю {task.reviewerCount}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Натиснули {task.clicks.length} з {task.eligible}
                  </p>
                  {task.clicks.length > 0 ? (
                    <ul className="mt-2 divide-y divide-[var(--border)]">
                      {task.clicks.map((click) => (
                        <li
                          key={click.id}
                          className="flex justify-between gap-3 py-1.5 text-sm"
                        >
                          <span className="font-medium">{click.id}</span>
                          <span className="text-[var(--muted)]">
                            {click.assignment}
                            {click.timeMs != null ? ` · ${click.timeMs} ms` : " · не фініш"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm">Ніхто не натиснув.</p>
                  )}
                  <ul className="mt-3 space-y-1 text-sm leading-relaxed">
                    {task.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Рейтинг:{" "}
              {round.ratings
                .map((bot) => `${bot.id} ${bot.rating} (рів.${bot.level})`)
                .join(" · ")}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm">
        <Link href="/app" className="font-semibold text-[var(--accent)]">
          До app
        </Link>
      </p>
    </main>
  );
}
