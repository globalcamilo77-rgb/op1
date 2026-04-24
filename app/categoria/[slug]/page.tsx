'use client'

import Link from 'next/link'
import { use, useMemo, useState, useEffect } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { WhatsAppButton } from '@/components/store/whatsapp-button'
import { ServiceAreaDialog } from '@/components/store/service-area-dialog'
import { ProductCard } from '@/components/store/product-card'
import { CATEGORIES } from '@/lib/categories'
import { useProductsStore } from '@/lib/products-store'

interface Params {
  slug: string
}

export default function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params)
  const category = CATEGORIES.find((cat) => cat.slug === slug)

  const { products, loadFromSupabase } = useProductsStore()

  const [activeSub, setActiveSub] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadFromSupabase()
  }, [loadFromSupabase])

  const allProducts = mounted ? products : []

  const productsInCategory = useMemo(() => {
    if (!category) return []
    return allProducts.filter((product) => product.active && product.category === category.name)
  }, [allProducts, category])

  const visibleProducts = useMemo(() => {
    let list = productsInCategory
    if (activeSub) {
      list = list.filter((product) => product.subcategory === activeSub)
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.subcategory ?? '').toLowerCase().includes(term),
      )
    }
    return list
  }, [productsInCategory, activeSub, search])

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StoreHeader />
        <main className="flex-1 max-w-3xl mx-auto px-5 py-16 text-center">
          <h1 className="text-2xl font-bold">Categoria nao encontrada</h1>
          <p className="text-sm text-muted-foreground mt-2">
            A categoria <span className="font-mono">{slug}</span> nao existe ou foi removida.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white rounded text-sm font-semibold transition-colors"
          >
            Voltar a loja
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const subcategories = category.subcategories ?? []
  const totalActive = productsInCategory.length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/40">
          <div className="max-w-6xl mx-auto px-5 py-6">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Inicio
              </Link>
              <ChevronRight size={12} />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>

            <div className="mt-2 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{category.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalActive} {totalActive === 1 ? 'produto disponivel' : 'produtos disponiveis'}
                  {activeSub ? ` em ${activeSub}` : ''}
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar nesta categoria"
                  className="w-full h-9 pl-9 pr-3 rounded border border-border bg-background text-sm outline-none focus:border-[var(--orange-primary)]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
            {subcategories.length > 0 && (
              <aside className="lg:sticky lg:top-6 lg:self-start">
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
                    Subcategorias
                  </p>
                  <ul className="flex flex-col gap-1">
                    <li>
                      <button
                        onClick={() => setActiveSub(null)}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                          activeSub === null
                            ? 'bg-[var(--orange-primary)] text-white font-semibold'
                            : 'hover:bg-secondary text-foreground'
                        }`}
                      >
                        Todos ({productsInCategory.length})
                      </button>
                    </li>
                    {subcategories.map((sub) => {
                      const count = productsInCategory.filter((p) => p.subcategory === sub).length
                      return (
                        <li key={sub}>
                          <button
                            onClick={() => setActiveSub(sub)}
                            className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                              activeSub === sub
                                ? 'bg-[var(--orange-primary)] text-white font-semibold'
                                : 'hover:bg-secondary text-foreground'
                            }`}
                          >
                            {sub} ({count})
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </aside>
            )}

            <div className={subcategories.length === 0 ? 'lg:col-span-2' : ''}>
              {visibleProducts.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                  <p className="text-base font-semibold text-foreground">Nenhum produto encontrado.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tente ajustar a busca ou voltar para todas as subcategorias.
                  </p>
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
    </div>
  )
}
