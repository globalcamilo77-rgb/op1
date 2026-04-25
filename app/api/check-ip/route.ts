import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown'

    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip', ip)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar IP:', error)
    }

    return NextResponse.json({ 
      blocked: !!data,
      ip,
      reason: data?.reason || null
    })
  } catch (error) {
    console.error('Erro ao verificar IP:', error)
    return NextResponse.json({ blocked: false, ip: 'unknown' })
  }
}
