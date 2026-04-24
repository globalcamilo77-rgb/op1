'use client'

import { AdminTopbar } from '@/components/admin/topbar'
import { DataTable, StatusBadge } from '@/components/admin/data-table'

const adminUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@alfaconstrucao.com',
    role: 'Administrador',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'SuperAdmin User',
    email: 'superadmin@alfaconstrucao.com',
    role: 'SuperAdmin',
    status: 'active' as const,
  },
]

export default function UsuariosPage() {
  const userColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Funcao' },
    {
      key: 'status',
      label: 'Status',
      render: (user: typeof adminUsers[0]) => <StatusBadge status={user.status} />,
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
      <AdminTopbar title="Usuarios" />
      <div className="flex-1 p-6 overflow-y-auto">
        <DataTable
          title="Usuarios Administrativos"
          columns={userColumns}
          data={adminUsers}
          action={
            <button className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors">
              + Novo Usuario
            </button>
          }
        />
      </div>
    </>
  )
}
