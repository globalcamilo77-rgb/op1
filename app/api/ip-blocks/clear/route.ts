import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not configured')
  return createClient(url, key)
}

export async function DELETE() {
  try {
    const supabase = getSupabaseAdmin()
    
    // Remove todos os IPs bloqueados
    const { error } = await supabase
      .from('ip_blocks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deleta todos (workaround para delete sem where)
    
    if (error) {
      // Tenta deletar de outra forma
      await supabase.from('ip_blocks').delete().gte('created_at', '1970-01-01')
    }
    
    return NextResponse.json({ success: true, message: 'Todos os IPs foram desbloqueados' })
  } catch (err) {
    console.error('Erro ao limpar IPs:', err)
    return NextResponse.json({ error: 'Erro ao limpar IPs' }, { status: 500 })
  }
}
