import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { Search, Bell, ChevronDown, Menu, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Input } from '@/components/ui/input'
import { MarketToggle } from './MarketToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { MarketToggleItem } from '@/types'

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  market: 'Market',
  signals: 'Signals',
  watchlist: 'Watchlist',
  portfolio: 'Portfolio',
  'ai-insights': 'AI Insights',
  billing: 'Billing',
  settings: 'Settings',
}

type TopBarProps = {
  marketToggleItems: MarketToggleItem[]
  selectedMarket: string
  onMarketSelect: (code: string) => void
  userDisplayName: string
}

export function TopBar({ marketToggleItems, selectedMarket, onMarketSelect, userDisplayName }: TopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal)
  const route = location.pathname.split('/').pop() ?? 'dashboard'
  const pageTitle = routeLabels[route] ?? 'Dashboard'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-surface-border bg-surface-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface-card/80 sm:gap-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-6">
        <h2 className="truncate text-base font-semibold text-text-primary sm:text-lg">{pageTitle}</h2>
        <div className="hidden min-w-0 shrink sm:block">
          <MarketToggle
            items={marketToggleItems}
            selectedMarket={selectedMarket}
            onSelect={onMarketSelect}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="sm:hidden shrink-0">
              {marketToggleItems.find((m) => m.code === selectedMarket)?.label ?? 'Market'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {marketToggleItems.map((item) => (
              <DropdownMenuItem
                key={item.code}
                onClick={() =>
                  item.accessible ? onMarketSelect(item.code) : openUpgradeModal({ market: item.label, reason: item.reason ?? undefined })
                }
              >
                {item.label}
                {!item.accessible && <Lock className="ml-auto h-3.5 w-3.5 text-text-secondary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search (⌘K)"
            className="w-40 pl-9 lg:w-64"
            readOnly
          />
        </div>
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-medium text-brand-primary">
                {userDisplayName.charAt(0)}
              </div>
              <span className="hidden sm:inline">{userDisplayName}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app/billing')}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                await logout()
                navigate('/sign-in')
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
