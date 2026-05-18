import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { SectionCard } from "@/components/SectionCard";
import { fetchPositionDetail } from "@/api/positions";
import { RelativeTime } from "@/components/RelativeTime";
import { cn } from "@/lib/utils";
import type { PositionDetail, PositionStatus, PositionSide } from "@/api/positions";

function statusClass(status: PositionStatus) {
  switch (status) {
    case "running":  return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "opening":  return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "opened":   return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "closing":  return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
    case "closed":   return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

function sideClass(side: PositionSide) {
  return side === "buy"
    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

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

function formatPrice(n: number) {
  if (n === 0) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function PositionDetailPage() {
  const { t } = useTranslation();
  const { positionId } = useParams<{ positionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const selectedMarket = useAppStore((s) => s.selectedMarket);
  const marketId = (selectedMarket === "crypto" ? 1 : 2) as 1 | 2;

  const stateMarketId: 1 | 2 | undefined = (location.state as { marketId?: 1 | 2 })?.marketId;
  const resolvedMarketId = stateMarketId ?? marketId;

  const [detail, setDetail] = useState<PositionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!accessToken || !positionId) return;
    const id = parseInt(positionId, 10);
    if (isNaN(id)) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    fetchPositionDetail(resolvedMarketId, id, accessToken)
      .then((d) => setDetail(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [accessToken, positionId, resolvedMarketId]);

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

  const capacityPct =
    detail.capacity > 0 ? Math.min(100, (detail.size / detail.capacity) * 100) : 0;

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

          {/* Stats: 2-col on mobile, 3-col on sm+ */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                {t("positions.columns.avgPrice")}
              </dt>
              <dd className="mt-0.5 tabular-nums font-semibold text-text-primary">
                {formatPrice(detail.avg_price)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                {t("positions.columns.size")}
              </dt>
              <dd className="mt-0.5 tabular-nums font-semibold text-text-primary">
                {detail.size.toFixed(6)}
              </dd>
            </div>
            {/* Capacity with progress bar — spans both cols on mobile */}
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                {t("positions.columns.capacity")}
              </dt>
              <dd className="mt-1.5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-border sm:max-w-[120px]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      detail.side === "buy" ? "bg-green-500" : "bg-red-500",
                    )}
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
                <span className="tabular-nums text-sm font-semibold text-text-primary">
                  {detail.capacity.toFixed(0)}%
                </span>
              </dd>
            </div>
          </dl>
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
              {detail.orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-surface-border bg-surface-warm/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <RelativeTime timestampMs={o.timestamp * 1000} />
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
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table — hidden below sm */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-warm/50">
                    {["time", "side", "type", "price", "qty"].map((k) => (
                      <th key={k} className="px-4 py-3 text-left font-medium text-text-secondary">
                        {t(`positions.detail.col.${k}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.orders.map((o) => (
                    <tr key={o.id} className="border-b border-surface-border last:border-0 hover:bg-surface-warm/30">
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
