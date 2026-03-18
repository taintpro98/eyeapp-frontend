import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getIcon } from '@/lib/icons'
import { PlanBadge } from '@/components/PlanBadge'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import type { SidebarItem } from '@/types'

type SidebarProps = {
  items: SidebarItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen, openUpgradeModal } = useAppStore()
  const visibleItems = items.filter((i) => i.visible)
  const showLabels = !sidebarCollapsed || sidebarOpen // Always full on mobile drawer

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          'flex flex-col border-r border-surface-border bg-surface-card transition-all duration-200',
          'fixed inset-y-0 left-0 z-50 w-64 lg:relative lg:inset-auto',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
      <div className="flex h-16 items-center justify-between border-b border-surface-border px-4">
        <div className={cn('flex items-center gap-2', !showLabels && 'justify-center w-full')}>
          <img
            src="/logo.png"
            alt="ALumiEye"
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          {showLabels && (
            <span className="font-semibold text-text-primary">ALumiEye</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {visibleItems.map((item) => {
          const Icon = getIcon(item.icon)
          const isLocked = !item.accessible

          const content = (
            <>
              <Icon className={cn('h-5 w-5 shrink-0', isLocked && 'opacity-60')} />
              {showLabels && (
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
                onClick={() => {
                  openUpgradeModal({ feature: item.label, reason: item.reason ?? undefined })
                  setSidebarOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  'text-text-secondary hover:bg-surface-border/50 hover:text-text-primary',
                  !showLabels && 'justify-center px-0'
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
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-secondary hover:bg-surface-border/50 hover:text-text-primary',
                  !showLabels && 'justify-center px-0'
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
        className="hidden items-center justify-center border-t border-surface-border p-3 text-text-secondary hover:bg-surface-border/50 hover:text-text-primary lg:flex"
      >
        {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
    </>
  )
}
