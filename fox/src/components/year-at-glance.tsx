import type { GetYearAtGlanceResponse } from "@/types";

import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MONTH_SHORT } from "@/lib/constant";

const CURRENT_YEAR = new Date().getFullYear();

type DayEntry = { id: string; date: string; emoji: string } | null;

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function buildYearDays(year: number, entries: GetYearAtGlanceResponse["entries"]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = isLeapYear(year) ? 366 : 365;
  const entryMap = new Map(entries.map((e) => [e.date, e]));
  const result: { date: string; entry: DayEntry; isFuture: boolean; isToday: boolean }[] = [];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(year, 0, i + 1);
    const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const entry = entryMap.get(dateStr) ?? null;
    const isFuture = date > today;
    const isToday = date.getTime() === today.getTime();
    result.push({ date: dateStr, entry, isFuture, isToday });
  }

  return result;
}

function getMonthWidths(year: number) {
  const totalDays = isLeapYear(year) ? 366 : 365;
  return Array.from({ length: 12 }, (_, m) => {
    const days = new Date(year, m + 1, 0).getDate();
    return (days / totalDays) * 100;
  });
}

export function YearAtGlance(props: {
  data: GetYearAtGlanceResponse;
  year: number;
  onYearChange: (year: number) => void;
}) {
  const { data, year, onYearChange } = props;
  const navigate = useNavigate();
  const days = buildYearDays(year, data.entries);
  const monthWidths = getMonthWidths(year);
  const totalDays = days.length;

  return (
    <div className="w-full max-w-(--content-max-width) mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onYearChange(year - 1)}
            className="size-8 flex items-center justify-center rounded-md text-ink-faint hover:text-ink hover:bg-surface-hover active:scale-[0.95] transition-all duration-150 ease-active cursor-pointer"
            aria-label="Previous year"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span className="text-2xl font-semibold text-ink w-16 text-center tabular-nums">{year}</span>
          <button
            onClick={() => onYearChange(year + 1)}
            disabled={year >= CURRENT_YEAR}
            className="size-8 flex items-center justify-center rounded-md text-ink-faint hover:text-ink hover:bg-surface-hover active:scale-[0.95] transition-all duration-150 ease-active cursor-pointer disabled:opacity-20 disabled:cursor-default"
            aria-label="Next year"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-semibold text-ink tabular-nums">{data.total}</span>
          <span className="text-sm text-ink-faint">{data.total === 1 ? "entry" : "entries"}</span>
        </div>
      </div>

      <div className="flex mb-2 w-full">
        {monthWidths.map((widthPct, m) => (
          <div key={m} style={{ width: `${widthPct}%` }} className="shrink-0">
            <span className="text-[10px] text-ink-faint uppercase tracking-wider">{MONTH_SHORT[m]}</span>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${totalDays} 72`}
        width="100%"
        height="72"
        preserveAspectRatio="none"
        aria-label={`${year} journaling activity`}
        style={{ display: "block" }}
      >
        {days.map((day, i) => {
          const hasEntry = day.entry !== null;
          return (
            <rect
              key={i}
              x={i + 0.08}
              y={hasEntry ? 4 : 64}
              width={0.84}
              height={hasEntry ? 68 : 8}
              rx={0.4}
              fill={hasEntry ? "var(--color-accent)" : "var(--color-surface-card)"}
              opacity={day.isFuture ? 0.12 : day.isToday && !hasEntry ? 0.5 : 1}
              style={{ cursor: day.entry ? "pointer" : "default" }}
              onClick={() => {
                if (day.entry) {
                  navigate({ to: "/entries/$id", params: { id: day.entry.id } });
                }
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function YearAtGlanceContainer(props: React.PropsWithChildren) {
  return <div className="w-full max-w-(--content-max-width) mx-auto">{props.children}</div>;
}
