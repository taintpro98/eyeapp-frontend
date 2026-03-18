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
        'rounded-card border border-surface-border bg-surface-card p-4 shadow-card transition-shadow hover:shadow-soft sm:p-5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary sm:text-sm">{title}</p>
          <p className="mt-0.5 truncate text-lg font-semibold text-text-primary sm:mt-1 sm:text-2xl">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 sm:h-10 sm:w-10">
            <Icon className="h-4 w-4 text-brand-primary sm:h-5 sm:w-5" />
          </div>
        )}
      </div>
      {trend && (
        <p className={cn('mt-1 text-xs sm:mt-2 sm:text-sm', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </p>
      )}
    </div>
  )
}
