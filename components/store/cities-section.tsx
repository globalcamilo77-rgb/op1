import { MapPin } from 'lucide-react'
import { cities } from '@/lib/mock-data'

export function CitiesSection() {
  return (
    <section className="max-w-6xl mx-auto my-10 px-5">
      <h2 className="text-2xl mb-8 text-foreground">Cidades que Atuamos</h2>

      <div className="bg-secondary p-8 rounded">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {cities.map((city, index) => (
            <div key={index} className="text-sm text-muted-foreground">
              {city}
            </div>
          ))}
        </div>

        <div className="w-full h-[200px] bg-muted rounded mt-5 flex items-center justify-center text-muted-foreground text-sm">
          <MapPin className="mr-2" size={20} />
          Mapa de cobertura (63 cidades)
        </div>
      </div>
    </section>
  )
}
