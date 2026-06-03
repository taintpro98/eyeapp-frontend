import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

type Props = {
  titleKey: string;
  hintKey: string;
};

export function AccessDeniedState({ titleKey, hintKey }: Props) {
  const { t } = useTranslation();
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
        <Lock className="h-5 w-5 text-brand-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{t(titleKey)}</p>
        <p className="max-w-xs text-xs text-text-secondary">{t(hintKey)}</p>
      </div>
      <Button
        size="sm"
        className="mt-1"
        onClick={() => openUpgradeModal({ reasonKey: "featureRequired" })}
      >
        {t("upgrade.upgradeNow")}
      </Button>
    </div>
  );
}
