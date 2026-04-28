'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Search, X } from 'lucide-react'
import { useProductsStore, type StoreProduct } from '@/lib/products-store'
import { DEFAULT_APPEARANCE, useAppearanceStore } from '@/lib/appearance-store'
import { CATEGORIES, getCategoryByName } from '@/lib/categories'
import { ProductCard } from './product-card'

const MAX_PER_CATEGORY = 4

export function FeaturedProducts() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const { products, loadFromSupabase } = useProductsStore()
  const eyebrow = useAppearanceStore((state) => state.featuredEyebrow)
  const title = useAppearanceStore((state) => state.featuredTitle)
  const subtitle = useAppearanceStore((state) => state.featuredSubtitle)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Carregar produtos do Supabase ao montar
    loadFromSupabase()
  }, [loadFromSupabase])

  // Filtra produtos ativos e aplica busca se houver query
  const activeProducts = useMemo(() => {
    if (!mounted) return []
    let filtered = products.filter((p) => p.active)
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
    
    return filtered
  }, [mounted, products, searchQuery])

  const groupedByCategory = useMemo(() => {
    if (!mounted) return []

    const groups = new Map<string, StoreProduct[]>()
    for (const product of activeProducts) {
      const existing = groups.get(product.category)
      if (existing) {
        existing.push(product)
      } else {
        groups.set(product.category, [product])
      }
    }

    const orderedCategoryNames = CATEGORIES.map((cat) => cat.name)

    const orderedGroups: Array<{
      categoryName: string
      slug?: string
      products: StoreProduct[]
      total: number
    }> = []

    for (const name of orderedCategoryNames) {
      const list = groups.get(name)
      if (list && list.length > 0) {
        orderedGroups.push({
          categoryName: name,
          slug: getCategoryByName(name)?.slug,
          products: list.slice(0, MAX_PER_CATEGORY),
          total: list.length,
        })
        groups.delete(name)
      }
    }

    for (const [name, list] of groups.entries()) {
      orderedGroups.push({
        categoryName: name,
        slug: undefined,
        products: list.slice(0, MAX_PER_CATEGORY),
        total: list.length,
      })
    }

    return orderedGroups
  }, [mounted, activeProducts])

  // Se buscando e nao encontrou nada
  if (mounted && searchQuery && activeProducts.length === 0) {
    return (
      <section className="bg-background py-12 px-5">
        <div className="max-w-6xl mx-auto text-center">
          <Search size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Nenhum produto encontrado para &quot;{searchQuery}&quot;
          </h2>
          <p className="text-muted-foreground mb-4">
            Tente buscar por outro termo ou navegue pelas categorias.
          </p>
          <Link
            href="/loja"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--orange-primary)] text-white rounded-lg hover:bg-[var(--orange-dark)] transition-colors"
          >
            <X size={16} />
            Limpar busca
          </Link>
        </div>
      </section>
    )
  }

  if (mounted && activeProducts.length === 0) {
    return null
  }

  const eyebrowText = mounted ? eyebrow : DEFAULT_APPEARANCE.featuredEyebrow
  const titleText = mounted ? title : DEFAULT_APPEARANCE.featuredTitle
  const subtitleText = mounted ? subtitle : DEFAULT_APPEARANCE.featuredSubtitle

  // Se tem busca ativa, mostra titulo diferente
  const isSearching = searchQuery.trim().length > 0

  return (
    <section className="bg-background py-12 px-5">
      <div className="max-w-6xl mx-auto">
        {isSearching ? (
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--orange-primary)] font-semibold">
                Resultados da busca
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                {activeProducts.length} produto{activeProducts.length !== 1 ? 's' : ''} encontrado{activeProducts.length !== 1 ? 's' : ''} para &quot;{searchQuery}&quot;
              </h2>
            </div>
            <Link
              href="/loja"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              <X size={16} />
              Limpar busca
            </Link>
          </div>
        ) : (
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--orange-primary)] font-semibold">
                {eyebrowText}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                {titleText}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{subtitleText}</p>
            </div>
          </div>
        )}

        <div className="space-y-12">
          {groupedByCategory.map((group) => (
            <div key={group.categoryName}>
              <div className="flex items-end justify-between gap-3 mb-5 flex-wrap border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-6 w-1 rounded-full bg-[var(--orange-primary)]" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                      {group.categoryName}
                    </h3>
                  </div>
                </div>

                {group.slug && group.total > MAX_PER_CATEGORY && (
                  <Link
                    href={`/categoria/${group.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--orange-primary)] hover:text-[var(--orange-dark)] transition-colors"
                  >
                    Ver todos ({group.total})
                    <ArrowRight size={14} />
                  </Link>
                )}
                {group.slug && group.total <= MAX_PER_CATEGORY && (
                  <Link
                    href={`/categoria/${group.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--orange-primary)] hover:text-[var(--orange-dark)] transition-colors"
                  >
                    Ver categoria
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
