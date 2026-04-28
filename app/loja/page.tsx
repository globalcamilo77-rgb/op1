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
import { FloatingCart } from '@/components/store/floating-cart'

export default function LojaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />
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
