import Link from 'next/link'
import { brands } from '@/lib/mock-data'

export function BrandsSection() {
  return (
    <section className="bg-secondary py-10 px-5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl mb-8 text-foreground">
          Compre por <strong>Marca</strong>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/marca/${brand.name.toLowerCase()}`}
              aria-label={`Ver produtos da marca ${brand.name}`}
              className="group bg-background border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-lg hover:border-[var(--orange-primary)] hover:-translate-y-0.5 min-h-28"
            >
              <span
                className={`font-extrabold tracking-tight leading-none mb-2 transition-transform duration-200 group-hover:scale-105 ${
                  brand.italic ? 'italic' : ''
                } ${brand.wordmark.length > 8 ? 'text-base' : 'text-xl'}`}
                style={{ color: brand.color, letterSpacing: '-0.02em' }}
              >
                {brand.wordmark}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
