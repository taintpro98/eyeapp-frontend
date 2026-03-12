export type SidebarItem = {
  key: string
  label: string
  path: string
  icon: string
  visible: boolean
  accessible: boolean
  reason?: string | null
  badge?: string | null
}

export type MarketToggleItem = {
  code: string
  label: string
  accessible: boolean
  selected: boolean
  reason?: string | null
}

export type BootstrapResponse = {
  user: {
    id: string
    displayName: string
    role: 'user' | 'admin'
    status: 'active' | 'blocked'
  }
  subscription: {
    planCode: 'free' | 'pro' | 'premium'
    status: 'active' | 'expired'
    expiresAt: string
  }
  navigation: {
    sidebar: SidebarItem[]
    marketToggle: MarketToggleItem[]
  }
}
