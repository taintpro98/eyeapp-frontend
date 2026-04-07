export const mockSignals = [
  {
    id: "1",
    symbol: "VNM",
    type: "Buy",
    strength: "Strong",
    minutesAgo: 2,
    market: "stocks",
  },
  {
    id: "2",
    symbol: "VCB",
    type: "Sell",
    strength: "Medium",
    minutesAgo: 5,
    market: "stocks",
  },
  {
    id: "3",
    symbol: "FPT",
    type: "Buy",
    strength: "Weak",
    minutesAgo: 12,
    market: "stocks",
  },
  {
    id: "4",
    symbol: "BTC/USD",
    type: "Buy",
    strength: "Strong",
    minutesAgo: 2,
    market: "crypto",
  },
  {
    id: "5",
    symbol: "ETH/USD",
    type: "Sell",
    strength: "Medium",
    minutesAgo: 5,
    market: "crypto",
  },
];

export const mockKpis = [
  { title: "VN-Index", value: "1,285.4", trend: { value: 0.8, label: "24h" } },
  {
    title: "HOSE value",
    value: "18.2T ₫",
    trend: { value: 12.1, label: "24h" },
  },
  { title: "Net foreign", value: "+245B ₫", subtitle: "Session" },
  { title: "VN30", value: "1,412.0", trend: { value: 0.5, label: "24h" } },
];

export const mockMarketSummary = {
  stocks: {
    rows: [
      { label: "VN-Index", value: "1,285.40" },
      { label: "VN30", value: "1,412.05" },
    ],
  },
  crypto: {
    rows: [
      { label: "BTC", value: "$67,420" },
      { label: "ETH", value: "$3,890" },
    ],
  },
};
