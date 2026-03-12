import { PageHeader } from '@/components/PageHeader'
import { PremiumPreviewCard } from '@/components/PremiumPreviewCard'

export function AIInsightsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Insights"
        subtitle="AI-powered market analysis and predictions"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <PremiumPreviewCard
          title="Market Direction"
          description="AI-predicted short-term direction with confidence score"
        >
          <div className="rounded-lg border border-surface-border bg-surface-warm/30 p-4">
            <p className="text-sm text-text-secondary">Sample insight</p>
            <p className="mt-1 font-medium">BTC: Bullish · 87% confidence</p>
          </div>
        </PremiumPreviewCard>
        <PremiumPreviewCard
          title="Sentiment Analysis"
          description="Aggregated sentiment from news and social"
        >
          <div className="rounded-lg border border-surface-border bg-surface-warm/30 p-4">
            <p className="text-sm text-text-secondary">Sample insight</p>
            <p className="mt-1 font-medium">Overall: Greed (72)</p>
          </div>
        </PremiumPreviewCard>
      </div>
    </div>
  )
}
