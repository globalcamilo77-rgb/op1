'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'

export default function SistemaPage() {
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

  return (
    <>
      <AdminTopbar title="Sistema" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-foreground">Configuracoes do Sistema</h2>

          <div className="bg-cyan-50 border border-cyan-200 p-4 rounded mb-6 flex items-start gap-3">
            <Shield className="text-cyan-600 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-cyan-800">Apenas SuperAdmin</p>
              <p className="text-sm text-cyan-700">Controle total do sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Versao</label>
              <input
                type="text"
                value="1.0.0"
                disabled
                className="px-3 py-2 border border-border rounded text-sm bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Ultimo Backup</label>
              <input
                type="text"
                value="2026-04-23 14:30:00"
                disabled
                className="px-3 py-2 border border-border rounded text-sm bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Nome da Aplicacao</label>
              <input
                type="text"
                defaultValue="AlfaConstrução"
                className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email de Suporte</label>
              <input
                type="email"
                defaultValue="contato@alfaconstrucao.com.br"
                className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors">
              Salvar Configuracoes
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm font-semibold hover:bg-muted transition-colors">
              Executar Diagnostico
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
