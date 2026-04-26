import { redirect } from 'next/navigation'

/**
 * A pagina principal do site e' /loja. A raiz / apenas redireciona
 * para /loja preservando query params (UTM, gclid, fbclid etc).
 *
 * Server component sincrono: o redirect acontece no SSR (HTTP 307),
 * sem flash de pagina vazia para o cliente.
 */
export default async function HomeRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const qs = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v)
    } else {
      qs.set(key, value)
    }
  }

  const query = qs.toString()
  redirect(query ? `/loja?${query}` : '/loja')
}
