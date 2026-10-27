/**
 * Numeric sort key for period codes ("2024Q1", "2024-Q1", "Q1/24", "2024") so
 * they order chronologically. 0 means "unrecognised".
 */
export function periodSortKey(period: string): number {
  if (!period) return 0;

  const quarterFirstYear = period.match(/^(\d{4})[-_]?Q([1-4])$/i);
  if (quarterFirstYear) return Number(quarterFirstYear[1]) * 10 + Number(quarterFirstYear[2]);

  const quarterSlashYear = period.match(/^Q([1-4])\/(\d{2,4})$/i);
  if (quarterSlashYear) {
    let year = Number(quarterSlashYear[2]);
    if (year < 100) year += 2000;
    return year * 10 + Number(quarterSlashYear[1]);
  }

  const year = period.match(/^(\d{4})$/);
  if (year) return Number(year[1]) * 10;

  return 0;
}

export function comparePeriods(a: string, b: string): number {
  const ka = periodSortKey(a);
  const kb = periodSortKey(b);
  if (ka !== 0 && kb !== 0 && ka !== kb) return ka - kb;
  return a.localeCompare(b);
}

/** Compact axis label: "2024Q1" → "Q1/24". */
export function formatPeriodLabel(period: string): string {
  if (!period) return "";

  const quarterFirstYear = period.match(/^(\d{4})[-_]?Q([1-4])$/i);
  if (quarterFirstYear) return `Q${quarterFirstYear[2]}/${quarterFirstYear[1].slice(2)}`;

  const quarterSlashYear = period.match(/^Q([1-4])\/(\d{2,4})$/i);
  if (quarterSlashYear) {
    const year = quarterSlashYear[2].length === 4 ? quarterSlashYear[2].slice(2) : quarterSlashYear[2];
    return `Q${quarterSlashYear[1]}/${year}`;
  }

  return period;
}
