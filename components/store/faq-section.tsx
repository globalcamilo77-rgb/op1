'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqItems } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-secondary py-12 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wide text-[var(--orange-primary)] font-semibold mb-2">
            Dúvidas
          </p>
          <h2 className="text-2xl font-bold text-foreground">Perguntas Frequentes</h2>
        </div>

        <div className="flex flex-col gap-3 max-w-3xl">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="bg-background border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground pr-4">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      'text-muted-foreground flex-shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
