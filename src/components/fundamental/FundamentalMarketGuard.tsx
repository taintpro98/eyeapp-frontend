import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Landmark } from "lucide-react";
import { fetchAllMarkets } from "@/api/markets";
import { VN_STOCK_MARKET_ID } from "@/api/fa";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useMarketId } from "@/hooks/useMarketId";

/** Renders children only on the VN stock market; elsewhere explains why and links across. */
export function FundamentalMarketGuard({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const marketId = useMarketId();
  // Same query key as AppShell, so this reads the cached list.
  const { data: markets = [] } = useQuery({ queryKey: ["markets"], queryFn: fetchAllMarkets });

  if (marketId === VN_STOCK_MARKET_ID) return <>{children}</>;

  const vnCode = markets.find((m) => m.market_id === VN_STOCK_MARKET_ID)?.code ?? "vnstock";

  return (
    <EmptyState
      icon={Landmark}
      title={t("fa.guard.title")}
      description={t("fa.guard.description")}
      action={
        <Button asChild>
          <Link to={`/app/${vnCode}/fundamental`}>{t("fa.guard.cta")}</Link>
        </Button>
      }
    />
  );
}
