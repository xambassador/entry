import { getRouteApi } from "@tanstack/react-router";

import { MONTH_NAMES } from "@/lib/constant";

export function EmptyState() {
  const routerCache = getRouteApi("/entries");
  const { month, year } = routerCache.useSearch();
  const { total } = routerCache.useLoaderData();
  if (total !== 0) return null;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
      <p className="text-ink-faint text-sm font-light tracking-wide text-center">
        No entries in {MONTH_NAMES[month]} {year}
      </p>
    </div>
  );
}
