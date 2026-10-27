import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ratingLabelKey, ratingTier } from "@/lib/fa/ratings";
import { RATING_FILL, RATING_SOFT, RATING_TEXT } from "./ratingStyles";

type RatingBadgeProps = {
  rating: string | null | undefined;
  size?: "sm" | "md";
  className?: string;
};

/** FA rating pill: coloured dot + Vietnamese/English label, never the raw enum. */
export function RatingBadge({ rating, size = "sm", className }: RatingBadgeProps) {
  const { t } = useTranslation();
  const tier = ratingTier(rating);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        RATING_SOFT[tier],
        RATING_TEXT[tier],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", RATING_FILL[tier])} aria-hidden />
      {t(ratingLabelKey(rating))}
    </span>
  );
}
