'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Inbox } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { StatusBadge } from '@/components/admin/data-table'
import { backups } from '@/lib/mock-data'
import { useAuthStore } from '@/lib/store'

export default function BackupPage() {
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

  const backupColumns = [
    { key: 'date', label: 'Data' },
    { key: 'size', label: 'Tamanho' },
    {
      key: 'status',
      label: 'Status',
      render: (backup: typeof backups[0]) => <StatusBadge status={backup.status} />,
    },
    {
      key: 'actions',
      label: 'Acoes',
      render: () => (
        <div className="flex gap-2">
          <button className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-muted transition-colors">
            Download
          </button>
          <button className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-opacity">
            Deletar
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <AdminTopbar title="Backup" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-foreground">Gerenciar Backups</h2>

          <button className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors mb-6">
            + Executar Backup
          </button>

          {backups.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center border border-dashed border-border rounded-lg">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <Inbox size={24} className="text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">
                Nenhum backup registrado
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Os backups aparecerão aqui após a primeira execução.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  {backupColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-secondary/50 transition-colors">
                    {backupColumns.map((col) => (
                      <td
                        key={`${backup.id}-${col.key}`}
                        className="px-4 py-3 text-sm text-foreground border-b border-border"
                      >
                        {col.render
                          ? col.render(backup)
                          : String(backup[col.key as keyof typeof backup] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
