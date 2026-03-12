import { cn } from '@/lib/utils'

type PlanBadgeProps = {
  label: string
  variant?: 'default' | 'pro' | 'premium' | 'locked'
  className?: string
}

export function PlanBadge({ label, variant = 'default', className }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variant === 'pro' && 'bg-brand-light/20 text-brand-dark',
        variant === 'premium' && 'bg-brand-primary/20 text-brand-primary',
        variant === 'locked' && 'bg-surface-border text-text-secondary',
        variant === 'default' && 'bg-surface-border/80 text-text-secondary',
        className
      )}
    >
      {label}
    </span>
  )
}
