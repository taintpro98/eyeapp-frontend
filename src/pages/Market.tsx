import { TrendingUp, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { SectionCard } from '@/components/SectionCard'
import { DataTable } from '@/components/DataTable'
import { mockTopMovers, mockSentiment } from '@/data/mockMarket'

export function MarketPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Market Overview"
        subtitle="Real-time market data and sentiment"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="BTC Price" value="$67,420" trend={{ value: 1.2, label: '24h' }} icon={TrendingUp} />
        <StatCard title="ETH Price" value="$3,890" trend={{ value: -0.4, label: '24h' }} icon={TrendingUp} />
        <StatCard title="Market Cap" value="$2.4T" trend={{ value: 2.1, label: '24h' }} icon={BarChart3} />
        <StatCard title="24h Volume" value="$98B" trend={{ value: -1.5, label: '24h' }} icon={BarChart3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Top Movers" subtitle="24h performance">
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
        </SectionCard>

        <SectionCard title="Market Sentiment">
          <div className="space-y-4">
            {mockSentiment.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-sm">
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
