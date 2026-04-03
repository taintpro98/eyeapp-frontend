import { TrendingUp, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { SectionCard } from '@/components/SectionCard'
import { DataTable } from '@/components/DataTable'
import {
  mockTopMoversStocks,
  mockTopMoversCrypto,
  mockSentiment,
  mockMarketOverviewStats,
} from '@/data/mockMarket'
import { useAppStore } from '@/store/useAppStore'

const statIcons = [TrendingUp, TrendingUp, BarChart3, BarChart3]

export function MarketPage() {
  const selectedMarket = useAppStore((s) => s.selectedMarket)
  const isCrypto = selectedMarket === 'crypto'
  const topMovers = isCrypto ? mockTopMoversCrypto : mockTopMoversStocks
  const overviewStats = isCrypto ? mockMarketOverviewStats.crypto : mockMarketOverviewStats.stocks

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Market Overview"
        subtitle={isCrypto ? 'Cryptocurrency markets — real-time snapshot' : 'Vietnam (HOSE / HNX) — real-time snapshot'}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, i) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={statIcons[i] ?? TrendingUp}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Top Movers" subtitle="24h performance">
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {topMovers.map((row) => (
              <div
                key={row.symbol}
                className="flex items-center justify-between rounded-lg border border-surface-border p-3"
              >
                <div>
                  <p className="font-medium text-text-primary">{row.symbol}</p>
                  <p className="text-xs text-text-secondary">{row.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{row.price}</p>
                  <p className={row.change24h >= 0 ? 'text-xs text-green-600' : 'text-xs text-red-600'}>
                    {row.change24h >= 0 ? '+' : ''}{row.change24h}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block">
            <DataTable
            columns={[
              { key: 'symbol', header: 'Symbol' },
              { key: 'name', header: 'Name' },
              { key: 'price', header: 'Price' },
              {
                key: 'change24h',
                header: '24h',
                render: (row) => (
                  <span className={row.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {row.change24h >= 0 ? '+' : ''}{row.change24h}%
                  </span>
                ),
              },
              { key: 'volume', header: 'Volume' },
            ]}
            data={topMovers}
          />
          </div>
        </SectionCard>

        <SectionCard title="Market Sentiment">
          <div className="space-y-3 sm:space-y-4">
            {mockSentiment.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-xs sm:text-sm">
                  <span className="text-text-secondary">{s.label}</span>
                  <span className="font-medium">{s.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-border">
                  <div
                    className={`h-full ${s.color} transition-all`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
