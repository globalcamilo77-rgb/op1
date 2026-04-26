import { NextRequest, NextResponse } from 'next/server'
import { notifyPixGenerated } from '@/lib/pushcut'

const KOLISEU_API_URL = 'https://www.koliseu.cloud/api/v1/pix/payments'

// CPF fixo enviado para a Koliseu ao gerar o QR PIX. Configurado em
// PIX_FALLBACK_CPF nos Vars do projeto — nao aparece em codigo nenhum.
// O documento real do cliente (CNPJ ou CPF que ele digitou) continua sendo
// salvo internamente no order/log, apenas o gateway recebe o fallback.
const FALLBACK_CPF = (process.env.PIX_FALLBACK_CPF || '').replace(/\D/g, '')
const isCpfValid = (digits: string) => digits.length === 11
const isCnpjValid = (digits: string) => digits.length === 14

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.KOLISEU_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key da Koliseu não configurada' },
        { status: 500 }
      )
    }

    const body = await request.json()

    const { amountCents, description, externalReference, client } = body

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    // Documento real digitado pelo cliente (CNPJ ou CPF) — preservado para
    // log/Pushcut/order. NAO eh enviado para a Koliseu.
    const customerDigits = (client?.document || '').replace(/\D/g, '')

    // Documento que vai para a Koliseu: sempre o CPF fixo da env, exceto
    // quando o cliente digitou um CPF valido (11 digitos) — nesse caso usamos
    // o dele mesmo. CNPJ NUNCA vai pro gateway.
    const gatewayDocument =
      isCpfValid(customerDigits) && !isCnpjValid(customerDigits)
        ? customerDigits
        : FALLBACK_CPF

    const payload = {
      amountCents: Number(amountCents),
      description: description || 'Cobrança PIX',
      externalReference: externalReference || `pix-${Date.now()}`,
      client: {
        name: client?.name || 'Cliente',
        email: client?.email || '',
        phone: client?.phone || '',
        document: gatewayDocument,
      },
    }

    const response = await fetch(KOLISEU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[v0] Koliseu API error:', data)
      return NextResponse.json(
        { error: data.message || 'Erro ao criar cobrança PIX', details: data },
        { status: response.status }
      )
    }

    // Disparar notificacao Pushcut em paralelo para os 3 dispositivos
    const notifyResult = await notifyPixGenerated({
      amount: Number(amountCents) / 100,
      customerName: client?.name,
      customerPhone: client?.phone,
      customerDocument: customerDigits || undefined,
      externalReference: payload.externalReference,
      paymentId: data?.id,
    })
    console.log('[v0] Pushcut Pix gerado:', notifyResult)

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] PIX creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar cobrança PIX' },
      { status: 500 }
    )
  }
}
