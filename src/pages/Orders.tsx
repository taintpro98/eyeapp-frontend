import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockOrdersList } from "@/data/mockOrders";
import { cn } from "@/lib/utils";
import type { Order } from "@/api/orders";

const PAGE_SIZE = 20;

export function OrdersPage() {
  const { t } = useTranslation();
  const [symbolFilter, setSymbolFilter] = useState("");

  // TODO: replace with real API call using fetchOrders + cursor pagination
  const allOrders = mockOrdersList;

  const filtered = useMemo(() => {
    if (!symbolFilter.trim()) return allOrders;
    return allOrders.filter((o) =>
      o.symbol.toLowerCase().includes(symbolFilter.trim().toLowerCase()),
    );
  }, [allOrders, symbolFilter]);

  // Client-side pagination (will be replaced by cursor from API)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleOrders = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const columns = useMemo(
    () => [
      { key: "symbol", header: t("orders.columns.symbol") },
      {
        key: "side",
        header: t("orders.columns.side"),
        render: (row: Order) => (
          <span
            className={cn(
              "font-medium",
              row.side === "buy"
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400",
            )}
          >
            {t(`ordersEnum.side.${row.side}` as never)}
          </span>
        ),
      },
      {
        key: "order_type",
        header: t("orders.columns.orderType"),
        render: (row: Order) => (
          <span className="capitalize">{row.order_type}</span>
        ),
      },
      {
        key: "price",
        header: t("orders.columns.price"),
        render: (row: Order) => (
          <span className="tabular-nums">
            {row.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "quantity",
        header: t("orders.columns.quantity"),
        render: (row: Order) => (
          <span className="tabular-nums">
            {row.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </span>
        ),
      },
      {
        key: "timestamp_str",
        header: t("orders.columns.time"),
        render: (row: Order) => (
          <span className="text-text-secondary">{row.timestamp_str}</span>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHeader
        title={t("orders.title")}
        subtitle={t("orders.subtitle")}
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Input
            placeholder={t("orders.filterPlaceholder")}
            className="w-full min-w-0 sm:w-48"
            value={symbolFilter}
            onChange={(e) => {
              setSymbolFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />
          <Button variant="outline" className="w-full shrink-0 sm:w-auto">
            {t("orders.filters")}
          </Button>
        </div>
      </PageHeader>

      <SectionCard
        title={t("orders.orderHistory")}
        subtitle={t("orders.orderHistorySubtitle")}
        className="p-3 sm:p-4 md:p-6"
      >
        {visibleOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            {t("orders.noOrders")}
          </p>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={visibleOrders as Record<string, unknown>[]}
              renderMobileCard={(row) => {
                const order = row as unknown as Order;
                return (
                  <div
                    className={cn(
                      "rounded-lg border border-surface-border bg-surface-card p-3 sm:p-4",
                      "dark:bg-zinc-900/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-lg font-semibold text-text-primary">
                        {order.symbol}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          order.side === "buy"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500 dark:text-red-400",
                        )}
                      >
                        {t(`ordersEnum.side.${order.side}` as never)}
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("orders.mobile.orderType")}
                        </dt>
                        <dd className="mt-0.5 font-medium capitalize text-text-primary">
                          {order.order_type}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("orders.mobile.price")}
                        </dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-text-primary">
                          {order.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("orders.mobile.quantity")}
                        </dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-text-primary">
                          {order.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {t("orders.mobile.time")}
                        </dt>
                        <dd className="mt-0.5 text-text-primary">
                          {order.timestamp_str}
                        </dd>
                      </div>
                    </dl>
                  </div>
                );
              }}
            />
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  {t("orders.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
