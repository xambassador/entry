import type { CalendarCell } from "@/lib/date";
import type { MonthGlance } from "./index";

import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/cn";
import { MINI_WEEKDAYS, MONTH_FULL } from "@/lib/constant";
import { colorForId } from "@/lib/journal";

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
  const cardColor = colorForId(`${year}-${month}`);

  return (
    <div
      className="relative w-[320px] cursor-grab touch-none select-none rounded-[4px] p-4 pb-14 papersheet-shadow transition-shadow duration-300 ease-out active:cursor-grabbing"
      style={{ background: "linear-gradient(150deg, #fefdfa 0%, #f7f2e9 100%)" }}
      onPointerDown={onDragHandlePointerDown}
    >
      <div
        className="relative cursor-auto touch-auto overflow-hidden rounded-[2px]"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${cardColor.bg} 50%, white) 0%, ${cardColor.bg} 100%)`
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4">
          <div className="grid grid-cols-7">
            {MINI_WEEKDAYS.map((d, i) => (
              <div
                key={i}
                className="grid h-5 place-items-center text-[10px] font-bold tracking-wider"
                style={{ color: cardColor.muted }}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 pb-3">
            {cells.map((cell) => (
              <MiniDay key={cell.key} cell={cell} entry={glance?.byDate.get(cell.key)} ink={cardColor.ink} />
            ))}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 22%), radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(70,50,30,0.14) 100%)"
          }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center gap-2 pb-3">
        <span className={cn("font-hand text-4xl leading-none", isCurrent ? "text-accent" : "text-ink/80")}>
          {MONTH_FULL[month]}
        </span>
        <span className="font-hand text-xl leading-none text-ink/35">’{String(year).slice(2)}</span>
        {isCurrent && <span className="font-hand text-lg leading-none text-accent/70">· now</span>}
      </div>
    </div>
  );
}

function MiniDay({ cell, entry, ink }: { cell: CalendarCell; entry?: { id: string; emoji: string }; ink: string }) {
  if (!cell.inMonth) return <div className="aspect-square" />;

  const hasEntry = !!entry;

  const face = (
    <span
      className={cn("grid h-[32px] w-[32px] place-items-center rounded-full", cell.isToday && "ring-2 ring-accent/70")}
    >
      {hasEntry ? (
        entry?.emoji ? (
          <span className="text-[17px] leading-none">{entry.emoji}</span>
        ) : (
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ink }} />
        )
      ) : (
        <span
          className={cn(
            "text-[11px] font-medium leading-none tabular-nums",
            cell.isToday ? "text-accent" : "opacity-35"
          )}
          style={cell.isToday ? undefined : { color: ink }}
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
