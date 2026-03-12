import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { Lock } from 'lucide-react'

export function UpgradeModal() {
  const { upgradeModalOpen, upgradeModalContext, closeUpgradeModal } = useAppStore()

  const handleUpgrade = () => {
    closeUpgradeModal()
    // In real app: navigate to billing/upgrade
  }

  const title = upgradeModalContext?.market
    ? `Unlock ${upgradeModalContext.market} Market`
    : upgradeModalContext?.feature
    ? `Unlock ${upgradeModalContext.feature}`
    : 'Upgrade Your Plan'

  const description =
    upgradeModalContext?.reason ||
    'This feature is available on our Pro or Premium plans. Upgrade now to unlock advanced market intelligence and trading insights.'

  return (
    <Dialog open={upgradeModalOpen} onOpenChange={(open) => !open && closeUpgradeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
              <Lock className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={closeUpgradeModal}>
            Maybe later
          </Button>
          <Button onClick={handleUpgrade}>Upgrade now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
