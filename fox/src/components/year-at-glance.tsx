import type { GetYearAtGlanceResponse } from "@/types";

import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";
import { DAY_LABELS, MONTH_NAMES, MONTH_SHORT } from "@/lib/constant";
import { getDaysInMonth, getFirstDayOfMonth } from "@/lib/date";

const s = ["th", "st", "nd", "rd"];

function formatOrdinal(day: number): string {
  const v = day % 100;
  return day + (s[(v - 20) % 10] || s[v] || s[0]);
}

function DayCell({
  day,
  month,
  emoji,
  isToday,
  isFuture,
  id
}: {
  id: string;
  day: number;
  month: number;
  isToday: boolean;
  isFuture: boolean;
  emoji: string | null;
}) {
  const moodColor = undefined;

  if (!id || id === "") {
    return (
      <span
        title={`${MONTH_NAMES[month]} ${formatOrdinal(day)}`}
        className={cn(
          "relative size-6.5 rounded-md flex items-center justify-center",
          isFuture ? "opacity-[0.12]" : "",
          isToday && "ring-1 ring-gilt/40 bg-gilt/10",
          moodColor && !isFuture && "rounded-md"
        )}
        style={emoji && moodColor && !isFuture ? { backgroundColor: `${moodColor}18` } : undefined}
      >
        {emoji ? (
          <span className="text-sm leading-none">{emoji}</span>
        ) : (
          <span className={cn("size-1 rounded-full", isToday ? "bg-gilt" : "bg-wax-light")} />
        )}
      </span>
    );
  }

  return (
    <Link
      to="/entries/$id"
      params={{ id }}
      disabled={isFuture}
      title={`${MONTH_NAMES[month]} ${formatOrdinal(day)}`}
      className={cn(
        "relative size-6.5 rounded-md flex items-center justify-center active:scale-[0.95] transition-all duration-150 focus-ring",
        isFuture ? "opacity-[0.12] cursor-default" : "cursor-pointer hover:bg-gilt/10",
        isToday && "ring-1 ring-gilt/40 bg-gilt/10",
        moodColor && !isFuture && "rounded-md"
      )}
      style={{ ...(emoji && moodColor && !isFuture ? { backgroundColor: `${moodColor}18` } : undefined) }}
    >
      {emoji ? (
        <span className="text-sm leading-none">{emoji}</span>
      ) : (
        <span className={cn("size-1 rounded-full", isToday ? "bg-gilt" : "bg-wax-light")} />
      )}
    </Link>
  );
}

function MiniMonth({ month, year, data }: { month: number; year: number; data: GetYearAtGlanceResponse }) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  let entryCount = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    if (data.entries.some((e) => e.date === dateStr)) {
      entryCount++;
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between px-0.5 mb-0.5">
        <span className="text-[11px] font-medium tracking-wider uppercase text-ink-secondary">
          {MONTH_SHORT[month]}
        </span>
        {entryCount > 0 && <span className="text-[9px] text-ink-muted font-mono tabular-nums">{entryCount}</span>}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-[8px] text-ink-faint text-center font-mono pb-0.5">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} className="size-6.5" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const emoji = data.entries.find((e) => e.date === key)?.emoji || null;
          const id = data.entries.find((e) => e.date === key)?.id || "";
          return (
            <DayCell
              key={day}
              day={day}
              month={month}
              emoji={emoji}
              isToday={year === today.getFullYear() && month === today.getMonth() && day === today.getDate()}
              isFuture={new Date(year, month, day) > today}
              id={id}
            />
          );
        })}
      </div>
    </div>
  );
}

function YearStats({ total }: { total: number }) {
  return (
    <div className="flex items-center gap-5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-medium text-ink tabular-nums">{total}</span>
        <span className="text-xs text-ink-faint font-mono tracking-wider">entries</span>
      </div>
    </div>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

export function YearAtGlance(props: {
  data: GetYearAtGlanceResponse;
  year: number;
  onYearChange: (year: number) => void;
}) {
  const { data, year, onYearChange } = props;

  return (
    <YearAtGlanceContainer>
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onYearChange(year - 1)}
            className="p-1 text-ink-faint hover:text-gilt cursor-pointer active:scale-[0.96] min-w-10 min-h-10 flex items-center justify-center"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
          </button>
          <span className="text-lg text-gilt tracking-wide w-12 text-center tabular-nums">{year}</span>
          <button
            onClick={() => onYearChange(year + 1)}
            disabled={year >= CURRENT_YEAR}
            className="p-1 text-ink-faint hover:text-gilt cursor-pointer disabled:opacity-20 disabled:cursor-default active:scale-[0.96] min-w-10 min-h-10 flex items-center justify-center"
          >
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        <YearStats total={data.total} />
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-gilt/12 to-transparent mb-10 shrink-0" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-5 sm:gap-x-6 lg:flex-1 lg:min-h-0">
        {Array.from({ length: 12 }).map((_, month) => (
          <MiniMonth key={`${year}-${month}`} month={month} year={year} data={data} />
        ))}
      </div>
    </YearAtGlanceContainer>
  );
}

export function YearAtGlanceContainer(props: React.PropsWithChildren) {
  return (
    <div className="w-full max-w-(--year-at-glance-width) mx-auto h-auto lg:h-full">
      <div className="h-auto lg:h-full relative">
        <div className="flex rounded-l-3xl rounded-r-5xl bg-journal-surface h-auto lg:h-full w-full shadow-year-at-glance">
          <div className="min-w-[3%] h-auto lg:h-full flex justify-end shrink-0">
            <div className="bg-shark w-0.5 h-full" />
          </div>

          <div className="flex-1 flex flex-col py-5 px-4 sm:py-7 sm:px-7 lg:min-h-0">{props.children}</div>
        </div>
      </div>
    </div>
  );
}
