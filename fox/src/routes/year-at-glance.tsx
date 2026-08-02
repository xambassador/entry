import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { RouteError } from "@/components/route-error";
import { YeatAtGlance } from "@/components/views/glance";

import { getYearAtGlance } from "@/lib/api";
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

export const Route = createFileRoute("/year-at-glance")({
  component: CanvasComponent,
  validateSearch: (search: { year?: number; month?: number }) => {
    const year = parseYear(search.year);
    const month = parseMonth(search.month, year);
    return { year, month };
  },
  loaderDeps: ({ search }) => ({ year: search.year }),
  loader: ({ deps, abortController }) => getYearAtGlance(deps.year, abortController.signal),
  errorComponent: ({ error }) => <RouteError error={error} />,
  pendingComponent: CanvasPending
});

function CanvasComponent() {
  return <YeatAtGlance />;
}

function CanvasPending() {
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-3 text-ink-faint">
        <Loader2 size={22} className="animate-spin" strokeWidth={2.25} />
        <p className="font-hand text-lg text-ink-muted">Laying out your year…</p>
      </div>
    </div>
  );
}
