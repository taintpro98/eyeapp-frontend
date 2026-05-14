import { useTranslation } from "react-i18next";
import { formatRelativeTime } from "@/lib/relativeTime";
import { cn } from "@/lib/utils";

type Props = {
  /** Unix timestamp in milliseconds */
  timestampMs: number;
  className?: string;
};

export function RelativeTime({ timestampMs, className }: Props) {
  const { t } = useTranslation();
  return (
    <span className={cn("whitespace-nowrap text-text-secondary", className)}>
      {formatRelativeTime(timestampMs, t)}
    </span>
  );
}
