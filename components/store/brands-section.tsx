import Link from 'next/link'
import { brands } from '@/lib/mock-data'

export function BrandsSection() {
  return (
    <section className="bg-secondary py-10 px-5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl mb-8 text-foreground">
          Compre por <strong>Marca</strong>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/marca/${brand.name.toLowerCase()}`}
              className="bg-background border border-border rounded p-5 text-center cursor-pointer transition-all hover:shadow-md hover:border-muted-foreground"
            >
              <div className="text-2xl font-bold text-[var(--orange-primary)] mb-2">
                {brand.initial}
              </div>
              <div className="text-xs text-muted-foreground">{brand.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
