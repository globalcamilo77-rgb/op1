import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not configured')
  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    
    // Busca os ultimos 100 IPs unicos com contagem
    const { data, error } = await supabase
      .from('ip_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupa por IP mostrando o mais recente
    const ipMap = new Map<string, typeof data[0] & { count: number }>()
    for (const log of data || []) {
      if (!ipMap.has(log.ip)) {
        ipMap.set(log.ip, { ...log, count: 1 })
      } else {
        ipMap.get(log.ip)!.count++
      }
    }

    const logs = Array.from(ipMap.values()).slice(0, 50)

    return NextResponse.json({ logs })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
