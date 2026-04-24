'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AdminTopbar } from '@/components/admin/topbar'
import { DashboardCard } from '@/components/admin/dashboard-card'
import { DataTable, StatusBadge } from '@/components/admin/data-table'
import { orders as mockOrders } from '@/lib/mock-data'
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
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

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

const EMPTY_MONTHS = ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr']

export default function AdminDashboard() {
  const productCount = useProductsStore((state) => state.products.length)
  const activeProductCount = useProductsStore(
    (state) => state.products.filter((p) => p.active).length,
  )

  const orders = mockOrders

  const metrics = useMemo(() => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    const uniqueCustomers = new Set(orders.map((o) => o.customerId)).size
    const uniqueVendors = new Set(orders.map((o) => o.vendorId)).size
    return { totalOrders, totalRevenue, uniqueCustomers, uniqueVendors }
  }, [orders])

  const statusBreakdown = useMemo(() => {
    const counts = {
      delivered: 0,
      shipped: 0,
      processing: 0,
      cancelled: 0,
    }
    for (const order of orders) {
      if (order.status === 'delivered') counts.delivered += 1
      else if (order.status === 'shipped') counts.shipped += 1
      else if (order.status === 'processing' || order.status === 'pending')
        counts.processing += 1
      else if (order.status === 'cancelled') counts.cancelled += 1
    }
    const total = orders.length || 1
    return [
      {
        label: 'Entregues',
        count: counts.delivered,
        pct: (counts.delivered / total) * 100,
        color: 'bg-green-500',
      },
      {
        label: 'Em transporte',
        count: counts.shipped,
        pct: (counts.shipped / total) * 100,
        color: 'bg-blue-500',
      },
      {
        label: 'Processando',
        count: counts.processing,
        pct: (counts.processing / total) * 100,
        color: 'bg-yellow-500',
      },
      {
        label: 'Cancelados',
        count: counts.cancelled,
        pct: (counts.cancelled / total) * 100,
        color: 'bg-red-400',
      },
    ]
  }, [orders])

  const onTimeRate = useMemo(() => {
    if (orders.length === 0) return null
    const delivered = orders.filter((o) => o.status === 'delivered').length
    return Math.round((delivered / orders.length) * 100 * 10) / 10
  }, [orders])

  const revenueData = useMemo(() => {
    return EMPTY_MONTHS.map((mes) => ({ mes, receita: 0 }))
  }, [])

  const isEmpty = orders.length === 0

  const orderColumns = [
    { key: 'id', label: 'ID', render: (order: typeof mockOrders[0]) => `#${order.id}` },
    { key: 'customerName', label: 'Cliente' },
    {
      key: 'total',
      label: 'Total',
      render: (order: typeof mockOrders[0]) => formatCurrencyFull(order.total),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order: typeof mockOrders[0]) => <StatusBadge status={order.status} />,
    },
    { key: 'createdAt', label: 'Data' },
  ]

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Welcome banner when everything is zero */}
        {isEmpty && productCount === 0 && (
          <div className="mb-6 rounded-2xl border-2 border-dashed border-[var(--orange-primary)]/40 bg-[var(--orange-soft)] p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--orange-primary)] text-white flex items-center justify-center flex-shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">
                  Bem-vindo à AlfaConstrução! O painel está zerado e pronto para começar.
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Cadastre seus produtos, configure seus métodos de pagamento e defina os números
                  de WhatsApp para começar a receber pedidos.
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
                    href="/adminlr/pagamentos"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-secondary rounded-lg text-sm font-semibold transition-colors"
                  >
                    Formas de pagamento
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/adminlr/whatsapp"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-secondary rounded-lg text-sm font-semibold transition-colors"
                  >
                    WhatsApp rotativo
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <DashboardCard
            title="Total de Pedidos"
            icon={Package}
            value={metrics.totalOrders.toLocaleString('pt-BR')}
            change={isEmpty ? 'Sem dados' : 'atualizado agora'}
          />
          <DashboardCard
            title="Receita Total"
            icon={DollarSign}
            value={formatCurrencyFull(metrics.totalRevenue)}
            change={isEmpty ? 'Sem dados' : 'atualizado agora'}
          />
          <DashboardCard
            title="Clientes Ativos"
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
                : `${productCount} cadastrados no total`
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Receita dos Últimos 6 Meses
            </h2>
            {isEmpty ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
                  <TrendingUp size={22} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Ainda não há receita registrada
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Quando os pedidos começarem a entrar, a evolução mensal aparece aqui
                  automaticamente.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--orange-primary)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--orange-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
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

          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Pedidos por Status</h2>
            {isEmpty ? (
              <div className="py-6 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-2">
                  <Package size={18} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Sem pedidos ainda
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Os status serão atualizados conforme os clientes fecharem pedidos.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                {statusBreakdown.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{s.label}</span>
                      <span className="font-medium text-foreground">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">Taxa de entrega no prazo</div>
              <div className="text-2xl font-bold mt-1 text-foreground">
                {onTimeRate === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <span className="text-green-600">{onTimeRate.toLocaleString('pt-BR')}%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="bg-card rounded-lg border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Últimos Pedidos</h2>
            </div>
            <div className="px-5 py-12 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <Inbox size={24} className="text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">
                Nenhum pedido foi realizado ainda
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Divulgue sua loja, ative WhatsApp rotativo e comece a captar pedidos. Aqui
                aparecerão os últimos fechamentos em tempo real.
              </p>
              <Link
                href="/adminlr/marketing"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary rounded-lg text-sm font-semibold transition-colors"
              >
                Ver analytics / ROAS
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <DataTable title="Últimos Pedidos" columns={orderColumns} data={orders} />
        )}
      </div>
    </>
  )
}
