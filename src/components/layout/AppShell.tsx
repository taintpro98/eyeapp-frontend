import { useEffect } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
  const { market: urlMarket } = useParams<{ market?: string }>();

  const { data: bootstrap, isLoading: bootstrapLoading } = useQuery({
    queryKey: ["bootstrap"],
    queryFn: fetchBootstrap,
  });
  const { data: allMarkets = [] } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchAllMarkets,
  });
  const { data: userMarkets = [], isSuccess: marketsLoaded } = useQuery({
    queryKey: ["me/markets"],
    queryFn: fetchUserMarkets,
  });

  const { selectedMarket, setSelectedMarket } = useAppStore();
  const authUser = useAuthStore((s) => s.user);

  // Redirect to onboarding if user has no markets yet.
  useEffect(() => {
    if (marketsLoaded && userMarkets.length === 0) {
      navigate("/onboarding", { replace: true });
    }
  }, [marketsLoaded, userMarkets, navigate]);

  // Keep the Zustand store in sync with the URL market param.
  // When on market-agnostic pages (profile, billing) the param is absent —
  // in that case we leave the store as-is so it retains the last known market.
  useEffect(() => {
    if (!urlMarket) return;
    const isValid = userMarkets.some((m) => m.code === urlMarket);
    if (isValid) {
      if (urlMarket !== selectedMarket) setSelectedMarket(urlMarket);
    } else if (userMarkets.length > 0) {
      // URL has an invalid/inaccessible market → redirect to the first valid one
      const fallback = userMarkets[0].code;
      const pageParts = location.pathname.split("/").slice(3).join("/");
      navigate(`/app/${fallback}/${pageParts || "dashboard"}`, { replace: true });
    }
  }, [urlMarket, userMarkets, selectedMarket, setSelectedMarket, navigate, location.pathname]);

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
    signals:       "signals",
    positions:     "positions",
    watchlist:     "watchlist",
    portfolio:     "portfolio",
    analysis:      "analysis",
    "ai-insights": "ai_insights",
  };

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
      : item.accessible;

    // Inject the current market into paths that start with /app/.
    // e.g. "/app/positions" → "/app/stocks/positions"
    // Market-agnostic paths (profile, billing, settings) don't go through
    // this sidebar so they keep their /app/<page> form unchanged.
    const path = item.path.replace(/^\/app\//, `/app/${selectedMarket}/`);

    return {
      ...item,
      path,
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

  // Switching markets: navigate to the same page under the new market.
  const handleMarketSelect = (code: string) => {
    if (code === selectedMarket) return;
    // Extract page path after /app/<market>/ (or fall back to "dashboard")
    const parts = location.pathname.split("/");
    // parts: ["", "app", "<market>", "<page>", ...]
    const pageParts = parts.slice(3).join("/");
    navigate(`/app/${code}/${pageParts || "dashboard"}`, { replace: false });
  };

  return (
    <div className="flex h-screen bg-surface-bg">
      <Sidebar items={sidebarNavItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          marketToggleItems={marketItems}
          selectedMarket={selectedMarket}
          onMarketSelect={handleMarketSelect}
          userDisplayName={authUser?.display_name ?? bootstrap.user.displayName}
          planCode={currentMarket?.plan ?? "free"}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <UpgradeModal />
    </div>
  );
}
