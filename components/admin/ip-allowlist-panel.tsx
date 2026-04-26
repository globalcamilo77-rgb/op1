'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, ShieldCheck, ShieldOff, Plus, RefreshCw, Eye, EyeOff } from 'lucide-react'

interface AllowlistedIp {
  id: string
  ip: string
  label: string
  created_at: string
}

interface Whoami {
  ip: string
  allowed: boolean
  blocked: boolean
}

export function IpAllowlistPanel() {
  const [items, setItems] = useState<AllowlistedIp[]>([])
  const [whoami, setWhoami] = useState<Whoami | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ip, setIp] = useState('')
  const [label, setLabel] = useState('Admin')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [listRes, whoRes] = await Promise.all([
        fetch('/api/ip-allowlist', { cache: 'no-store' }),
        fetch('/api/whoami', { cache: 'no-store' }),
      ])
      if (listRes.ok) {
        const data = (await listRes.json()) as { items: AllowlistedIp[] }
        setItems(data.items || [])
      }
      if (whoRes.ok) {
        const data = (await whoRes.json()) as Whoami
        setWhoami(data)
      }
    } catch (error) {
      console.error('[ip-allowlist] load falhou:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = ip.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      await fetch('/api/ip-allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: trimmed, label: label.trim() || 'Admin' }),
      })
      setIp('')
      setLabel('Admin')
      load()
    } catch (error) {
      console.error('[ip-allowlist] add falhou:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const protectMine = async () => {
    if (!whoami?.ip) return
    setSubmitting(true)
    try {
      await fetch('/api/ip-allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: whoami.ip, label: 'Admin / Operador' }),
      })
      load()
    } catch (error) {
      console.error('[ip-allowlist] protect falhou:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remover este IP da allowlist? Ele voltara a poder ser bloqueado.')) return
    try {
      await fetch(`/api/ip-allowlist?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      load()
    } catch (error) {
      console.error('[ip-allowlist] remove falhou:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          {whoami?.allowed ? <ShieldCheck size={18} /> : <Eye size={18} />}
          <h2 className="font-semibold text-sm">Seu IP atual</h2>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-mono text-sm">
            {whoami?.ip || <span className="text-muted-foreground">--</span>}
            {whoami?.allowed && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                <ShieldCheck size={12} /> camuflado
              </span>
            )}
            {whoami?.blocked && !whoami.allowed && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100">
                <EyeOff size={12} /> bloqueado
              </span>
            )}
          </div>
          {whoami?.ip && !whoami.allowed && (
            <button
              type="button"
              onClick={protectMine}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
              Proteger meu IP
            </button>
          )}
        </div>
        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/70">
          IPs protegidos sao IMUNES a qualquer bloqueio (PIX aprovado, rotacao detectada
          ou bloqueio manual). Use para o IP do operador / da loja fisica para
          nao ficar travado fora do checkout durante testes.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="rounded-lg border border-border bg-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-emerald-600" />
          <h2 className="font-semibold text-foreground">Adicionar IP a allowlist</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Endereço IP
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="ex: 177.170.85.161"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono"
              required
            />
          </div>
          <div className="md:col-span-7">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Identificacao
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Admin / Operador"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || !ip.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-emerald-700"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          Proteger este IP
        </button>
      </form>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck size={16} />
            IPs protegidos ({items.length})
          </h2>
          <button
            type="button"
            onClick={load}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Recarregar"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhum IP protegido ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">IP</th>
                  <th className="text-left px-4 py-2 font-medium">Identificacao</th>
                  <th className="text-left px-4 py-2 font-medium">Adicionado</th>
                  <th className="text-right px-4 py-2 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono">
                      {it.ip}
                      {whoami?.ip === it.ip && (
                        <span className="ml-2 text-[10px] uppercase text-emerald-700 dark:text-emerald-300">
                          (voce)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{it.label}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(it.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(it.id)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <ShieldOff size={12} /> Remover
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
