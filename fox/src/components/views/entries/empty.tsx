import { getRouteApi } from "@tanstack/react-router";

import { MONTH_NAMES } from "@/lib/constant";

export function EmptyState() {
  const route = getRouteApi("/");
  const { month, year } = route.useSearch();
  const { total } = route.useLoaderData();
  if (total !== 0) return null;
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <p className="text-ink-faint text-sm">
        No entries in {MONTH_NAMES[month]} {year}
      </p>
    </div>
  );
}
