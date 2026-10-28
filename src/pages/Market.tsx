import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import { IndexStrip } from "@/components/market/IndexStrip";
import { IndexChart } from "@/components/market/IndexChart";
import { LiquidityCard } from "@/components/market/LiquidityCard";
import { CryptoBreadthCard } from "@/components/market/CryptoBreadthCard";
import { TopMoversCard } from "@/components/market/TopMoversCard";
import { ForeignFlowCard } from "@/components/market/ForeignFlowCard";
import { SignalPulseCard } from "@/components/market/SignalPulseCard";
import { fetchForeignFlow, fetchMarketMovers } from "@/api/markets";
import { useMarketId } from "@/hooks/useMarketId";
import { useMarketOverview } from "@/hooks/useMarketOverview";
import { CRYPTO_MARKET_ID, formatAsOf } from "@/lib/marketFormat";
import { cn } from "@/lib/utils";

type SessionState = "open" | "break" | "closed" | "always";

/** HOSE trading hours (Mon–Fri 9:00–11:30, 13:00–14:45, Vietnam time). Holidays are not modelled. */
function vnSessionState(now: Date): SessionState {
  const vn = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const day = vn.getDay();
  const minutes = vn.getHours() * 60 + vn.getMinutes();
  if (day === 0 || day === 6) return "closed";
  if (minutes >= 9 * 60 && minutes < 11 * 60 + 30) return "open";
  if (minutes >= 11 * 60 + 30 && minutes < 13 * 60) return "break";
  if (minutes >= 13 * 60 && minutes < 14 * 60 + 45) return "open";
  return "closed";
}

const SESSION_DOT: Record<SessionState, string> = {
  open: "bg-green-500",
  break: "bg-amber-400",
  closed: "bg-text-secondary/50",
  always: "bg-green-500",
};

export function MarketPage() {
  const { t } = useTranslation();
  const marketId = useMarketId();
  const isCrypto = marketId === CRYPTO_MARKET_ID;
  const { data: overview, isLoading } = useMarketOverview(marketId);
  const { data: movers } = useQuery({
    queryKey: ["markets", marketId, "movers"],
    queryFn: () => fetchMarketMovers(marketId),
    refetchInterval: 60_000,
    retry: 1,
  });
  const { data: foreign } = useQuery({
    queryKey: ["markets", marketId, "foreign"],
    queryFn: () => fetchForeignFlow(marketId),
    enabled: !isCrypto,
    refetchInterval: 5 * 60_000,
    retry: 1,
  });
  // Block ③: HOSE liquidity for vnstock, top-100 pair breadth for crypto.
  const sideCard = isCrypto
    ? movers?.breadth && <CryptoBreadthCard breadth={movers.breadth} />
    : overview?.breadth && <LiquidityCard marketId={marketId} overview={overview} />;
  const showForeign = !isCrypto && !!foreign;

  // Chart follows the clicked card; reset to the first quote when the market changes.
  const [selection, setSelection] = useState<{ marketId: number; code: string } | null>(null);
  const selected =
    selection?.marketId === marketId ? selection.code : (overview?.quotes[0]?.code ?? (isCrypto ? "BTC" : "VNINDEX"));

  const session = isCrypto ? "always" : vnSessionState(new Date());

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={t("market.title")}
        subtitle={isCrypto ? t("market.subtitleCrypto") : t("market.subtitleStocks")}
      >
        {overview && (
          <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-card px-3 py-1 text-xs text-text-secondary">
            <span className={cn("h-2 w-2 rounded-full", SESSION_DOT[session])} />
            {t(`market.session.${session}`)} · {formatAsOf(overview.as_of)}
          </span>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[136px] animate-pulse rounded-card border border-surface-border bg-surface-card" />
          ))}
        </div>
      ) : (
        overview && (
          <IndexStrip
            marketId={marketId}
            quotes={overview.quotes}
            isCrypto={isCrypto}
            selected={selected}
            onSelect={(code) => setSelection({ marketId, code })}
          />
        )
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <IndexChart
          marketId={marketId}
          code={selected}
          isCrypto={isCrypto}
          className={sideCard ? "xl:col-span-2" : "xl:col-span-3"}
        />
        {sideCard}
      </div>

      {(movers || showForeign) && (
        // 3/5 + 2/5 so the foreign-flow card is wide enough for its two diverging lists at 1280px.
        <div className="grid gap-6 xl:grid-cols-5">
          {movers && (
            <TopMoversCard movers={movers} isCrypto={isCrypto} className={showForeign ? "xl:col-span-3" : "xl:col-span-5"} />
          )}
          {showForeign && <ForeignFlowCard flow={foreign} className={movers ? "xl:col-span-2" : "xl:col-span-5"} />}
        </div>
      )}

      <SignalPulseCard marketId={marketId} isCrypto={isCrypto} />
    </div>
  );
}
