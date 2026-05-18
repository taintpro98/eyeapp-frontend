import { ChevronRight } from "lucide-react";
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
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  onRowClick?: (row: T) => void;
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
  onRowClick,
}: DataTableProps<T>) {
  const table = (
    <table className="min-w-[640px] w-full text-sm">
      <thead>
        <tr className="border-b-2 border-surface-border bg-surface-warm/70">
          {columns.map((col) => (
            <th
              key={String(col.key)}
              className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary"
            >
              {col.header}
            </th>
          ))}
          {onRowClick && <th className="w-8" />}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={getRowKey(row, i)}
            className={cn(
              "group border-b border-surface-border last:border-0 transition-colors duration-150",
              "even:bg-surface-warm/20",
              onRowClick && "cursor-pointer hover:bg-surface-warm/60 hover:shadow-[inset_3px_0_0_var(--brand-primary)]",
              onRowClick && "row-hint",
            )}
            style={onRowClick ? { ["--row-delay" as string]: `${i * 80}ms` } : undefined}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <td key={String(col.key)} className="px-4 py-3.5 text-text-primary">
                {col.render
                  ? col.render(row)
                  : String(row[col.key as keyof T] ?? "")}
              </td>
            ))}
            {onRowClick && (
              <td className="w-8 px-2 py-3.5 text-right">
                <ChevronRight className="ml-auto h-4 w-4 text-text-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
              </td>
            )}
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
          <div
            key={getRowKey(row, i)}
            onClick={() => onRowClick?.(row)}
            className={cn(onRowClick && "cursor-pointer group/card")}
          >
            {renderMobileCard(row, i)}
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-card border border-surface-border md:block">
        {table}
      </div>
    </div>
  );
}
