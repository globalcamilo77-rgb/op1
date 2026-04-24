'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Filter,
  MousePointerClick,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'
import {
  AnalyticsEvent,
  AnalyticsEventType,
  useAnalyticsStore,
} from '@/lib/analytics-store'

type Range = '7d' | '30d' | 'all'

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function pct(value: number) {
  if (!Number.isFinite(value)) return '-'
  return `${(value * 100).toFixed(1)}%`
}

function rangeStart(range: Range): number {
  const now = Date.now()
  if (range === '7d') return now - 7 * 24 * 60 * 60 * 1000
  if (range === '30d') return now - 30 * 24 * 60 * 60 * 1000
  return 0
}

function uniqueSessions(events: AnalyticsEvent[]): number {
  return new Set(events.map((e) => e.sessionId)).size
}

function countType(events: AnalyticsEvent[], type: AnalyticsEventType): number {
  return events.filter((e) => e.type === type).length
}

function sumValue(events: AnalyticsEvent[], type: AnalyticsEventType): number {
  return events.filter((e) => e.type === type).reduce((acc, e) => acc + (e.value || 0), 0)
}

function uniqueSessionsByType(events: AnalyticsEvent[], type: AnalyticsEventType): number {
  const set = new Set<string>()
  for (const e of events) {
    if (e.type === type) set.add(e.sessionId)
  }
  return set.size
}

const KPI_ICON_MAP = {
  sessions: Users,
  pageViews: Activity,
  addToCart: MousePointerClick,
  checkout: Target,
  purchases: TrendingUp,
  revenue: DollarSign,
} as const

