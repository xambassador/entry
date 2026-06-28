import type { Entry } from "@/types";

import { Link } from "@tanstack/react-router";

type Props = {
  entries: Entry[];
  year: number;
  month: number;
};

function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function dateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function entryHeight(wordCount: number, seed: number) {
  const base = 64;
  const fromWords = Math.min(wordCount * 0.35, 78);
  const jitter = rand(seed) * 14;
  return Math.round(base + fromWords + jitter);
}

export function MonthWaveFooter({ entries, year, month }: Props) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const byDate = new Map(entries.map((e) => [e.date, e]));

  return (
    <div
      className="wave-footer group/footer relative shrink-0 mt-6"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginBottom: "-2.5rem" }}
    >
      <div
        className="absolute -top-10 inset-x-0 h-20 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, var(--color-canvas), transparent)" }}
      />

      <div className="flex items-end justify-center gap-[0.4%] px-4 h-[150px] sm:h-[200px]">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const entry = byDate.get(dateStr(year, month, day));
          const seed = day * 7.3 + month;

          if (!entry) {
            const h = 10 + Math.round(rand(seed) * 14);
            return (
              <div key={i} className="flex-1 min-w-0 flex items-end" style={{ height: h }}>
                <span className="block w-full h-full rounded-t-full bg-surface-raised/40 transition-colors duration-300 ease-out group-hover/footer:bg-surface-card/50 hover:!bg-surface-elevated" />
              </div>
            );
          }

          const h = entryHeight(entry.word_count, seed);
          const rotate = (rand(seed + 1) - 0.5) * 16; // -8deg..8deg
          const scale = 0.9 + rand(seed + 2) * 0.25; // 0.9..1.15

          return (
            <Link
              key={i}
              to="/entries/$id"
              params={{ id: entry.id }}
              title={`${entry.title || "Untitled"} · ${entry.word_count} words`}
              className="wave-bar group/bar relative flex-1 min-w-0 flex flex-col items-center justify-end"
              style={{ height: h }}
            >
              <span
                className="block mb-1 text-[clamp(9px,1.4vw,18px)] leading-none duration-300 ease-out"
                style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
              >
                {entry.emoji || "•"}
              </span>
              <span className="block w-full flex-1 rounded-t-full bg-linear-to-t from-accent/15 to-accent/40 transition-colors duration-300 ease-out group-hover/bar:from-accent/60 group-hover/bar:to-accent" />
            </Link>
          );
        })}
      </div>

      <div className="absolute bottom-0 inset-x-0 flex items-end justify-between px-6 pb-5 z-20 pointer-events-none">
        <span className="text-ink-faint/40 text-[11px] tracking-wider">Entry · {year}</span>
        <a
          href="/write"
          className="pointer-events-auto text-ink-faint/40 hover:text-accent/80 text-[11px] tracking-wide transition-colors duration-150"
        >
          + New entry
        </a>
      </div>
    </div>
  );
}
