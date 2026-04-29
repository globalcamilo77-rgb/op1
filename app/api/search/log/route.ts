import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not configured')
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, results_count } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query obrigatoria' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    
    // Pega IP e user agent
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const user_agent = request.headers.get('user-agent') || 'unknown'

    await supabase.from('search_logs').insert({
      query: query.trim().toLowerCase(),
      results_count: results_count || 0,
      ip,
      user_agent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao registrar pesquisa:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
