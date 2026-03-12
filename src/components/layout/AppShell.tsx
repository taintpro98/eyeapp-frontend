import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchBootstrap } from '@/api/bootstrap'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { UpgradeModal } from '@/components/UpgradeModal'

export function AppShell() {
  const { data: bootstrap, isLoading } = useQuery({
    queryKey: ['bootstrap'],
    queryFn: fetchBootstrap,
  })

  const { selectedMarket, setSelectedMarket } = useAppStore()
  const authUser = useAuthStore((s) => s.user)

  useEffect(() => {
    if (bootstrap) {
      const selected = bootstrap.navigation.marketToggle.find((m) => m.selected)
      if (selected) setSelectedMarket(selected.code)
    }
  }, [bootstrap, setSelectedMarket])

  if (isLoading || !bootstrap) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  const { sidebar, marketToggle } = bootstrap.navigation
  const marketItems = marketToggle.map((m) => ({
    ...m,
    selected: m.code === selectedMarket,
  }))

  return (
    <div className="flex h-screen bg-surface-bg">
      <Sidebar items={sidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          marketToggleItems={marketItems}
          selectedMarket={selectedMarket}
          onMarketSelect={setSelectedMarket}
          userDisplayName={authUser?.displayName ?? bootstrap.user.displayName}
        />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      <UpgradeModal />
    </div>
  )
}
