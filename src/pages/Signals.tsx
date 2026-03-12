import { Lock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { DataTable } from '@/components/DataTable'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PlanBadge } from '@/components/PlanBadge'
import { mockSignalsList } from '@/data/mockSignals'

export function SignalsPage() {
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal)
  return (
    <div className="space-y-8">
      <PageHeader
        title="Signals"
        subtitle="Trading signals and alerts"
        children={
          <div className="flex gap-2">
            <Input placeholder="Filter by symbol..." className="w-48" />
            <Button variant="outline">Filters</Button>
          </div>
        }
      />

      <SectionCard title="Active Signals" subtitle="Market-aware signals">
        <DataTable
          columns={[
            { key: 'symbol', header: 'Symbol' },
            { key: 'type', header: 'Type' },
            { key: 'strength', header: 'Strength' },
            {
              key: 'confidence',
              header: 'Confidence',
              render: (row) => (
                <span className={row.confidence >= 80 ? 'text-green-600 font-medium' : ''}>
                  {row.confidence}%
                </span>
              ),
            },
            { key: 'time', header: 'Time' },
            {
              key: 'premium',
              header: '',
              render: (row) =>
                row.premium ? (
                  <PlanBadge label="Pro" variant="pro" />
                ) : null,
            },
          ]}
          data={mockSignalsList}
        />
      </SectionCard>

      <SectionCard
        title="Advanced Signal Analytics"
        subtitle="Premium feature — Unlock with Pro plan"
        className="relative overflow-hidden"
      >
        <div className="pointer-events-none select-none blur-sm">
          <div className="h-48 rounded-lg border border-surface-border bg-surface-warm/50 p-4">
            <p className="text-text-secondary">Correlation matrix, backtest results, and custom alerts...</p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Button onClick={() => openUpgradeModal({ feature: 'Advanced Signal Analytics', reason: 'Pro plan' })}>
            <Lock className="mr-2 h-4 w-4" />
            Unlock Advanced Analytics
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
