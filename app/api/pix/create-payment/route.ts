import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface CreatePaymentBody {
  amountCents: number
  description?: string
  externalReference?: string
  client?: {
    name?: string
    email?: string
    phone?: string
    document?: string
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.KOLISEU_API_KEY ?? ''
  const baseUrl = process.env.KOLISEU_BASE_URL ?? 'https://www.koliseu.cloud/api/v1'

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gateway PIX nao configurado. Defina KOLISEU_API_KEY no servidor.' },
      { status: 503 },
    )
  }

  let body: CreatePaymentBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  if (!body.amountCents || body.amountCents <= 0) {
    return NextResponse.json({ error: 'amountCents deve ser maior que zero' }, { status: 400 })
  }

  const payload = {
    amountCents: Math.round(body.amountCents),
    description: body.description ?? 'Pagamento PIX',
    externalReference: body.externalReference ?? `ref-${Date.now().toString(36)}`,
    client: body.client ?? {},
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/pix/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    const contentType = response.headers.get('content-type') ?? ''
    const raw = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Falha no gateway Koliseu', status: response.status, raw },
        { status: response.status },
      )
    }

    return NextResponse.json({ ok: true, data: raw })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Falha de conexao: ${message}` }, { status: 502 })
  }
}
