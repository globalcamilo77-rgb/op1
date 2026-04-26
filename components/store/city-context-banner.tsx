import { MapPin } from 'lucide-react'

/**
 * Banner sutil exibido no topo da pagina /cidade/[slug] para deixar claro
 * que o cliente esta na LP focada daquela cidade. Server component puro,
 * sem hooks.
 */
export function CityContextBanner({
  cityName,
  state,
  highlight,
}: {
  cityName: string
  state?: string | null
  highlight?: string | null
}) {
  return (
    <section className="bg-[var(--orange-primary)]/10 border-b border-[var(--orange-primary)]/20">
      <div className="max-w-6xl mx-auto px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--orange-dark)]">
          <MapPin size={14} />
          Atendendo em {cityName}
          {state ? <span className="text-[var(--orange-dark)]/70">/ {state}</span> : null}
        </span>
        {highlight ? (
          <span className="text-[var(--graphite)]/80">{highlight}</span>
        ) : (
          <span className="text-[var(--graphite)]/80">
            Frete reduzido e atendimento direto pelo WhatsApp da regiao.
          </span>
        )}
      </div>
    </section>
  )
}
