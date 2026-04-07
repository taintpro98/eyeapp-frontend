/** Format VND for display (mock / Vietnam market). */
export function formatVnd(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value.toLocaleString('vi-VN')} ₫`
}
