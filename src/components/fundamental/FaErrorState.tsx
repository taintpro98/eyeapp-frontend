import { useTranslation } from "react-i18next";
import { PlugZap, ShieldAlert, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { TaAgentError } from "@/lib/taAgent";

type FaErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  className?: string;
};

/** Explains why FA data could not load — the service is separate from eyeapp, so say which part failed. */
export function FaErrorState({ error, onRetry, className }: FaErrorStateProps) {
  const { t } = useTranslation();
  const code = error instanceof TaAgentError ? error.code : "http";

  const icon = code === "unreachable" ? PlugZap : code === "unauthorized" || code === "forbidden" ? ShieldAlert : AlertCircle;

  return (
    <EmptyState
      icon={icon}
      title={t(`fa.error.${code}.title`)}
      description={t(`fa.error.${code}.description`)}
      className={className}
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t("fa.common.retry")}
          </Button>
        ) : undefined
      }
    />
  );
}
