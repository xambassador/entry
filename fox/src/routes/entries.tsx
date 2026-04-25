import { createFileRoute } from "@tanstack/react-router";

import { DiaryCover } from "@/components/diary-cover";
import { RouteError } from "@/components/route-error";
import { EmptyState } from "@/components/views/entries/empty";
import { MonthSelector, YearSelector } from "@/components/views/entries/filter";
import { Header } from "@/components/views/entries/header";
import { Entries } from "@/components/views/entries/list";

import { getEntries } from "@/lib/api";

export const Route = createFileRoute("/entries")({
  component: RouteComponent,
  loader: (opts) => getEntries(undefined, opts.abortController.signal),
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
