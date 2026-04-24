import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface InfoHeroProps {
  eyebrow?: string
  title: string
  description?: string
  breadcrumbLabel: string
}

export function InfoHero({ eyebrow, title, description, breadcrumbLabel }: InfoHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--graphite)] via-[var(--graphite-soft)] to-[var(--graphite)] text-white">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[var(--orange-primary)]/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[var(--orange-dark)]/25 blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-5 py-12 md:py-16">
        <nav className="flex items-center gap-1 text-xs text-white/70 mb-6">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-white transition-colors">
            <Home size={12} />
            Inicio
          </Link>
          <ChevronRight size={12} className="text-white/40" />
          <span className="text-white/90">{breadcrumbLabel}</span>
        </nav>

        {eyebrow && (
          <p className="text-xs uppercase tracking-wider text-[var(--orange-primary)] font-semibold mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
        {description && (
          <p className="mt-3 text-white/80 max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
    </section>
  )
}
