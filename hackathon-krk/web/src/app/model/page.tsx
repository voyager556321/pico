import Link from "next/link";
import { runModelScenarios } from "@/domain/workflow/scenarios";

export const dynamic = "force-dynamic";

export default async function ModelPage() {
  const blocks = await runModelScenarios();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        Pico model
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">
        Перевірка моделі
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Ті самі правила, що й <span className="font-medium text-[var(--text)]">yarn model</span>.
        Ескроу на чейні тут не чіпається.
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="font-semibold text-[var(--accent)]">
          Лендінг
        </Link>
        <Link href="/app" className="font-semibold text-[var(--accent)]">
          App
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {blocks.map((block) => (
          <section
            key={block.id}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]"
          >
            <h2 className="text-lg font-semibold tracking-tight">{block.title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{block.note}</p>
            {block.rows ? (
              <ul className="mt-4 divide-y divide-[var(--border)]">
                {block.rows.map((row) => (
                  <li
                    key={`${block.id}-${row.userId}`}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <span>
                      <span className="mr-2 tabular-nums text-[var(--muted)]">
                        {row.place}
                      </span>
                      <span className="font-medium">{row.userId}</span>
                    </span>
                    <span className="text-[var(--muted)]">
                      {row.assignment}
                      {row.timeMs != null ? ` · ${row.timeMs} ms` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <ul className="mt-4 space-y-1.5 text-sm leading-relaxed">
              {block.lines.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
