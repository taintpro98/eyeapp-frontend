export const mockSignals = [
  { id: '1', symbol: 'AAPL', type: 'Buy', strength: 'Strong', time: '2 min ago', market: 'stocks' },
  { id: '2', symbol: 'MSFT', type: 'Sell', strength: 'Medium', time: '5 min ago', market: 'stocks' },
  { id: '3', symbol: 'GOOGL', type: 'Buy', strength: 'Weak', time: '12 min ago', market: 'stocks' },
  { id: '4', symbol: 'BTC/USD', type: 'Buy', strength: 'Strong', time: '2 min ago', market: 'crypto' },
  { id: '5', symbol: 'ETH/USD', type: 'Sell', strength: 'Medium', time: '5 min ago', market: 'crypto' },
]

export const mockKpis = [
  { title: 'Market Cap', value: '$2.4T', trend: { value: 2.3, label: '24h' } },
  { title: 'Volume 24h', value: '$98B', trend: { value: -1.2, label: '24h' } },
  { title: 'Fear & Greed', value: '72', subtitle: 'Greed' },
  { title: 'Dominance', value: 'BTC 52%', trend: { value: 0.5, label: '7d' } },
]

export const mockMarketSummary = {
  btcPrice: '$67,420',
  ethPrice: '$3,890',
  btcChange: 1.2,
  ethChange: -0.4,
}
