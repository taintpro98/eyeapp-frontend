import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchBootstrap } from '@/api/bootstrap'
import { TrendingUp, Zap, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { SectionCard } from '@/components/SectionCard'
import { Button } from '@/components/ui/button'
import { PlanBadge } from '@/components/PlanBadge'
import { useAppStore } from '@/store/useAppStore'
import { mockKpis, mockSignals, mockMarketSummary } from '@/data/mockDashboard'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: bootstrap } = useQuery({ queryKey: ['bootstrap'], queryFn: fetchBootstrap })
  const selectedMarket = useAppStore((s) => s.selectedMarket)
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal)

  const plan = bootstrap?.subscription.planCode ?? 'free'
  const signals = mockSignals.filter((s) => s.market === selectedMarket)

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${bootstrap?.user.displayName ?? 'Trader'}`}
        subtitle="Here's your market overview for today"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockKpis.map((kpi, i) => (
          <StatCard
            key={i}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            trend={kpi.trend}
            icon={TrendingUp}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Plan Summary" className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
                <span className="text-xl font-bold text-brand-primary">{plan.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</span>
                  <PlanBadge label={plan} variant={plan === 'free' ? 'default' : plan === 'pro' ? 'pro' : 'premium'} />
                </div>
                <p className="text-sm text-text-secondary">
                  {bootstrap?.subscription.expiresAt
                    ? `Renews ${new Date(bootstrap.subscription.expiresAt).toLocaleDateString()}`
                    : 'Active'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/app/billing')}>
              Manage plan
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Current Market">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">BTC</span>
              <span className="font-medium">{mockMarketSummary.btcPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">ETH</span>
              <span className="font-medium">{mockMarketSummary.ethPrice}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent Signals" subtitle="Latest trading signals for your market">
        <div className="space-y-2">
          {signals.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-surface-border p-3"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-brand-primary" />
                <div>
                  <p className="font-medium">{s.symbol}</p>
                  <p className="text-sm text-text-secondary">{s.type} · {s.strength}</p>
                </div>
              </div>
              <span className="text-sm text-text-secondary">{s.time}</span>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate('/app/signals')}>
          View all signals <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </SectionCard>

      <SectionCard
        title="Unlock Premium Features"
        subtitle="Get AI Insights, Portfolio tracking, and Stocks market access"
        className="border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Upgrade to Pro or Premium for advanced analytics and more markets.
          </p>
          <Button onClick={() => openUpgradeModal({ feature: 'Premium Features' })}>
            Upgrade now
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