export default function AdminMarketingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const events = useAnalyticsStore((state) => state.events)
  const spends = useAnalyticsStore((state) => state.spends)
  const addSpend = useAnalyticsStore((state) => state.addSpend)
  const removeSpend = useAnalyticsStore((state) => state.removeSpend)
  const clearEvents = useAnalyticsStore((state) => state.clearEvents)

  const [range, setRange] = useState<Range>('30d')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [hydrated, setHydrated] = useState(false)

  const [spendCampaign, setSpendCampaign] = useState('')
  const [spendSource, setSpendSource] = useState('')
  const [spendAmount, setSpendAmount] = useState('')
  const [spendStart, setSpendStart] = useState('')
  const [spendEnd, setSpendEnd] = useState('')

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  const sources = useMemo(() => {
    const set = new Set<string>()
    for (const e of events) set.add(e.source)
    return Array.from(set).sort()
  }, [events])

  const filteredEvents = useMemo(() => {
    const since = rangeStart(range)
    return events.filter((e) => {
      if (e.ts < since) return false
      if (sourceFilter !== 'all' && e.source !== sourceFilter) return false
      return true
    })
  }, [events, range, sourceFilter])

  const sessions = uniqueSessions(filteredEvents)
  const pageViews = countType(filteredEvents, 'page_view')
  const leads = uniqueSessionsByType(filteredEvents, 'lead')
  const addToCartSessions = uniqueSessionsByType(filteredEvents, 'add_to_cart')
  const beginCheckoutSessions = uniqueSessionsByType(filteredEvents, 'begin_checkout')
  const purchaseCount = countType(filteredEvents, 'purchase')
  const revenue = sumValue(filteredEvents, 'purchase')

  const cvrToCart = sessions ? addToCartSessions / sessions : 0
  const cvrToCheckout = addToCartSessions ? beginCheckoutSessions / addToCartSessions : 0
  const cvrToPurchase = beginCheckoutSessions ? purchaseCount / beginCheckoutSessions : 0
  const overallConversion = sessions ? purchaseCount / sessions : 0
  const aov = purchaseCount ? revenue / purchaseCount : 0

  const sourceBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        source: string
        sessions: Set<string>
        purchases: number
        revenue: number
      }
    >()
    for (const e of filteredEvents) {
      const key = e.source || 'direct'
      if (!map.has(key)) {
        map.set(key, { source: key, sessions: new Set(), purchases: 0, revenue: 0 })
      }
      const entry = map.get(key)!
      entry.sessions.add(e.sessionId)
      if (e.type === 'purchase') {
        entry.purchases += 1
        entry.revenue += e.value || 0
      }
    }
    return Array.from(map.values())
      .map((entry) => ({
        source: entry.source,
        sessions: entry.sessions.size,
        purchases: entry.purchases,
        revenue: entry.revenue,
        conversion: entry.sessions.size ? entry.purchases / entry.sessions.size : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.sessions - a.sessions)
  }, [filteredEvents])

  const campaignBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string
        source: string
        campaign: string
        sessions: Set<string>
        purchases: number
        revenue: number
      }
    >()
    for (const e of filteredEvents) {
      const key = `${e.source}::${e.campaign}`
      if (!map.has(key)) {
        map.set(key, {
          key,
          source: e.source,
          campaign: e.campaign,
          sessions: new Set(),
          purchases: 0,
          revenue: 0,
        })
      }
      const entry = map.get(key)!
      entry.sessions.add(e.sessionId)
      if (e.type === 'purchase') {
        entry.purchases += 1
        entry.revenue += e.value || 0
      }
    }
    return Array.from(map.values())
      .map((entry) => {
        const matchingSpend = spends
          .filter((s) => s.campaign === entry.campaign && s.source === entry.source)
          .reduce((acc, s) => acc + s.amount, 0)
        const roas = matchingSpend ? entry.revenue / matchingSpend : null
        return {
          source: entry.source,
          campaign: entry.campaign,
          sessions: entry.sessions.size,
          purchases: entry.purchases,
          revenue: entry.revenue,
          spend: matchingSpend,
          roas,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredEvents, spends])

  const totalSpend = spends.reduce((acc, s) => acc + s.amount, 0)
  const overallRoas = totalSpend > 0 ? revenue / totalSpend : null

  const handleAddSpend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!spendCampaign.trim() || !spendSource.trim() || !spendAmount) return
    addSpend({
      campaign: spendCampaign.trim(),
      source: spendSource.trim(),
      amount: Number(spendAmount),
      startDate: spendStart || new Date().toISOString().slice(0, 10),
      endDate: spendEnd || new Date().toISOString().slice(0, 10),
    })
    setSpendCampaign('')
    setSpendSource('')
    setSpendAmount('')
    setSpendStart('')
    setSpendEnd('')
  }

  if (user?.role !== 'superadmin' || !hydrated) {
    return null
  }

  const kpis = [
    { key: 'sessions', label: 'Sessoes', value: sessions.toLocaleString('pt-BR'), helper: `${pageViews} pageviews` },
    { key: 'pageViews', label: 'Leads (CEP)', value: leads.toLocaleString('pt-BR'), helper: 'Sessoes com CEP capturado' },
    {
      key: 'addToCart',
      label: 'Add to cart',
      value: addToCartSessions.toLocaleString('pt-BR'),
      helper: pct(cvrToCart) + ' das sessoes',
    },
    {
      key: 'checkout',
      label: 'Iniciaram checkout',
      value: beginCheckoutSessions.toLocaleString('pt-BR'),
      helper: pct(cvrToCheckout) + ' do add to cart',
    },
    {
      key: 'purchases',
      label: 'Compras',
      value: purchaseCount.toLocaleString('pt-BR'),
      helper: pct(cvrToPurchase) + ' do checkout',
    },
    {
      key: 'revenue',
      label: 'Receita',
      value: currency(revenue),
      helper: 'Ticket medio ' + currency(aov),
    },
  ] as const

  const funnel = [
    { label: 'Sessoes', count: sessions, color: 'bg-blue-500' },
    { label: 'Leads (CEP)', count: leads, color: 'bg-cyan-500' },
    { label: 'Add to cart', count: addToCartSessions, color: 'bg-amber-500' },
    { label: 'Checkout iniciado', count: beginCheckoutSessions, color: 'bg-orange-500' },
    { label: 'Compras', count: purchaseCount, color: 'bg-green-600' },
  ]
  const funnelMax = Math.max(1, ...funnel.map((f) => f.count))

  return (
    <>
      <AdminTopbar title="Marketing & Trafego" />
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="bg-card p-4 rounded-lg shadow-sm flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 bg-secondary rounded p-1">
            {(['7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs rounded font-medium ${
                  range === r ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {r === '7d' ? 'Ultimos 7 dias' : r === '30d' ? 'Ultimos 30 dias' : 'Tudo'}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 ml-auto">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="text-sm px-2 py-1.5 border border-border rounded bg-background"
            >
              <option value="all">Todas as fontes</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apagar todos os eventos de analytics? (Investimentos sao mantidos)')) {
                clearEvents()
              }
            }}
            className="inline-flex items-center gap-1 text-xs px-2 py-1.5 border border-border rounded hover:bg-secondary"
            title="Limpar eventos"
          >
            <RefreshCw size={12} />
            Resetar eventos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => {
            const Icon = KPI_ICON_MAP[kpi.key as keyof typeof KPI_ICON_MAP]
            return (
              <div key={kpi.key} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs uppercase tracking-wide">{kpi.label}</span>
                  <Icon size={16} />
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.helper}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground inline-flex items-center gap-2">
                  <BarChart3 size={16} /> Funil de conversao
                </h2>
                <p className="text-xs text-muted-foreground">
                  Conversao geral: <strong>{pct(overallConversion)}</strong>
                  {' '}- {sessions} sessoes, {purchaseCount} compras
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {funnel.map((stage, idx) => {
                const widthPct = (stage.count / funnelMax) * 100
                const previous = idx === 0 ? null : funnel[idx - 1]
                const stepConversion =
                  previous && previous.count > 0 ? stage.count / previous.count : null
                return (
                  <div key={stage.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{stage.label}</span>
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{stage.count.toLocaleString('pt-BR')}</strong>
                        {stepConversion !== null && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs">
                            {stepConversion >= 0.5 ? (
                              <ArrowUpRight size={12} className="text-green-600" />
                            ) : (
                              <ArrowDownRight size={12} className="text-red-600" />
                            )}
                            {pct(stepConversion)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-3 rounded bg-secondary overflow-hidden">
                      <div
                        className={`h-full ${stage.color} transition-[width] duration-500`}
                        style={{ width: `${Math.max(widthPct, stage.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {sessions === 0 && (
              <div className="mt-6 bg-secondary rounded p-4 text-sm text-muted-foreground text-center">
                Ainda nao ha dados. Navegue pela loja em{' '}
                <a className="text-[#0066cc] hover:underline" href="/" target="_blank" rel="noreferrer">
                  outra aba
                </a>{' '}
                ou compartilhe links com UTMs (?utm_source=meta&utm_campaign=cimentos) para comecar a
                medir.
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground inline-flex items-center gap-2 mb-2">
              <DollarSign size={16} /> ROAS geral
            </h2>
            <p className="text-3xl font-bold mt-1">
              {overallRoas !== null ? overallRoas.toFixed(2) + 'x' : '-'}
            </p>
            <p className="text-xs text-muted-foreground">
              Receita {currency(revenue)} / Investido {currency(totalSpend)}
            </p>

            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">CPA medio</span>
                <span>{purchaseCount > 0 ? currency(totalSpend / purchaseCount) : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Custo por lead</span>
                <span>{leads > 0 ? currency(totalSpend / leads) : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket medio</span>
                <span>{currency(aov)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">Desempenho por fonte</h2>
          {sourceBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem trafego registrado no periodo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left py-2 px-2">Fonte</th>
                    <th className="text-right py-2 px-2">Sessoes</th>
                    <th className="text-right py-2 px-2">Compras</th>
                    <th className="text-right py-2 px-2">Conv.</th>
                    <th className="text-right py-2 px-2">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceBreakdown.map((row) => (
                    <tr key={row.source} className="border-b border-border last:border-b-0">
                      <td className="py-2 px-2 font-medium">{row.source}</td>
                      <td className="py-2 px-2 text-right">{row.sessions}</td>
                      <td className="py-2 px-2 text-right">{row.purchases}</td>
                      <td className="py-2 px-2 text-right">{pct(row.conversion)}</td>
                      <td className="py-2 px-2 text-right">{currency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-1">Investimentos / ROAS por campanha</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Cadastre quanto voce investiu em cada campanha (utm_source + utm_campaign) para calcular o
            ROAS automaticamente.
          </p>

          <form
            onSubmit={handleAddSpend}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_140px_140px_auto] gap-3 mb-5"
          >
            <input
              value={spendCampaign}
              onChange={(event) => setSpendCampaign(event.target.value)}
              placeholder="Campanha (utm_campaign)"
              className="px-3 py-2 border border-border rounded text-sm bg-background"
            />
            <input
              value={spendSource}
              onChange={(event) => setSpendSource(event.target.value)}
              placeholder="Fonte (utm_source)"
              className="px-3 py-2 border border-border rounded text-sm bg-background"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={spendAmount}
              onChange={(event) => setSpendAmount(event.target.value)}
              placeholder="Investido (R$)"
              className="px-3 py-2 border border-border rounded text-sm bg-background"
            />
            <input
              type="date"
              value={spendStart}
              onChange={(event) => setSpendStart(event.target.value)}
              className="px-3 py-2 border border-border rounded text-sm bg-background"
            />
            <input
              type="date"
              value={spendEnd}
              onChange={(event) => setSpendEnd(event.target.value)}
              className="px-3 py-2 border border-border rounded text-sm bg-background"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)]"
            >
              <Plus size={14} /> Adicionar
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-2">Fonte</th>
                  <th className="text-left py-2 px-2">Campanha</th>
                  <th className="text-right py-2 px-2">Sessoes</th>
                  <th className="text-right py-2 px-2">Compras</th>
                  <th className="text-right py-2 px-2">Receita</th>
                  <th className="text-right py-2 px-2">Investido</th>
                  <th className="text-right py-2 px-2">ROAS</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {campaignBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 px-2 text-center text-muted-foreground text-xs">
                      Nenhuma campanha com dados ainda. Use links com UTMs.
                    </td>
                  </tr>
                )}
                {campaignBreakdown.map((row) => {
                  const matchingSpendId = spends.find(
                    (s) => s.source === row.source && s.campaign === row.campaign,
                  )?.id
                  return (
                    <tr key={`${row.source}-${row.campaign}`} className="border-b border-border last:border-b-0">
                      <td className="py-2 px-2 font-medium">{row.source}</td>
                      <td className="py-2 px-2">{row.campaign}</td>
                      <td className="py-2 px-2 text-right">{row.sessions}</td>
                      <td className="py-2 px-2 text-right">{row.purchases}</td>
                      <td className="py-2 px-2 text-right">{currency(row.revenue)}</td>
                      <td className="py-2 px-2 text-right">{row.spend ? currency(row.spend) : '-'}</td>
                      <td className="py-2 px-2 text-right">
                        {row.roas !== null ? (
                          <span
                            className={`font-semibold ${
                              row.roas >= 2 ? 'text-green-700' : row.roas >= 1 ? 'text-amber-700' : 'text-red-700'
                            }`}
                          >
                            {row.roas.toFixed(2)}x
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {matchingSpendId && (
                          <button
                            onClick={() => removeSpend(matchingSpendId)}
                            className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-xs"
                            title="Remover investimento"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
