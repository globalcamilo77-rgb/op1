'use client'

import { AdminTopbar } from '@/components/admin/topbar'
import { DataTable, StatusBadge } from '@/components/admin/data-table'
import { orders } from '@/lib/mock-data'

export default function PedidosPage() {
  const orderColumns = [
    { key: 'id', label: 'ID', render: (order: typeof orders[0]) => `#${order.id}` },
    { key: 'customerName', label: 'Cliente' },
    { key: 'vendorName', label: 'Lojista' },
    {
      key: 'total',
      label: 'Total',
      render: (order: typeof orders[0]) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order: typeof orders[0]) => <StatusBadge status={order.status} />,
    },
    {
      key: 'actions',
      label: 'Acoes',
      render: () => (
        <button className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-muted transition-colors">
          Editar
        </button>
      ),
    },
  ]

  return (
    <>
      <AdminTopbar title="Pedidos" />
      <div className="flex-1 p-6 overflow-y-auto">
        <DataTable
          title="Gerenciar Pedidos"
          columns={orderColumns}
          data={orders}
          emptyTitle="Nenhum pedido realizado ainda"
          emptyMessage="Assim que um cliente fechar compra, o pedido aparece aqui com todos os detalhes."
          action={
            <button className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors">
              + Novo Pedido
            </button>
          }
        />
      </div>
    </>
  )
}
