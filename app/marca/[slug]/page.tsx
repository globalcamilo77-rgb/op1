'use client'

import Link from 'next/link'
import { use, useMemo, useState, useEffect } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { WhatsAppButton } from '@/components/store/whatsapp-button'
import { ServiceAreaDialog } from '@/components/store/service-area-dialog'
import { FloatingCart } from '@/components/store/floating-cart'
import { ProductCard } from '@/components/store/product-card'
import { CATEGORIES } from '@/lib/categories'
import { useProductsStore } from '@/lib/products-store'
import { brands } from '@/lib/mock-data'

interface Params {
  slug: string
}

/** Normaliza um texto para comparacao por slug. Tira acentos, espacos e caracteres especiais. */
function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function BrandPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params)
  const normalizedSlug = toSlug(decodeURIComponent(slug))
  const brand = useMemo(
    () => brands.find((b) => toSlug(b.name) === normalizedSlug),
    [normalizedSlug],
  )

  const { products, loadFromSupabase } = useProductsStore()

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadFromSupabase()
  }, [loadFromSupabase])

  const productsByBrand = useMemo(() => {
    if (!mounted) return []
    return products.filter(
      (product) => product.active && product.brand && toSlug(product.brand) === normalizedSlug,
    )
  }, [mounted, products, normalizedSlug])

  const categoriesPresent = useMemo(() => {
    const set = new Set<string>()
    for (const product of productsByBrand) {
      set.add(product.category)
    }
    const orderedNames = CATEGORIES.map((cat) => cat.name).filter((name) => set.has(name))
    const extras = Array.from(set).filter((name) => !orderedNames.includes(name))
    return [...orderedNames, ...extras]
  }, [productsByBrand])

  const visibleProducts = useMemo(() => {
    let list = productsByBrand
    if (activeCategory) {
      list = list.filter((product) => product.category === activeCategory)
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.subcategory ?? '').toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term),
      )
    }
    return list
  }, [productsByBrand, activeCategory, search])

  // Marca nao reconhecida (slug invalido)
  if (!brand && mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StoreHeader />
        <main className="flex-1 max-w-3xl mx-auto px-5 py-16 text-center">
          <h1 className="text-2xl font-bold">Marca nao encontrada</h1>
          <p className="text-sm text-muted-foreground mt-2">
            A marca <span className="font-mono">{slug}</span> nao foi reconhecida.
          </p>
          <Link
            href="/loja"
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white rounded text-sm font-semibold transition-colors"
          >
            Voltar a loja
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const totalActive = productsByBrand.length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/40">
          <div className="max-w-6xl mx-auto px-5 py-6">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link href="/loja" className="hover:text-foreground">
                Loja
              </Link>
              <ChevronRight size={12} />
              <span>Marca</span>
              <ChevronRight size={12} />
              <span className="text-foreground font-medium">{brand?.name ?? slug}</span>
            </nav>

              <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {brand && (
                  <div className="bg-background border border-border rounded-lg p-3">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--orange-primary)] font-semibold">
                    Compre por marca
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {brand?.name ?? slug}
                  </h1>
                  {mounted && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {totalActive === 0
                        ? 'Nenhum produto cadastrado para esta marca'
                        : `${totalActive} ${totalActive === 1 ? 'produto disponivel' : 'produtos disponiveis'}`}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative w-full md:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Buscar produtos ${brand?.name ? `da ${brand.name}` : ''}`}
                  className="w-full h-9 pl-9 pr-3 rounded border border-border bg-background text-sm outline-none focus:border-[var(--orange-primary)]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
            {categoriesPresent.length > 1 && (
              <aside className="lg:sticky lg:top-6 lg:self-start">
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
                    Categorias
                  </p>
                  <ul className="flex flex-col gap-1">
                    <li>
                      <button
                        onClick={() => setActiveCategory(null)}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                          activeCategory === null
                            ? 'bg-[var(--orange-primary)] text-white font-semibold'
                            : 'hover:bg-secondary text-foreground'
                        }`}
                      >
                        Todas ({productsByBrand.length})
                      </button>
                    </li>
                    {categoriesPresent.map((cat) => {
                      const count = productsByBrand.filter((p) => p.category === cat).length
                      return (
                        <li key={cat}>
                          <button
                            onClick={() => setActiveCategory(cat)}
                            className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                              activeCategory === cat
                                ? 'bg-[var(--orange-primary)] text-white font-semibold'
                                : 'hover:bg-secondary text-foreground'
                            }`}
                          >
                            {cat} ({count})
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </aside>
            )}

            <div className={categoriesPresent.length <= 1 ? 'lg:col-span-2' : ''}>
              {!mounted ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                  <p className="text-sm text-muted-foreground">Carregando produtos...</p>
                </div>
              ) : visibleProducts.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                  <p className="text-base font-semibold text-foreground">
                    Nenhum produto encontrado.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalActive === 0
                      ? 'Esta marca ainda nao possui produtos cadastrados.'
                      : 'Tente ajustar a busca ou voltar para todas as categorias.'}
                  </p>
                  <Link
                    href="/loja"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white rounded text-sm font-semibold transition-colors"
                  >
                    Voltar a loja
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} showSubcategoryBadge />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
        <ServiceAreaDialog />
        <FloatingCart />
      </div>
    )
  }
