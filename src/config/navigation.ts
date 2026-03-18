import type { SidebarItem } from '@/types'

/** Sidebar keys for core daily-use pages only. Billing and Settings live in the account menu. */
export const SIDEBAR_NAV_KEYS = [
  'dashboard',
  'market',
  'signals',
  'watchlist',
  'portfolio',
  'ai-insights',
] as const

export type AccountMenuLinkItem = {
  type: 'link'
  label: string
  path: string
  icon: string
  description?: string
}

export const accountMenuItems: AccountMenuLinkItem[] = [
  { type: 'link', label: 'Plan & Billing', path: '/app/billing', icon: 'CreditCard' },
  { type: 'link', label: 'Settings', path: '/app/settings', icon: 'Settings' },
]

/** Filter sidebar items to only include core nav (excludes billing, settings). */
export function getSidebarNavItems(allItems: SidebarItem[]): SidebarItem[] {
  return allItems.filter((item) => SIDEBAR_NAV_KEYS.includes(item.key as (typeof SIDEBAR_NAV_KEYS)[number]))
}
