import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useMarketId } from "@/hooks/useMarketId";
import { SectionCard } from "@/components/SectionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { fetchPositionDetail, fetchPositionLive } from "@/api/positions";
import { RelativeTime } from "@/components/RelativeTime";
import { statusClass, sideClass } from "@/lib/positionColors";
import { formatPricePrecise as formatPrice, fmt2 } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PositionDetail } from "@/api/positions";

function BackLink({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-0.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export function PositionDetailPage() {
  const { t } = useTranslation();
  const { positionId } = useParams<{ positionId: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const handleApiError = useApiErrorHandler();
  const resolvedMarketId = useMarketId();

  const [detail, setDetail] = useState<PositionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [livePnl, setLivePnl] = useState<number | null>(null);
  const [livePositionReturn, setLivePositionReturn] = useState<number | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const autoFetchedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!accessToken || !positionId) return;
    const id = parseInt(positionId, 10);
    if (isNaN(id)) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    fetchPositionDetail(resolvedMarketId, id, accessToken)
      .then((d) => setDetail(d))
      .catch((err) => { handleApiError(err); setNotFound(true); })
      .finally(() => setLoading(false));
  }, [accessToken, positionId, resolvedMarketId, handleApiError]);

  const handleRefreshLive = useCallback(async () => {
    if (!accessToken || !positionId || liveLoading) return;
    const id = parseInt(positionId, 10);
    if (isNaN(id)) return;
    setLiveLoading(true);
    try {
      const live = await fetchPositionLive(resolvedMarketId, id, accessToken);
      setLivePrice(live.current_price);
      setLivePnl(live.current_pnl);
      setLivePositionReturn(live.position_return);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLiveLoading(false);
    }
  }, [accessToken, positionId, resolvedMarketId, liveLoading, handleApiError]);

  // For closed positions, auto-load the current market price once (no manual refresh needed).
  useEffect(() => {
    if (detail && !detail.active && autoFetchedRef.current !== detail.id) {
      autoFetchedRef.current = detail.id;
      handleRefreshLive();
    }
  }, [detail, handleRefreshLive]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className="space-y-3">
        <BackLink onBack={() => navigate(-1)} label={t("positions.detail.back")} />
        <p className="text-sm text-text-secondary">{t("positions.detail.notFound")}</p>
      </div>
    );
  }


  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Hero card */}
      <div
        className={cn(
          "rounded-xl border border-surface-border bg-surface-card p-4 sm:p-6",
          "border-l-4",
          detail.side === "buy" ? "border-l-green-500" : "border-l-red-500",
        )}
      >
        <BackLink onBack={() => navigate(-1)} label={t("positions.detail.back")} />

        <div className="mt-4 space-y-4">
          {/* Symbol + badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {detail.symbol}
              </h1>
              <Badge className={sideClass(detail.side)}>
                {t(`positionsEnum.side.${detail.side}`)}
              </Badge>
              <Badge className={statusClass(detail.status)}>
                {t(`positionsEnum.status.${detail.status}`)}
              </Badge>
              <Badge className={
                detail.term === "short_term"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
              }>
                {t(`positionsEnum.term.${detail.term}`)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              ID #{detail.id}
              <span className="mx-2 text-surface-border">·</span>
              <RelativeTime timestampMs={detail.timestamp * 1000} />
            </p>
          </div>

          {/* Live tracking card — only for open positions */}
          {detail.active ? (
          <div className="overflow-hidden rounded-xl border border-surface-border">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-surface-border bg-surface-warm/50 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  livePrice != null ? "animate-pulse bg-green-500" : "bg-surface-border",
                )} />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Live</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshLive}
                disabled={liveLoading}
                className="h-7 gap-1.5 px-2.5 text-xs text-text-secondary hover:text-text-primary"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", liveLoading && "animate-spin")} />
                {t("positions.detail.refreshLive")}
              </Button>
            </div>
            {/* Metrics grid — 2×2 on mobile, single row on sm+ */}
            {detail.stop_loss != null ? (
              <div className="grid grid-cols-2 sm:grid-cols-4">
                {/* top-left */}
                <div className="min-w-0 overflow-hidden px-4 py-3.5 border-r border-b border-surface-border sm:border-b-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {t("positions.detail.currentPrice")}
                  </p>
                  <p className="mt-1.5 tabular-nums text-lg font-bold text-text-primary">
                    {livePrice != null ? fmt2(livePrice) : <span className="text-sm font-normal text-text-secondary/40">—</span>}
                  </p>
                </div>
                {/* top-right */}
                <div className="min-w-0 overflow-hidden px-4 py-3.5 border-b border-surface-border sm:border-r sm:border-b-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {t("positions.detail.unrealizedPnl")}
                  </p>
                  <p className={cn(
                    "mt-1.5 tabular-nums text-lg font-bold",
                    livePnl == null ? "text-sm font-normal text-text-secondary/40"
                      : livePnl > 0 ? "text-green-500"
                      : livePnl < 0 ? "text-red-500"
                      : "text-text-secondary",
                  )}>
                    {livePnl == null ? "—" : `${livePnl > 0 ? "+" : ""}${fmt2(livePnl)}%`}
                  </p>
                </div>
                {/* bottom-left */}
                <div className="min-w-0 overflow-hidden px-4 py-3.5 border-r border-surface-border">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {t("positions.detail.positionReturn")}
                  </p>
                  <p className={cn(
                    "mt-1.5 tabular-nums text-lg font-bold",
                    livePositionReturn == null ? "text-sm font-normal text-text-secondary/40"
                      : livePositionReturn > 0 ? "text-green-500"
                      : livePositionReturn < 0 ? "text-red-500"
                      : "text-text-secondary",
                  )}>
                    {livePositionReturn == null ? "—" : `${livePositionReturn > 0 ? "+" : ""}${fmt2(livePositionReturn)}%`}
                  </p>
                </div>
                {/* bottom-right */}
                {(() => {
                  const dist = livePrice != null && detail.avg_price !== 0
                    ? (Math.abs(livePrice - detail.stop_loss) / detail.avg_price) * 100
                    : null;
                  const distCls = dist == null ? "text-sm font-normal text-text-secondary/40"
                    : dist > 5 ? "text-green-500"
                    : dist >= 2 ? "text-amber-500"
                    : "text-red-500";
                  return (
                    <div className="min-w-0 overflow-hidden px-4 py-3.5">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                        {t("positions.detail.distToStop")}
                      </p>
                      <p className={cn("mt-1.5 tabular-nums text-lg font-bold", distCls)}>
                        {dist == null ? "—" : `${fmt2(dist)}%`}
                      </p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-3 divide-x divide-surface-border">
                <div className="min-w-0 overflow-hidden px-4 py-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {t("positions.detail.currentPrice")}
                  </p>
                  <p className="mt-1.5 tabular-nums text-lg font-bold text-text-primary">
                    {livePrice != null ? fmt2(livePrice) : <span className="text-sm font-normal text-text-secondary/40">—</span>}
                  </p>
                </div>
                <div className="min-w-0 overflow-hidden px-4 py-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {t("positions.detail.unrealizedPnl")}
                  </p>
                  <p className={cn(
                    "mt-1.5 tabular-nums text-lg font-bold",
                    livePnl == null ? "text-sm font-normal text-text-secondary/40"
                      : livePnl > 0 ? "text-green-500"
                      : livePnl < 0 ? "text-red-500"
                      : "text-text-secondary",
                  )}>
                    {livePnl == null ? "—" : `${livePnl > 0 ? "+" : ""}${fmt2(livePnl)}%`}
                  </p>
                </div>
                <div className="min-w-0 overflow-hidden px-4 py-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {t("positions.detail.positionReturn")}
                  </p>
                  <p className={cn(
                    "mt-1.5 tabular-nums text-lg font-bold",
                    livePositionReturn == null ? "text-sm font-normal text-text-secondary/40"
                      : livePositionReturn > 0 ? "text-green-500"
                      : livePositionReturn < 0 ? "text-red-500"
                      : "text-text-secondary",
                  )}>
                    {livePositionReturn == null ? "—" : `${livePositionReturn > 0 ? "+" : ""}${fmt2(livePositionReturn)}%`}
                  </p>
                </div>
              </div>
            )}
          </div>
          ) : (
            /* Closed position — no live tracking, just the current market price */
            <div className="flex items-center justify-between rounded-xl border border-surface-border px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-text-secondary/40" />
                <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                  {t("positions.detail.currentPrice")}
                </span>
                <span className="tabular-nums text-lg font-bold text-text-primary">
                  {livePrice != null
                    ? fmt2(livePrice)
                    : <span className="text-sm font-normal text-text-secondary/40">{liveLoading ? "…" : "—"}</span>}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshLive}
                disabled={liveLoading}
                className="h-7 shrink-0 gap-1.5 px-2.5 text-xs text-text-secondary hover:text-text-primary"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", liveLoading && "animate-spin")} />
                {t("positions.detail.refreshLive")}
              </Button>
            </div>
          )}

          {/* Stats row */}
          <div className="overflow-hidden rounded-xl border border-surface-border">
            {/* Top row: Avg Price | Stop Loss | Booked P&L */}
            <div className="flex divide-x divide-surface-border">
              {/* Avg Price */}
              <div className="flex-1 px-4 py-3">
                <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                  {t("positions.columns.avgPrice")}
                </p>
                <p className="mt-1 tabular-nums font-semibold text-text-primary">
                  {fmt2(detail.avg_price)}
                </p>
              </div>

              {/* Stop Loss */}
              <div className="flex-1 px-4 py-3">
                <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                  {t("positions.detail.stopLoss")}
                </p>
                <p className="mt-1 tabular-nums font-semibold text-red-500">
                  {detail.stop_loss != null ? fmt2(detail.stop_loss) : "—"}
                </p>
              </div>

              {/* Booked PnL */}
              <div className="flex-1 px-4 py-3">
                <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                  {t("positions.detail.bookedPnl")}
                </p>
                <p className={cn(
                  "mt-1 tabular-nums font-semibold",
                  detail.booked_pnl > 0 ? "text-green-500" : detail.booked_pnl < 0 ? "text-red-500" : "text-text-secondary",
                )}>
                  {detail.booked_pnl !== 0 ? `${detail.booked_pnl > 0 ? "+" : ""}${fmt2(detail.booked_pnl)}%` : "—"}
                </p>
              </div>
            </div>

            {/* Capacity — always full width below */}
            {(() => {
                const scaleMax = Math.max(detail.capacity, detail.size, 100);
                const sizePct = (detail.size / scaleMax) * 100;
                const capPct = (detail.capacity / scaleMax) * 100;
                const marker = scaleMax > 100 ? (100 / scaleMax) * 100 : null;
                return (
                  <div className="w-full border-t border-surface-border px-4 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      {t("positions.columns.capacity")}
                    </p>
                    <div className="mt-2 flex items-start gap-4">
                      {/* Bar section */}
                      <div className="min-w-0 flex-1">
                        <div className="relative h-3.5 tabular-nums">
                          <span
                            className={cn("absolute -translate-x-1/2 text-[10px] font-semibold", detail.side === "buy" ? "text-green-500" : "text-red-500")}
                            style={{ left: `${sizePct}%` }}
                          >
                            {detail.size.toFixed(0)}%
                          </span>
                        </div>
                        <div className="relative h-2 overflow-hidden rounded-full bg-surface-border">
                          <div
                            className={cn("absolute left-0 h-full transition-all", detail.side === "buy" ? "bg-green-500/25" : "bg-red-500/25")}
                            style={{ width: `${capPct}%` }}
                          />
                          <div
                            className={cn("absolute left-0 h-full transition-all", detail.side === "buy" ? "bg-green-500" : "bg-red-500")}
                            style={{ width: `${sizePct}%` }}
                          />
                          {marker !== null && (
                            <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: `${marker}%` }} />
                          )}
                        </div>
                        <div className="relative h-3.5 tabular-nums">
                          <span
                            className="absolute -translate-x-1/2 text-[10px] font-semibold text-text-secondary"
                            style={{ left: `${capPct}%` }}
                          >
                            {detail.capacity.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {/* Legend */}
                      <div className="flex shrink-0 flex-col gap-1.5 pt-1">
                        <span className="flex items-center gap-1.5">
                          <span className={cn("h-2 w-2 shrink-0 rounded-full", detail.side === "buy" ? "bg-green-500" : "bg-red-500")} />
                          <span className="text-xs text-text-secondary">{t("positions.detail.current")}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className={cn("h-2 w-2 shrink-0 rounded-full opacity-30", detail.side === "buy" ? "bg-green-500" : "bg-red-500")} />
                          <span className="text-xs text-text-secondary">{t("positions.detail.max")}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>


        </div>
      </div>

      {/* Order history */}
      <SectionCard
        title={t("positions.detail.orders")}
        subtitle={t("positions.detail.ordersSubtitle")}
        className="p-4 sm:p-6"
      >
        {detail.orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-secondary">
            {t("positions.detail.noOrders")}
          </p>
        ) : (
          <>
            {/* Mobile cards — hidden on sm+ */}
            <div className="space-y-3 sm:hidden">
              {detail.orders.map((o, idx) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-surface-border bg-surface-warm/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums text-text-secondary">{idx + 1}.</span>
                      <RelativeTime timestampMs={o.timestamp * 1000} />
                    </div>
                    <Badge className={sideClass(o.side)}>
                      {t(`ordersEnum.side.${o.side}`)}
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.detail.col.type")}
                      </p>
                      <p className="mt-0.5 text-text-secondary">
                        {t(`positions.detail.orderType.${o.order_type}`)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.detail.col.price")}
                      </p>
                      <p className="mt-0.5 tabular-nums font-medium text-text-primary">
                        {formatPrice(o.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.detail.col.qty")}
                      </p>
                      <p className="mt-0.5 tabular-nums text-text-primary">
                        {o.quantity.toFixed(4)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.detail.col.orderPnl")}
                      </p>
                      <p className={cn(
                        "mt-0.5 tabular-nums",
                        o.order_pnl > 0 ? "text-green-500" : o.order_pnl < 0 ? "text-red-500" : "text-text-secondary",
                      )}>
                        {o.order_pnl === 0 ? "—" : `${o.order_pnl > 0 ? "+" : ""}${formatPrice(o.order_pnl)}%`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                        {t("positions.detail.col.positionPnl")}
                      </p>
                      <p className={cn(
                        "mt-0.5 tabular-nums",
                        o.position_pnl > 0 ? "text-green-500" : o.position_pnl < 0 ? "text-red-500" : "text-text-secondary",
                      )}>
                        {o.position_pnl === 0 ? "—" : `${o.position_pnl > 0 ? "+" : ""}${formatPrice(o.position_pnl)}%`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table — hidden below sm */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-warm/50">
                    {["no", "time", "side", "type", "price", "qty", "orderPnl", "positionPnl"].map((k) => (
                      <th key={k} className="px-4 py-3 text-left font-medium text-text-secondary">
                        {t(`positions.detail.col.${k}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.orders.map((o, idx) => (
                    <tr key={o.id} className="border-b border-surface-border last:border-0 hover:bg-surface-warm/30">
                      <td className="px-4 py-3 tabular-nums text-text-secondary">{idx + 1}</td>
                      <td className="px-4 py-3"><RelativeTime timestampMs={o.timestamp * 1000} /></td>
                      <td className="px-4 py-3">
                        <Badge className={sideClass(o.side)}>
                          {t(`ordersEnum.side.${o.side}`)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {t(`positions.detail.orderType.${o.order_type}`)}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium text-text-primary">
                        {formatPrice(o.price)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-text-primary">
                        {o.quantity.toFixed(4)}%
                      </td>
                      <td className={cn(
                        "px-4 py-3 tabular-nums",
                        o.order_pnl > 0 ? "text-green-500" : o.order_pnl < 0 ? "text-red-500" : "text-text-secondary",
                      )}>
                        {o.order_pnl === 0 ? "—" : `${o.order_pnl > 0 ? "+" : ""}${formatPrice(o.order_pnl)}%`}
                      </td>
                      <td className={cn(
                        "px-4 py-3 tabular-nums",
                        o.position_pnl > 0 ? "text-green-500" : o.position_pnl < 0 ? "text-red-500" : "text-text-secondary",
                      )}>
                        {o.position_pnl === 0 ? "—" : `${o.position_pnl > 0 ? "+" : ""}${formatPrice(o.position_pnl)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
