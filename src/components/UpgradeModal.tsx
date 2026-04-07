import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { Lock } from "lucide-react";

export function UpgradeModal() {
  const { t } = useTranslation();
  const { upgradeModalOpen, upgradeModalContext, closeUpgradeModal } =
    useAppStore();

  const handleUpgrade = () => {
    closeUpgradeModal();
  };

  const title = useMemo(() => {
    const ctx = upgradeModalContext;
    if (!ctx) return t("upgrade.titleDefault");
    if (ctx.marketCode) {
      const marketLabel = t(`marketToggle.${ctx.marketCode}`, {
        defaultValue: ctx.market ?? "",
      });
      return t("upgrade.unlockMarket", { market: marketLabel });
    }
    if (ctx.featureKey) {
      return t(`upgrade.features.${ctx.featureKey}.title`);
    }
    if (ctx.feature) {
      return t("upgrade.unlockFeature", { feature: ctx.feature });
    }
    return t("upgrade.titleDefault");
  }, [upgradeModalContext, t]);

  const description = useMemo(() => {
    const ctx = upgradeModalContext;
    if (!ctx) return t("upgrade.descriptionDefault");
    if (ctx.reasonKey) {
      return t(`upgrade.reasons.${ctx.reasonKey}`);
    }
    if (ctx.reason) return ctx.reason;
    return t("upgrade.descriptionDefault");
  }, [upgradeModalContext, t]);

  return (
    <Dialog
      open={upgradeModalOpen}
      onOpenChange={(open) => !open && closeUpgradeModal()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
              <Lock className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={closeUpgradeModal}>
            {t("upgrade.maybeLater")}
          </Button>
          <Button onClick={handleUpgrade}>{t("upgrade.upgradeNow")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
