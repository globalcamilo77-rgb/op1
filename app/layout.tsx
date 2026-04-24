import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AppearanceProvider } from '@/components/store/appearance-provider'
import { AnalyticsTracker } from '@/components/store/analytics-tracker'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AlfaConstrução - Melhores orcamentos com entrega rapida',
  description: 'O Mercado da Construcao. Compre materiais de construcao com os melhores precos e entrega rapida na sua regiao.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo.png',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'AlfaConstrução - Materiais para Construção',
    description:
      'O Mercado da Construcao. Melhores precos e entrega rapida na sua regiao.',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'AlfaConstrução' }],
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlfaConstrução - Materiais para Construção',
    description: 'Melhores precos e entrega rapida na sua regiao.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className="font-sans antialiased">
        <AppearanceProvider />
        <AnalyticsTracker />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
