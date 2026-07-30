import { createFileRoute } from "@tanstack/react-router";

import { RouteError } from "@/components/route-error";
import { CalendarView } from "@/components/views/month";
import { CalendarSkeleton } from "@/components/views/month/calendar-skeleton";

import { getEntries } from "@/lib/api";
import { CURRENT_MONTH, CURRENT_YEAR, EARLIEST_YEAR } from "@/lib/constant";

export type CalendarViewMode = "month" | "day";

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function parseYear(y: number | undefined) {
  return y ? clamp(y, EARLIEST_YEAR, CURRENT_YEAR) : CURRENT_YEAR;
}

function parseMonth(m: number | undefined, year: number) {
  const max = year === CURRENT_YEAR ? CURRENT_MONTH : 11;
  return m === undefined ? max : clamp(m, 0, max);
}

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: (search: { year?: number; month?: number }) => {
    const year = parseYear(search.year);
    const month = parseMonth(search.month, year);
    return { year, month };
  },
  loaderDeps: ({ search }) => ({ year: search.year, month: search.month }),
  loader: ({ deps, abortController }) => getEntries({ year: deps.year, month: deps.month + 1 }, abortController.signal),
  errorComponent: ({ error }) => <RouteError error={error} />,
  pendingComponent: () => <CalendarSkeleton />
});

function HomeComponent() {
  return <CalendarView />;
}
