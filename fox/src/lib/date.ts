export function getDayWithFallback(date?: Date | string) {
  const currentDate = new Date();
  return date ? new Date(date).getDate() : currentDate.getDate();
}

export function getMonthNameWithFallback(date?: Date | string) {
  const currentDate = new Date();
  return date
    ? new Date(date).toLocaleString("default", { month: "long" })
    : currentDate.toLocaleString("default", { month: "long" });
}

export function getYearWithFallback(date?: Date | string) {
  const currentDate = new Date();
  return date ? new Date(date).getFullYear() : currentDate.getFullYear();
}

export function getWeekdayWithFallback(date?: Date | string) {
  const currentDate = new Date();
  return date
    ? new Date(date).toLocaleString("default", { weekday: "long" })
    : currentDate.toLocaleString("default", { weekday: "long" });
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export type CalendarCell = {
  date: Date;
  key: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
};

export const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function toKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfToday() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

function mondayOffset(date: Date) {
  return (date.getDay() + 6) % 7;
}

function makeCell(date: Date, month: number, todayKey: string, today: Date): CalendarCell {
  const key = toKey(date);
  return {
    date,
    key,
    day: date.getDate(),
    inMonth: date.getMonth() === month,
    isToday: key === todayKey,
    isFuture: date.getTime() > today.getTime()
  };
}

export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const today = startOfToday();
  const todayKey = toKey(today);
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(year, month, 1 - mondayOffset(firstOfMonth));

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return makeCell(date, month, todayKey, today);
  });
}
