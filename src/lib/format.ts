/** Format a price value with up to 4 decimal places. Returns "—" for zero. */
export function formatPrice(n: number): string {
  if (n === 0) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

/** Format a price value with up to 6 decimal places. Returns "—" for zero. */
export function formatPricePrecise(n: number): string {
  if (n === 0) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/** Format a number to exactly 2 decimal places. */
export function fmt2(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
