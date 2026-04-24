import Link from 'next/link'
import { InfoHero } from '@/components/store/info-hero'
import { CATEGORIES } from '@/lib/categories'

export const metadata = {
  title: 'Mapa do site | AlfaConstrução',
  description: 'Navegue rapidamente por todas as paginas e categorias da AlfaConstrução.',
}

const institucionais = [
  { href: '/quem-somos', label: 'Quem Somos' },
  { href: '/como-funciona', label: 'Como Funciona' },
  { href: '/vender', label: 'Quero vender na AlfaConstrução' },
  { href: '/faq', label: 'FAQ' },
]

const ajuda = [
  { href: '/termos', label: 'Termos de Uso' },
  { href: '/privacidade', label: 'Politica de Privacidade' },
  { href: '/trocas', label: 'Trocas e Devolucoes' },
]

const comprar = [
  { href: '/', label: 'Home' },
  { href: '/carrinho', label: 'Meu carrinho' },
  { href: '/checkout', label: 'Checkout' },
  { href: '/oferta', label: 'Ofertas ativas' },
]

export default function SitemapPage() {
  return (
    <>
      <InfoHero
        eyebrow="Navegacao"
        title="Mapa do site"
        description="Todas as paginas da AlfaConstrução em um so lugar, para voce achar o que precisa rapido."
        breadcrumbLabel="Mapa do site"
      />

      <section className="px-5 py-12 md:py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">Institucional</h2>
            <ul className="space-y-2">
              {institucionais.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-[var(--orange-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">Ajuda e legal</h2>
            <ul className="space-y-2">
              {ajuda.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-[var(--orange-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">Comprar</h2>
            <ul className="space-y-2">
              {comprar.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-[var(--orange-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-bold text-foreground mb-3">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="text-sm text-muted-foreground hover:text-[var(--orange-primary)] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
