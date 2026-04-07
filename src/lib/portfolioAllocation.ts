import type { PortfolioSlice } from '@/data/mockPortfolio'

/** Non-zero slices first (clockwise on ring), then zeros — matches list ↔ chart */
export function orderSlicesForDisplay(slices: PortfolioSlice[]): PortfolioSlice[] {
  const positive = slices.filter((s) => s.percent > 0)
  const zero = slices.filter((s) => s.percent <= 0)
  return [...positive, ...zero]
}

/** Neutral arc if weights don’t sum to 100% */
const REMAINDER = 'rgba(110, 100, 112, 0.35)'

export type DonutGradientResult = {
  /** CSS conic-gradient or null */
  gradient: string | null
  /** Sum of positive weights (0–100) */
  totalPercent: number
}

/**
 * Builds ring segments in the same order as `orderSlicesForDisplay` (non-zero first):
 * clockwise from top matches list top-to-bottom for those rows.
 */
export function buildDonutGradient(slices: PortfolioSlice[]): DonutGradientResult {
  const ordered = orderSlicesForDisplay(slices)
  const positive = ordered.filter((s) => s.percent > 0)
  if (positive.length === 0) {
    return { gradient: null, totalPercent: 0 }
  }

  let accDeg = 0
  const parts: string[] = []
  let totalPercent = 0

  for (const s of ordered) {
    if (s.percent <= 0) continue
    totalPercent += s.percent
    const sweep = (s.percent / 100) * 360
    const start = accDeg
    const end = accDeg + sweep
    parts.push(`${s.color} ${start}deg ${end}deg`)
    accDeg = end
  }

  if (accDeg < 359.5) {
    parts.push(`${REMAINDER} ${accDeg}deg 360deg`)
  }

  return {
    gradient: `conic-gradient(from -90deg, ${parts.join(', ')})`,
    totalPercent,
  }
}
