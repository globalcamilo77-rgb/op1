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
  title: 'AlfaConstrução - Melhores orcamentos com entrega rapida',
  description: 'O Mercado da Construcao. Compre materiais de construcao com os melhores precos e entrega rapida na sua regiao.',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
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
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PNMM4P57');`}
        </Script>
        {/* End Google Tag Manager */}

        {/* Google Ads (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17985777423"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-17985777423');`}
        </Script>
        {/* End Google Ads */}
      </head>
      <body className="font-sans antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PNMM4P57"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="gtm-noscript"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
