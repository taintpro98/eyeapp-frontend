import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchBootstrap } from "@/api/bootstrap";
import { fetchAllMarkets, fetchUserMarkets } from "@/api/markets";
import { getSidebarNavItems } from "@/config/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { UpgradeModal } from "@/components/UpgradeModal";

export function AppShell() {
  const { t } = useTranslation();
  const { data: bootstrap, isLoading: bootstrapLoading } = useQuery({
    queryKey: ["bootstrap"],
    queryFn: fetchBootstrap,
  });
  const { data: allMarkets = [] } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchAllMarkets,
  });
  const { data: userMarkets = [] } = useQuery({
    queryKey: ["me/markets"],
    queryFn: fetchUserMarkets,
  });

  const { selectedMarket, setSelectedMarket } = useAppStore();
  const authUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (userMarkets.length === 0) return;
    const isValid = userMarkets.some((m) => m.code === selectedMarket);
    if (!isValid) setSelectedMarket(userMarkets[0].code);
  }, [userMarkets, selectedMarket, setSelectedMarket]);

  if (bootstrapLoading || !bootstrap) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">{t("appShell.loading")}</p>
        </div>
      </div>
    );
  }

  // Map sidebar nav keys to feature codes in the subscription system
  const SIDEBAR_FEATURE_MAP: Record<string, string> = {
    signals:     "signals",
    positions:   "positions",
    "ai-insights": "ai_insights",
  };

  // Features accessible in the currently selected market
  const currentMarket = userMarkets.find((m) => m.code === selectedMarket);
  const accessibleFeatures = new Set(
    (currentMarket?.features ?? [])
      .filter((f) => f.accessible)
      .map((f) => f.code),
  );

  const { sidebar } = bootstrap.navigation;
  const sidebarNavItems = getSidebarNavItems(sidebar).map((item) => {
    const featureCode = SIDEBAR_FEATURE_MAP[item.key];
    const accessible = featureCode
      ? accessibleFeatures.has(featureCode)
      : item.accessible; // dashboard, market, watchlist etc — keep mock value
    return {
      ...item,
      label: t(`nav.${item.key}`),
      accessible,
    };
  });

  const accessibleCodes = new Set(userMarkets.map((m) => m.code));
  const marketItems = allMarkets.map((m) => ({
    code: m.code,
    label: t(`marketToggle.${m.code}`, { defaultValue: m.name }),
    accessible: accessibleCodes.has(m.code),
    selected: m.code === selectedMarket,
    reason: null,
  }));

  return (
    <div className="flex h-screen bg-surface-bg">
      <Sidebar items={sidebarNavItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          marketToggleItems={marketItems}
          selectedMarket={selectedMarket}
          onMarketSelect={setSelectedMarket}
          userDisplayName={authUser?.display_name ?? bootstrap.user.displayName}
          planCode={bootstrap.subscription.planCode}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <UpgradeModal />
    </div>
  );
}
