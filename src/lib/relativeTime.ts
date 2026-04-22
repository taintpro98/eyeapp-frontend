import type { TFunction } from "i18next";

export function formatRelativeTime(timestampMs: number, t: TFunction): string {
  const now = Date.now();
  const diffMs = now - timestampMs;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);

  if (diffMin < 1) return t("signals.time.justNow");
  if (diffMin < 60) return t("signals.time.minutesAgo", { count: diffMin });
  if (diffHr < 24) return t("signals.time.hoursAgo", { count: diffHr });

  const date = new Date(timestampMs);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const hhmm = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  if (date >= yesterdayStart && date < todayStart) {
    return t("signals.time.yesterday", { time: hhmm });
  }
  if (date >= weekStart) {
    const days = t("signals.time.days", { returnObjects: true }) as string[];
    return t("signals.time.thisWeek", { day: days[date.getDay()], time: hhmm });
  }

  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" });
}
