'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { DEFAULT_APPEARANCE, useAppearanceStore } from '@/lib/appearance-store'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { openWhatsApp } from '@/lib/whatsapp-link'

function formatBrPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 13 && digits.startsWith('55')) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 12 && digits.startsWith('55')) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return raw
}

export function Footer() {
  const [mounted, setMounted] = useState(false)
  const appearance = useAppearanceStore(
    useShallow((state) => ({
      footerCompany: state.footerCompany,
      footerCopyright: state.footerCopyright,
      footerPhone: state.footerPhone,
      footerWhatsapp: state.footerWhatsapp,
      footerEmail: state.footerEmail,
      logoUrl: state.logoUrl,
    })),
  )
  const whatsapp = useWhatsAppStore(
    useShallow((state) => ({
      contacts: state.contacts,
      defaultMessage: state.defaultMessage,
    })),
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const companyText = mounted ? appearance.footerCompany : DEFAULT_APPEARANCE.footerCompany
  const copyrightText = mounted ? appearance.footerCopyright : DEFAULT_APPEARANCE.footerCopyright
  const phoneText = mounted ? appearance.footerPhone : DEFAULT_APPEARANCE.footerPhone
  const emailText = mounted ? appearance.footerEmail : DEFAULT_APPEARANCE.footerEmail
  const logoSrc = mounted ? appearance.logoUrl : DEFAULT_APPEARANCE.logoUrl

  const activeContacts = mounted
    ? whatsapp.contacts.filter((c) => c.active && c.number.replace(/\D/g, '').length >= 10)
    : []

  const encodedMessage = encodeURIComponent(
    mounted ? whatsapp.defaultMessage || '' : '',
  )

  const whatsappList =
    activeContacts.length > 0
      ? activeContacts.map((c) => ({
          id: c.id,
          label: c.label || 'WhatsApp',
          number: c.number.replace(/\D/g, ''),
        }))
      : [
          {
            id: 'fallback',
            label: 'WhatsApp',
            number: (mounted ? appearance.footerWhatsapp : DEFAULT_APPEARANCE.footerWhatsapp)
              .replace(/\D/g, ''),
          },
        ]

  const phoneDigits = phoneText.replace(/\D/g, '')
  const phoneHref = phoneDigits.length > 0 ? `tel:${phoneDigits}` : undefined

  return (
    <footer className="bg-[var(--graphite)] text-white py-10 px-5 mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            {logoSrc ? (
              <div className="mb-4 inline-flex items-center justify-center bg-white rounded-lg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt={companyText}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ) : null}
            <h3 className="font-bold text-sm mb-4">{companyText}</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/quem-somos" className="text-sm text-white/80 hover:underline">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-sm text-white/80 hover:underline">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/vender" className="text-sm text-white/80 hover:underline">
                  Quero vender na {companyText}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-white/80 hover:underline">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4">Ajuda</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/termos" className="text-sm text-white/80 hover:underline">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-sm text-white/80 hover:underline">
                  Politica de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/trocas" className="text-sm text-white/80 hover:underline">
                  Trocas e Devolucoes
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-sm text-white/80 hover:underline">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4">Televendas</h3>
            <p className="text-sm text-white/80 mb-3 leading-relaxed">
              <strong>Horario de atendimento</strong>
              <br />
              Todos os dias: 08:00 as 22:00
            </p>
            {phoneHref && (
              <p className="text-sm text-white/80 leading-relaxed flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-[var(--orange-primary)]" />
                <a href={phoneHref} className="hover:underline">
                  {phoneText}
                </a>
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4">Contato</h3>
            <ul className="flex flex-col gap-2 mb-3">
              {whatsappList.map((item) => {
                const href = `https://wa.me/${item.number}${encodedMessage ? `?text=${encodedMessage}` : ''}`
                return (
                  <li key={item.id} className="text-sm text-white/80 leading-relaxed">
                    <span className="block text-[11px] uppercase tracking-wide text-white/50 mb-0.5">
                      {item.label}
                    </span>
                    <a
                      href={href}
                      onClick={(event) => {
                        event.preventDefault()
                        openWhatsApp(item.number, whatsapp.defaultMessage || undefined)
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <MessageCircle size={14} className="text-[var(--orange-primary)] shrink-0" />
                      {formatBrPhone(item.number)}
                    </a>
                  </li>
                )
              })}
            </ul>
            <p className="text-sm text-white/80 leading-relaxed flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-[var(--orange-primary)]" />
              <a href={`mailto:${emailText}`} className="hover:underline break-all">
                {emailText}
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  )
}
