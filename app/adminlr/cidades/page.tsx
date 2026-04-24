'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'
import {
  slugify,
  useCitiesStore,
  type CityContact,
  type CityPage,
} from '@/lib/cities-store'

const inputClass =
  'px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground w-full'

const SUGGESTIONS: { cityName: string; state: string }[] = [
  { cityName: 'Sao Paulo', state: 'SP' },
  { cityName: 'Osasco', state: 'SP' },
  { cityName: 'Guarulhos', state: 'SP' },
  { cityName: 'Santo Andre', state: 'SP' },
  { cityName: 'Sao Bernardo do Campo', state: 'SP' },
  { cityName: 'Campinas', state: 'SP' },
  { cityName: 'Sorocaba', state: 'SP' },
  { cityName: 'Ribeirao Preto', state: 'SP' },
  { cityName: 'Santos', state: 'SP' },
  { cityName: 'Sao Jose dos Campos', state: 'SP' },
  { cityName: 'Rio de Janeiro', state: 'RJ' },
  { cityName: 'Belo Horizonte', state: 'MG' },
]

function useOrigin() {
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])
  return origin
}

function buildUtmUrl(origin: string, slug: string, source = 'google', medium = 'cpc') {
  const base = `${origin}/cidade/${slug}`
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: `cidade-${slug}`,
  })
  return `${base}?${params.toString()}`
}

