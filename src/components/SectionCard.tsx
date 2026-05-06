import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
};

export function SectionCard({
  title,
  subtitle,
  children,
  className,
  headerAction,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-surface-border bg-surface-card p-4 shadow-card sm:p-6",
        className,
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
