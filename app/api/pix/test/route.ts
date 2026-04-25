import { NextRequest, NextResponse } from 'next/server'

const KOLISEU_API_URL = 'https://www.koliseu.cloud/api/v1/pix/payments'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.KOLISEU_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API Key da Koliseu não configurada',
          configured: false 
        },
        { status: 500 }
      )
    }

    // Cobrança de teste com R$ 1,00
    const testPayload = {
      amountCents: 100,
      description: 'Teste de conexão - AlfaConstrução',
      externalReference: `test-${Date.now()}`,
      client: {
        name: 'Teste Sistema',
        email: 'teste@alfaconstrucao.com',
        phone: '11999999999',
        document: '00000000000',
      },
    }

    const response = await fetch(KOLISEU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(testPayload),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.message || 'Falha na conexão com Koliseu',
        details: data,
        configured: true,
        status: response.status,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão com Koliseu funcionando!',
      configured: true,
      testPayment: data,
    })
  } catch (error) {
    console.error('[v0] PIX test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro de conexão com a API',
        configured: true 
      },
      { status: 500 }
    )
  }
}
