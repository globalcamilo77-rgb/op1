import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * Retorna o numero de WhatsApp ideal para a sessao.
 * Para funis e cidades, faz rotacao temporal entre os contatos ativos
 * usando o intervalo configurado em whatsapp_settings.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const source = searchParams.get('source') || 'home'

    const { data: contacts } = await supabase
      .from('whatsapp_contacts')
      .select('id, label, number, active')
      .eq('active', true)

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum numero ativo cadastrado' },
        { status: 404 },
      )
    }

    const { data: settings } = await supabase
      .from('whatsapp_settings')
      .select('rotation_interval_minutes')
      .eq('id', 1)
      .single()

    let selected = contacts[0]
    const shouldRotate =
      source === 'cidade' || source === 'funnel-cidade' || source === 'funnel'

    if (shouldRotate && contacts.length > 1) {
      const intervalMin = settings?.rotation_interval_minutes || 60
      const intervalMs = Math.max(1, intervalMin) * 60 * 1000
      const index = Math.floor(Date.now() / intervalMs) % contacts.length
      selected = contacts[index]
    }

    const phoneClean = String(selected.number).replace(/\D/g, '')
    return NextResponse.json({
      success: true,
      number: selected.number,
      number_clean: phoneClean,
      label: selected.label,
      whatsapp_url: `https://wa.me/${phoneClean}`,
    })
  } catch (error) {
    console.error('[v0] Erro em /api/whatsapp/get:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
