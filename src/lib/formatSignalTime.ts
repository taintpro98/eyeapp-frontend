import type { TFunction } from "i18next";

export function formatSignalMinutesAgo(minutes: number, t: TFunction) {
  return t("common.time.minutesAgo", { count: minutes });
}
