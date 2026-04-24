'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AdminTopbar } from '@/components/admin/topbar'
import { Plus, X, Pencil, Trash2, RefreshCw, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react'

interface Order {
  id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  customer_document?: string
  total: number
  status: string
  payment_method?: string
  paid_at?: string | null
  created_at: string
}

const EMPTY_FORM = {
  id: '',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  customer_document: '',
  total: 0,
  status: 'pending',
  payment_method: 'manual',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    paid: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    completed: { label: 'Concluido', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
    processing: { label: 'Processando', color: 'bg-blue-100 text-blue-800', icon: Clock },
  }
  const c = config[status] || config.pending
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${c.color}`}>
      <Icon size={12} />
      {c.label}
    </span>
  )
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const openCreate = () => {
    setEditing(EMPTY_FORM)
    setEditingId(null)
    setIsOpen(true)
  }

  const openEdit = (order: Order) => {
    setEditing({
      id: order.id,
      customer_name: order.customer_name || '',
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || '',
      customer_document: order.customer_document || '',
      total: order.total,
      status: order.status,
      payment_method: order.payment_method || 'manual',
    })
    setEditingId(order.id)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setEditing(EMPTY_FORM)
    setEditingId(null)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing.customer_name.trim()) {
      alert('Nome do cliente e obrigatorio')
      return
    }
    if (editing.total <= 0) {
      alert('Total deve ser maior que zero')
      return
    }

    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...editing, id: editingId } : editing
      const res = await fetch('/api/orders', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) {
        alert('Erro: ' + data.error)
      } else {
        closeModal()
        await loadOrders()
      }
    } catch (error) {
      alert('Erro ao salvar pedido')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Remover pedido ${id}?`)) return
    try {
      await fetch(`/api/orders?id=${id}`, { method: 'DELETE' })
      await loadOrders()
    } catch (error) {
      alert('Erro ao remover pedido')
    }
  }

  return (
    <>
      <AdminTopbar title="Pedidos" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-base font-semibold text-foreground">Gerenciar Pedidos</h3>
              <p className="text-xs text-muted-foreground">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''} registrado{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadOrders}
                disabled={loading}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded text-sm font-semibold hover:bg-muted transition-colors inline-flex items-center gap-2 disabled:opacity-60"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Atualizar
              </button>
              <button
                onClick={openCreate}
                className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Novo Pedido
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Contato</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Pagamento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      <Loader2 size={20} className="inline-block animate-spin mr-2" />
                      Carregando pedidos...
                    </td>
                  </tr>
                )}
                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground mb-1">Nenhum pedido realizado ainda</p>
                      <p className="text-xs">
                        Crie um novo pedido manualmente ou aguarde os clientes finalizarem suas compras.
                      </p>
                    </td>
                  </tr>
                )}
                {!loading && orders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border font-mono text-xs">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border font-medium">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border text-xs">
                      {order.customer_phone && <div>{order.customer_phone}</div>}
                      {order.customer_email && <div className="text-muted-foreground">{order.customer_email}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border font-semibold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border capitalize">
                      {order.payment_method || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground border-b border-border text-xs">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(order)}
                          className="inline-flex items-center gap-1 text-sm text-[#0066cc] hover:text-[#0052a3]"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={onSubmit}
            className="bg-background rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                {editingId ? 'Editar pedido' : 'Novo pedido manual'}
              </h3>
              <button type="button" onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Nome do cliente *</label>
                <input
                  required
                  value={editing.customer_name}
                  onChange={(e) => setEditing({ ...editing, customer_name: e.target.value })}
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Telefone / WhatsApp</label>
                <input
                  value={editing.customer_phone}
                  onChange={(e) => setEditing({ ...editing, customer_phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">CPF/CNPJ</label>
                <input
                  value={editing.customer_document}
                  onChange={(e) => setEditing({ ...editing, customer_document: e.target.value })}
                  placeholder="000.000.000-00"
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={editing.customer_email}
                  onChange={(e) => setEditing({ ...editing, customer_email: e.target.value })}
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Total (R$) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min={0}
                  value={editing.total}
                  onChange={(e) => setEditing({ ...editing, total: Number(e.target.value) })}
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Forma de pagamento</label>
                <select
                  value={editing.payment_method}
                  onChange={(e) => setEditing({ ...editing, payment_method: e.target.value })}
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                >
                  <option value="manual">Manual</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="cartao">Cartao</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                  <option value="paid">Pago</option>
                  <option value="completed">Concluido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-secondary/30">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-border bg-background hover:bg-secondary rounded text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Salvando...' : editingId ? 'Atualizar pedido' : 'Criar pedido'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
