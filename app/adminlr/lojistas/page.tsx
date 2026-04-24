'use client'

import { AdminTopbar } from '@/components/admin/topbar'
import { DataTable, StatusBadge } from '@/components/admin/data-table'
import { vendors } from '@/lib/mock-data'

export default function LojistasPage() {
  const vendorColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'Cidade' },
    {
      key: 'status',
      label: 'Status',
      render: (vendor: typeof vendors[0]) => <StatusBadge status={vendor.status} />,
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
      <AdminTopbar title="Lojistas" />
      <div className="flex-1 p-6 overflow-y-auto">
        <DataTable
          title="Lojistas"
          columns={vendorColumns}
          data={vendors}
          emptyTitle="Nenhum lojista cadastrado"
          emptyMessage="Cadastre lojistas parceiros para que eles possam vender pela plataforma."
          action={
            <button className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors">
              + Novo Lojista
            </button>
          }
        />
      </div>
    </>
  )
}
