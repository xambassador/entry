import { getRouteApi } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CURRENT_MONTH, CURRENT_YEAR, MONTH_NAMES } from "@/lib/constant";
import { buildMonthGrid } from "@/lib/date";
import { decorate, indexByDate } from "@/lib/journal";

import { CalendarGrid } from "./calendar-grid";

const route = getRouteApi("/");

export function CalendarView() {
  const { year, month } = route.useSearch();
  const { entries } = route.useLoaderData();

  const monthCells = buildMonthGrid(year, month);
  const byDate = indexByDate(entries);

  const noteFor = (cell: { key: string }) => {
    const entry = byDate.get(cell.key);
    return entry ? decorate(entry) : undefined;
  };

  return (
    <div className="w-full h-full overflow-y-auto py-8 sm:px-6 px-2">
      <div className="flex min-h-full w-full">
        <div className="calendar m-auto w-full max-w-[1500px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)]">
          <Header />
          <div className="notebook-strip mx-1 mb-2" />
          <CalendarGrid cells={monthCells} noteFor={noteFor} />
        </div>
      </div>
    </div>
  );
}

function title(ctx: { year: number; month: number; selected: Date }) {
  return `${MONTH_NAMES[ctx.month]}, ${ctx.year}`;
}

export function Header() {
  const { year, month } = route.useSearch();
  const navigate = route.useNavigate();
  const selected = new Date(year, month);
  const nextDisabled = year === CURRENT_YEAR && month === CURRENT_MONTH;

  function shift(dir: 1 | -1) {
    const d = new Date(year, month + dir, 1);
    navigate({ search: (p) => ({ ...p, year: d.getFullYear(), month: d.getMonth() }) });
    return;
  }

  function goToday() {
    const t = new Date();
    navigate({ search: (p) => ({ ...p, year: t.getFullYear(), month: t.getMonth(), day: t.getDate() }) });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-4xl">{title({ year, month, selected })}</h1>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-ring"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={nextDisabled}
            aria-label="Next"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-ring disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="text-xl font-medium tracking-tight text-ink-faint transition-colors hover:text-ink-muted focus-ring sm:text-3xl"
        >
          Today
        </button>
      </div>
    </div>
  );
}
