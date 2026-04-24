'use client'

import { AdminTopbar } from '@/components/admin/topbar'
import { DataTable } from '@/components/admin/data-table'
import { customers } from '@/lib/mock-data'

export default function ClientesPage() {
  const customerColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
    { key: 'ordersCount', label: 'Pedidos' },
    {
      key: 'actions',
      label: 'Acoes',
      render: () => (
        <button className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-muted transition-colors">
          Visualizar
        </button>
      ),
    },
  ]

  return (
    <>
      <AdminTopbar title="Clientes" />
      <div className="flex-1 p-6 overflow-y-auto">
        <DataTable
          title="Clientes"
          columns={customerColumns}
          data={customers}
          emptyTitle="Nenhum cliente cadastrado"
          emptyMessage="Clientes são criados automaticamente quando fecham o primeiro pedido."
        />
      </div>
    </>
  )
}
