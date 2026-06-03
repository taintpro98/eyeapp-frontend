import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent className="max-w-xs rounded-2xl sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10">
            <Lock className="h-7 w-7 text-brand-primary" />
          </div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={closeUpgradeModal}>
            {t("upgrade.maybeLater")}
          </Button>
          <Button className="flex-1" onClick={handleUpgrade}>
            {t("upgrade.upgradeNow")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
