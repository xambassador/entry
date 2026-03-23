import type { Mood } from "@/types";

import { useMemo, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

const MOOD_EMOJI: Record<string, string> = {
  joyful: "😊",
  calm: "😌",
  reflective: "🤔",
  anxious: "😰",
  grateful: "🙏",
  creative: "✨",
  tired: "😴",
  excited: "🎉",
  melancholy: "🌧️",
  peaceful: "🕊️"
};

const MOOD_COLORS: Record<string, string> = {
  joyful: "#F5D45E",
  calm: "#5BC4BE",
  reflective: "#A893D4",
  anxious: "#E8836A",
  grateful: "#E0A86E",
  creative: "#F0A0E0",
  tired: "#8A9AAE",
  excited: "#FF7A7A",
  melancholy: "#6E94B8",
  peaceful: "#7ED4A0"
};

const ALL_MOODS: Mood[] = [
  "joyful",
  "calm",
  "reflective",
  "anxious",
  "grateful",
  "creative",
  "tired",
  "excited",
  "melancholy",
  "peaceful"
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MONTH_FULL_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatOrdinal(day: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  return day + (s[(v - 20) % 10] || s[v] || s[0]);
}

type DayEntry = { mood: Mood; emoji: string };
type YearData = Record<string, DayEntry>;

function generateMockData(year: number): YearData {
  const data: YearData = {};
  const today = new Date();
  for (let month = 0; month < 12; month++) {
    const daysInMonth = getDaysInMonth(year, month);
    for (let day = 1; day <= daysInMonth; day++) {
      if (new Date(year, month, day) > today) continue;
      if (Math.random() > 0.4) continue;
      const mood = ALL_MOODS[Math.floor(Math.random() * ALL_MOODS.length)]!;
      data[`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`] = {
        mood,
        emoji: MOOD_EMOJI[mood]
      };
    }
  }
  return data;
}

function DayCell({
  day,
  month,
  entry,
  isToday,
  isFuture
}: {
  day: number;
  month: number;
  entry?: DayEntry;
  isToday: boolean;
  isFuture: boolean;
}) {
  const moodColor = entry?.mood ? MOOD_COLORS[entry.mood] : undefined;

  const cell = (
    <button
      disabled={isFuture}
      className={cn(
        "relative size-6.5 rounded-md flex items-center justify-center",
        isFuture ? "opacity-[0.12] cursor-default" : "cursor-pointer",
        isToday && "ring-1 ring-gilt/40",
        entry && moodColor && !isFuture && "rounded-md"
      )}
      style={entry && moodColor && !isFuture ? { backgroundColor: `${moodColor}18` } : undefined}
    >
      {entry ? (
        <span className="text-sm leading-none">{entry.emoji}</span>
      ) : (
        <span className={cn("size-1 rounded-full", isToday ? "bg-gilt" : "bg-wax-light")} />
      )}
    </button>
  );

  if (isFuture || !entry) return cell;

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{cell}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="bg-journal-elevated border border-border-strong rounded-lg px-3 py-2 shadow-2xl shadow-black/50 z-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{entry.emoji}</span>
              <div>
                <p className="text-xs text-ink font-medium">
                  {MONTH_FULL_NAMES[month]} {formatOrdinal(day)}
                </p>
                <p className="text-[10px] capitalize font-mono tracking-wider" style={{ color: moodColor }}>
                  {entry.mood}
                </p>
              </div>
            </div>
            <Tooltip.Arrow className="fill-journal-elevated" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function MiniMonth({ month, year, data }: { month: number; year: number; data: YearData }) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const entryCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (data[`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`]) count++;
    }
    return count;
  }, [data, year, month, daysInMonth]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between px-0.5 mb-0.5">
        <span className="text-[11px] font-medium tracking-wider uppercase text-ink-secondary">
          {MONTH_NAMES[month]}
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
          return (
            <DayCell
              key={day}
              day={day}
              month={month}
              entry={data[key]}
              isToday={year === today.getFullYear() && month === today.getMonth() && day === today.getDate()}
              isFuture={new Date(year, month, day) > today}
            />
          );
        })}
      </div>
    </div>
  );
}

function YearStats({ data }: { data: YearData }) {
  const stats = useMemo(() => {
    const entries = Object.values(data);
    const total = entries.length;
    const moodCounts: Record<string, number> = {};
    for (const e of entries) {
      if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    }
    return { total };
  }, [data]);

  return (
    <div className="flex items-center gap-5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-medium text-ink tabular-nums">{stats.total}</span>
        <span className="text-xs text-ink-faint font-mono tracking-wider">entries</span>
      </div>
    </div>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

export function YearAtGlance() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const yearData = useMemo(() => generateMockData(year), [year]);

  return (
    <div className="w-full max-w-(--year-at-glance-width) mx-auto h-full">
      <div className="h-full relative">
        <div className="flex rounded-l-3xl rounded-r-5xl bg-journal-surface h-full w-full shadow-year-at-glance">
          <div className="min-w-[3%] h-full flex justify-end shrink-0">
            <div className="bg-shark w-0.5 h-full" />
          </div>

          <div className="flex-1 flex flex-col py-7 px-7 min-h-0">
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setYear((y) => y - 1)}
                  className="p-1 text-ink-faint hover:text-gilt cursor-pointer"
                >
                  <ChevronLeft size={14} strokeWidth={1.5} />
                </button>
                <span className="text-lg text-gilt tracking-wide w-12 text-center tabular-nums">{year}</span>
                <button
                  onClick={() => setYear((y) => y + 1)}
                  disabled={year >= CURRENT_YEAR}
                  className="p-1 text-ink-faint hover:text-gilt cursor-pointer disabled:opacity-20 disabled:cursor-default"
                >
                  <ChevronRight size={14} strokeWidth={1.5} />
                </button>
              </div>

              <YearStats data={yearData} />
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-gilt/12 to-transparent mb-10 shrink-0" />

            <div className="grid grid-cols-4 grid-rows-3 gap-x-6 gap-y-5 flex-1 min-h-0">
              {Array.from({ length: 12 }).map((_, month) => (
                <MiniMonth key={`${year}-${month}`} month={month} year={year} data={yearData} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
