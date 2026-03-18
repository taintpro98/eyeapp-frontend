import { cn } from '@/lib/utils'

type SectionCardProps = {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, subtitle, children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-surface-border bg-surface-card p-4 shadow-card sm:p-6',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
