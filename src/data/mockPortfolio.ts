/** Mock portfolio: 5 lines (4 tickers + cash). Weights sum to 100%. */

export type PortfolioSlice = {
  key: string
  label: string
  color: string
  percent: number
  entryPrice: number | null
  currentPrice: number | null
  returnPct: number | null
}

export const mockPortfolioSlices: PortfolioSlice[] = [
  {
    key: 'VIC',
    label: 'VIC',
    color: '#3b82f6',
    percent: 28,
    entryPrice: 52_400,
    currentPrice: 62_500,
    returnPct: 19.27,
  },
  {
    key: 'VCB',
    label: 'VCB',
    color: '#14b8a6',
    percent: 22,
    entryPrice: 65_000,
    currentPrice: 68_200,
    returnPct: 4.92,
  },
  {
    key: 'FPT',
    label: 'FPT',
    color: '#a855f7',
    percent: 18,
    entryPrice: 138_000,
    currentPrice: 151_000,
    returnPct: 9.42,
  },
  {
    key: 'HPG',
    label: 'HPG',
    color: '#f97316',
    percent: 15,
    entryPrice: 29_500,
    currentPrice: 27_800,
    returnPct: -5.76,
  },
  {
    key: 'CASH',
    label: 'Tiền',
    color: '#22c55e',
    percent: 17,
    entryPrice: null,
    currentPrice: null,
    returnPct: null,
  },
]
