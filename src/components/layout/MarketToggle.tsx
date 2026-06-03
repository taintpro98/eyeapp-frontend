import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { MarketToggleItem } from "@/types";

type MarketToggleProps = {
  items: MarketToggleItem[];
  selectedMarket: string;
  onSelect: (code: string) => void;
};

export function MarketToggle({
  items,
  selectedMarket,
  onSelect,
}: MarketToggleProps) {
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);

  const sorted = [...items].sort((a, b) => {
    if (a.code === selectedMarket) return -1;
    if (b.code === selectedMarket) return 1;
    if (a.accessible && !b.accessible) return -1;
    if (!a.accessible && b.accessible) return 1;
    return 0;
  });

  return (
    <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface-card p-1">
      {sorted.map((item) => {
        const isSelected = item.code === selectedMarket;
        const isLocked = !item.accessible;

        const handleClick = () => {
          if (isLocked) {
            openUpgradeModal({
              market: item.label,
              marketCode: item.code,
              reason: item.reason ?? undefined,
            });
          } else {
            onSelect(item.code);
          }
        };

        return (
          <button
            key={item.code}
            onClick={handleClick}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
              isSelected && "bg-brand-primary text-white shadow-sm",
              !isSelected && !isLocked && "text-text-secondary hover:bg-surface-border/50 hover:text-text-primary",
              isLocked && "cursor-not-allowed select-none text-text-secondary/40",
            )}
          >
            {isLocked && <Lock className="h-3 w-3 shrink-0" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
