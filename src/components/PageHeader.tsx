import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {children && <div className="mt-4 sm:mt-0">{children}</div>}
    </div>
  )
}
