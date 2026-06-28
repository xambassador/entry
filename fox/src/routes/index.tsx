import { createFileRoute } from "@tanstack/react-router";

import { MonthWaveFooter } from "@/components/month-wave-footer";
import { RouteError } from "@/components/route-error";
import { EmptyState } from "@/components/views/entries/empty";
import { EntryFilter } from "@/components/views/entries/filter";
import { Header } from "@/components/views/entries/header";
import { Entries } from "@/components/views/entries/list";

import { getEntries } from "@/lib/api";
import { CURRENT_MONTH, CURRENT_YEAR, EARLIEST_YEAR } from "@/lib/constant";

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
    return { year, month: parseMonth(search.month, year) };
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
  const { entries } = Route.useLoaderData();
  const { year, month } = Route.useSearch();

  return (
    <div className="flex flex-col h-full">
      <div className="w-full max-w-(--content-max-width) mx-auto flex flex-col flex-1 min-h-0 px-4">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <Header />
          <EntryFilter />
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 relative -mx-2 px-2">
          <EmptyState />
          <Entries />
        </div>
      </div>
      <MonthWaveFooter entries={entries} year={year} month={month} />
    </div>
  );
}
