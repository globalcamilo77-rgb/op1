'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AdminTopbar } from '@/components/admin/topbar'
import { DashboardCard } from '@/components/admin/dashboard-card'
import { useProductsStore } from '@/lib/products-store'
import {
  Package,
  DollarSign,
  Users,
  Store,
  Inbox,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Order {
  id: string
  customer_name: string
  customer_email?: string
  total: number
  status: string
  payment_method?: string
  paid_at?: string | null
  created_at: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
  }).format(value)
}

function formatCurrencyFull(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#10b981',
  completed: '#10b981',
  pending: '#f59e0b',
  processing: '#3b82f6',
  cancelled: '#ef4444',
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function AdminDashboard() {
  const productCount = useProductsStore((state) => state.products.length)
  const activeProductCount = useProductsStore(
    (state) => state.products.filter((p) => p.active).length,
  )
  const loadProducts = useProductsStore((state) => state.loadFromSupabase)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [loadProducts])

  const metrics = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'completed')
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
    const uniqueCustomers = new Set(orders.map((o) => o.customer_email || o.customer_name)).size
    const avgTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0
    return {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      totalRevenue,
      uniqueCustomers,
      avgTicket,
    }
  }, [orders])

  // Receita por mes (ultimos 6 meses)
  const revenueByMonth = useMemo(() => {
    const now = new Date()
    const months: { mes: string; receita: number; pedidos: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`
      const monthOrders = orders.filter((o) => {
        const od = new Date(o.created_at)
        return `${od.getFullYear()}-${od.getMonth()}` === monthKey &&
          (o.status === 'paid' || o.status === 'completed')
      })
      months.push({
        mes: MONTH_NAMES[d.getMonth()],
        receita: monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
        pedidos: monthOrders.length,
      })
    }
    return months
  }, [orders])

  // Distribuicao por status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1
    }
    return Object.entries(counts).map(([status, count]) => ({
      name: status === 'paid' ? 'Pago' :
            status === 'completed' ? 'Concluido' :
            status === 'pending' ? 'Pendente' :
            status === 'processing' ? 'Processando' :
            status === 'cancelled' ? 'Cancelado' : status,
      value: count,
      color: STATUS_COLORS[status] || '#9ca3af',
    }))
  }, [orders])

  // Distribuicao por forma de pagamento
  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const order of orders) {
      const method = order.payment_method || 'outros'
      counts[method] = (counts[method] || 0) + 1
    }
    return Object.entries(counts).map(([method, count]) => ({
      name: method.charAt(0).toUpperCase() + method.slice(1),
      pedidos: count,
    }))
  }, [orders])

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders])
  const isEmpty = orders.length === 0

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Welcome banner quando tudo zerado */}
        {isEmpty && productCount === 0 && !loading && (
          <div className="mb-6 rounded-2xl border-2 border-dashed border-[var(--orange-primary)]/40 bg-[var(--orange-soft)] p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--orange-primary)] text-white flex items-center justify-center flex-shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">
                  Bem-vindo a AlfaConstrucao! Comece a configurar sua loja.
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Cadastre produtos, configure pagamento e WhatsApp para comecar a receber pedidos.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link
                    href="/adminlr/produtos"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <ShoppingBag size={16} />
                    Cadastrar produtos
                  </Link>
                  <Link
                    href="/adminlr/pix"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-secondary rounded-lg text-sm font-semibold transition-colors"
                  >
                    Configurar PIX
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards de metricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <DashboardCard
            title="Total de Pedidos"
            icon={Package}
            value={metrics.totalOrders.toLocaleString('pt-BR')}
            change={`${metrics.paidOrders} pago${metrics.paidOrders !== 1 ? 's' : ''}`}
          />
          <DashboardCard
            title="Receita Total"
            icon={DollarSign}
            value={formatCurrencyFull(metrics.totalRevenue)}
            change={metrics.avgTicket > 0 ? `Ticket: ${formatCurrencyFull(metrics.avgTicket)}` : 'Sem vendas'}
          />
          <DashboardCard
            title="Clientes Unicos"
            icon={Users}
            value={metrics.uniqueCustomers.toLocaleString('pt-BR')}
            change={isEmpty ? 'Sem dados' : 'unicos com pedido'}
          />
          <DashboardCard
            title="Produtos Ativos"
            icon={Store}
            value={activeProductCount.toLocaleString('pt-BR')}
            change={
              productCount === 0
                ? 'Cadastre produtos'
                : `${productCount} cadastrados`
            }
          />
        </div>

        {/* Grafico Receita ultimos 6 meses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Receita dos Ultimos 6 Meses
            </h2>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={24} />
              </div>
            ) : isEmpty ? (
              <div className="h-[260px] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
                  <TrendingUp size={22} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Ainda nao ha receita registrada
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Quando os pedidos comecarem a entrar, a evolucao mensal aparece aqui.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--orange-primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--orange-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => formatCurrencyFull(v)}
                    labelClassName="font-semibold"
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="var(--orange-primary)"
                    strokeWidth={2}
                    fill="url(#colorReceita)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Distribuicao por status */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Pedidos por Status</h2>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={20} />
              </div>
            ) : isEmpty ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-2">
                  <Package size={18} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Sem pedidos ainda</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Grafico de pagamentos + pedidos por mes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Pedidos por Forma de Pagamento
            </h2>
            {loading ? (
              <div className="h-[220px] flex items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={20} />
              </div>
            ) : isEmpty ? (
              <div className="py-12 flex flex-col items-center text-center">
                <DollarSign size={22} className="text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Sem dados de pagamento</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={paymentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="pedidos" fill="var(--orange-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Pedidos por Mes
            </h2>
            {loading ? (
              <div className="h-[220px] flex items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={20} />
              </div>
            ) : isEmpty ? (
              <div className="py-12 flex flex-col items-center text-center">
                <Package size={22} className="text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Sem pedidos registrados</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="pedidos" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Ultimos pedidos */}
        <div className="bg-card rounded-lg border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Ultimos Pedidos</h2>
            <Link
              href="/adminlr/pedidos"
              className="text-xs text-[var(--orange-primary)] hover:underline inline-flex items-center gap-1"
            >
              Ver todos
              <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="px-5 py-12 flex justify-center">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="px-5 py-12 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <Inbox size={24} className="text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">
                Nenhum pedido foi realizado ainda
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Adicione produtos e divulgue sua loja para receber pedidos.
              </p>
              <Link
                href="/adminlr/pedidos"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary rounded-lg text-sm font-semibold transition-colors"
              >
                Criar pedido manual
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 text-xs font-mono text-foreground">{order.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{order.customer_name}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">
                        {formatCurrencyFull(Number(order.total))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: `${STATUS_COLORS[order.status] || '#9ca3af'}20`,
                            color: STATUS_COLORS[order.status] || '#9ca3af',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
