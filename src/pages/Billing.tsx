import { Check } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { PlanBadge } from '@/components/PlanBadge'
import { mockPlans, mockInvoices } from '@/data/mockBilling'

export function BillingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing"
        subtitle="Manage your subscription and invoices"
      />

      <SectionCard title="Current Plan">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <PlanBadge label="Free" variant="default" />
            <div>
              <p className="font-medium">Free Plan</p>
              <p className="text-sm text-text-secondary">Next billing: —</p>
            </div>
          </div>
          <Button>Upgrade plan</Button>
        </div>
      </SectionCard>

      <SectionCard title="Compare Plans" subtitle="Choose the plan that fits your needs">
        <div className="grid gap-4 md:grid-cols-3">
          {mockPlans.map((plan) => (
            <div
              key={plan.code}
              className={`rounded-card border p-6 ${
                plan.current ? 'border-brand-primary bg-brand-primary/5' : 'border-surface-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{plan.name}</h3>
                {plan.current && <PlanBadge label="Current" variant="default" />}
              </div>
              <p className="mt-2 text-2xl font-bold text-text-primary">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-brand-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <Button className="mt-4 w-full" variant={plan.current ? 'outline' : 'default'}>
                  {plan.code === 'free' ? 'Current' : 'Upgrade'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Invoice History">
        <DataTable
          columns={[
            { key: 'id', header: 'Invoice' },
            { key: 'date', header: 'Date' },
            { key: 'amount', header: 'Amount' },
            { key: 'status', header: 'Status' },
          ]}
          data={mockInvoices}
        />
      </SectionCard>
    </div>
  )
}
