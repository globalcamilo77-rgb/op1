'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useProductsStore } from '@/lib/products-store'

interface Benefit {
  title: string
  description?: string
}

interface LPState {
  enabled: boolean
  headline: string
  subheadline: string
  heroImage: string
  gallery: string[]
  videoUrl: string
  benefits: Benefit[]
  longDescription: string
  ctaText: string
  ctaMessage: string
  seoTitle: string
  seoDescription: string
}

const EMPTY: LPState = {
  enabled: false,
  headline: '',
  subheadline: '',
  heroImage: '',
  gallery: [],
  videoUrl: '',
  benefits: [],
  longDescription: '',
  ctaText: 'Comprar pelo WhatsApp',
  ctaMessage: '',
  seoTitle: '',
  seoDescription: '',
}

export default function ProductLPEditor() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = decodeURIComponent(params.id)
  const { products, loadFromSupabase } = useProductsStore()

  const product = useMemo(() => products.find((p) => p.id === id), [products, id])

  const [state, setState] = useState<LPState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (products.length === 0) loadFromSupabase()
  }, [products.length, loadFromSupabase])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch(`/api/product-lp/${encodeURIComponent(id)}`)
        const json = await res.json()
        if (!active) return
        const lp = json.lp
        if (lp) {
          setState({
            enabled: !!lp.enabled,
            headline: lp.headline || '',
            subheadline: lp.subheadline || '',
            heroImage: lp.heroImage || '',
            gallery: Array.isArray(lp.gallery) ? lp.gallery : [],
            videoUrl: lp.videoUrl || '',
            benefits: Array.isArray(lp.benefits) ? lp.benefits : [],
            longDescription: lp.longDescription || '',
            ctaText: lp.ctaText || 'Comprar pelo WhatsApp',
            ctaMessage: lp.ctaMessage || '',
            seoTitle: lp.seoTitle || '',
            seoDescription: lp.seoDescription || '',
          })
        }
      } catch (e) {
        console.error('[lp-editor] erro ao carregar', e)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/product-lp/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error || 'Erro ao salvar')
      } else {
        setSavedAt(new Date().toLocaleTimeString('pt-BR'))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  const updateBenefit = (idx: number, patch: Partial<Benefit>) => {
    setState((s) => ({
      ...s,
      benefits: s.benefits.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    }))
  }
  const addBenefit = () => {
    setState((s) => ({ ...s, benefits: [...s.benefits, { title: '', description: '' }] }))
  }
  const removeBenefit = (idx: number) => {
    setState((s) => ({ ...s, benefits: s.benefits.filter((_, i) => i !== idx) }))
  }
  const updateGallery = (idx: number, value: string) => {
    setState((s) => ({ ...s, gallery: s.gallery.map((g, i) => (i === idx ? value : g)) }))
  }
  const addGallery = () => {
    setState((s) => ({ ...s, gallery: [...s.gallery, ''] }))
  }
  const removeGallery = (idx: number) => {
    setState((s) => ({ ...s, gallery: s.gallery.filter((_, i) => i !== idx) }))
  }

  const uploadImage = async (file: File, target: 'hero' | { kind: 'gallery'; idx: number }) => {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) {
        if (target === 'hero') {
          setState((s) => ({ ...s, heroImage: json.url }))
        } else {
          updateGallery(target.idx, json.url)
        }
      }
    } catch (e) {
      console.error('[lp-editor] upload', e)
    }
  }

  return (
    <>
      <AdminTopbar title={product ? `LP — ${product.name}` : `LP — ${id}`} />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/adminlr/produtos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Voltar aos produtos
          </Link>
          <a
            href={`/p/${encodeURIComponent(id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-semibold"
          >
            <ExternalLink size={14} />
            Visualizar LP publica
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" size={18} />
            Carregando LP...
          </div>
        ) : (
          <>
            {/* Toggle de ativacao */}
            <section className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-foreground mb-1">
                    Status da Landing Page
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Quando <strong>ativa</strong>, a rota{' '}
                    <code className="px-1 bg-muted rounded">/p/{id}</code> mostra o
                    conteudo customizado abaixo. Quando inativa, qualquer pessoa que
                    abrir essa URL vai cair na pagina padrao do produto.
                  </p>
                </div>
                <button
                  onClick={() => setState((s) => ({ ...s, enabled: !s.enabled }))}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-colors ${
                    state.enabled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {state.enabled ? (
                    <>
                      <CheckCircle2 size={16} /> Ativa
                    </>
                  ) : (
                    <>
                      <XCircle size={16} /> Inativa
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Hero */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="text-base font-bold text-foreground">Hero</h2>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Headline (titulo grande)
                </label>
                <input
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder={product?.name || 'O melhor cimento da sua obra'}
                  value={state.headline}
                  onChange={(e) => setState((s) => ({ ...s, headline: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Subheadline (frase de apoio)
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Frete reduzido, entrega em 24h e atendimento direto pelo WhatsApp."
                  value={state.subheadline}
                  onChange={(e) => setState((s) => ({ ...s, subheadline: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Imagem principal (Hero)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm font-mono text-xs"
                    placeholder="/products/exemplo.jpg ou https://..."
                    value={state.heroImage}
                    onChange={(e) => setState((s) => ({ ...s, heroImage: e.target.value }))}
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-muted">
                    <Upload size={14} /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadImage(file, 'hero')
                      }}
                    />
                  </label>
                </div>
                {state.heroImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={state.heroImage}
                    alt="Preview"
                    className="mt-2 h-32 w-32 object-cover rounded-md border border-border"
                  />
                )}
              </div>
            </section>

            {/* Beneficios */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Beneficios / Diferenciais</h2>
                <button
                  onClick={addBenefit}
                  className="inline-flex items-center gap-1 text-sm text-[#0066cc] hover:text-[#0052a3] font-semibold"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
              {state.benefits.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Nenhum beneficio cadastrado. Adicione 3 a 6 itens curtos.
                </p>
              )}
              {state.benefits.map((b, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                  <input
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Titulo (ex: Frete em 24h)"
                    value={b.title}
                    onChange={(e) => updateBenefit(idx, { title: e.target.value })}
                  />
                  <input
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Descricao curta"
                    value={b.description || ''}
                    onChange={(e) => updateBenefit(idx, { description: e.target.value })}
                  />
                  <button
                    onClick={() => removeBenefit(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </section>

            {/* Galeria */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Galeria de imagens</h2>
                <button
                  onClick={addGallery}
                  className="inline-flex items-center gap-1 text-sm text-[#0066cc] hover:text-[#0052a3] font-semibold"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
              {state.gallery.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Nenhuma imagem na galeria. A imagem principal ja basta para uma LP simples.
                </p>
              )}
              {state.gallery.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm font-mono text-xs"
                    placeholder="URL da imagem"
                    value={url}
                    onChange={(e) => updateGallery(idx, e.target.value)}
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-muted">
                    <Upload size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadImage(file, { kind: 'gallery', idx })
                      }}
                    />
                  </label>
                  <button
                    onClick={() => removeGallery(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </section>

            {/* Video */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-2">
              <h2 className="text-base font-bold text-foreground">Video (opcional)</h2>
              <input
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono text-xs"
                placeholder="https://www.youtube.com/watch?v=... ou https://.../video.mp4"
                value={state.videoUrl}
                onChange={(e) => setState((s) => ({ ...s, videoUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Aceita link do YouTube ou URL direto de MP4. Se vazio, a secao de video nao
                aparece na LP.
              </p>
            </section>

            {/* Descricao longa */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-2">
              <h2 className="text-base font-bold text-foreground">Descricao longa</h2>
              <textarea
                rows={8}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                placeholder="Conte a historia do produto. Como ele e feito, em qual obra usar, dicas de aplicacao..."
                value={state.longDescription}
                onChange={(e) =>
                  setState((s) => ({ ...s, longDescription: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Suporta quebras de linha. Para listas, use - no inicio da linha.
              </p>
            </section>

            {/* CTA */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h2 className="text-base font-bold text-foreground">Chamada para acao (CTA)</h2>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Texto do botao
                </label>
                <input
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Comprar pelo WhatsApp"
                  value={state.ctaText}
                  onChange={(e) => setState((s) => ({ ...s, ctaText: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mensagem pre-preenchida no WhatsApp
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder={`Ola! Quero comprar: ${product?.name || 'este produto'}.`}
                  value={state.ctaMessage}
                  onChange={(e) => setState((s) => ({ ...s, ctaMessage: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se vazio, gera uma mensagem padrao com o nome do produto.
                </p>
              </div>
            </section>

            {/* SEO */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h2 className="text-base font-bold text-foreground">SEO (opcional)</h2>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Title (max 60 caracteres)
                </label>
                <input
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  maxLength={70}
                  placeholder={`${product?.name || 'Produto'} | Alfa Construcao`}
                  value={state.seoTitle}
                  onChange={(e) => setState((s) => ({ ...s, seoTitle: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Description (max 160 caracteres)
                </label>
                <textarea
                  rows={2}
                  maxLength={180}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Compre direto da loja. Frete reduzido, entrega rapida e atendimento WhatsApp."
                  value={state.seoDescription}
                  onChange={(e) =>
                    setState((s) => ({ ...s, seoDescription: e.target.value }))
                  }
                />
              </div>
            </section>

            {/* Salvar */}
            <div className="sticky bottom-4 z-10 bg-card border border-border rounded-lg p-4 shadow-lg flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {savedAt && <span>Salvo as {savedAt}.</span>}
                {error && <span className="text-red-600">{error}</span>}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#FF6B00] hover:bg-[#e85f00] text-white font-bold text-sm disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Salvando...' : 'Salvar LP'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
