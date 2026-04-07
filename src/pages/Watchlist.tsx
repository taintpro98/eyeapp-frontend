import { useTranslation } from "react-i18next";
import { Star, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { mockWatchlistItems, WATCHLIST_FREE_LIMIT } from "@/data/mockWatchlist";

export function WatchlistPage() {
  const { t } = useTranslation();
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);
  const items = mockWatchlistItems;
  const atLimit = items.length >= WATCHLIST_FREE_LIMIT;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("watchlist.title")}
        subtitle={t("watchlist.subtitle", {
          count: items.length,
          max: WATCHLIST_FREE_LIMIT,
        })}
        children={
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              atLimit &&
              openUpgradeModal({
                featureKey: "watchlist",
                reasonKey: "freeWatchlistLimit",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {atLimit ? t("watchlist.upgradeToAdd") : t("watchlist.addAsset")}
          </Button>
        }
      />

      {items.length > 0 ? (
        <SectionCard title={t("watchlist.trackedAssets")}>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-surface-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                    <Star className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.symbol}</p>
                    <p className="text-sm text-text-secondary">{item.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.price}</p>
                  <p
                    className={`text-sm ${item.change24h >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {item.change24h >= 0 ? "+" : ""}
                    {item.change24h}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          {atLimit && (
            <div className="mt-4 rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-4">
              <p className="text-sm text-text-secondary">
                {t("watchlist.limitBanner")}
              </p>
              <Button
                className="mt-2"
                size="sm"
                onClick={() => openUpgradeModal({ featureKey: "watchlist" })}
              >
                {t("watchlist.upgradeToPro")}
              </Button>
            </div>
          )}
        </SectionCard>
      ) : (
        <EmptyState
          icon={Star}
          title={t("watchlist.emptyTitle")}
          description={t("watchlist.emptyDescription")}
          action={<Button>{t("watchlist.addFirst")}</Button>}
        />
      )}
    </div>
  );
}
