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
    
    const ip = body.ip || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]
    
    if (!ip) {
      return NextResponse.json({ error: 'IP não encontrado' }, { status: 400 })
    }

    const { error } = await supabase
      .from('ip_logs')
      .insert({
        ip: ip.trim(),
        path: body.path || '',
        user_agent: body.userAgent || req.headers.get('user-agent') || '',
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
