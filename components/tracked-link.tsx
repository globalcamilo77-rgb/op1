'use client'

import Link from 'next/link'
import { forwardRef, type ComponentProps } from 'react'
import { useTrackedHref } from '@/lib/tracking-params-store'

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

/**
 * Wrapper de next/link que automaticamente concatena os parametros de tracking
 * (UTMs, gclid, fbclid, msclkid, etc.) ao href, mantendo o lead atribuido
 * a campanha original do Google Ads em todo o funil.
 */
export const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(function TrackedLink(
  { href, ...rest },
  ref
) {
  const trackedHref = useTrackedHref()
  return <Link ref={ref} href={trackedHref(href)} {...rest} />
})
