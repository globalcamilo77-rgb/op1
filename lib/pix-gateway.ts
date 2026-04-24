export interface GatewayChargeInput {
  amountCents: number
  description: string
  externalReference: string
  client?: {
    name?: string
    email?: string
    phone?: string
    document?: string
  }
}

export interface GatewayChargeNormalized {
  id?: string
  status?: string
  qrCode?: string
  qrCodeImage?: string
  expiresAt?: string
  raw: unknown
}

export type GatewayResult =
  | { ok: true; data: GatewayChargeNormalized }
  | { ok: false; error: string; raw?: unknown }

function pick(obj: unknown, keys: string[]): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const o = obj as Record<string, unknown>
  for (const key of keys) {
    const val = o[key]
    if (typeof val === 'string' && val.length > 0) return val
  }
  return undefined
}

function nested(obj: unknown, path: string[]): unknown {
  let cursor: unknown = obj
  for (const key of path) {
    if (cursor && typeof cursor === 'object') {
      cursor = (cursor as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return cursor
}

export function normalizeKoliseu(raw: unknown): GatewayChargeNormalized {
  if (!raw || typeof raw !== 'object') return { raw }
  const o = raw as Record<string, unknown>

  const nestedPix = [
    nested(o, ['pix']),
    nested(o, ['data']),
    nested(o, ['data', 'pix']),
    nested(o, ['payment']),
    nested(o, ['payment', 'pix']),
  ]

  const merged = [o, ...nestedPix].filter(Boolean) as unknown[]

  let qrCode: string | undefined
  let qrCodeImage: string | undefined
  let id: string | undefined
  let status: string | undefined
  let expiresAt: string | undefined

  for (const src of merged) {
    if (!qrCode) {
      qrCode = pick(src, [
        'qrCode',
        'qr_code',
        'brcode',
        'brCode',
        'emv',
        'pixCopyPaste',
        'pix_copia_e_cola',
        'copiaECola',
        'copiaecola',
        'payload',
        'pixPayload',
      ])
    }
    if (!qrCodeImage) {
      qrCodeImage = pick(src, [
        'qrCodeImage',
        'qr_code_image',
        'qrCodeBase64',
        'qr_code_base64',
        'qrCodeUrl',
        'qrcodeUrl',
        'qrcode_url',
        'qrImage',
        'qrImageUrl',
      ])
    }
    if (!id) {
      id = pick(src, ['id', 'paymentId', 'payment_id', 'transactionId', 'transaction_id'])
    }
    if (!status) {
      status = pick(src, ['status', 'state', 'paymentStatus'])
    }
    if (!expiresAt) {
      expiresAt = pick(src, ['expiresAt', 'expires_at', 'expiration', 'expirationDate'])
    }
  }

  return { id, status, qrCode, qrCodeImage, expiresAt, raw }
}

export async function createGatewayPix(input: GatewayChargeInput): Promise<GatewayResult> {
  try {
    const res = await fetch('/api/pix/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.ok) {
      return {
        ok: false,
        error: json?.error || `HTTP ${res.status}`,
        raw: json?.raw ?? json,
      }
    }
    return { ok: true, data: normalizeKoliseu(json.data) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return { ok: false, error: message }
  }
}

export async function fetchGatewayStatus(paymentId: string): Promise<GatewayResult> {
  try {
    const params = new URLSearchParams({ id: paymentId })
    const res = await fetch(`/api/pix/status?${params.toString()}`)
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.ok) {
      return {
        ok: false,
        error: json?.error || `HTTP ${res.status}`,
        raw: json?.raw ?? json,
      }
    }
    return { ok: true, data: normalizeKoliseu(json.data) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return { ok: false, error: message }
  }
}

export async function fetchGatewayConfig(): Promise<{ hasServerKey: boolean }> {
  try {
    const res = await fetch('/api/pix/config')
    if (!res.ok) return { hasServerKey: false }
    const json = await res.json()
    return { hasServerKey: Boolean(json?.hasServerKey) }
  } catch {
    return { hasServerKey: false }
  }
}
