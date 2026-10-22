import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lumi } from "@/components/Lumi";

type EmptyStateProps = {
  icon?: LucideIcon;
  /** Hiển thị linh vật Lumi thay cho icon */
  mascot?: "thinking" | "happy";
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  mascot,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-surface-border bg-surface-warm/50 py-12 px-6 text-center",
        className,
      )}
    >
      {mascot ? (
        <Lumi mood={mascot} className="h-24 w-24" />
      ) : Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-border/50">
          <Icon className="h-7 w-7 text-text-secondary" />
        </div>
      )}
      <h3 className="mt-4 text-base font-medium text-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-text-secondary max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
