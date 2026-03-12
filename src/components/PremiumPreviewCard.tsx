import { Lock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

type PremiumPreviewCardProps = {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PremiumPreviewCard({ title, description, children, className }: PremiumPreviewCardProps) {
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border border-surface-border bg-surface-card p-6 shadow-card',
        'ring-1 ring-brand-light/20',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-light/5 via-transparent to-brand-primary/5" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light/20">
            <Sparkles className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{title}</h3>
            {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
          </div>
        </div>
        {children && <div className="mt-4">{children}</div>}
        <Button className="mt-4" variant="default" onClick={() => openUpgradeModal({ feature: title })}>
          <Lock className="mr-2 h-4 w-4" />
          Upgrade to Premium
        </Button>
      </div>
    </div>
  )
}
