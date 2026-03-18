import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

type LockedCardProps = {
  title: string
  description?: string
  badge?: string
  children?: React.ReactNode
  className?: string
}

export function LockedCard({ title, description, badge, children, className }: LockedCardProps) {
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border border-surface-border bg-surface-card p-4 shadow-card sm:p-6',
        'ring-1 ring-brand-primary/5',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
            <Lock className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary">{title}</h3>
              {badge && (
                <span className="rounded bg-brand-primary/20 px-2 py-0.5 text-xs font-medium text-brand-primary">
                  {badge}
                </span>
              )}
            </div>
            {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
          </div>
        </div>
        {children}
        <Button className="mt-4" onClick={() => openUpgradeModal({ feature: title })}>
          Upgrade to unlock
        </Button>
      </div>
    </div>
  )
}
