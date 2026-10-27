import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMarket } from "@/hooks/useMarket";
import { cn } from "@/lib/utils";

type SymbolLinkProps = {
  symbol: string;
  className?: string;
};

/**
 * A ticker that opens its analysis page. Stops the click from bubbling, so it
 * can sit inside clickable rows/cards (e.g. a position row that opens its detail).
 */
export function SymbolLink({ symbol, className }: SymbolLinkProps) {
  const { t } = useTranslation();
  const market = useMarket();

  return (
    <Link
      to={`/app/${market}/analysis/${encodeURIComponent(symbol)}`}
      title={t("common.viewAnalysis", { symbol })}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn(
        "rounded underline-offset-4 transition-colors hover:text-brand-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:hover:text-brand-light",
        className,
      )}
    >
      {symbol}
    </Link>
  );
}
