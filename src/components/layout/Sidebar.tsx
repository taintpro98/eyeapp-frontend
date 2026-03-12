import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getIcon } from '@/lib/icons'
import { PlanBadge } from '@/components/PlanBadge'
import { useAppStore } from '@/store/useAppStore'
import type { SidebarItem } from '@/types'

type SidebarProps = {
  items: SidebarItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed, openUpgradeModal } = useAppStore()
  const visibleItems = items.filter((i) => i.visible)

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-surface-border bg-surface-card transition-all duration-200',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b border-surface-border px-4">
        <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center w-full')}>
          <img
            src="/logo.png"
            alt="ALumiEye"
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          {!sidebarCollapsed && (
            <span className="font-semibold text-text-primary">ALumiEye</span>
          )}
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {visibleItems.map((item) => {
          const Icon = getIcon(item.icon)
          const isLocked = !item.accessible

          const content = (
            <>
              <Icon className={cn('h-5 w-5 shrink-0', isLocked && 'opacity-60')} />
              {!sidebarCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <PlanBadge
                      label={item.badge}
                      variant={item.badge === 'Pro' ? 'pro' : 'premium'}
                      className="ml-auto"
                    />
                  )}
                  {isLocked && <Lock className="ml-auto h-4 w-4 text-text-secondary" />}
                </>
              )}
            </>
          )

          if (isLocked) {
            return (
              <button
                key={item.key}
                onClick={() => openUpgradeModal({ feature: item.label, reason: item.reason ?? undefined })}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  'text-text-secondary hover:bg-surface-border/50 hover:text-text-primary',
                  sidebarCollapsed && 'justify-center px-0'
                )}
              >
                {content}
              </button>
            )
          }

          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-secondary hover:bg-surface-border/50 hover:text-text-primary',
                  sidebarCollapsed && 'justify-center px-0'
                )
              }
            >
              {content}
            </NavLink>
          )
        })}
      </nav>
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="flex items-center justify-center border-t border-surface-border p-3 text-text-secondary hover:bg-surface-border/50 hover:text-text-primary"
      >
        {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  )
}
