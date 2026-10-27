import { lazy, Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CandlestickChart } from "lucide-react";
import { fetchMarks, type UdfMark } from "@/api/ta";
import { fetchUserMarkets } from "@/api/markets";
import { useMarket } from "@/hooks/useMarket";
import { LockedCard } from "@/components/LockedCard";
import { taAgentRetry } from "@/lib/taAgent";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { SignalRow, SignalSourceTag } from "@/components/SignalRow";
import type { SignalTone } from "@/lib/signalColors";

// Vela is large (canvas engine + UI kit) and the chat pulls in the AI SDK + markdown:
// load both only when the Technical tab opens.
const VelaChart = lazy(() => import("./VelaChart").then((m) => ({ default: m.VelaChart })));
const ChatPanel = lazy(() => import("./ChatPanel").then((m) => ({ default: m.ChatPanel })));

const SIGNAL_LOOKBACK_DAYS = 90;
const SIGNAL_LIMIT = 12;

const KIND_BY_LABEL: Record<string, SignalTone> = { B: "buy", S: "sell", W: "watch" };

function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-card border border-surface-border bg-surface-card" />;
}

/** Recent ta-agent signals for one ticker, newest first. */
function RecentSignals({ ticker }: { ticker: string }) {
  const { t, i18n } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ta", "marks", ticker],
    queryFn: () => {
      const to = Math.floor(Date.now() / 1000);
      return fetchMarks({ symbol: ticker, from: to - SIGNAL_LOOKBACK_DAYS * 86400, to });
    },
    staleTime: 5 * 60 * 1000,
    retry: taAgentRetry,
  });

  const signals = useMemo(
    () =>
      [...(data ?? [])]
        .sort((a, b) => b.time - a.time || Number(b.id) - Number(a.id))
        .slice(0, SIGNAL_LIMIT),
    [data],
  );

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language === "en" ? "en-GB" : "vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    [i18n.language],
  );

  const kindOf = (mark: UdfMark): SignalTone => KIND_BY_LABEL[mark.label] ?? "watch";

  return (
    <SectionCard
      title={t("technical.signals.title")}
      subtitle={t("technical.signals.subtitle", { days: SIGNAL_LOOKBACK_DAYS })}
      headerAction={<SignalSourceTag source="standard" />}
    >
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-border/40" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-4 text-center text-sm text-text-secondary">{t("technical.signals.error")}</p>
      ) : signals.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-secondary">{t("technical.signals.empty", { ticker })}</p>
      ) : (
        <ul className="space-y-2">
          {signals.map((mark) => (
            <li key={mark.id}>
              {/* Daily signals: the meta is a date, not a time of day */}
              <SignalRow
                tone={kindOf(mark)}
                label={t(`technical.signals.kind.${kindOf(mark)}`)}
                meta={<span className="tabular-nums">{dateFmt.format(new Date(mark.time * 1000))}</span>}
              >
                <span className="min-w-0 text-sm text-text-primary">{mark.text}</span>
              </SignalRow>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/** Whether the user's plan for the current market includes the AI assistant (`ai_insights`). */
function useAiAccess(): boolean | undefined {
  const market = useMarket();
  // Same query key as AppShell / Dashboard, so this reads the cached list.
  const { data } = useQuery({ queryKey: ["me/markets"], queryFn: fetchUserMarkets });
  if (!data) return undefined;
  return data.find((m) => m.code === market)?.features.some((f) => f.code === "ai_insights" && f.accessible) ?? false;
}

function AssistantColumn({ ticker }: { ticker: string }) {
  const { t } = useTranslation();
  const access = useAiAccess();

  // The chat needs a fixed height to scroll inside; the locked card sizes to its content.
  if (access === undefined) return <div className="h-40"><ChartSkeleton /></div>;
  if (!access) {
    return (
      <LockedCard
        title={t("technical.chat.locked.title")}
        description={t("technical.chat.locked.description")}
        badge={t("technical.chat.locked.badge")}
        upgradeFeatureKey="aiInsights"
      />
    );
  }
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChatPanel ticker={ticker} className="xl:h-[640px]" activeClassName="h-[520px]" />
    </Suspense>
  );
}

/**
 * Chart + Lumi chat, shown above the analysis tabs so both tabs share one Vela
 * workspace and one conversation (switching tabs neither reloads the chart nor
 * cuts off a streaming answer). VN stocks only — the caller hides it elsewhere.
 */
export function ChartWorkspace({ ticker }: { ticker: string }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="h-[460px] sm:h-[560px] lg:h-[640px]">
        <Suspense fallback={<ChartSkeleton />}>
          <VelaChart ticker={ticker} />
        </Suspense>
      </div>
      <AssistantColumn ticker={ticker} />
    </div>
  );
}

type TechnicalSignalsPanelProps = { ticker: string; supported: boolean };

/** "Tín hiệu kỹ thuật" tab: ta-agent's latest signals for the ticker. */
export function TechnicalSignalsPanel({ ticker, supported }: TechnicalSignalsPanelProps) {
  const { t } = useTranslation();

  if (!supported) {
    return (
      <EmptyState
        icon={CandlestickChart}
        title={t("technical.unsupported.title")}
        description={t("technical.unsupported.description")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <RecentSignals ticker={ticker} />
      <p className="text-center text-xs text-text-secondary">{t("technical.disclaimer")}</p>
    </div>
  );
}
