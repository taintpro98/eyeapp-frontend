import { useTranslation } from "react-i18next";
import type { MarketMovers } from "@/api/markets";
import { SectionCard } from "@/components/SectionCard";
import { BreadthBar } from "@/components/MarketSnapshot";

/** Block ③ (crypto): 24h volume and direction of the 100 most traded USDT pairs. */
export function CryptoBreadthCard({
  breadth,
  className,
}: {
  breadth: NonNullable<MarketMovers["breadth"]>;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const pairs = breadth.advances + breadth.declines + breadth.unchanged;

  return (
    <SectionCard title={t("market.liquidity.titleCrypto")} className={className}>
      <p className="text-xs text-text-secondary">{t("market.liquidity.volume24h", { count: pairs })}</p>
      <p className="text-2xl font-semibold tabular-nums text-text-primary">
        ${(breadth.total_volume / 1e9).toLocaleString(locale, { maximumFractionDigits: 2 })}B
      </p>
      <BreadthBar breadth={breadth} title={t("market.liquidity.breadthCrypto", { count: pairs })} />
    </SectionCard>
  );
}
