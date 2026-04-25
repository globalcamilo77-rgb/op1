'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAnalyticsStore } from '@/lib/analytics-store'

interface LeadCaptureFormProps {
  source: string
  city?: string
  funnelSlug?: string
  whatsappNumber?: string
  ctaLabel?: string
  headline?: string
  subheadline?: string
  className?: string
}

function formatPhone(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, 11)
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
}

export function LeadCaptureForm({
  source,
  city,
  funnelSlug,
  whatsappNumber,
  ctaLabel = 'Quero meu orcamento agora',
  headline = 'Te respondemos em 10 minutos',
  subheadline = 'Sem compromisso. Frete e prazo personalizados pra sua obra.',
  className = '',
}: LeadCaptureFormProps) {
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', cep: '' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const phoneClean = form.phone.replace(/\D/g, '')
    if (!form.name.trim()) {
      setError('Informe seu nome')
      return
    }
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      setError('Telefone invalido. Use DDD + numero (ex: 11999990000)')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: phoneClean,
          cep: form.cep || null,
          city: city || null,
          source_page: source,
          funnel_slug: funnelSlug || null,
          whatsapp_number: whatsappNumber || null,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao enviar')
      }

      trackEvent('lead', {
        meta: { source, funnelSlug, city, type: 'lead_capture' },
      })
      setSuccess(true)

      if (data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao enviar. Tente novamente.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        className={`bg-card rounded-2xl shadow-2xl p-8 text-center ${className}`}
      >
        <div className="w-14 h-14 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
          <ArrowRight size={26} className="text-green-600" />
        </div>
        <h3 className="text-xl font-extrabold text-foreground">
          Recebemos seus dados
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Estamos te encaminhando para o WhatsApp do nosso atendimento. Se a
          janela nao abriu, verifique o bloqueio de pop-ups.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-card rounded-2xl shadow-2xl p-6 md:p-8 space-y-3 ${className}`}
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
          Orcamento rapido{city ? ` para ${city}` : ''}
        </p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mt-1">
          {headline}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">{subheadline}</p>
      </div>

      <input
        type="text"
        placeholder="Seu nome completo"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        disabled={loading}
        className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--orange-primary)]"
        required
      />

      <input
        type="tel"
        inputMode="numeric"
        placeholder="Telefone com DDD (WhatsApp)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
        disabled={loading}
        className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--orange-primary)]"
        required
      />

      <input
        type="text"
        inputMode="numeric"
        placeholder="CEP da obra (opcional)"
        value={form.cep}
        onChange={(e) => setForm({ ...form, cep: e.target.value })}
        disabled={loading}
        className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--orange-primary)]"
      />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-extrabold h-12 rounded-md transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            {ctaLabel}
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-[11px] text-muted-foreground text-center">
        Ao enviar voce concorda em receber contato pelo WhatsApp e e-mail.
      </p>
    </form>
  )
}
