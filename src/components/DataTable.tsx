import { cn } from "@/lib/utils";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  /** Renders each row as a card below `md` instead of using the table */
  renderMobileCard?: (row: T) => React.ReactNode;
};

function getRowKey<T extends Record<string, unknown>>(
  row: T,
  index: number,
): string | number {
  const id = row["id"];
  if (id !== undefined && id !== null) return String(id);
  return index;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  className,
  renderMobileCard,
}: DataTableProps<T>) {
  const table = (
    <table className="min-w-[640px] w-full text-sm">
      <thead>
        <tr className="border-b border-surface-border bg-surface-warm/50">
          {columns.map((col) => (
            <th
              key={String(col.key)}
              className="px-4 py-3 text-left font-medium text-text-secondary"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={getRowKey(row, i)}
            className="border-b border-surface-border last:border-0 transition-colors hover:bg-surface-warm/30"
          >
            {columns.map((col) => (
              <td key={String(col.key)} className="px-4 py-3 text-text-primary">
                {col.render
                  ? col.render(row)
                  : String(row[col.key as keyof T] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!renderMobileCard) {
    return (
      <div
        className={cn(
          "overflow-x-auto rounded-card border border-surface-border",
          className,
        )}
      >
        {table}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <div className="flex flex-col gap-3 md:hidden">
        {data.map((row, i) => (
          <div key={getRowKey(row, i)}>{renderMobileCard(row)}</div>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-card border border-surface-border md:block">
        {table}
      </div>
    </div>
  );
}
