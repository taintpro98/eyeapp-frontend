import { PageHeader } from '@/components/PageHeader'
import { LockedCard } from '@/components/LockedCard'

export function PortfolioPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Portfolio"
        subtitle="Track your holdings and performance"
      />

      <LockedCard
        title="Portfolio Tracking"
        description="Track your crypto, forex, and stock holdings in one place. Get performance analytics and rebalancing suggestions."
        badge="Pro"
      >
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-surface-border bg-surface-warm/30 p-4">
            <p className="text-sm text-text-secondary">Sample allocation</p>
            <p className="mt-1 font-medium">BTC 45% · ETH 30% · SOL 25%</p>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-warm/30 p-4">
            <p className="text-sm text-text-secondary">Total value</p>
            <p className="mt-1 font-medium">—</p>
          </div>
        </div>
      </LockedCard>
    </div>
  )
}
