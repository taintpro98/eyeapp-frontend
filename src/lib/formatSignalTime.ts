import type { TFunction } from "i18next";

/** Relative “N minutes ago” for mock signal rows — uses `signals.time.minutesAgo`. */
export function formatSignalMinutesAgo(minutes: number, t: TFunction) {
  return t("signals.time.minutesAgo", { count: minutes });
}
