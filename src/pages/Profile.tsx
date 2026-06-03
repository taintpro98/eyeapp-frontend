import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";
import { fetchUserMarkets } from "@/api/markets";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatExpiry(expiresAt: string | null, never: string): string {
  if (!expiresAt) return never;
  return new Date(expiresAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);

  const { data: userMarkets = [], isLoading } = useQuery({
    queryKey: ["me/markets"],
    queryFn: fetchUserMarkets,
  });

  const initials = (user?.display_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

      {/* Identity */}
      <SectionCard title={t("profile.identity")}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-text-primary">
              {user?.display_name}
            </p>
            <p className="truncate text-sm text-text-secondary">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
              {user?.role === "admin" ? t("profile.roleAdmin") : t("profile.roleUser")}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Subscriptions */}
      <SectionCard
        title={t("profile.subscriptions")}
        subtitle={t("profile.subscriptionsSubtitle")}
      >
        {isLoading ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            {t("common.loading")}
          </p>
        ) : userMarkets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="text-sm text-text-secondary">{t("profile.noSubscriptions")}</p>
            <Button size="sm" onClick={() => openUpgradeModal({})}>
              {t("profile.upgrade")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {userMarkets.map((market) => (
              <div
                key={market.code}
                className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-warm/30 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{market.name}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {t("profile.expires")}:{" "}
                    <span className="font-medium text-text-primary">
                      {formatExpiry(market.expires_at, t("profile.never"))}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <PlanBadge label={capitalize(market.plan)} variant="default" />
                  {market.plan !== "premium" && (
                    <button
                      onClick={() =>
                        openUpgradeModal({
                          market: market.name,
                          marketCode: market.code,
                          reasonKey: "featureRequired",
                        })
                      }
                      className="text-xs font-medium text-brand-primary hover:underline"
                    >
                      {t("profile.upgrade")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
