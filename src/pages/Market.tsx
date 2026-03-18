import { TrendingUp, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { SectionCard } from '@/components/SectionCard'
import { DataTable } from '@/components/DataTable'
import { mockTopMovers, mockSentiment } from '@/data/mockMarket'

export function MarketPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Market Overview"
        subtitle="Real-time market data and sentiment"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="BTC Price" value="$67,420" trend={{ value: 1.2, label: '24h' }} icon={TrendingUp} />
        <StatCard title="ETH Price" value="$3,890" trend={{ value: -0.4, label: '24h' }} icon={TrendingUp} />
        <StatCard title="Market Cap" value="$2.4T" trend={{ value: 2.1, label: '24h' }} icon={BarChart3} />
        <StatCard title="24h Volume" value="$98B" trend={{ value: -1.5, label: '24h' }} icon={BarChart3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Top Movers" subtitle="24h performance">
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {mockTopMovers.map((row) => (
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
            data={mockTopMovers}
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
