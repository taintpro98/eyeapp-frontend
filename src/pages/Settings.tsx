import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/store/useThemeStore";
import { useQuery } from "@tanstack/react-query";
import { fetchBootstrap } from "@/api/bootstrap";
import { fetchUserMarkets } from "@/api/markets";
import { useAppStore } from "@/store/useAppStore";

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { data: bootstrap } = useQuery({
    queryKey: ["bootstrap"],
    queryFn: fetchBootstrap,
  });
  const selectedMarket = useAppStore((s) => s.selectedMarket);
  const { data: userMarkets = [] } = useQuery({
    queryKey: ["me/markets"],
    queryFn: fetchUserMarkets,
  });
  const currentPlan = userMarkets.find((m) => m.code === selectedMarket)?.plan ?? "free";

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <SectionCard
        title={t("language.label")}
        subtitle={t("language.description")}
      >
        <LanguageSwitcher variant="inline" />
      </SectionCard>

      <SectionCard
        title={t("settings.appearance")}
        subtitle={t("settings.appearanceSubtitle")}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-text-primary">
              {t("settings.themeLabel")}
            </p>
            <p className="text-sm text-text-secondary">
              {t("settings.themeHint")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              {t("theme.light")}
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
            >
              {t("theme.dark")}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={t("settings.profile")}
        subtitle={t("settings.profileSubtitle")}
      >
        <div className="max-w-md space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">
              {t("settings.displayName")}
            </label>
            <Input
              defaultValue={bootstrap?.user.displayName}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">
              {t("settings.email")}
            </label>
            <Input
              placeholder="alex@example.com"
              type="email"
              className="mt-1"
            />
          </div>
          <Button>{t("settings.saveChanges")}</Button>
        </div>
      </SectionCard>

      <SectionCard
        title={t("settings.security")}
        subtitle={t("settings.securitySubtitle")}
      >
        <div className="max-w-md space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">
              {t("settings.currentPassword")}
            </label>
            <Input type="password" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">
              {t("settings.newPassword")}
            </label>
            <Input type="password" className="mt-1" />
          </div>
          <Button variant="outline">{t("settings.updatePassword")}</Button>
        </div>
      </SectionCard>

      <SectionCard
        title={t("settings.planEntitlements")}
        subtitle={t("settings.planEntitlementsSubtitle")}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <PlanBadge
            label={currentPlan}
            variant={
              currentPlan === "pro"
                ? "pro"
                : currentPlan === "premium"
                  ? "premium"
                  : "default"
            }
          />
          <span className="text-sm text-text-secondary">
            {t("settings.status", {
              status: bootstrap?.subscription.status ?? "",
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/billing")}
          >
            {t("settings.manageBilling")}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
