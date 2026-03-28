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
