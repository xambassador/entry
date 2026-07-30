import type { CalendarCell } from "@/lib/date";
import type { JournalNote } from "@/lib/journal";
import type { Status } from "@/types";

import { WEEKDAYS } from "@/lib/date";

import { DayCell } from "./day-cell";

export function CalendarGrid({
  cells,
  noteFor,
  status
}: {
  cells: CalendarCell[];
  noteFor: (cell: CalendarCell) => JournalNote | undefined;
  status?: Status;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[820px]">
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="flex h-[var(--cal-head-h)] items-center px-3 text-[11px] font-semibold tracking-widest text-ink-muted"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-border">
          {cells.map((cell, index) => (
            <DayCell
              key={cell.key}
              index={index + 1}
              cell={cell}
              note={cell.inMonth ? noteFor(cell) : undefined}
              status={status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
