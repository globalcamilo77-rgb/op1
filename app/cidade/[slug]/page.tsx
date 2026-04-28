import type { Metadata } from 'next'
import { StoreHeader } from '@/components/store/header'
import { HeroSection } from '@/components/store/hero-section'
import { CategoryCarousel } from '@/components/store/category-carousel'
import { AddressSection } from '@/components/store/address-section'
import { FeaturesSection } from '@/components/store/features-section'
import { FeaturedProducts } from '@/components/store/featured-products'
import { BannersSection } from '@/components/store/banners-section'
import { HowItWorks } from '@/components/store/how-it-works'
import { CitiesSection } from '@/components/store/cities-section'
import { FaqSection } from '@/components/store/faq-section'
import { Footer } from '@/components/store/footer'
import { ServiceAreaDialog } from '@/components/store/service-area-dialog'
import { CityActivator } from '@/components/store/city-activator'
import { CityContextBanner } from '@/components/store/city-context-banner'
import { FloatingCart } from '@/components/store/floating-cart'
import { getCityBySlug } from '@/lib/supabase-cities'

/**
 * Pagina de cidade (LP focada). Reusa exatamente o mesmo layout/componentes
 * da /loja para que o cliente tenha a experiencia completa de e-commerce e
 * apenas a copy/contexto fique focada na cidade.
 *
 * - Server Component: busca a cidade no Supabase pelo slug.
 * - Se a cidade nao existe ou esta inativa, ainda assim renderiza a /loja
 *   completa (em vez de quebrar com "Cidade nao configurada"), apenas sem
 *   o banner contextual.
 * - Se existe, mostra um banner sutil "Atendendo em <cidade>" e ativa o
 *   contexto da cidade nos componentes que ja consomem useActiveCityStore.
 */

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const city = await getCityBySlug(slug)

  if (!city) {
    return {
      title: 'AlfaConstrução · Loja',
      description: 'Materiais de construção com entrega rápida e atendimento direto.',
    }
  }

  const cityLabel = city.state ? `${city.cityName}/${city.state}` : city.cityName

  return {
    title: `${city.headline || `Materiais de construção em ${cityLabel}`} · AlfaConstrução`,
    description:
      city.subheadline ||
      `Compra de materiais de construção em ${cityLabel}. Frete reduzido, atendimento pelo WhatsApp da região e entrega expressa.`,
  }
}

export default async function CityLandingPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const city = await getCityBySlug(slug)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {city && (
        <CityActivator
          slug={city.slug}
          cityName={city.cityName}
          state={city.state}
        />
      )}

      <StoreHeader />

      {city && (
        <CityContextBanner
          cityName={city.cityName}
          state={city.state}
          highlight={city.offerBadge}
        />
      )}

      <CategoryCarousel />
      <HeroSection />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-5">
          <AddressSection />
        </div>

        <FeaturesSection />
        <FeaturedProducts />
        <BannersSection />
        <HowItWorks />
        <CitiesSection />
        <FaqSection />
      </main>

      <Footer />
      <ServiceAreaDialog />
      <FloatingCart />
    </div>
  )
}
