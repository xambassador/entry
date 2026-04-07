import { useSelectedMonth, useSelectedYear } from "@/stores/entry-list";
import { getRouteApi } from "@tanstack/react-router";

import { cn } from "@/lib/cn";
import { groupEntriesByWeek } from "@/lib/entry";

import { EntryRow } from "./entry";

export function Entries() {
  const routerCache = getRouteApi("/entries");
  const month = useSelectedMonth();
  const year = useSelectedYear();
  const { entries, total } = routerCache.useLoaderData();
  const { weeks } = groupEntriesByWeek(entries, month, year);
  return (
    <div className="space-y-5">
      {total > 0 &&
        weeks.map((week) => (
          <div key={week.label}>
            <div className="flex items-center gap-3 mb-1.5 sticky top-0 bg-journal-surface/80 backdrop-blur-sm py-1 -mx-1 px-1 z-10">
              <h3
                className={cn(
                  "text-xs tracking-widest uppercase whitespace-nowrap font-medium",
                  week.entries.length === 0 ? "text-ink-faint opacity-40" : "text-gilt/70"
                )}
              >
                {week.label}
              </h3>
              {week.entries.length > 0 && <div className="h-px flex-1 bg-linear-to-r from-gilt/10 to-transparent" />}
            </div>
            {week.entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        ))}
    </div>
  );
}
