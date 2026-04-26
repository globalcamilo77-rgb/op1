import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processPixWebhook } from '@/lib/pix-webhook-processor'

export const runtime = 'nodejs'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return ''
}

const PAID_STATUSES = new Set([
  'paid',
  'PAID',
  'completed',
  'COMPLETED',
  'confirmed',
  'CONFIRMED',
  'approved',
  'APPROVED',
])

function extractStatus(raw: unknown): string {
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>
    if (typeof r.status === 'string') return r.status
    if (r.data && typeof r.data === 'object') {
      const d = r.data as Record<string, unknown>
      if (typeof d.status === 'string') return d.status
    }
  }
  return ''
}

function extractField(raw: unknown, path: string[]): string | undefined {
  let cur: unknown = raw
  for (const key of path) {
    if (cur && typeof cur === 'object' && key in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return typeof cur === 'string' ? cur : undefined
}

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

    // Detecta se a Koliseu ja confirmou o pagamento. Se sim e ainda nao
    // disparamos o webhook localmente (status no Supabase nao eh "paid"),
    // invocamos o processPixWebhook na hora — assim o Pushcut, o bloqueio
    // de IP e o update da order acontecem mesmo se a Koliseu ainda nao
    // tiver chamado nosso webhook (ou se ela falhar em chamar).
    const detectedStatus = extractStatus(raw)
    const isPaid = PAID_STATUSES.has(detectedStatus)

    if (isPaid) {
      const supabase = getSupabase()
      
      // Tenta extrair externalReference de varios caminhos possiveis
      let externalReference =
        extractField(raw, ['external_reference']) ||
        extractField(raw, ['externalReference']) ||
        extractField(raw, ['data', 'external_reference']) ||
        extractField(raw, ['data', 'externalReference']) ||
        extractField(raw, ['payment', 'external_reference']) ||
        extractField(raw, ['payment', 'externalReference'])

      let alreadyProcessed = false
      let orderFromDb: { id: string; status: string } | null = null

      // Se nao achou externalReference no payload, tenta buscar pelo paymentId
      // (pix_transaction_id) no Supabase
      if (supabase && !externalReference) {
        const { data: orderByPix } = await supabase
          .from('orders')
          .select('id, status')
          .eq('pix_transaction_id', paymentId)
          .maybeSingle()
        if (orderByPix) {
          externalReference = orderByPix.id
          orderFromDb = orderByPix
          if (orderByPix.status === 'paid') {
            alreadyProcessed = true
          }
        }
      }

      // Se achou externalReference mas nao buscou ainda, verifica status
      if (supabase && externalReference && !orderFromDb) {
        const { data: orderRow } = await supabase
          .from('orders')
          .select('id, status')
          .eq('id', externalReference)
          .maybeSingle()
        if (orderRow) {
          orderFromDb = orderRow
          if (orderRow.status === 'paid') {
            alreadyProcessed = true
          }
        }
      }

      if (!alreadyProcessed && externalReference) {
        // Idempotencia: chamamos o processador uma unica vez por pedido.
        // Ele marca status=paid no Supabase, dispara Pushcut, bloqueia IP e
        // loga o evento. Em chamadas subsequentes, "alreadyProcessed" trava.
        const ctx = {
          requestIp: getClientIp(req),
          userAgent: req.headers.get('user-agent') || '',
        }
        try {
          console.log('[pix-status] Disparando webhook local para pedido:', externalReference)
          await processPixWebhook(
            {
              event: 'payment.confirmed',
              data: {
                id: paymentId,
                status: detectedStatus,
                externalReference,
              },
            },
            ctx,
          )
          console.log('[pix-status] Webhook local processado com sucesso')
        } catch (err) {
          console.error('[pix-status] erro ao disparar webhook local:', err)
        }
      } else if (!externalReference) {
        console.warn('[pix-status] Pagamento confirmado mas externalReference nao encontrado:', paymentId)
      }
    }

    return NextResponse.json({ ok: true, data: raw })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Falha de conexao: ${message}` }, { status: 502 })
  }
}
