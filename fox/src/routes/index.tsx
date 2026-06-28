import { createFileRoute } from "@tanstack/react-router";

import { RouteError } from "@/components/route-error";
import { CalendarView } from "@/components/views/month";

import { getEntries } from "@/lib/api";
import { getDaysInMonth } from "@/lib/date";
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

function parseView(v: unknown): CalendarViewMode {
  return v === "day" ? v : "month";
}

function parseDay(d: number | undefined, year: number, month: number) {
  const days = getDaysInMonth(year, month);
  // default to today when we're on the current month, otherwise the 1st
  const fallback = year === CURRENT_YEAR && month === CURRENT_MONTH ? new Date().getDate() : 1;
  return d === undefined ? fallback : clamp(Math.trunc(d), 1, days);
}

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: (search: { year?: number; month?: number; view?: string; day?: number }) => {
    const year = parseYear(search.year);
    const month = parseMonth(search.month, year);
    return { year, month, view: parseView(search.view), day: parseDay(search.day, year, month) };
  },
  loaderDeps: ({ search }) => ({ year: search.year, month: search.month }),
  loader: ({ deps, abortController }) => getEntries({ year: deps.year, month: deps.month + 1 }, abortController.signal),
  errorComponent: ({ error }) => <RouteError error={error} />,
  pendingComponent: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-ink-faint text-sm">Loading...</p>
    </div>
  )
});

function HomeComponent() {
  return <CalendarView />;
}
