import { buildMonthGrid } from "@/lib/date";

import { Header } from ".";
import { CalendarGrid } from "./calendar-grid";

function noteFor() {
  return undefined;
}

export function CalendarSkeleton() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const monthCells = buildMonthGrid(year, month);

  return (
    <div className="w-full h-full overflow-y-auto py-8 sm:px-6 px-2">
      <div className="flex min-h-full w-full">
        <div className="calendar m-auto w-full max-w-[1500px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)]">
          <Header />
          <div className="notebook-strip mx-1 mb-2" />
          <CalendarGrid status="pending" cells={monthCells} noteFor={noteFor} />
        </div>
      </div>
    </div>
  );
}
