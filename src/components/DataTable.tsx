import { cn } from '@/lib/utils'

type Column<T> = {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, className }: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-card border border-surface-border', className)}>
      <table className="w-full text-sm">
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
              key={i}
              className="border-b border-surface-border last:border-0 transition-colors hover:bg-surface-warm/30"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-text-primary">
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
