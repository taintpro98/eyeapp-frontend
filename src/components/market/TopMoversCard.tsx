import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { MarketMovers, Mover } from "@/api/markets";
import { SectionCard } from "@/components/SectionCard";
import { SymbolLink } from "@/components/SymbolLink";
import { ChangePct } from "@/components/MarketSnapshot";
import { cn } from "@/lib/utils";

type Tab = "gainers" | "losers" | "active";
const TABS: Tab[] = ["gainers", "losers", "active"];

/** Block ④: top gainers / losers / most traded of the latest session (vnstock) or 24h (crypto). */
export function TopMoversCard({
  movers,
  isCrypto,
  className,
}: {
  movers: MarketMovers;
  isCrypto: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>("gainers");
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const rows = movers[tab];

  const price = (m: Mover) =>
    isCrypto
      ? `$${m.price.toLocaleString(undefined, { maximumSignificantDigits: m.price >= 1 ? 6 : 4 })}`
      : m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const value = (m: Mover) =>
    isCrypto
      ? `$${(m.value / 1e6).toLocaleString(locale, { maximumFractionDigits: 0 })}M`
      : t("dashboard.turnoverValue", { value: (m.value / 1e9).toLocaleString(locale, { maximumFractionDigits: 0 }) });

  return (
    <SectionCard
      title={t(isCrypto ? "market.movers.titleCrypto" : "market.movers.title")}
      subtitle={t(isCrypto ? "market.movers.subtitleCrypto" : "market.movers.subtitleStocks")}
      className={className}
    >
      <div className="mb-3 flex rounded-lg border border-surface-border p-0.5" role="tablist">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={key === tab}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-1 py-1.5 text-xs font-medium transition-colors sm:px-2 sm:text-sm",
              key === tab ? "bg-brand-primary text-white" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {t(`market.movers.tabs.${key}`)}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">{t("market.movers.empty")}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-text-secondary">
              <th className="pb-2 text-left font-medium">{t("market.columns.symbol")}</th>
              <th className="pb-2 text-right font-medium">
                {t(isCrypto ? "market.columns.price" : "market.movers.priceThousand")}
              </th>
              <th className="pb-2 text-right font-medium">%</th>
              <th className="pb-2 text-right font-medium">
                {t(isCrypto ? "market.movers.volume24h" : "market.movers.value")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {rows.map((m) => (
              <tr key={m.code}>
                <td className="py-2">
                  <SymbolLink symbol={isCrypto ? `${m.code}USDT` : m.code} className="font-semibold text-text-primary" />
                </td>
                <td className="py-2 text-right tabular-nums text-text-primary">{price(m)}</td>
                <td className="py-2 text-right">
                  <ChangePct value={m.change_pct} />
                </td>
                <td className="py-2 text-right tabular-nums text-text-secondary">{value(m)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!isCrypto && tab !== "active" && (
        <p className="mt-3 text-xs text-text-secondary">{t("market.movers.liquidityNote")}</p>
      )}
    </SectionCard>
  );
}
