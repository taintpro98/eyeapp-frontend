import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { MarketToggleItem } from '@/types'

type MarketToggleProps = {
  items: MarketToggleItem[]
  selectedMarket: string
  onSelect: (code: string) => void
}

export function MarketToggle({ items, selectedMarket, onSelect }: MarketToggleProps) {
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal)

  return (
    <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface-card p-1">
      {items.map((item) => {
        const isSelected = item.code === selectedMarket
        const isLocked = !item.accessible

        const handleClick = () => {
          if (isLocked) {
            openUpgradeModal({ market: item.label, reason: item.reason ?? undefined })
          } else {
            onSelect(item.code)
          }
        }

        return (
          <button
            key={item.code}
            onClick={handleClick}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected && !isLocked && 'bg-brand-primary text-white shadow-sm',
              !isSelected && !isLocked && 'text-text-secondary hover:bg-surface-border/50 hover:text-text-primary',
              isLocked && 'cursor-not-allowed text-text-secondary opacity-75 hover:opacity-100'
            )}
          >
            {item.label}
            {isLocked && <Lock className="h-3.5 w-3.5" />}
          </button>
        )
      })}
    </div>
  )
}
