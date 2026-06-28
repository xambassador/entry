import type { Entry } from "@/types";

import { Link } from "@tanstack/react-router";

function formatEntryDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  const day = date.getDate();
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  return { day, dayName };
}

export function EntryRow({ entry }: { entry: Entry }) {
  const { day, dayName } = formatEntryDate(entry.date);

  return (
    <Link
      to="/entries/$id"
      params={{ id: entry.id }}
      className="group relative flex items-center gap-4 py-3 pl-3 pr-4 rounded-xl cursor-pointer transition-colors duration-150 hover:bg-surface-raised focus-ring"
    >
      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[2px] rounded-full bg-accent transition-all duration-200 group-hover:h-7" />
      <div className="flex flex-col items-center justify-center w-9 shrink-0">
        <span className="text-[10px] uppercase tracking-wide text-ink-faint leading-none mb-0.5">{dayName}</span>
        <span className="text-lg font-semibold text-ink-secondary tabular-nums leading-none group-hover:text-ink transition-colors duration-150">
          {day}
        </span>
      </div>
      <span className="grid place-items-center w-8 h-8 shrink-0 rounded-lg bg-surface-card/60 border border-border group-hover:border-border-strong transition-colors duration-150">
        <span className="text-base leading-none">{entry.emoji || "·"}</span>
      </span>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-[15px] font-medium text-ink-secondary group-hover:text-ink transition-colors duration-150 truncate">
          {entry.title || "Untitled"}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          {entry.word_count > 0 && (
            <span className="text-[11px] text-ink-faint tabular-nums shrink-0">{entry.word_count} words</span>
          )}
          {entry.tags.length > 0 && (
            <>
              {entry.word_count > 0 && <span className="text-ink-faint/40 text-[11px]">·</span>}
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                {entry.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[11px] text-accent/70 whitespace-nowrap">
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <span className="text-ink-faint/0 group-hover:text-ink-faint transition-all duration-200 -translate-x-1 group-hover:translate-x-0 shrink-0 text-sm">
        →
      </span>
    </Link>
  );
}
