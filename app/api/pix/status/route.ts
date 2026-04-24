import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const apiKey = process.env.KOLISEU_API_KEY ?? ''
  const baseUrl = process.env.KOLISEU_BASE_URL ?? 'https://www.koliseu.cloud/api/v1'

  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get('id')

  if (!paymentId) {
    return NextResponse.json({ error: 'Parametro id obrigatorio' }, { status: 400 })
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Gateway PIX nao configurado' }, { status: 503 })
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/pix/payments/${encodeURIComponent(paymentId)}`,
      {
        method: 'GET',
        headers: { 'x-api-key': apiKey },
      },
    )
    const contentType = response.headers.get('content-type') ?? ''
    const raw = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Falha ao consultar status', status: response.status, raw },
        { status: response.status },
      )
    }

    return NextResponse.json({ ok: true, data: raw })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Falha de conexao: ${message}` }, { status: 502 })
  }
}
