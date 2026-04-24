'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/topbar'
import { DataTable, StatusBadge } from '@/components/admin/data-table'
import { reports } from '@/lib/mock-data'
import { useAuthStore } from '@/lib/store'

export default function RelatoriosPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  if (user?.role !== 'superadmin') {
    return null
  }

  const reportColumns = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Tipo' },
    { key: 'date', label: 'Data' },
    {
      key: 'status',
      label: 'Status',
      render: (report: typeof reports[0]) => <StatusBadge status={report.status} />,
    },
    {
      key: 'actions',
      label: 'Acoes',
      render: () => (
        <button className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-muted transition-colors">
          Download
        </button>
      ),
    },
  ]

  return (
    <>
      <AdminTopbar title="Relatorios" />
      <div className="flex-1 p-6 overflow-y-auto">
        <DataTable
          title="Relatorios do Sistema"
          columns={reportColumns}
          data={reports}
          emptyTitle="Nenhum relatório gerado"
          emptyMessage='Clique em "Gerar Novo" quando quiser exportar relatórios do sistema.'
          action={
            <button className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors">
              Gerar Novo
            </button>
          }
        />
      </div>
    </>
  )
}
