'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  ShoppingBag,
  Crown,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import { useWhatsAppStore } from '@/lib/whatsapp-store'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PERIOD_LABELS: Record<string, string> = {
  today: 'Hoje',
  week: 'Esta semana',
  month: 'Este mes',
  all: 'Total',
}

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

interface AttendantStat {
  name: string
  revenue: number
  orders_count: number
}

interface RankingItem {
  name: string
  label: string
  number: string
  active: boolean
  revenue: number
  orders_count: number
  ticket_avg: number
  position: number
}

export default function RankingPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month')
  const [mounted, setMounted] = useState(false)

  const contacts = useWhatsAppStore((state) => state.contacts)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading } = useSWR<{
    stats: AttendantStat[]
    total_revenue: number
    total_orders: number
  }>(`/api/attendants/ranking?period=${period}`, fetcher, {
    refreshInterval: 30000,
  })

  const ranking = useMemo<RankingItem[]>(() => {
    if (!mounted) return []

    const statsByName = new Map<string, AttendantStat>()
    ;(data?.stats || []).forEach((s) => {
      statsByName.set(s.name.toLowerCase().trim(), s)
    })

    const items: RankingItem[] = contacts.map((contact) => {
      const stat = statsByName.get(contact.label.toLowerCase().trim())
      const revenue = stat?.revenue || 0
      const orders_count = stat?.orders_count || 0
      const ticket_avg = orders_count > 0 ? revenue / orders_count : 0

      return {
        name: contact.label,
        label: contact.label,
        number: contact.number,
        active: contact.active,
        revenue,
        orders_count,
        ticket_avg,
        position: 0,
      }
    })

    // Adicionar nomes que vieram dos pedidos mas nao estao mais no whatsapp store
    ;(data?.stats || []).forEach((stat) => {
      const exists = items.some(
        (i) => i.label.toLowerCase().trim() === stat.name.toLowerCase().trim(),
      )
      if (!exists) {
        items.push({
          name: stat.name,
          label: stat.name,
          number: '',
          active: false,
          revenue: stat.revenue,
          orders_count: stat.orders_count,
          ticket_avg: stat.orders_count > 0 ? stat.revenue / stat.orders_count : 0,
          position: 0,
        })
      }
    })

    items.sort((a, b) => b.revenue - a.revenue)
    return items.map((r, index) => ({ ...r, position: index + 1 }))
  }, [contacts, data, mounted])

  const totalRevenue = data?.total_revenue || 0
  const totalOrders = data?.total_orders || 0
  const champion = ranking[0]

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-[var(--orange-primary)]" />
            Ranking de Atendentes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Competicao de faturamento em tempo real. Atualiza automaticamente a cada 30 segundos.
          </p>
        </div>

        <Link
          href="/adminlr/whatsapp"
          className="inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold px-4 py-2.5 rounded-md text-sm transition-colors"
        >
          <MessageCircle size={16} />
          Gerenciar atendentes (WhatsApp)
          <ArrowRight size={14} />
        </Link>
      </header>

      <div className="bg-secondary border border-border rounded-lg p-4 flex items-start gap-3">
        <MessageCircle className="text-[var(--orange-primary)] mt-0.5 flex-shrink-0" size={20} />
        <div className="text-sm">
          <p className="font-semibold text-foreground">
            Os atendentes vem da pagina <span className="text-[var(--orange-primary)]">WhatsApp Rotativo</span>.
          </p>
          <p className="text-muted-foreground mt-1">
            Para adicionar ou remover atendentes da competicao, edite os contatos em{' '}
            <Link
              href="/adminlr/whatsapp"
              className="text-[var(--orange-primary)] hover:underline font-medium"
            >
              /adminlr/whatsapp
            </Link>
            . O nome do atendente nos pedidos deve ser exatamente igual ao nome cadastrado.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['today', 'week', 'month', 'all'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              period === p
                ? 'bg-[var(--orange-primary)] text-white'
                : 'bg-card border border-border text-foreground hover:border-[var(--orange-primary)]'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            <TrendingUp size={14} />
            Faturamento total
          </div>
          <div className="text-3xl font-extrabold mt-2">{currency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">{PERIOD_LABELS[period]}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            <ShoppingBag size={14} />
            Pedidos confirmados
          </div>
          <div className="text-3xl font-extrabold mt-2">{totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">{PERIOD_LABELS[period]}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            <Crown size={14} />
            Lider atual
          </div>
          <div className="text-2xl font-extrabold mt-2 truncate">
            {champion ? champion.name : '—'}
          </div>
          <p className="text-xs text-[var(--orange-primary)] font-bold mt-1">
            {champion ? currency(champion.revenue) : '—'}
          </p>
        </div>
      </div>

      {ranking.length >= 3 && (
        <div className="bg-foreground rounded-2xl p-8">
          <h2 className="text-lg font-bold text-background mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-400" size={22} />
            Podium - Top 3
          </h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            <PodiumCard item={ranking[1]} place={2} height="h-40" color="bg-slate-300" />
            <PodiumCard item={ranking[0]} place={1} height="h-56" color="bg-yellow-400" />
            <PodiumCard item={ranking[2]} place={3} height="h-32" color="bg-orange-400" />
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold">Ranking completo</h2>
          <span className="text-xs text-muted-foreground">
            {ranking.length} {ranking.length === 1 ? 'atendente' : 'atendentes'}
          </span>
        </div>

        {isLoading || !mounted ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando ranking...</div>
        ) : ranking.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum atendente cadastrado. Adicione contatos em{' '}
              <Link
                href="/adminlr/whatsapp"
                className="text-[var(--orange-primary)] hover:underline font-medium"
              >
                /adminlr/whatsapp
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ranking.map((item) => (
              <div
                key={item.label}
                className="px-5 py-4 grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center hover:bg-secondary/50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                    item.position === 1
                      ? 'bg-yellow-400 text-yellow-950'
                      : item.position === 2
                        ? 'bg-slate-300 text-slate-800'
                        : item.position === 3
                          ? 'bg-orange-400 text-orange-950'
                          : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {item.position === 1 ? (
                    <Crown size={18} />
                  ) : item.position === 2 ? (
                    <Medal size={18} />
                  ) : item.position === 3 ? (
                    <Award size={18} />
                  ) : (
                    item.position
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate flex items-center gap-2">
                    {item.name}
                    {!item.active && (
                      <span className="text-[10px] uppercase tracking-wide bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                        inativo
                      </span>
                    )}
                  </p>
                  {item.number && (
                    <p className="text-xs text-muted-foreground truncate">{item.number}</p>
                  )}
                </div>
                <div className="text-center hidden md:block">
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                  <p className="text-sm font-bold">{item.orders_count}</p>
                </div>
                <div className="text-center hidden md:block">
                  <p className="text-xs text-muted-foreground">Ticket medio</p>
                  <p className="text-sm font-bold">{currency(item.ticket_avg)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                  <p className="text-base font-extrabold text-[var(--orange-primary)]">
                    {currency(item.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PodiumCard({
  item,
  place,
  height,
  color,
}: {
  item: RankingItem | undefined
  place: number
  height: string
  color: string
}) {
  if (!item) return <div />

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-3 px-2">
        {place === 1 ? (
          <Trophy className="w-7 h-7 mx-auto text-yellow-400" />
        ) : place === 2 ? (
          <Medal className="w-6 h-6 mx-auto text-slate-300" />
        ) : (
          <Award className="w-6 h-6 mx-auto text-orange-400" />
        )}
        <p className="text-sm md:text-base font-bold text-background mt-2 line-clamp-2">
          {item.name}
        </p>
        <p className="text-base md:text-lg font-extrabold text-yellow-400 mt-1">
          {currency(item.revenue)}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.orders_count} {item.orders_count === 1 ? 'pedido' : 'pedidos'}
        </p>
      </div>
      <div
        className={`${height} ${color} w-full rounded-t-md flex items-start justify-center pt-3`}
      >
        <span className="text-3xl font-extrabold text-foreground/70">{place}</span>
      </div>
    </div>
  )
}
