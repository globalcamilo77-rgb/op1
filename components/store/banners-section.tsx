import Link from 'next/link'
import { Star, Zap, MessageCircle, CreditCard } from 'lucide-react'

const banners = [
  {
    id: 1,
    icon: Star,
    eyebrow: 'Reclame Aqui',
    headline: 'Nota 9.7',
    sub: 'Empresa comprometida com você',
    gradient: 'from-indigo-500 to-purple-600',
    href: '#',
  },
  {
    id: 2,
    icon: CreditCard,
    eyebrow: 'Pagamento fácil',
    headline: 'Pague no PIX',
    sub: 'Ou cartão na entrega',
    gradient: 'from-pink-500 to-rose-600',
    href: '#',
  },
  {
    id: 3,
    icon: Zap,
    eyebrow: 'Economize tempo',
    headline: 'Orçamento Relâmpago',
    sub: 'Muitos produtos de uma vez',
    gradient: 'from-cyan-500 to-teal-500',
    href: '#',
  },
  {
    id: 4,
    icon: MessageCircle,
    eyebrow: 'Fique por dentro',
    headline: 'Grupo de Ofertas',
    sub: 'Receba as melhores promoções',
    gradient: 'from-emerald-500 to-teal-500',
    href: '#',
  },
]

export function BannersSection() {
  return (
    <div className="max-w-6xl mx-auto my-8 px-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {banners.map(({ id, icon: Icon, eyebrow, headline, sub, gradient, href }) => (
          <Link
            key={id}
            href={href}
            className={`rounded-xl overflow-hidden bg-gradient-to-br ${gradient} text-white p-5 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer`}
          >
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs opacity-75 font-medium mb-0.5">{eyebrow}</p>
              <p className="text-lg font-extrabold leading-tight">{headline}</p>
              <p className="text-xs opacity-80 mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