export default function AdminCidadesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const origin = useOrigin()

  const cities = useCitiesStore((state) => state.cities)
  const addCity = useCitiesStore((state) => state.addCity)
  const updateCity = useCitiesStore((state) => state.updateCity)
  const removeCity = useCitiesStore((state) => state.removeCity)
  const addContact = useCitiesStore((state) => state.addContact)
  const updateContact = useCitiesStore((state) => state.updateContact)
  const removeContact = useCitiesStore((state) => state.removeContact)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (user && user.role !== 'superadmin') router.push('/adminlr')
  }, [user, router])

  const [cityName, setCityName] = useState('')
  const [state, setState] = useState('SP')
  const [customSlug, setCustomSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [firstNumber, setFirstNumber] = useState('')
  const [firstLabel, setFirstLabel] = useState('Comercial 1')
  const [createdFlash, setCreatedFlash] = useState<string | null>(null)

  const autoSlug = useMemo(() => slugify(cityName), [cityName])
  const effectiveSlug = slugTouched ? slugify(customSlug) : autoSlug

  if (user?.role !== 'superadmin') return null

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cityName.trim()) return
    const city = addCity({
      cityName: cityName.trim(),
      state: state.trim() || 'SP',
      slug: effectiveSlug,
      contacts: firstNumber.trim()
        ? [{ label: firstLabel.trim() || 'Comercial', number: firstNumber.trim(), active: true }]
        : [],
    })
    setCreatedFlash(city.slug)
    setCityName('')
    setCustomSlug('')
    setSlugTouched(false)
    setFirstNumber('')
    setFirstLabel('Comercial 1')
    window.setTimeout(() => setCreatedFlash(null), 2500)
  }

  const handleSuggestion = (suggestion: { cityName: string; state: string }) => {
    setCityName(suggestion.cityName)
    setState(suggestion.state)
    setSlugTouched(false)
  }

  if (!hydrated) return null

  return (
    <>
      <AdminTopbar title="Cidades (Landing Pages)" />
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="bg-[#fff7e6] border border-[#ffc107] p-4 rounded-lg flex items-start gap-3">
          <Sparkles className="text-[var(--orange-primary)] mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              Uma landing para cada cidade, com WhatsApp proprio
            </p>
            <p className="text-muted-foreground mt-1">
              Cada cidade vira um link{' '}
              <code className="bg-yellow-100 px-1 rounded font-mono">/cidade/nome-cidade</code> com
              headline, numero(s) de WhatsApp e rotacao local. Perfeito para separar campanhas do
              Google Ads por geolocalizacao.
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Plus size={16} /> Nova cidade
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Preencha o nome e um WhatsApp inicial. Voce pode adicionar mais numeros e personalizar
            tudo depois.
          </p>

          <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Cidade
              </label>
              <input
                required
                className={inputClass}
                placeholder="Ex: Osasco"
                value={cityName}
                onChange={(event) => setCityName(event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                UF
              </label>
              <input
                required
                maxLength={2}
                className={`${inputClass} uppercase`}
                value={state}
                onChange={(event) => setState(event.target.value.toUpperCase())}
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                <span>Slug da URL</span>
                {slugTouched && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlugTouched(false)
                      setCustomSlug('')
                    }}
                    className="text-[var(--orange-primary)] hover:underline normal-case tracking-normal text-[11px]"
                  >
                    usar automatico
                  </button>
                )}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  /cidade/
                </span>
                <input
                  className={inputClass}
                  placeholder={autoSlug || 'sua-cidade'}
                  value={slugTouched ? customSlug : autoSlug}
                  onChange={(event) => {
                    setSlugTouched(true)
                    setCustomSlug(event.target.value)
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                WhatsApp inicial
              </label>
              <input
                className={inputClass}
                placeholder="5511999999999"
                value={firstNumber}
                onChange={(event) => setFirstNumber(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Rotulo do numero
              </label>
              <input
                className={inputClass}
                value={firstLabel}
                onChange={(event) => setFirstLabel(event.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={!cityName.trim()}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-semibold text-sm"
              >
                <Plus size={16} />
                Criar cidade
              </button>
            </div>
          </form>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Sugestoes rapidas:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.cityName}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 rounded-full text-xs hover:bg-secondary transition-colors"
                >
                  <MapPin size={11} />
                  {s.cityName} / {s.state}
                </button>
              ))}
            </div>
          </div>

          {createdFlash && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              <Check size={14} />
              Cidade criada! Acesse{' '}
              <Link
                href={`/cidade/${createdFlash}`}
                target="_blank"
                className="underline font-semibold"
              >
                /cidade/{createdFlash}
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Cidades cadastradas{' '}
            <span className="text-sm text-muted-foreground font-normal">({cities.length})</span>
          </h2>

          {cities.length === 0 && (
            <div className="bg-card rounded-lg p-8 text-center text-sm text-muted-foreground border border-dashed border-border">
              Nenhuma cidade cadastrada ainda. Use o formulario acima.
            </div>
          )}

          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              origin={origin}
              onUpdate={(updates) => updateCity(city.id, updates)}
              onRemove={() => {
                if (!window.confirm(`Remover ${city.cityName} (${city.slug})?`)) return
                removeCity(city.id)
              }}
              onAddContact={(contact) => addContact(city.id, contact)}
              onUpdateContact={(contactId, updates) => updateContact(city.id, contactId, updates)}
              onRemoveContact={(contactId) => removeContact(city.id, contactId)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

interface CityCardProps {
  city: CityPage
  origin: string
  onUpdate: (updates: Partial<Omit<CityPage, 'id' | 'createdAt'>>) => void
  onRemove: () => void
  onAddContact: (contact: Omit<CityContact, 'id'>) => void
  onUpdateContact: (contactId: string, updates: Partial<Omit<CityContact, 'id'>>) => void
  onRemoveContact: (contactId: string) => void
}

function CityCard({
  city,
  origin,
  onUpdate,
  onRemove,
  onAddContact,
  onUpdateContact,
  onRemoveContact,
}: CityCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState<'plain' | 'utm' | null>(null)

  const [draft, setDraft] = useState({
    cityName: city.cityName,
    state: city.state,
    slug: city.slug,
    headline: city.headline,
    subheadline: city.subheadline,
    offerBadge: city.offerBadge,
    defaultMessage: city.defaultMessage,
    rotationIntervalMinutes: city.rotationIntervalMinutes,
  })

  useEffect(() => {
    setDraft({
      cityName: city.cityName,
      state: city.state,
      slug: city.slug,
      headline: city.headline,
      subheadline: city.subheadline,
      offerBadge: city.offerBadge,
      defaultMessage: city.defaultMessage,
      rotationIntervalMinutes: city.rotationIntervalMinutes,
    })
  }, [city])

  const [newLabel, setNewLabel] = useState(`Comercial ${city.contacts.length + 1}`)
  const [newNumber, setNewNumber] = useState('')

  const plainUrl = `${origin}/cidade/${city.slug}`
  const utmUrl = buildUtmUrl(origin, city.slug)

  const copy = async (value: string, which: 'plain' | 'utm') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(which)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      // ignore
    }
  }

  const handleSave = () => {
    onUpdate(draft)
    setExpanded(false)
  }

  const handleAddContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newNumber.trim()) return
    onAddContact({ label: newLabel.trim() || 'Comercial', number: newNumber.trim(), active: true })
    setNewNumber('')
    setNewLabel(`Comercial ${city.contacts.length + 2}`)
  }

  return (
    <div className="bg-card rounded-lg shadow-sm">
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-border">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[var(--orange-primary)]" />
            <h3 className="text-base font-bold">
              {city.cityName}
              <span className="text-muted-foreground text-sm font-normal"> / {city.state}</span>
            </h3>
            <span
              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                city.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {city.active ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {origin || '...'}/cidade/{city.slug}
          </p>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={city.active}
            onChange={(event) => onUpdate({ active: event.target.checked })}
          />
          Ativa
        </label>

        <Link
          href={`/cidade/${city.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#0066cc] hover:underline text-sm"
        >
          <ExternalLink size={14} /> Abrir
        </Link>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-sm border border-border rounded px-3 py-1.5 hover:bg-secondary"
        >
          {expanded ? 'Recolher' : 'Editar'}
        </button>

        <button
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
          title="Remover cidade"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary px-3 py-2 rounded font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
            {plainUrl}
          </div>
          <button
            onClick={() => copy(plainUrl, 'plain')}
            className="inline-flex items-center gap-1 border border-border rounded px-2 py-1.5 text-xs hover:bg-secondary"
          >
            {copied === 'plain' ? <Check size={12} /> : <Copy size={12} />}
            {copied === 'plain' ? 'Copiado' : 'URL'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary px-3 py-2 rounded font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
            {utmUrl}
          </div>
          <button
            onClick={() => copy(utmUrl, 'utm')}
            className="inline-flex items-center gap-1 border border-border rounded px-2 py-1.5 text-xs hover:bg-secondary"
          >
            {copied === 'utm' ? <Check size={12} /> : <Copy size={12} />}
            {copied === 'utm' ? 'Copiado' : 'Com UTM (Google Ads)'}
          </button>
        </div>
      </div>

      <div className="p-4 pt-0">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          WhatsApp ({city.contacts.length})
        </h4>
        <div className="space-y-2">
          {city.contacts.map((contact) => (
            <div
              key={contact.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr_auto_auto] gap-2 items-center p-2 border border-border rounded"
            >
              <input
                className={inputClass}
                value={contact.label}
                onChange={(event) => onUpdateContact(contact.id, { label: event.target.value })}
              />
              <input
                className={`${inputClass} font-mono`}
                value={contact.number}
                onChange={(event) => onUpdateContact(contact.id, { number: event.target.value })}
              />
              <label className="inline-flex items-center gap-1.5 text-xs justify-center">
                <input
                  type="checkbox"
                  checked={contact.active}
                  onChange={(event) =>
                    onUpdateContact(contact.id, { active: event.target.checked })
                  }
                />
                Ativo
              </label>
              <button
                onClick={() => onRemoveContact(contact.id)}
                className="text-destructive hover:underline text-xs inline-flex items-center gap-1 justify-center"
              >
                <X size={12} /> Remover
              </button>
            </div>
          ))}
          {city.contacts.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Sem numeros. Adicione ao menos um para o botao do WhatsApp funcionar.
            </p>
          )}
        </div>

        <form
          onSubmit={handleAddContact}
          className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_1.3fr_auto] gap-2 items-end"
        >
          <input
            className={inputClass}
            placeholder="Rotulo (ex: Comercial 2)"
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="5511999999999"
            value={newNumber}
            onChange={(event) => setNewNumber(event.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 border border-border rounded px-3 py-2 text-sm hover:bg-secondary"
          >
            <Plus size={14} /> Adicionar
          </button>
        </form>

        <p className="text-[11px] text-muted-foreground mt-2">
          A rotacao troca o numero a cada{' '}
          <strong>{city.rotationIntervalMinutes}</strong> minutos, de forma deterministica
          (mesmo lead que recarrega a pagina cai no mesmo numero).
        </p>
      </div>

      {expanded && (
        <div className="p-4 border-t border-border bg-secondary/30 space-y-3">
          <h4 className="text-sm font-semibold">Editar conteudo da pagina</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Cidade</label>
              <input
                className={inputClass}
                value={draft.cityName}
                onChange={(event) => setDraft({ ...draft, cityName: event.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">UF</label>
              <input
                className={`${inputClass} uppercase`}
                maxLength={2}
                value={draft.state}
                onChange={(event) =>
                  setDraft({ ...draft, state: event.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Slug da URL</label>
              <input
                className={`${inputClass} font-mono`}
                value={draft.slug}
                onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Rotacao (min)</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={draft.rotationIntervalMinutes}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    rotationIntervalMinutes: Number(event.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Badge de oferta (topo)</label>
            <input
              className={inputClass}
              value={draft.offerBadge}
              onChange={(event) => setDraft({ ...draft, offerBadge: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Headline</label>
            <input
              className={inputClass}
              value={draft.headline}
              onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Subheadline</label>
            <textarea
              rows={2}
              className={inputClass}
              value={draft.subheadline}
              onChange={(event) => setDraft({ ...draft, subheadline: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Mensagem inicial do WhatsApp
            </label>
            <textarea
              rows={2}
              className={inputClass}
              value={draft.defaultMessage}
              onChange={(event) => setDraft({ ...draft, defaultMessage: event.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white px-4 py-2 rounded text-sm font-semibold"
            >
              <Save size={14} /> Salvar alteracoes
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-1 border border-border rounded px-3 py-2 text-sm hover:bg-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
