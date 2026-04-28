import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not configured')
  return createClient(url, key)
}

/**
 * POST /api/ip-blocks/add
 * Body: { ip: string, reason: string, metadata?: object }
 * 
 * Adiciona IP a lista de bloqueados.
 * Usado pelo middleware quando detecta spam ou bot malicioso.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ip, reason, metadata } = body

    if (!ip) {
      return NextResponse.json({ error: 'IP obrigatorio' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Verifica se IP ja esta bloqueado
    const { data: existing } = await supabase
      .from('ip_blocks')
      .select('id')
      .eq('ip', ip)
      .maybeSingle()

    if (existing) {
      // Atualiza metadata se ja existe
      await supabase
        .from('ip_blocks')
        .update({ 
          metadata: metadata || {},
          reason: reason || 'spam_detected',
        })
        .eq('ip', ip)
      
      return NextResponse.json({ success: true, updated: true })
    }

    // Insere novo bloqueio (expira em 24 horas)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { error } = await supabase.from('ip_blocks').insert({
      ip,
      reason: reason || 'spam_detected',
      source: 'auto',
      manual: false,
      expires_at: expiresAt,
      metadata: metadata || {},
    })

    if (error) {
      console.error('[ip-blocks/add] erro ao inserir:', error)
      return NextResponse.json({ error: 'Erro ao bloquear IP' }, { status: 500 })
    }

    console.log(`[ip-blocks/add] IP ${ip} bloqueado por ${reason}`)
    return NextResponse.json({ success: true, expiresAt })
  } catch (error) {
    console.error('[ip-blocks/add] erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
