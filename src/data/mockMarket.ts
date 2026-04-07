/** Top movers — Vietnam (HOSE / HNX), prices in ₫ */
export const mockTopMoversStocks = [
  {
    symbol: "VNM",
    name: "Vinamilk",
    price: "62,500 ₫",
    change24h: 1.2,
    volume: "892B ₫",
  },
  {
    symbol: "VCB",
    name: "Vietcombank",
    price: "68,200 ₫",
    change24h: -0.4,
    volume: "1.2T ₫",
  },
  {
    symbol: "FPT",
    name: "FPT Corp",
    price: "142,000 ₫",
    change24h: 2.1,
    volume: "654B ₫",
  },
  {
    symbol: "VIC",
    name: "Vingroup",
    price: "48,350 ₫",
    change24h: 0.8,
    volume: "421B ₫",
  },
];

/** Top movers — crypto (shown when Crypto tab is unlocked) */
export const mockTopMoversCrypto = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$67,420",
    change24h: 1.2,
    volume: "$28.4B",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$3,890",
    change24h: -0.4,
    volume: "$14.2B",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: "$142.50",
    change24h: 8.2,
    volume: "$4.2B",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: "$0.085",
    change24h: 4.5,
    volume: "$2.1B",
  },
];

export const mockSentiment = [
  { label: "Bullish", value: 65, color: "bg-green-500" },
  { label: "Neutral", value: 25, color: "bg-surface-border" },
  { label: "Bearish", value: 10, color: "bg-red-500" },
];

/** KPI row for Market page stat cards (icons applied in the page) */
export const mockMarketOverviewStats = {
  stocks: [
    {
      title: "VN-Index",
      value: "1,285.4",
      trend: { value: 0.8, label: "24h" },
    },
    { title: "VN30", value: "1,412.0", trend: { value: 0.5, label: "24h" } },
    {
      title: "HOSE value",
      value: "18.2T ₫",
      trend: { value: 12.1, label: "24h" },
    },
    {
      title: "Net foreign",
      value: "+245B ₫",
      trend: { value: 3.2, label: "session" },
    },
  ],
  crypto: [
    {
      title: "BTC Price",
      value: "$67,420",
      trend: { value: 1.2, label: "24h" },
    },
    {
      title: "ETH Price",
      value: "$3,890",
      trend: { value: -0.4, label: "24h" },
    },
    {
      title: "Crypto Mkt Cap",
      value: "$2.4T",
      trend: { value: 2.1, label: "24h" },
    },
    {
      title: "24h Volume",
      value: "$98B",
      trend: { value: -1.5, label: "24h" },
    },
  ],
} as const;
