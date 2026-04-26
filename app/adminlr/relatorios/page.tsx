'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Download,
  RefreshCcw,
  ShoppingCart,
  Users,
  Wallet,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'

interface Summary {
  days: number
  series: Array<{
    date: string
    orders: number
    revenue: number
    leads: number
    pixApproved: number
  }>
  totals: {
    orders: number
    revenue: number
    leads: number
    pixApproved: number
    activeIpBlocks: number
    manualBlocks: number
  }
}

const REPORTS = [
  { type: 'orders', label: 'Pedidos', description: 'Todos os pedidos com cliente, valor e status.' },
  { type: 'leads', label: 'Leads', description: 'Contatos capturados pelos formularios da loja.' },
  { type: 'events', label: 'Analytics', description: 'Eventos de navegacao e conversao registrados.' },
  { type: 'pix', label: 'PIX', description: 'Eventos do webhook PIX (gerado e aprovado).' },
  { type: 'ip-blocks', label: 'Bloqueios de IP', description: 'IPs bloqueados, automaticos e manuais.' },
] as const

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function RelatoriosPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  useEffect(() => {
    if (user?.role !== 'superadmin') return
    let cancelled = false
    setLoading(true)
    fetch(`/api/reports/summary?days=${days}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: Summary) => {
        if (!cancelled) setSummary(data)
      })
      .catch((err) => console.error('[relatorios] erro:', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [days, user])

  const totalsCards = useMemo(() => {
    if (!summary) return []
    const t = summary.totals
    return [
      {
        label: 'Receita',
        value: formatCurrency(t.revenue),
        icon: TrendingUp,
        accent: 'text-emerald-600',
      },
      { label: 'Pedidos', value: String(t.orders), icon: ShoppingCart, accent: 'text-foreground' },
      { label: 'Leads', value: String(t.leads), icon: Users, accent: 'text-foreground' },
      {
        label: 'PIX aprovados',
        value: String(t.pixApproved),
        icon: Wallet,
        accent: 'text-emerald-600',
      },
      {
        label: 'IPs bloqueados',
        value: String(t.activeIpBlocks),
        icon: ShieldAlert,
        accent: 'text-amber-600',
      },
    ]
  }, [summary])

  if (user?.role !== 'superadmin') {
    return null
  }

  return (
    <>
      <AdminTopbar title="Relatorios" />
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Resumo geral</h2>
            <p className="text-sm text-muted-foreground">
              Dados em tempo real do Supabase. Janela: ultimos {days} dias.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-card border border-border rounded px-3 py-2 text-sm text-foreground"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
            >
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
              <option value={180}>180 dias</option>
            </select>
            <button
              type="button"
              onClick={() => setDays((d) => d)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded text-sm font-medium hover:bg-muted transition-colors"
              aria-label="Atualizar"
            >
              <RefreshCcw size={14} />
              Atualizar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {totalsCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                  <Icon size={14} className={card.accent} />
                </div>
                <p className={`text-xl font-bold ${card.accent}`}>{loading ? '...' : card.value}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">Receita por dia</h3>
          <div className="h-72 w-full">
            {summary && summary.series.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'Receita' ? [formatCurrency(value), name] : [value, name]
                    }
                    labelFormatter={(l) => `Dia ${formatDate(l as string)}`}
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Receita"
                    stroke="var(--orange-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Pedidos"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                {loading ? 'Carregando...' : 'Sem dados nesse intervalo.'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">Exportar CSV</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {REPORTS.map((r) => (
              <a
                key={r.type}
                href={`/api/reports/${r.type}`}
                className="flex items-start justify-between gap-3 p-4 rounded-lg border border-border hover:border-[var(--orange-primary)] transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[var(--orange-primary)] text-white shrink-0 group-hover:bg-[var(--orange-dark)] transition-colors">
                  <Download size={12} />
                  CSV
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
