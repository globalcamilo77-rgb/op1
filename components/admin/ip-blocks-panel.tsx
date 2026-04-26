'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Shield, ShieldOff, Plus, RefreshCw, Clock } from 'lucide-react'

interface IpBlock {
  id: string
  ip: string
  reason: string
  source: string
  manual: boolean
  expires_at: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export function IpBlocksPanel() {
  const [blocks, setBlocks] = useState<IpBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ip, setIp] = useState('')
  const [reason, setReason] = useState('Bloqueio manual')
  const [duration, setDuration] = useState<'permanent' | '1h' | '24h' | '7d'>('permanent')
  const [showExpired, setShowExpired] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ip-blocks?expired=${showExpired ? '1' : '0'}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = (await res.json()) as { blocks: IpBlock[] }
        setBlocks(data.blocks || [])
      }
    } catch (error) {
      console.error('[ip-blocks] load falhou:', error)
    } finally {
      setLoading(false)
    }
  }, [showExpired])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = ip.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      const expiresAt = computeExpires(duration)
      await fetch('/api/ip-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: trimmed,
          reason: reason.trim() || 'Bloqueio manual',
          source: 'admin',
          manual: true,
          expires_at: expiresAt,
        }),
      })
      setIp('')
      setReason('Bloqueio manual')
      setDuration('permanent')
      load()
    } catch (error) {
      console.error('[ip-blocks] add falhou:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!window.confirm('Desbloquear este IP?')) return
    try {
      await fetch(`/api/ip-blocks?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      load()
    } catch (error) {
      console.error('[ip-blocks] remove falhou:', error)
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="rounded-lg border border-border bg-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-[var(--orange-primary)]" />
          <h2 className="font-semibold text-foreground">Bloquear IP manualmente</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Endereço IP
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="ex: 187.45.123.4"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              required
            />
          </div>
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Motivo</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Bloqueio manual"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Duração</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as typeof duration)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="permanent">Permanente</option>
              <option value="1h">1 hora</option>
              <option value="24h">24 horas</option>
              <option value="7d">7 dias</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || !ip.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--orange-primary)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
          Bloquear IP
        </button>
      </form>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Shield size={16} />
            IPs bloqueados ({blocks.length})
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
                className="rounded border-border"
              />
              Mostrar expirados
            </label>
            <button
              type="button"
              onClick={load}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Recarregar"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : blocks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhum IP bloqueado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">IP</th>
                  <th className="text-left px-4 py-2 font-medium">Origem</th>
                  <th className="text-left px-4 py-2 font-medium">Motivo</th>
                  <th className="text-left px-4 py-2 font-medium">Expira</th>
                  <th className="text-right px-4 py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {blocks.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono">{b.ip}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          b.manual
                            ? 'inline-flex px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            : 'inline-flex px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }
                      >
                        {b.manual ? 'Manual' : b.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.reason}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.expires_at ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Clock size={12} />
                          {formatExpires(b.expires_at)}
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/70">Permanente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(b.id)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <ShieldOff size={12} /> Desbloquear
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function computeExpires(duration: 'permanent' | '1h' | '24h' | '7d'): string | null {
  if (duration === 'permanent') return null
  const now = Date.now()
  const ms =
    duration === '1h' ? 60 * 60 * 1000 : duration === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
  return new Date(now + ms).toISOString()
}

function formatExpires(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'expirado'
  const totalMin = Math.floor(ms / 60000)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours >= 24) return `em ${Math.floor(hours / 24)}d`
  if (hours > 0) return `em ${hours}h ${mins}m`
  return `em ${mins}m`
}
