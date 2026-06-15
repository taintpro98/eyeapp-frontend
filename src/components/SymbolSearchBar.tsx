import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SymbolSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onAction: () => void;
  isApplyMode: boolean;
  loading: boolean;
  placeholder?: string;
}

export function SymbolSearchBar({
  value,
  onChange,
  onAction,
  isApplyMode,
  loading,
  placeholder,
}: SymbolSearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full gap-2 sm:w-auto">
      <Input
        placeholder={placeholder ?? t("common.filterBySymbol")}
        className="min-w-0 flex-1 sm:w-48 sm:flex-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAction()}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={onAction}
        disabled={loading}
        className="shrink-0 gap-2"
      >
        {isApplyMode ? (
          t("common.apply")
        ) : (
          <>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="hidden sm:inline">{t("common.refresh")}</span>
          </>
        )}
      </Button>
    </div>
  );
}
