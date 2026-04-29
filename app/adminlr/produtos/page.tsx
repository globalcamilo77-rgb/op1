'use client'

import { FormEvent, useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  Cloud,
  CloudDownload,
  CloudUpload,
  Upload,
  Loader2,
  FileText,
} from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useProductsStore, type StoreProduct } from '@/lib/products-store'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  listProducts as listRemoteProducts,
  upsertProducts as upsertRemoteProducts,
} from '@/lib/supabase-products'

type EditingProduct = Omit<StoreProduct, 'id'> & { id?: string }

const EMPTY_FORM: EditingProduct = {
  name: '',
  category: '',
  brand: '',
  dimensions: '',
  price: 0,
  stock: 0,
  description: '',
  image: '',
  active: true,
}

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function AdminProdutosPage() {
  const { products, addProduct, updateProduct, removeProduct, toggleActive, loadFromSupabase, saveToSupabase } = useProductsStore()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<EditingProduct>(EMPTY_FORM)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [syncing, setSyncing] = useState<'idle' | 'pull' | 'push'>('idle')
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabaseReady = isSupabaseConfigured()

  // Carregar produtos do Supabase ao montar
  useEffect(() => {
    loadFromSupabase()
  }, [loadFromSupabase])

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        alert(data.error || 'Erro ao fazer upload')
        return
      }
      
      setEditing({ ...editing, image: data.url })
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const formatSupabaseError = (error: unknown): string => {
    if (!error) return 'Erro desconhecido.'
    const err = error as {
      message?: string
      code?: string
      details?: string
      hint?: string
    }
    if (err?.code === 'PGRST205' || /Could not find the table/i.test(err?.message ?? '')) {
      return 'A tabela "products" nao existe no Supabase. Rode o SQL em supabase/migrations/0001_init.sql no editor SQL do Supabase.'
    }
    if (err?.code === '42501' || /row-level security|RLS|permission denied/i.test(err?.message ?? '')) {
      return 'Permissao negada (RLS). Rode supabase/migrations/0002_allow_anon_writes.sql para liberar escrita do painel admin.'
    }
    return err?.message ?? 'Falha na sincronizacao.'
  }

  const handlePull = async () => {
    try {
      setSyncing('pull')
      setSyncMessage(null)
      await loadFromSupabase()
      const state = useProductsStore.getState()
      setSyncMessage(`Baixados ${state.products.length} produtos do Supabase.`)
    } catch (error) {
      console.error(error)
      setSyncMessage(`Falha ao baixar: ${formatSupabaseError(error)}`)
    } finally {
      setSyncing('idle')
    }
  }

  const handlePush = async () => {
    try {
      setSyncing('push')
      setSyncMessage(null)
      const result = await saveToSupabase()
      if (result?.error) {
        setSyncMessage(`Falha ao enviar: ${result.error}`)
      } else {
        setSyncMessage(`Enviados ${products.length} produtos para o Supabase.`)
      }
    } catch (error) {
      console.error(error)
      setSyncMessage(`Falha ao enviar: ${formatSupabaseError(error)}`)
    } finally {
      setSyncing('idle')
    }
  }

  const filteredProducts = useMemo(() => {
    if (filter === 'active') return products.filter((p) => p.active)
    if (filter === 'inactive') return products.filter((p) => !p.active)
    return products
  }, [products, filter])

  const activeCount = products.filter((p) => p.active).length
  const inactiveCount = products.length - activeCount

  const openCreate = () => {
    setEditing(EMPTY_FORM)
    setIsOpen(true)
  }

  const openEdit = (product: StoreProduct) => {
    setEditing(product)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setEditing(EMPTY_FORM)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing.name.trim() || !editing.category.trim()) return

    const payload = {
      name: editing.name.trim(),
      category: editing.category.trim(),
      brand: editing.brand?.trim() || '',
      dimensions: editing.dimensions?.trim() || '',
      price: Number(editing.price) || 0,
      stock: Number(editing.stock) || 0,
      description: editing.description?.trim() || '',
      image: editing.image?.trim() || '',
      active: !!editing.active,
    }

    if (editing.id) {
      updateProduct(editing.id, payload)
    } else {
      addProduct(payload)
    }

    closeModal()
  }

  return (
    <>
      <AdminTopbar title="Produtos" />
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
        <div
          className={`mb-6 p-4 rounded-lg border flex flex-wrap items-center gap-3 ${
            supabaseReady
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <Cloud
            size={18}
            className={supabaseReady ? 'text-green-700' : 'text-yellow-700'}
          />
          <div className="flex-1 min-w-[200px]">
            <p
              className={`text-sm font-semibold ${
                supabaseReady ? 'text-green-800' : 'text-yellow-800'
              }`}
            >
              {supabaseReady ? 'Supabase conectado' : 'Supabase nao configurado'}
            </p>
            <p
              className={`text-xs ${
                supabaseReady ? 'text-green-700' : 'text-yellow-700'
              }`}
            >
              {supabaseReady
                ? 'Sincronize seus produtos entre este dispositivo e o banco.'
                : 'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.'}
            </p>
            {syncMessage && (
              <p className="text-xs mt-1 text-foreground font-medium">{syncMessage}</p>
            )}
            {syncMessage?.includes('nao existe') && (
              <p className="text-xs mt-1 text-yellow-800">
                Va em <strong>Supabase &gt; SQL Editor</strong> e cole o conteudo de
                {' '}<code className="bg-yellow-100 px-1 rounded">supabase/migrations/0001_init.sql</code>{' '}
                e depois{' '}
                <code className="bg-yellow-100 px-1 rounded">supabase/migrations/0002_allow_anon_writes.sql</code>.
              </p>
            )}
            {syncMessage?.includes('Permissao negada') && (
              <p className="text-xs mt-1 text-yellow-800">
                Cole o SQL de{' '}
                <code className="bg-yellow-100 px-1 rounded">supabase/migrations/0002_allow_anon_writes.sql</code>{' '}
                no SQL Editor do Supabase para liberar escrita do admin local.
              </p>
            )}
          </div>

          {supabaseReady && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePull}
                disabled={syncing !== 'idle'}
                className="flex-1 sm:flex-none px-3 py-2 bg-secondary text-secondary-foreground rounded text-xs sm:text-sm font-semibold hover:bg-muted transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CloudDownload size={16} />
                <span className="hidden sm:inline">{syncing === 'pull' ? 'Baixando...' : 'Baixar do Supabase'}</span>
                <span className="sm:hidden">{syncing === 'pull' ? 'Baixando' : 'Baixar'}</span>
              </button>
              <button
                onClick={handlePush}
                disabled={syncing !== 'idle'}
                className="flex-1 sm:flex-none px-3 py-2 bg-[var(--orange-primary)] text-white rounded text-xs sm:text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CloudUpload size={16} />
                <span className="hidden sm:inline">{syncing === 'push' ? 'Enviando...' : 'Enviar para Supabase'}</span>
                <span className="sm:hidden">{syncing === 'push' ? 'Enviando' : 'Enviar'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total de produtos</p>
            <p className="text-2xl font-bold text-foreground mt-1">{products.length}</p>
          </div>
          <div className="bg-card rounded-lg p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{activeCount}</p>
          </div>
          <div className="bg-card rounded-lg p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Inativos</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">{inactiveCount}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Gerenciar produtos</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Produtos ativos aparecem na loja.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-secondary rounded p-1 flex-1 sm:flex-none">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded ${
                    filter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded ${
                    filter === 'active' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Ativos
                </button>
                <button
                  onClick={() => setFilter('inactive')}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded ${
                    filter === 'inactive' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Inativos
                </button>
              </div>

              <button
                onClick={openCreate}
                className="px-3 sm:px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-xs sm:text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors inline-flex items-center gap-1 sm:gap-2 whitespace-nowrap"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Novo produto</span>
                <span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>

          {/* Mobile: Cards */}
          <div className="sm:hidden p-3 space-y-3">
            {filteredProducts.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum produto encontrado.</p>
            )}
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-secondary/30 rounded-lg p-3 border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Sem foto</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-bold text-foreground mt-1">{currency(product.price)}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(product.id)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold ${
                      product.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {product.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 px-3 py-2 bg-secondary text-foreground rounded text-xs font-semibold inline-flex items-center justify-center gap-1"
                  >
                    <Pencil size={12} />
                    Editar
                  </button>
                  <Link
                    href={`/adminlr/produtos/${encodeURIComponent(product.id)}/lp`}
                    className="px-3 py-2 bg-purple-100 text-purple-800 rounded text-xs font-semibold inline-flex items-center justify-center gap-1"
                  >
                    <FileText size={12} />
                    LP
                  </Link>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded text-xs font-semibold inline-flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">
                    Preco
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">
                    Estoque
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}

                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem foto</span>
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">{product.category}</td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">{currency(product.price)}</td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      {product.stock.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      <button
                        onClick={() => toggleActive(product.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          product.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {product.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {product.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-b border-border">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(product)}
                          className="inline-flex items-center gap-1 text-sm text-[#0066cc] hover:text-[#0052a3]"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        <Link
                          href={`/adminlr/produtos/${encodeURIComponent(product.id)}/lp`}
                          className="inline-flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900 font-semibold"
                          title="Editar Landing Page deste produto"
                        >
                          <FileText size={14} />
                          LP
                        </Link>
                        <button
                          onClick={() => removeProduct(product.id)}
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={onSubmit}
            className="bg-background rounded-t-2xl sm:rounded-lg shadow-lg w-full sm:max-w-xl max-h-[90vh] overflow-y-auto"
          >
            {/* Handle de arraste mobile */}
            <div className="sm:hidden w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
            
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                {editing.id ? 'Editar produto' : 'Novo produto'}
              </h3>
              <button type="button" onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Nome *</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">Categoria *</label>
                <input
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  placeholder="Ex: Cimento, Ferro, Tijolos..."
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">Marca</label>
                <input
                  value={editing.brand || ''}
                  onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                  placeholder="Ex: Votoran, Tigre, Gerdau..."
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Medidas / Dimensoes</label>
                <input
                  value={editing.dimensions || ''}
                  onChange={(e) => setEditing({ ...editing, dimensions: e.target.value })}
                  placeholder="Ex: 50kg - Saco 40x60cm, 10mm x 12m..."
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">Preco (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  placeholder="0.00"
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">Estoque</label>
                <input
                  type="number"
                  min={0}
                  value={editing.stock}
                  onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm text-foreground">
                  Produto ativo (visivel para compra)
                </label>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Imagem do produto</label>
                <div className="flex gap-3 items-start">
                  {editing.image && (
                    <div className="w-20 h-20 rounded border border-border overflow-hidden flex-shrink-0">
                      <img 
                        src={editing.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Fazer upload de imagem
                        </>
                      )}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Ou cole uma URL diretamente:
                    </p>
                    <input
                      value={editing.image || ''}
                      onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Descricao</label>
                <textarea
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm font-semibold hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors"
              >
                {editing.id ? 'Salvar alteracoes' : 'Criar produto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
