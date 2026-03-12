import type { BootstrapResponse } from '@/types'

export const mockBootstrap: BootstrapResponse = {
  user: {
    id: 'usr_001',
    displayName: 'Alex Trader',
    role: 'user',
    status: 'active',
  },
  subscription: {
    planCode: 'free',
    status: 'active',
    expiresAt: '2025-12-31T23:59:59Z',
  },
  navigation: {
    sidebar: [
      { key: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard', visible: true, accessible: true, badge: null },
      { key: 'market', label: 'Market', path: '/app/market', icon: 'TrendingUp', visible: true, accessible: true, badge: null },
      { key: 'signals', label: 'Signals', path: '/app/signals', icon: 'Zap', visible: true, accessible: true, badge: null },
      { key: 'watchlist', label: 'Watchlist', path: '/app/watchlist', icon: 'Star', visible: true, accessible: true, badge: null },
      { key: 'portfolio', label: 'Portfolio', path: '/app/portfolio', icon: 'PieChart', visible: true, accessible: false, reason: 'Upgrade to Pro', badge: 'Pro' },
      { key: 'ai-insights', label: 'AI Insights', path: '/app/ai-insights', icon: 'Brain', visible: true, accessible: false, reason: 'Upgrade to Premium', badge: 'Premium' },
      { key: 'billing', label: 'Billing', path: '/app/billing', icon: 'CreditCard', visible: true, accessible: true, badge: null },
      { key: 'settings', label: 'Settings', path: '/app/settings', icon: 'Settings', visible: true, accessible: true, badge: null },
    ],
    marketToggle: [
      { code: 'crypto', label: 'Crypto', accessible: true, selected: true, reason: null },
      { code: 'forex', label: 'Forex', accessible: true, selected: false, reason: null },
      { code: 'stocks', label: 'Stocks', accessible: false, selected: false, reason: 'Upgrade to Pro' },
    ],
  },
}
