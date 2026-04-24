import { DollarSign, Store, Truck, Package, CheckCircle, Zap } from 'lucide-react'
import { features } from '@/lib/mock-data'

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  Store,
  Truck,
  Package,
  CheckCircle,
  Zap,
}

export function FeaturesSection() {
  return (
    <section className="bg-secondary py-12 px-5 border-y border-border">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const IconComponent = iconMap[feature.icon] || Package
          return (
            <div key={index} className="text-center group">
              <div className="w-14 h-14 mx-auto mb-3 bg-background border-2 border-[var(--orange-primary)]/20 rounded-2xl flex items-center justify-center group-hover:border-[var(--orange-primary)] group-hover:bg-[var(--orange-soft)] transition-colors">
                <IconComponent size={26} className="text-[var(--orange-primary)]" />
              </div>
              <h3 className="text-xs font-bold mb-1 text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-snug">{feature.subtitle}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
