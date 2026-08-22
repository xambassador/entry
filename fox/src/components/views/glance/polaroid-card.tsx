import type { CalendarCell } from "@/lib/date";
import type { MonthGlance } from "./index";

import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/cn";
import { MINI_WEEKDAYS, MONTH_FULL } from "@/lib/constant";

const defaultColor = "oklch(60% 0.210 285.52)";

function getMonthColor(glance?: MonthGlance): string | undefined {
  if (!glance || glance.byDate.size === 0) return undefined;

  const entries = Array.from(glance.byDate.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  const counts = new Map<string, number>();
  for (const [, entry] of entries) {
    counts.set(entry.color, (counts.get(entry.color) ?? 0) + 1);
  }

  let mostUsed: string | undefined;
  let maxCount = 0;
  let tie = false;
  for (const [color, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mostUsed = color;
      tie = false;
    } else if (count === maxCount) {
      tie = true;
    }
  }

  if (mostUsed && !tie) return mostUsed;
  return entries[0][1].color;
}

export function PolaroidCard({
  month,
  year,
  cells,
  glance,
  isCurrent,
  onDragHandlePointerDown
}: {
  month: number;
  year: number;
  cells: CalendarCell[];
  glance?: MonthGlance;
  isCurrent: boolean;
  onDragHandlePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const monthColor = getMonthColor(glance);

  return (
    <div
      className="relative w-[320px] cursor-grab touch-none select-none bg-white p-4 pb-14 papersheet-shadow transition-shadow duration-300 ease-out active:cursor-grabbing"
      onPointerDown={onDragHandlePointerDown}
    >
      <div
        className="relative cursor-auto touch-auto overflow-hidden"
        style={
          {
            background: monthColor
              ? `color-mix(in srgb, ${monthColor} 15%, var(--color-card-canvas))`
              : `color-mix(in srgb, ${defaultColor} 8%, var(--color-card-canvas))`,
            "--text-color-primary": `color-mix(in srgb, ${monthColor ?? defaultColor} 30%, var(--color-ink-card))`,
            "--text-color-secondary": `color-mix(in srgb, ${monthColor ?? defaultColor} 10%, var(--color-ink-card) 50%)`
          } as Record<string, string>
        }
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4">
          <div className="grid grid-cols-7">
            {MINI_WEEKDAYS.map((d, i) => (
              <div
                key={i}
                className="grid h-5 place-items-center text-[10px] font-bold tracking-wider text-[var(--text-color-primary)]"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 pb-3">
            {cells.map((cell) => (
              <MiniDay key={cell.key} cell={cell} entry={glance?.byDate.get(cell.key)} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center gap-2 pb-3">
        <span className={cn("font-hand text-4xl leading-none", isCurrent ? "text-accent" : "text-ink/80")}>
          {MONTH_FULL[month]}
        </span>
        <span className="font-hand text-xl leading-none text-ink/35">’{String(year).slice(2)}</span>
      </div>
    </div>
  );
}

function MiniDay({ cell, entry }: { cell: CalendarCell; entry?: { id: string; emoji: string; color: string } }) {
  if (!cell.inMonth) return <div className="aspect-square" />;

  const hasEntry = !!entry;

  const face = (
    <span
      className={cn("grid h-[32px] w-[32px] place-items-center rounded-full", cell.isToday && "ring-2 ring-accent/70")}
      style={
        hasEntry ? { backgroundColor: `color-mix(in srgb, ${entry?.color} 33%, var(--color-card-canvas))` } : undefined
      }
    >
      {hasEntry ? (
        entry?.emoji ? (
          <span className="text-[17px] leading-none">{entry.emoji}</span>
        ) : (
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry?.color }} />
        )
      ) : (
        <span
          className={cn(
            "text-[11px] font-medium leading-none tabular-nums",
            cell.isToday ? "text-accent" : "text-[var(--text-color-secondary)]"
          )}
        >
          {cell.day}
        </span>
      )}
    </span>
  );

  if (!hasEntry) {
    return <div className="relative grid aspect-square place-items-center">{face}</div>;
  }

  return (
    <div className="relative grid aspect-square place-items-center">
      <Link to="/entries/$id" params={{ id: entry.id }} className="grid place-items-center focus-ring">
        {face}
      </Link>
    </div>
  );
}
