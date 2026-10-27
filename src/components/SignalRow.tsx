import { BookOpen, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SIGNAL_BADGE_CLASS, SIGNAL_BORDER_CLASS, type SignalTone } from "@/lib/signalColors";

export function SignalBadge({ tone, className, children }: { tone: SignalTone; className?: string; children: React.ReactNode }) {
  return <Badge className={cn("shrink-0 whitespace-nowrap", SIGNAL_BADGE_CLASS[tone], className)}>{children}</Badge>;
}

type SignalRowProps = {
  tone: SignalTone;
  /** Badge text (Mua / Bán / Theo dõi). */
  label: React.ReactNode;
  /** Right-aligned meta, usually the time or date. */
  meta?: React.ReactNode;
  /** What follows the badge: price and size, or a description. */
  children?: React.ReactNode;
  className?: string;
};

/** One signal as a card with a coloured left accent — shared by the Overview and Technical tabs. */
export function SignalRow({ tone, label, meta, children, className }: SignalRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border-l-4 bg-surface-warm/30 px-4 py-3",
        SIGNAL_BORDER_CLASS[tone],
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <SignalBadge tone={tone}>{label}</SignalBadge>
        {children}
      </div>
      {meta != null && <div className="shrink-0 whitespace-nowrap text-xs text-text-secondary">{meta}</div>}
    </div>
  );
}

/**
 * Where a list of signals comes from, shown in the section header so users can
 * tell ALumiEye's own trading algorithm apart from textbook indicator rules.
 */
export function SignalSourceTag({ source }: { source: "proprietary" | "standard" }) {
  const { t } = useTranslation();
  const Icon = source === "proprietary" ? Sparkles : BookOpen;
  return (
    <span
      title={t(`signalSource.${source}.hint`)}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        source === "proprietary"
          ? "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-light"
          : "bg-surface-border/50 text-text-secondary",
      )}
    >
      <Icon className="h-3 w-3" />
      {t(`signalSource.${source}.label`)}
    </span>
  );
}
