import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  title: string
  columns: Column<T>[]
  data: T[]
  action?: React.ReactNode
  className?: string
  emptyTitle?: string
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  title,
  columns,
  data,
  action,
  className,
  emptyTitle = 'Nenhum registro ainda',
  emptyMessage = 'Os dados aparecerão aqui assim que forem criados.',
}: DataTableProps<T>) {
  const isEmpty = data.length === 0

  return (
    <div className={cn('bg-card rounded-lg shadow-sm overflow-hidden border border-border', className)}>
      <div className="px-4 py-4 border-b border-border flex justify-between items-center">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {action}
      </div>

      {isEmpty ? (
        <div className="px-5 py-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <Inbox size={24} className="text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={`${item.id}-${String(col.key)}`}
                      className="px-4 py-3 text-sm text-foreground border-b border-border"
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Status Badge component
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'processing' | 'delivered' | 'complete' | 'failed' | 'inactive' | 'shipped' | 'cancelled'
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    delivered: 'bg-green-100 text-green-800',
    complete: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
  }

  const statusLabels: Record<string, string> = {
    active: 'Ativo',
    delivered: 'Entregue',
    complete: 'Completo',
    pending: 'Pendente',
    processing: 'Processando',
    shipped: 'Enviado',
    failed: 'Falhou',
    cancelled: 'Cancelado',
    inactive: 'Inativo',
  }

  return (
    <span
      className={cn(
        'inline-block px-2 py-1 rounded text-xs font-semibold',
        statusStyles[status] || 'bg-gray-100 text-gray-800'
      )}
    >
      {label || statusLabels[status] || status}
    </span>
  )
}
