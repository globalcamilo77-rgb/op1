'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'

interface RestoreResult {
  ok: boolean
  results: Record<string, { restored?: number; error?: string }>
}

export default function BackupPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  if (user?.role !== 'superadmin') {
    return null
  }

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch('/api/backup')
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `alfa-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao gerar backup')
    } finally {
      setDownloading(false)
    }
  }

  const handleRestore = async (file: File) => {
    if (
      !window.confirm(
        `Restaurar backup do arquivo "${file.name}"? Os dados existentes com mesmo ID serao sobrescritos.`,
      )
    )
      return
    setRestoring(true)
    setError(null)
    setRestoreResult(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      const data = (await res.json()) as RestoreResult
      if (!res.ok) {
        throw new Error('Falha ao restaurar')
      }
      setRestoreResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON invalido')
    } finally {
      setRestoring(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <AdminTopbar title="Backup" />
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--orange-primary)]/10 flex items-center justify-center shrink-0">
              <Database size={20} className="text-[var(--orange-primary)]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Backup completo do banco</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Inclui cidades, contatos, aparencia, produtos, pedidos, leads, eventos, bloqueios de IP e log de webhook PIX.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--orange-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-60"
            >
              <Download size={16} />
              {downloading ? 'Gerando backup...' : 'Baixar backup agora (JSON)'}
            </button>

            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">
              <Upload size={16} />
              {restoring ? 'Restaurando...' : 'Restaurar de arquivo JSON'}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                disabled={restoring}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleRestore(file)
                }}
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {restoreResult && (
            <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                <CheckCircle2 size={16} />
                Restauracao concluida
              </div>
              <ul className="text-xs text-foreground/80 space-y-1">
                {Object.entries(restoreResult.results).map(([table, result]) => (
                  <li key={table} className="flex items-center justify-between gap-2">
                    <span className="font-mono">{table}</span>
                    <span
                      className={
                        result.error
                          ? 'text-destructive'
                          : result.restored
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      }
                    >
                      {result.error ? `erro: ${result.error}` : `${result.restored ?? 0} registros`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">Recomendacoes</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Faca backup antes de importar bases novas ou rodar migrations grandes.</li>
            <li>Guarde o JSON num lugar seguro - ele contem dados de clientes.</li>
            <li>Restaurar nao deleta dados extras: faz upsert por id (sobrescreve duplicados).</li>
          </ul>
        </div>
      </div>
    </>
  )
}
