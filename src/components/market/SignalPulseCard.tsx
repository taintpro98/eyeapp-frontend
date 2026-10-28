import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { fetchSignals, type Signal } from "@/api/signals";
import { fetchAlertsSummary } from "@/api/ta";
import { SectionCard } from "@/components/SectionCard";
import { SignalSourceTag } from "@/components/SignalRow";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/hooks/useMarket";
import { useAuthStore } from "@/store/useAuthStore";
import { SIGNAL_BADGE_CLASS, type SignalTone } from "@/lib/signalColors";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
/** The signals API pages at most 20 items; eyebroker has no date filter. */
const PAGE_SIZE = 20;
const MAX_PAGES = 5;

/** Newest-first pages until a signal older than 24h shows up (or MAX_PAGES is hit). */
async function fetchLast24h(marketId: 1 | 2, accessToken: string): Promise<Signal[]> {
  const since = Date.now() - DAY_MS;
  const out: Signal[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetchSignals({ market_id: marketId, limit: PAGE_SIZE, offset: page * PAGE_SIZE }, accessToken);
    const recent = res.items.filter((s) => s.timestamp * 1000 >= since);
    out.push(...recent);
    if (recent.length < res.items.length || res.items.length < PAGE_SIZE) break;
  }
  return out;
}

function Count({ tone, label, value }: { tone: SignalTone; label: string; value: number }) {
  return (
    <div className={cn("flex-1 rounded-lg px-3 py-2", SIGNAL_BADGE_CLASS[tone])}>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

/**
 * Block ⑥: how many signals fired recently — ALumiEye's own algorithm (last 24h)
 * next to ta-agent's textbook indicator alerts (latest session, vnstock only).
 * Each half hides on its own when its source fails or the plan lacks access.
 */
export function SignalPulseCard({ marketId, isCrypto }: { marketId: number; isCrypto: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const market = useMarket();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: proprietary } = useQuery({
    queryKey: ["signals", marketId, "pulse"],
    queryFn: () => fetchLast24h(marketId as 1 | 2, accessToken!),
    enabled: !!accessToken,
    retry: false,
    refetchInterval: 60_000,
    select: (recent) => ({
      buy: recent.filter((s) => s.side === "buy").length,
      sell: recent.filter((s) => s.side === "sell").length,
    }),
  });

  const { data: standard } = useQuery({
    queryKey: ["ta", "alerts-summary", 1],
    queryFn: () => fetchAlertsSummary(1),
    enabled: !isCrypto,
    retry: false,
    refetchInterval: 5 * 60_000,
  });

  if (!proprietary && !standard) return null;

  return (
    <SectionCard
      title={t("market.pulse.title")}
      subtitle={proprietary && standard ? t("market.pulse.subtitle") : undefined}
    >
      {/* One source (crypto, or a plan without signals) spans the full width. */}
      <div className={cn("grid gap-6", proprietary && standard && "md:grid-cols-2")}>
        {proprietary && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <SignalSourceTag source="proprietary" />
              <span className="text-xs text-text-secondary">{t("market.pulse.last24h")}</span>
            </div>
            <div className="flex gap-2">
              <Count tone="buy" label={t("assetAnalysis.buy")} value={proprietary.buy} />
              <Count tone="sell" label={t("assetAnalysis.sell")} value={proprietary.sell} />
            </div>
            <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={() => navigate(`/app/${market}/signals`)}>
              {t("dashboard.viewAllSignals")} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {standard && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <SignalSourceTag source="standard" />
              <span className="text-xs text-text-secondary">{t("market.pulse.latestSession")}</span>
            </div>
            <div className="flex gap-2">
              <Count tone="buy" label={t("assetAnalysis.buy")} value={standard.buy} />
              <Count tone="sell" label={t("assetAnalysis.sell")} value={standard.sell} />
              <Count tone="watch" label={t("market.pulse.watch")} value={standard.watch} />
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
