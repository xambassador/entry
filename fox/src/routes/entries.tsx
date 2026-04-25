import { createFileRoute } from "@tanstack/react-router";

import { DiaryCover } from "@/components/diary-cover";
import { RouteError } from "@/components/route-error";
import { EmptyState } from "@/components/views/entries/empty";
import { MonthSelector, YearSelector } from "@/components/views/entries/filter";
import { Header } from "@/components/views/entries/header";
import { Entries } from "@/components/views/entries/list";

import { getEntries } from "@/lib/api";
import { CURRENT_MONTH, CURRENT_YEAR, EARLIEST_YEAR } from "@/lib/constant";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseYear(searchYear: number | undefined): number {
  if (!searchYear) {
    return CURRENT_YEAR;
  }
  return clamp(searchYear, EARLIEST_YEAR, CURRENT_YEAR);
}

function parseMonth(searchMonth: number | undefined, year: number): number {
  const maxMonth = year === CURRENT_YEAR ? CURRENT_MONTH : 11;
  if (searchMonth === undefined) {
    return maxMonth;
  }
  return clamp(searchMonth, 0, maxMonth);
}

export const Route = createFileRoute("/entries")({
  component: RouteComponent,
  validateSearch: (search: { year?: number; month?: number }) => {
    const year = parseYear(search.year);
    return {
      year,
      month: parseMonth(search.month, year)
    };
  },
  loaderDeps: ({ search }) => ({ year: search.year, month: search.month }),
  loader: ({ deps, abortController }) =>
    getEntries(
      {
        year: deps.year,
        month: deps.month + 1
      },
      abortController.signal
    ),
  errorComponent: ({ error }) => {
    return <RouteError error={error} />;
  }
});

function RouteComponent() {
  return (
    <DiaryCover className="max-h-full" shellProps={{ className: "py-5 px-3 sm:px-0" }}>
      <div className="flex flex-col gap-4 max-w-2xl w-full mx-auto size-full overflow-hidden">
        <Header />
        <YearSelector />
        <MonthSelector />
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto pr-1 pb-2">
            <EmptyState />
            <Entries />
          </div>
          {fadeShadow}
        </div>
      </div>
    </DiaryCover>
  );
}

const fadeShadow = (
  <div className="absolute bottom-0 inset-x-0 h-8 bg-linear-to-t from-journal-surface to-transparent pointer-events-none" />
);
