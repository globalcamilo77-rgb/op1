import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AppearanceProvider } from '@/components/store/appearance-provider'
import { AnalyticsTracker } from '@/components/store/analytics-tracker'
import { WhatsAppButton } from '@/components/store/whatsapp-button'
import { ActiveCityBanner } from '@/components/store/active-city-banner'
import { TrackingParamsCapture } from '@/components/tracking-params-capture'
import { StoresHydrator } from '@/components/stores-hydrator'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AlfaConstrucao - Materiais de Construcao com Entrega Rapida',
    template: '%s | AlfaConstrucao',
  },
  description: 'Compre materiais de construcao online: cimento, tijolos, argamassa, tubos, vergalhoes e mais. Melhores precos e entrega rapida na sua regiao. Atendimento via WhatsApp.',
  keywords: [
    'materiais de construcao',
    'cimento',
    'tijolos',
    'argamassa',
    'tubos PVC',
    'vergalhao',
    'areia',
    'brita',
    'construcao civil',
    'loja de construcao',
    'entrega de materiais',
  ],
  authors: [{ name: 'AlfaConstrucao' }],
  creator: 'AlfaConstrucao',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'AlfaConstrucao - Materiais de Construcao',
    description: 'Compre materiais de construcao online com os melhores precos e entrega rapida na sua regiao.',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'AlfaConstrucao' }],
    type: 'website',
    locale: 'pt_BR',
    siteName: 'AlfaConstrucao',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlfaConstrucao - Materiais de Construcao',
    description: 'Melhores precos e entrega rapida na sua regiao.',
    images: ['/logo.png'],
  },
  verification: {
    google: 'adicione-seu-codigo-aqui',
  },
  alternates: {
    canonical: 'https://alfaconstrucao.com.br',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <head>
        {/* Dados estruturados - Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'AlfaConstrucao',
              description: 'Loja de materiais de construcao com entrega rapida',
              url: 'https://alfaconstrucao.com.br',
              logo: 'https://alfaconstrucao.com.br/logo.png',
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'BR',
              },
              sameAs: [],
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '08:00',
                closes: '18:00',
              },
            }),
          }}
        />

        {/* Microsoft Clarity */}
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "why5jbezq8");`}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <StoresHydrator />
        <AppearanceProvider />
        <AnalyticsTracker />
        <Suspense fallback={null}>
          <TrackingParamsCapture />
        </Suspense>
        <ActiveCityBanner />
        {children}
        <WhatsAppButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
