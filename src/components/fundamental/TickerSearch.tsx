import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/hooks/useMarket";
import { cn } from "@/lib/utils";

/** "Look up a ticker" box that jumps to /app/:market/fundamental/:ticker. */
export function TickerSearch({ className }: { className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const market = useMarket();
  const [value, setValue] = useState("");

  const go = () => {
    const ticker = value.trim().toUpperCase();
    if (!ticker) return;
    setValue("");
    navigate(`/app/${market}/fundamental/${encodeURIComponent(ticker)}`);
  };

  return (
    <div className={cn("flex w-full gap-2 sm:w-auto", className)}>
      <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <Input
          placeholder={t("fa.search.placeholder")}
          aria-label={t("fa.search.placeholder")}
          className="pl-9 uppercase placeholder:normal-case"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
        />
      </div>
      <Button onClick={go} className="shrink-0">
        {t("fa.search.button")}
      </Button>
    </div>
  );
}
