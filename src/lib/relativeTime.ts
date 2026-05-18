import type { TFunction } from "i18next";

export function formatRelativeTime(
  timestampMs: number,
  t: TFunction,
  ns = "common.time",
): string {
  const now = Date.now();
  const diffMs = now - timestampMs;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);

  if (diffMin < 1) return t(`${ns}.justNow`);
  if (diffMin < 60) return t(`${ns}.minutesAgo`, { count: diffMin });
  if (diffHr < 24) return t(`${ns}.hoursAgo`, { count: diffHr });

  const date = new Date(timestampMs);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const hhmm = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  if (date >= yesterdayStart && date < todayStart) {
    return t(`${ns}.yesterday`, { time: hhmm });
  }
  if (date >= weekStart) {
    const days = t(`${ns}.days`, { returnObjects: true }) as string[];
    return t(`${ns}.thisWeek`, { day: days[date.getDay()], time: hhmm });
  }

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy} ${hhmm}`;
}
