import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { fetchWatchlist, type WatchlistItem } from "@/api/watchlist";

function PriceCell({ price }: { price: number | null }) {
  const { t } = useTranslation();
  if (price == null) {
    return <p className="font-medium text-text-secondary">{t("watchlist.priceUnavailable")}</p>;
  }
  return <p className="font-medium">{price.toLocaleString()}</p>;
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-surface-border p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-surface-border" />
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-surface-border" />
          <div className="h-3 w-24 rounded bg-surface-border" />
        </div>
      </div>
      <div className="h-4 w-20 rounded bg-surface-border" />
    </div>
  );
}

export function WatchlistPage() {
  const { t } = useTranslation();
  const selectedMarket = useAppStore((s) => s.selectedMarket);
  const accessToken = useAuthStore((s) => s.accessToken);
  const handleApiError = useApiErrorHandler();

  const marketId = (selectedMarket === "crypto" ? 1 : 2) as 1 | 2;

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetchWatchlist(marketId, accessToken);
      setItems(res.items);
      setTotal(res.total);
      setAccessDenied(false);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "feature_required" || code === "subscription_required") {
        setAccessDenied(true);
      }
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, marketId, handleApiError]);

  useEffect(() => {
    setItems([]);
    setAccessDenied(false);
    load();
  }, [load]);

  if (accessDenied) {
    return (
      <AccessDeniedState
        titleKey="watchlist.accessDenied"
        hintKey="watchlist.accessDeniedHint"
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("watchlist.title")}
        subtitle={loading ? undefined : t("watchlist.subtitle", { count: total })}
      />

      {loading ? (
        <SectionCard title={t("watchlist.trackedAssets")}>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </SectionCard>
      ) : items.length > 0 ? (
        <SectionCard title={t("watchlist.trackedAssets")}>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between rounded-lg border border-surface-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                    <Star className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.symbol}</p>
                    <p className="text-sm text-text-secondary">
                      {item.name ??
                        (item.base_asset && item.quote_asset
                          ? `${item.base_asset} / ${item.quote_asset}`
                          : item.symbol)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <PriceCell price={item.latest_price} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <EmptyState
          icon={Star}
          title={t("watchlist.emptyTitle")}
          description={t("watchlist.emptyDescription")}
        />
      )}
    </div>
  );
}
