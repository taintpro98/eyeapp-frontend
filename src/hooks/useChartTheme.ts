import { useMemo } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export type ChartTheme = {
  series: [string, string, string, string, string];
  rating: Record<1 | 2 | 3 | 4 | 5, string>;
  grid: string;
  axis: string;
  zero: string;
  cursor: string;
};

function cssColor(name: string, alpha = 1): string {
  const channels = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!channels) return "currentColor";
  return alpha === 1 ? `rgb(${channels})` : `rgb(${channels} / ${alpha})`;
}

/**
 * Recharts takes colours as props, not classes, so read the design tokens from
 * CSS variables. Recomputed when the theme flips (the `.dark` class is applied
 * synchronously by the theme store before this re-renders).
 */
export function useChartTheme(): ChartTheme {
  const theme = useThemeStore((s) => s.theme);

  return useMemo(
    () => ({
      series: [
        cssColor("--chart-1"),
        cssColor("--chart-2"),
        cssColor("--chart-3"),
        cssColor("--chart-4"),
        cssColor("--chart-5"),
      ],
      rating: {
        1: cssColor("--rating-1"),
        2: cssColor("--rating-2"),
        3: cssColor("--rating-3"),
        4: cssColor("--rating-4"),
        5: cssColor("--rating-5"),
      },
      grid: cssColor("--surface-border"),
      axis: cssColor("--text-secondary"),
      zero: cssColor("--text-secondary", 0.5),
      cursor: cssColor("--brand-primary", 0.06),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- theme is the trigger, values come from the DOM
    [theme],
  );
}
