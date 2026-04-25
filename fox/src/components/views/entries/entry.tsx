import type { Entry } from "@/types";

import { Link } from "@tanstack/react-router";

function getDayName(dateString: string) {
  const date = new Date(dateString);
  return { dayName: date.toLocaleDateString("en-US", { weekday: "short" }), day: date.getDate() };
}

export function EntryRow({ entry }: { entry: Entry }) {
  return (
    <Link
      to="/entries/$id"
      params={{ id: entry.id }}
      className="group cursor-pointer flex items-baseline gap-2 entry-row hover:bg-gilt-glow rounded px-1 relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gilt/40 focus-visible:rounded"
    >
      <span className="text-base text-ink-secondary group-hover:text-ink transition-colors duration-200 truncate min-w-0 shrink">
        {entry.title}
      </span>

      <span className="flex-1 dot-leader min-w-4 shrink-0" />

      {entry.tags.length > 0 && (
        <span className="text-xs text-ink-faint tracking-wider shrink-0 opacity-0 group-hover:opacity-100 transition-opacity max-w-28 truncate hidden sm:block">
          {entry.tags.slice(0, 2).join(", ")}
        </span>
      )}

      <span className="w-2 dot-leader opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 hidden sm:block" />
      <span className="text-sm text-ink-muted group-hover:text-gilt transition-colors duration-200 shrink-0 tabular-nums">
        <span className="text-ink-faint text-sm mr-1 hidden sm:inline">{getDayName(entry.date).dayName}</span>
        {getDayName(entry.date).day}
      </span>
    </Link>
  );
}
