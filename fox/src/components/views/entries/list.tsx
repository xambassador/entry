import { getRouteApi } from "@tanstack/react-router";

import { groupEntriesByWeek } from "@/lib/entry";

import { EntryRow } from "./entry";

export function Entries() {
  const route = getRouteApi("/");
  const { month, year } = route.useSearch();
  const { entries, total } = route.useLoaderData();
  const { weeks } = groupEntriesByWeek(entries, month, year);

  if (total === 0) return null;

  const activeWeeks = weeks.filter((w) => w.entries.length > 0);

  return (
    <div className="space-y-7 pb-6">
      {activeWeeks.map((week) => (
        <section key={week.label}>
          <div className="flex items-center gap-3 mb-1.5 sticky top-0 bg-canvas/85 backdrop-blur-sm py-1.5 z-10">
            <h3 className="text-[10px] tracking-widest uppercase whitespace-nowrap font-medium text-accent/60">
              {week.label}
            </h3>
            <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
            <span className="text-[10px] text-ink-faint tabular-nums shrink-0">
              {week.entries.length} {week.entries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="flex flex-col">
            {week.entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
