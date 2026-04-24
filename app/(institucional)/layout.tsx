import type { ReactNode } from 'react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { WhatsAppButton } from '@/components/store/whatsapp-button'

export default function InstitucionalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
