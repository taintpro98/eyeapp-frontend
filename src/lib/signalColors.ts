/** Direction of a signal or position: buy (green), sell (red), watch (amber). */
export type SignalTone = "buy" | "sell" | "watch";

/** Badge colours per tone — the one place the buy/sell palette is defined. */
export const SIGNAL_BADGE_CLASS: Record<SignalTone, string> = {
  buy: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  sell: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  watch: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

/** Left accent of a signal/position card. */
export const SIGNAL_BORDER_CLASS: Record<SignalTone, string> = {
  buy: "border-l-green-500",
  sell: "border-l-red-500",
  watch: "border-l-amber-500",
};
