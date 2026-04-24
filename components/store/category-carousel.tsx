'use client'

import Link from 'next/link'
import { useRef } from 'react'
import {
  Bath,
  Box,
  Boxes,
  Cog,
  Droplets,
  Hammer,
  Home,
  LayoutGrid,
  Layers,
  Mountain,
  Paintbrush,
  Palette,
  ShieldCheck,
  Sofa,
  Square,
  Tent,
  Trees,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

const iconMap: Record<string, LucideIcon> = {
  Bath,
  Box,
  Boxes,
  Cog,
  Droplets,
  Hammer,
  Home,
  LayoutGrid,
  Layers,
  Mountain,
  Paintbrush,
  Palette,
  ShieldCheck,
  Sofa,
  Square,
  Tent,
  Trees,
  Wrench,
  Zap,
}

export function CategoryCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleWheel = (event: React.WheelEvent) => {
    if (carouselRef.current && event.deltaY !== 0) {
      event.preventDefault()
      carouselRef.current.scrollLeft += event.deltaY
    }
  }

  return (
    <div
      ref={carouselRef}
      onWheel={handleWheel}
      className="bg-background border-b border-border overflow-x-auto overflow-y-hidden px-5 py-3 flex gap-3 items-center scrollbar-thin scrollbar-thumb-border"
    >
      {CATEGORIES.map((category) => {
        const IconComponent = iconMap[category.icon] || Box
        return (
          <Link
            key={category.id}
            href={`/categoria/${category.slug}`}
            className="flex flex-col items-center gap-2 min-w-[110px] max-w-[130px] text-center p-2 text-foreground text-xs rounded transition-colors hover:bg-secondary"
            title={category.name}
          >
            <IconComponent size={26} className="text-[var(--orange-primary)]" />
            <span className="leading-tight line-clamp-2">{category.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
