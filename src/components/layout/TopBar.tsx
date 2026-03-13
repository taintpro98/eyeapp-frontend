import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Search, Bell, ChevronDown } from 'lucide-react'
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
  const route = location.pathname.split('/').pop() ?? 'dashboard'
  const pageTitle = routeLabels[route] ?? 'Dashboard'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-surface-border bg-surface-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-surface-card/80">
      <div className="flex flex-1 items-center gap-6">
        <h2 className="text-lg font-semibold text-text-primary">{pageTitle}</h2>
        <MarketToggle
          items={marketToggleItems}
          selectedMarket={selectedMarket}
          onSelect={onMarketSelect}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search (⌘K)"
            className="w-64 pl-9"
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
              onClick={() => {
                logout()
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
