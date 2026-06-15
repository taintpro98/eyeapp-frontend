import type { PositionStatus, PositionSide, PositionTerm } from "@/api/positions";

export function statusClass(status: PositionStatus): string {
  switch (status) {
    case "running":    return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "opening":    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "opened":     return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "closing":    return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
    case "cancelling": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    case "closed":     return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

export function sideClass(side: PositionSide): string {
  return side === "buy"
    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
}

export function termClass(term: PositionTerm): string {
  return term === "short_term"
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
    : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400";
}
