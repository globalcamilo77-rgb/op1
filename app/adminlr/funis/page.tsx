'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  ExternalLink,
  Eye,
  Users,
} from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

interface Funnel {
  id: string
  slug: string
  name: string
  active: boolean
  badge: string | null
  headline: string
  subheadline: string | null
  cta_primary_text: string
  cta_secondary_text: string
  countdown_hours: number
  city: string | null
  whatsapp_override: string | null
  total_views: number
  total_leads: number
  total_sales: number
  stat_1_value: string
  stat_1_label: string
  stat_2_value: string
  stat_2_label: string
  stat_3_value: string
  stat_3_label: string
  stat_4_value: string
  stat_4_label: string
}

const EMPTY_FUNNEL: Partial<Funnel> = {
  slug: '',
  name: '',
  active: true,
  headline: '',
  subheadline: '',
  badge: 'Oferta especial',
  cta_primary_text: 'Quero meu orcamento agora',
  cta_secondary_text: 'Falar no WhatsApp',
  countdown_hours: 6,
  city: '',
  whatsapp_override: '',
  stat_1_value: '2.3k+',
  stat_1_label: 'Obras atendidas',
  stat_2_value: '48h',
  stat_2_label: 'Prazo medio',
  stat_3_value: '22%',
  stat_3_label: 'Economia media',
  stat_4_value: '4.8/5',
  stat_4_label: 'Nota dos clientes',
}

