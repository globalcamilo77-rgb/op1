'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAnalyticsStore } from '@/lib/analytics-store'

function TrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ensureSession = useAnalyticsStore((state) => state.ensureSession)
  const setAttribution = useAnalyticsStore((state) => state.setAttribution)
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  useEffect(() => {
    ensureSession()
  }, [ensureSession])

  useEffect(() => {
    const utmSource = searchParams.get('utm_source')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')

    if (utmSource || utmMedium || utmCampaign) {
      setAttribution({
        source: utmSource ?? 'direct',
        medium: utmMedium ?? 'none',
        campaign: utmCampaign ?? 'none',
      })
    } else if (typeof document !== 'undefined' && document.referrer) {
      try {
        const ref = new URL(document.referrer)
        if (ref.host !== window.location.host) {
          setAttribution({ source: ref.host, medium: 'referral', campaign: 'none' })
        }
      } catch {
        // ignore invalid referrer
      }
    }
  }, [searchParams, setAttribution])

  useEffect(() => {
    trackEvent('page_view', { path: pathname })
  }, [pathname, trackEvent])

  return null
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  )
}
