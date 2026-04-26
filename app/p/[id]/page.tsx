import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle2, MessageCircle, Package } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { getProductLP, type ProductLP } from '@/lib/supabase-product-lp'
import { ProductLPCta } from './lp-cta'
import { ProductLPVideo } from './lp-video'

interface ProductRow {
  id: string
  name: string
  category: string | null
  subcategory: string | null
  brand: string | null
  dimensions: string | null
  price: number
  description: string | null
  image: string | null
  active: boolean
}

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function getProduct(id: string): Promise<ProductRow | null> {
  const supabase = getServerSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, subcategory, brand, dimensions, price, description, image, active')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('[p/[id]] erro buscando produto', error)
    return null
  }
  return (data as unknown as ProductRow) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const productId = decodeURIComponent(id)
  const [product, lp] = await Promise.all([getProduct(productId), getProductLP(productId)])
  if (!product) {
    return { title: 'Produto não encontrado · AlfaConstrução' }
  }
  const title = lp?.seoTitle || lp?.headline || `${product.name} · AlfaConstrução`
  const description =
    lp?.seoDescription ||
    lp?.subheadline ||
    product.description ||
    `Compre ${product.name} direto pelo WhatsApp com frete reduzido e entrega rápida.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: lp?.heroImage || product.image ? [lp?.heroImage || product.image!] : [],
    },
  }
}

const currency = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default async function ProductLandingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = decodeURIComponent(id)
  const [product, lp] = await Promise.all([getProduct(productId), getProductLP(productId)])

  if (!product || !product.active) {
    notFound()
  }

  const heroImage = lp?.heroImage || product.image || '/placeholder.jpg'
  const headline = lp?.headline || product.name
  const subheadline =
    lp?.subheadline ||
    product.description ||
    'Material de construção com entrega rápida e atendimento direto.'
  const benefits = lp?.benefits?.length
    ? lp.benefits
    : [
        { title: 'Entrega rápida', description: 'Saída em até 24h.' },
        { title: 'Atendimento humano', description: 'WhatsApp direto, sem bot.' },
        { title: 'Pagamento facilitado', description: 'PIX, cartão ou boleto.' },
      ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        {/* Voltar */}
        <div className="max-w-6xl mx-auto px-5 pt-4">
          <Link
            href="/loja"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Voltar à loja
          </Link>
        </div>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 py-8 md:py-14 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border border-border">
            <Image
              src={heroImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          <div>
            {product.brand && (
              <div className="inline-block text-[11px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded mb-3">
                {product.brand}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight text-balance leading-tight mb-4">
              {headline}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 text-pretty">
              {subheadline}
            </p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-xs text-muted-foreground">A partir de</span>
              <span className="text-3xl md:text-4xl font-bold text-[var(--orange-primary,_#FF6B00)]">
                {currency(product.price)}
              </span>
              {product.dimensions && (
                <span className="text-xs text-muted-foreground">/ {product.dimensions}</span>
              )}
            </div>

            <ProductLPCta
              productId={product.id}
              productName={product.name}
              price={product.price}
              ctaText={lp?.ctaText || 'Comprar pelo WhatsApp'}
              ctaMessage={lp?.ctaMessage || ''}
            />

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Package size={14} />
              <span>Entrega expressa em São Paulo e ABC</span>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="bg-muted/40 border-y border-border">
          <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.slice(0, 6).map((b, i) => (
              <div key={i} className="flex gap-3">
                <CheckCircle2
                  size={22}
                  className="shrink-0 mt-0.5 text-[var(--orange-primary,_#FF6B00)]"
                />
                <div>
                  <div className="font-bold text-foreground text-sm">{b.title}</div>
                  {b.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {b.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Galeria */}
        {lp?.gallery && lp.gallery.length > 0 && (
          <section className="max-w-6xl mx-auto px-5 py-10">
            <h2 className="text-xl font-bold text-foreground mb-5">Galeria</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lp.gallery.filter(Boolean).map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square bg-muted rounded-lg overflow-hidden border border-border"
                >
                  <Image
                    src={url}
                    alt={`${product.name} — imagem ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vídeo */}
        {lp?.videoUrl && (
          <section className="max-w-6xl mx-auto px-5 py-10">
            <h2 className="text-xl font-bold text-foreground mb-5">Veja em ação</h2>
            <ProductLPVideo url={lp.videoUrl} />
          </section>
        )}

        {/* Descrição longa */}
        {lp?.longDescription && (
          <section className="max-w-3xl mx-auto px-5 py-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Sobre o produto</h2>
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line">
              {lp.longDescription}
            </div>
          </section>
        )}

        {/* CTA final */}
        <section className="max-w-3xl mx-auto px-5 py-12 text-center">
          <div className="bg-card border border-border rounded-xl p-8">
            <MessageCircle
              size={32}
              className="mx-auto mb-3 text-[var(--success,_#16a34a)]"
            />
            <h2 className="text-2xl font-bold text-foreground mb-2 text-balance">
              Fechou? Compre direto no WhatsApp.
            </h2>
            <p className="text-sm text-muted-foreground mb-5 text-pretty">
              Atendimento humano, orçamento na hora e entrega rápida.
            </p>
            <ProductLPCta
              productId={product.id}
              productName={product.name}
              price={product.price}
              ctaText={lp?.ctaText || 'Comprar pelo WhatsApp'}
              ctaMessage={lp?.ctaMessage || ''}
              size="lg"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
