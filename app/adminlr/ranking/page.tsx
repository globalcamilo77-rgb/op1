'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Trophy, Medal, Award, TrendingUp, Target, ShoppingBag, Plus, Pencil, Trash2, X } from 'lucide-react'

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

interface RankingItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  goal_monthly: number
  revenue: number
  orders_count: number
  ticket_avg: number
  goal_progress: number
  position: number
}

interface Attendant {
  id: string
  name: string
  email: string | null
  phone: string | null
  goal_monthly: number
  active: boolean
}

export default function RankingPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Attendant | null>(null)

  const { data, mutate, isLoading } = useSWR<{
    ranking: RankingItem[]
    total_revenue: number
    total_orders: number
  }>(`/api/attendants/ranking?period=${period}`, fetcher, {
    refreshInterval: 30000, // atualiza a cada 30s
  })

  const { data: attendantsData, mutate: mutateAttendants } = useSWR<{ attendants: Attendant[] }>(
    '/api/attendants',
    fetcher,
  )

  const ranking = data?.ranking || []
  const totalRevenue = data?.total_revenue || 0
  const totalOrders = data?.total_orders || 0
  const champion = ranking[0]

  function openNew() {
    setEditing({ id: '', name: '', email: '', phone: '', goal_monthly: 0, active: true })
    setShowModal(true)
  }

  function openEdit(att: Attendant) {
    setEditing(att)
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return

    const isEdit = !!editing.id
    const res = await fetch('/api/attendants', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })

    if (res.ok) {
      setShowModal(false)
      setEditing(null)
      mutateAttendants()
      mutate()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja remover este atendente?')) return
    await fetch(`/api/attendants?id=${id}`, { method: 'DELETE' })
    mutateAttendants()
    mutate()
  }

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

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold px-4 py-2.5 rounded-md text-sm transition-colors"
        >
          <Plus size={16} />
          Novo atendente
        </button>
      </header>

      {/* Filtro de periodo */}
      <div className="flex flex-wrap gap-2">
        {(['today', 'week', 'month', 'all'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              period === p
                ? 'bg-[var(--orange-primary)] text-white'
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Stats gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <TrendingUp size={14} />
            Faturamento total
          </div>
          <p className="text-3xl font-extrabold mt-2">{currency(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{PERIOD_LABELS[period]}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <ShoppingBag size={14} />
            Pedidos confirmados
          </div>
          <p className="text-3xl font-extrabold mt-2">{totalOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">{PERIOD_LABELS[period]}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Trophy size={14} />
            Lider atual
          </div>
          <p className="text-2xl font-extrabold mt-2 truncate">
            {champion ? champion.name : '-'}
          </p>
          <p className="text-xs text-[var(--orange-primary)] font-semibold mt-1">
            {champion ? currency(champion.revenue) : 'Nenhum pedido ainda'}
          </p>
        </div>
      </div>

      {/* Podium dos 3 primeiros */}
      {ranking.length > 0 && (
        <div className="bg-gradient-to-br from-[var(--graphite)] to-[var(--graphite-soft)] rounded-2xl p-6 md:p-8">
          <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} />
            Podium - Top 3
          </h2>
          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
            {/* 2 lugar */}
            {ranking[1] && (
              <PodiumCard
                position={2}
                name={ranking[1].name}
                revenue={ranking[1].revenue}
                orders={ranking[1].orders_count}
                color="bg-slate-300"
                icon={<Medal className="text-slate-300" size={28} />}
                height="h-32"
              />
            )}
            {/* 1 lugar */}
            {ranking[0] && (
              <PodiumCard
                position={1}
                name={ranking[0].name}
                revenue={ranking[0].revenue}
                orders={ranking[0].orders_count}
                color="bg-yellow-400"
                icon={<Trophy className="text-yellow-400" size={36} />}
                height="h-44"
                highlight
              />
            )}
            {/* 3 lugar */}
            {ranking[2] && (
              <PodiumCard
                position={3}
                name={ranking[2].name}
                revenue={ranking[2].revenue}
                orders={ranking[2].orders_count}
                color="bg-amber-700"
                icon={<Award className="text-amber-600" size={28} />}
                height="h-24"
              />
            )}
          </div>
        </div>
      )}

      {/* Lista completa */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Classificacao geral</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {ranking.length} atendente{ranking.length !== 1 ? 's' : ''} ativo{ranking.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando ranking...</div>
        ) : ranking.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum atendente cadastrado. Clique em &quot;Novo atendente&quot; para comecar.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ranking.map((item) => {
              const fullAtt = attendantsData?.attendants.find((a) => a.id === item.id)
              return (
                <div
                  key={item.id}
                  className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        item.position === 1
                          ? 'bg-yellow-400 text-yellow-950'
                          : item.position === 2
                            ? 'bg-slate-300 text-slate-900'
                            : item.position === 3
                              ? 'bg-amber-600 text-amber-50'
                              : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {item.position}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{item.name}</p>
                      {item.phone && (
                        <p className="text-xs text-muted-foreground truncate">{item.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:flex md:items-center gap-3 md:gap-8 text-sm">
                    <div className="text-center md:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Faturamento
                      </p>
                      <p className="font-extrabold text-[var(--orange-dark)] text-base md:text-lg">
                        {currency(item.revenue)}
                      </p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Pedidos
                      </p>
                      <p className="font-bold">{item.orders_count}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Ticket medio
                      </p>
                      <p className="font-bold">{currency(item.ticket_avg)}</p>
                    </div>
                  </div>

                  {item.goal_monthly > 0 && (
                    <div className="md:w-40">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <Target size={10} />
                          Meta
                        </span>
                        <span className="font-semibold">{item.goal_progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--orange-primary)] transition-all"
                          style={{ width: `${Math.min(100, item.goal_progress)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1 md:flex-col md:gap-1">
                    {fullAtt && (
                      <>
                        <button
                          onClick={() => openEdit(fullAtt)}
                          className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-red-500 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">{editing.id ? 'Editar atendente' : 'Novo atendente'}</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditing(null)
                }}
                className="p-1 hover:bg-secondary rounded"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nome *
                </label>
                <input
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Nome do atendente"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={editing.email || ''}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Telefone
                </label>
                <input
                  value={editing.phone || ''}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="11999990000"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meta mensal (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editing.goal_monthly || 0}
                  onChange={(e) =>
                    setEditing({ ...editing, goal_monthly: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="50000"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Ativo
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditing(null)
                  }}
                  className="flex-1 px-4 py-2.5 border border-border rounded-md text-sm font-semibold hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold px-4 py-2.5 rounded-md text-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PodiumCard({
  position,
  name,
  revenue,
  orders,
  color,
  icon,
  height,
  highlight,
}: {
  position: number
  name: string
  revenue: number
  orders: number
  color: string
  icon: React.ReactNode
  height: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`mb-3 ${highlight ? 'scale-110' : ''}`}>{icon}</div>
      <p className={`text-white font-bold text-center text-sm md:text-base mb-1 ${highlight ? 'text-base md:text-lg' : ''}`}>
        {name}
      </p>
      <p className={`font-extrabold text-center mb-3 ${highlight ? 'text-yellow-400 text-xl md:text-2xl' : 'text-white text-base md:text-lg'}`}>
        {currency(revenue)}
      </p>
      <p className="text-xs text-white/70 mb-3">{orders} pedidos</p>
      <div className={`${color} ${height} w-full rounded-t-lg flex items-start justify-center pt-3`}>
        <span className="text-2xl md:text-4xl font-extrabold text-white drop-shadow">
          {position}
        </span>
      </div>
    </div>
  )
}
