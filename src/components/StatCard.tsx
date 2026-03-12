import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  className?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-surface-border bg-surface-card p-5 shadow-card transition-shadow hover:shadow-soft',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
            <Icon className="h-5 w-5 text-brand-primary" />
          </div>
        )}
      </div>
      {trend && (
        <p className={cn('mt-2 text-sm', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </p>
      )}
    </div>
  )
}
