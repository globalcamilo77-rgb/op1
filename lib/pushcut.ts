// Helper para enviar notificacoes via Pushcut quando um Pix e gerado.
// Os 3 endpoints disparam para 3 dispositivos/contas distintas.

// IMPORTANTE: o nome da notification e case-sensitive e deve existir no
// Pushcut do dispositivo correspondente.
const PUSHCUT_ENDPOINTS = [
  'https://api.pushcut.io/1QF9kMziOF12FeAKJby0B/notifications/Alfa%20',
  'https://api.pushcut.io/8DnJaf6bHxILOHcg2BIbY/notifications/Gerado',
  'https://api.pushcut.io/G7TVP0BQZvdZeVlNdxBpM/notifications/ALFA',
]

export interface PixGeneratedPayload {
  amount: number
  customerName?: string
  customerPhone?: string
  customerDocument?: string
  externalReference?: string
  paymentId?: string
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export async function notifyPixGenerated(data: PixGeneratedPayload): Promise<{
  ok: number
  failed: number
  details: Array<{ url: string; status: number; ok: boolean; error?: string }>
}> {
  const valueFormatted = formatBRL(data.amount)

  const body = {
    title: 'Pix Gerado',
    text: valueFormatted,
    input: valueFormatted,
  }

  const results = await Promise.allSettled(
    PUSHCUT_ENDPOINTS.map(async (url) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
        clearTimeout(timeout)
        return { url, status: res.status, ok: res.ok }
      } catch (err) {
        clearTimeout(timeout)
        return {
          url,
          status: 0,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        }
      }
    })
  )

  const details = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { url: 'unknown', status: 0, ok: false, error: String(r.reason) }
  )

  const ok = details.filter((d) => d.ok).length
  const failed = details.length - ok

  return { ok, failed, details }
}
