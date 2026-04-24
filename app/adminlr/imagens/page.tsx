'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Search, ImageIcon, ExternalLink } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'
import { useProductsStore, type StoreProduct } from '@/lib/products-store'
import { getImagePrompt, PRODUCT_IMAGE_PROMPTS } from '@/lib/product-image-prompts'

type CopiedMap = Record<string, boolean>

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function ImageCard({
  product,
  onSaveImage,
}: {
  product: StoreProduct
  onSaveImage: (id: string, url: string) => void
}) {
  const [url, setUrl] = useState(product.image ?? '')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const prompt = getImagePrompt(product.id, product.name, product.category)
  const hasCustomPrompt = !!PRODUCT_IMAGE_PROMPTS[product.id]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    onSaveImage(product.id, url.trim())
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const isPlaceholder = product.image?.includes('placehold.co')

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      {/* Image Preview */}
      <div className="relative aspect-square bg-secondary flex items-center justify-center overflow-hidden">
        {url && !isPlaceholder ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
            <ImageIcon size={32} className="opacity-40" />
            <span className="text-xs text-center">
              {isPlaceholder ? 'Usando placeholder — adicione uma imagem real' : 'Sem imagem'}
            </span>
          </div>
        )}

        {/* Badge: tem prompt personalizado */}
        {hasCustomPrompt && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
            Prompt IA
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{product.category}</p>
          <h3 className="text-sm font-semibold text-foreground leading-snug mt-0.5 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-[var(--orange-primary)] mt-1">{currency(product.price)}</p>
        </div>

        {/* Prompt IA */}
        <div className="bg-secondary rounded-lg p-3 relative">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {hasCustomPrompt ? 'Prompt para gerar imagem' : 'Prompt genérico'}
            </p>
            <button
              onClick={handleCopy}
              title="Copiar prompt"
              className="flex items-center gap-1 text-[10px] text-[var(--orange-primary)] hover:text-[var(--orange-dark)] font-semibold"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-line font-mono">
            {prompt}
          </p>
        </div>

        {/* URL da imagem */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">URL da imagem gerada</label>
          <div className="flex gap-1.5">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole a URL aqui..."
              className="flex-1 min-w-0 px-2.5 py-1.5 border border-border rounded text-xs outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
            />
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 bg-secondary rounded border border-border hover:bg-muted transition-colors"
                title="Visualizar"
              >
                <ExternalLink size={13} className="text-muted-foreground" />
              </a>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-2 rounded text-xs font-semibold transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-[var(--orange-primary)] text-white hover:bg-[var(--orange-dark)]'
          }`}
        >
          {saved ? '✓ Salvo!' : 'Salvar imagem'}
        </button>
      </div>
    </div>
  )
}

export default function ImagensPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { products, updateProduct } = useProductsStore()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'com-imagem' | 'sem-imagem'>('todos')
  const [copiedAll, setCopiedAll] = useState(false)

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  if (user?.role !== 'superadmin') return null

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort()
    return ['Todas', ...cats]
  }, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === 'Todas' || p.category === categoryFilter
      const isReal = p.image && !p.image.includes('placehold.co')
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'com-imagem' && isReal) ||
        (statusFilter === 'sem-imagem' && !isReal)
      return matchSearch && matchCat && matchStatus
    })
  }, [products, search, categoryFilter, statusFilter])

  const withRealImage = products.filter((p) => p.image && !p.image.includes('placehold.co')).length
  const withPrompt = products.filter((p) => !!PRODUCT_IMAGE_PROMPTS[p.id]).length

  const handleSaveImage = (id: string, url: string) => {
    updateProduct(id, { image: url })
  }

  const handleCopyAllPrompts = async () => {
    const lines = filtered
      .map((p) => `### ${p.name}\n${getImagePrompt(p.id, p.name, p.category)}`)
      .join('\n\n---\n\n')
    await navigator.clipboard.writeText(lines)
    setCopiedAll(true)
    window.setTimeout(() => setCopiedAll(false), 2500)
  }

  return (
    <>
      <AdminTopbar title="Gerenciar Imagens de Produtos" />
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <div className="text-blue-600 mt-0.5 flex-shrink-0">💡</div>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Como usar os prompts de IA</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Copie o prompt de cada produto e gere a imagem no{' '}
              <strong>Midjourney, DALL-E 3, Stable Diffusion</strong> ou qualquer gerador de imagens.
              Após gerar, hospede em{' '}
              <strong>Cloudinary, Imgur, Google Drive (link público) ou similar</strong> e cole a
              URL no campo abaixo de cada produto. A imagem aparecerá automaticamente na loja.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-5 border border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total de produtos</p>
            <p className="text-2xl font-bold text-foreground mt-1">{products.length}</p>
          </div>
          <div className="bg-card rounded-lg p-5 border border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Com imagem real</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{withRealImage}</p>
          </div>
          <div className="bg-card rounded-lg p-5 border border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Com prompt IA</p>
            <p className="text-2xl font-bold text-[var(--orange-primary)] mt-1">{withPrompt}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[180px] flex items-center border border-border rounded overflow-hidden">
            <span className="px-2 text-muted-foreground">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-2 py-2 text-sm outline-none bg-background text-foreground"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded text-sm outline-none bg-background text-foreground"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-secondary rounded p-1">
            {(['todos', 'sem-imagem', 'com-imagem'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  statusFilter === s
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'todos' ? 'Todos' : s === 'sem-imagem' ? 'Sem imagem' : 'Com imagem'}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyAllPrompts}
            className="px-4 py-2 bg-secondary border border-border rounded text-xs font-semibold text-foreground hover:bg-muted transition-colors inline-flex items-center gap-2"
          >
            {copiedAll ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            {copiedAll ? 'Copiado!' : `Copiar ${filtered.length} prompts`}
          </button>
        </div>

        {/* Grid */}
        <p className="text-xs text-muted-foreground mb-4">
          Mostrando <strong>{filtered.length}</strong> de <strong>{products.length}</strong> produtos
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Nenhum produto encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ImageCard key={product.id} product={product} onSaveImage={handleSaveImage} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