export default function AdminFunisPage() {
  const supabase = getSupabase()
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Partial<Funnel> | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    loadFunnels()
  }, [])

  async function loadFunnels() {
    if (!supabase) return
    setLoading(true)
    const { data } = await supabase
      .from('funnels')
      .select('*')
      .order('created_at', { ascending: false })
    setFunnels((data || []) as Funnel[])
    setLoading(false)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !editing) return

    setSaving(true)
    setMessage(null)

    const slug = (editing.slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!slug || !editing.name || !editing.headline) {
      setMessage({
        type: 'error',
        text: 'Slug, nome e headline sao obrigatorios.',
      })
      setSaving(false)
      return
    }

    const payload = { ...editing, slug }
    delete (payload as Partial<Funnel>).id
    delete (payload as Partial<Funnel>).total_views
    delete (payload as Partial<Funnel>).total_leads
    delete (payload as Partial<Funnel>).total_sales

    let error
    if (editing.id) {
      const result = await supabase
        .from('funnels')
        .update(payload)
        .eq('id', editing.id)
      error = result.error
    } else {
      const result = await supabase.from('funnels').insert([payload])
      error = result.error
    }

    if (error) {
      setMessage({ type: 'error', text: `Erro: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: 'Funil salvo com sucesso.' })
      setEditing(null)
      await loadFunnels()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!supabase) return
    if (!window.confirm('Tem certeza que deseja apagar este funil?')) return
    await supabase.from('funnels').delete().eq('id', id)
    await loadFunnels()
  }

  async function toggleActive(funnel: Funnel) {
    if (!supabase) return
    await supabase
      .from('funnels')
      .update({ active: !funnel.active })
      .eq('id', funnel.id)
    await loadFunnels()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Funis de captura</h1>
          <p className="text-sm text-muted-foreground">
            Crie landings dinamicas com captura de lead, rotacao de WhatsApp e
            metricas.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(EMPTY_FUNNEL)
            setMessage(null)
          }}
          className="inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold px-4 py-2.5 rounded-md transition-colors"
        >
          <Plus size={16} />
          Novo funil
        </button>
      </div>

      {message && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Lista de funis */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2
              size={24}
              className="animate-spin text-[var(--orange-primary)]"
            />
          </div>
        ) : funnels.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum funil criado ainda. Clique em &quot;Novo funil&quot; para
            comecar.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {funnels.map((funnel) => (
              <div
                key={funnel.id}
                className="p-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold truncate">{funnel.name}</h3>
                    <span
                      className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        funnel.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {funnel.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    /funil/<span className="font-mono">{funnel.slug}</span>
                    {funnel.city ? ` - ${funnel.city}` : ''}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Eye size={12} />
                      {funnel.total_views || 0} views
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Users size={12} />
                      {funnel.total_leads || 0} leads
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/funil/${funnel.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--orange-primary)] hover:text-[var(--orange-dark)] px-2.5 py-1.5 rounded-md border border-border"
                  >
                    Abrir
                    <ExternalLink size={12} />
                  </Link>
                  <button
                    onClick={() => toggleActive(funnel)}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary"
                  >
                    {funnel.active ? 'Pausar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(funnel)
                      setMessage(null)
                    }}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-md bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(funnel.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    aria-label="Apagar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de edicao */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => !saving && setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 space-y-4"
          >
            <div>
              <h2 className="text-xl font-extrabold">
                {editing.id ? 'Editar funil' : 'Novo funil'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configure a landing page de captura. URL final:
                /funil/[slug]
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold mb-1 block">Slug *</label>
                <input
                  type="text"
                  value={editing.slug || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                  placeholder="orcamento-rapido"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">
                  Nome interno *
                </label>
                <input
                  type="text"
                  value={editing.name || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Campanha Black Friday"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block">Badge</label>
              <input
                type="text"
                value={editing.badge || ''}
                onChange={(e) =>
                  setEditing({ ...editing, badge: e.target.value })
                }
                placeholder="Oferta especial"
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block">Headline *</label>
              <input
                type="text"
                value={editing.headline || ''}
                onChange={(e) =>
                  setEditing({ ...editing, headline: e.target.value })
                }
                placeholder="Material de construcao com entrega em 48h"
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block">
                Subheadline
              </label>
              <textarea
                value={editing.subheadline || ''}
                onChange={(e) =>
                  setEditing({ ...editing, subheadline: e.target.value })
                }
                placeholder="Cimento, argamassa e rejunte com desconto exclusivo..."
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold mb-1 block">
                  Texto do CTA primario
                </label>
                <input
                  type="text"
                  value={editing.cta_primary_text || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, cta_primary_text: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">
                  Texto do CTA WhatsApp
                </label>
                <input
                  type="text"
                  value={editing.cta_secondary_text || ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      cta_secondary_text: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold mb-1 block">
                  Cidade (slug)
                </label>
                <input
                  type="text"
                  value={editing.city || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, city: e.target.value })
                  }
                  placeholder="sao-paulo"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">
                  WhatsApp manual (opcional)
                </label>
                <input
                  type="text"
                  value={editing.whatsapp_override || ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      whatsapp_override: e.target.value,
                    })
                  }
                  placeholder="5511999991111"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">
                  Countdown (horas)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={editing.countdown_hours || 6}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      countdown_hours: Number(e.target.value) || 6,
                    })
                  }
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Stats da pagina
              </p>
              {([1, 2, 3, 4] as const).map((i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={
                      (editing[`stat_${i}_value` as keyof Funnel] as string) ||
                      ''
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        [`stat_${i}_value`]: e.target.value,
                      })
                    }
                    placeholder="Valor"
                    className="h-10 px-3 rounded-md border border-border bg-background text-sm"
                  />
                  <input
                    type="text"
                    value={
                      (editing[`stat_${i}_label` as keyof Funnel] as string) ||
                      ''
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        [`stat_${i}_label`]: e.target.value,
                      })
                    }
                    placeholder="Label"
                    className="h-10 px-3 rounded-md border border-border bg-background text-sm"
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active !== false}
                onChange={(e) =>
                  setEditing({ ...editing, active: e.target.checked })
                }
              />
              Funil ativo (acessivel publicamente)
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="px-4 py-2.5 rounded-md text-sm font-bold border border-border hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? 'Salvando...' : 'Salvar funil'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
