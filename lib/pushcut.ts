// Helper para enviar notificacoes via Pushcut.
// Cada evento (gerado / aprovado) tem 3 endpoints, um por dispositivo.
// IMPORTANTE: o nome da notification e case-sensitive e deve existir no Pushcut do dispositivo correspondente.

const PUSHCUT_GENERATED_ENDPOINTS = [
  'https://api.pushcut.io/1QF9kMziOF12FeAKJby0B/notifications/Alfa%20',
  'https://api.pushcut.io/8DnJaf6bHxILOHcg2BIbY/notifications/Gerado',
  'https://api.pushcut.io/G7TVP0BQZvdZeVlNdxBpM/notifications/ALFA',
]

const PUSHCUT_APPROVED_ENDPOINTS = [
  'https://api.pushcut.io/1QF9kMziOF12FeAKJby0B/notifications/Alfa%2002%20',
  'https://api.pushcut.io/8DnJaf6bHxILOHcg2BIbY/notifications/Aprovado',
  'https://api.pushcut.io/G7TVP0BQZvdZeVlNdxBpM/notifications/Alfa',
]

export interface PixNotificationPayload {
  amount: number
  customerName?: string
  customerPhone?: string
  customerDocument?: string
  externalReference?: string
  paymentId?: string
}

export interface NotifyResult {
  ok: number
  failed: number
  details: Array<{ url: string; status: number; ok: boolean; error?: string }>
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

async function dispatch(
  endpoints: string[],
  body: { title: string; text: string; input: string }
): Promise<NotifyResult> {
  const results = await Promise.allSettled(
    endpoints.map(async (url) => {
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

export async function notifyPixGenerated(
  data: PixNotificationPayload
): Promise<NotifyResult> {
  const valueFormatted = formatBRL(data.amount)
  return dispatch(PUSHCUT_GENERATED_ENDPOINTS, {
    title: 'Pix Gerado',
    text: valueFormatted,
    input: valueFormatted,
  })
}

export async function notifyPixApproved(
  data: PixNotificationPayload
): Promise<NotifyResult> {
  const valueFormatted = formatBRL(data.amount)
  return dispatch(PUSHCUT_APPROVED_ENDPOINTS, {
    title: 'Pix Aprovado!',
    text: valueFormatted,
    input: valueFormatted,
  })
}
