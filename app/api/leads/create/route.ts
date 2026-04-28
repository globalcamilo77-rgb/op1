import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not configured')
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await req.json()
    const {
      name,
      phone,
      cep,
      email,
      city,
      source_page,
      funnel_slug,
      whatsapp_number,
      message,
      tracking,
    } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nome e telefone sao obrigatorios' },
        { status: 400 },
      )
    }

    const phoneClean = String(phone).replace(/\D/g, '')
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      return NextResponse.json(
        { error: 'Telefone invalido. Use DDD + numero.' },
        { status: 400 },
      )
    }

    // Inserir lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          phone: phoneClean,
          cep: cep || null,
          email: email || null,
          city: city || null,
          source_page: source_page || 'home',
          funnel_slug: funnel_slug || null,
          whatsapp_number: whatsapp_number || null,
          status: 'new',
          tracking: tracking && typeof tracking === 'object' ? tracking : {},
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('[v0] Erro ao salvar lead:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar lead' },
        { status: 500 },
      )
    }

    // Atualizar contador do funil
    if (funnel_slug) {
      await supabase.rpc('increment_funnel_leads', { p_slug: funnel_slug }).then(
        () => {},
        async () => {
          const { data: funnel } = await supabase
            .from('funnels')
            .select('total_leads')
            .eq('slug', funnel_slug)
            .single()
          if (funnel) {
            await supabase
              .from('funnels')
              .update({ total_leads: (funnel.total_leads || 0) + 1 })
              .eq('slug', funnel_slug)
          }
        },
      )
    }

    // Montar URL do WhatsApp
    let whatsapp_url: string | null = null
    if (whatsapp_number) {
      const numberClean = String(whatsapp_number).replace(/\D/g, '')
      const text =
        message ||
        `Ola ${name}! Recebi seu pedido de orcamento. Posso te ajudar com material de construcao?`
      whatsapp_url = `https://wa.me/${numberClean}?text=${encodeURIComponent(text)}`
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      whatsapp_url,
    })
  } catch (error) {
    console.error('[v0] Erro interno em /api/leads/create:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
