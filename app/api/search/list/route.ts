import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not configured')
  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // Busca as ultimas 500 pesquisas
    const { data: searches, error } = await supabase
      .from('search_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw error

    // Agrupa por query para ver as mais populares
    const queryCount = new Map<string, { count: number; lastSearch: string; totalResults: number }>()
    
    for (const search of searches || []) {
      const existing = queryCount.get(search.query)
      if (existing) {
        existing.count++
        existing.totalResults += search.results_count || 0
      } else {
        queryCount.set(search.query, {
          count: 1,
          lastSearch: search.created_at,
          totalResults: search.results_count || 0,
        })
      }
    }

    // Converte para array e ordena por popularidade
    const popular = Array.from(queryCount.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        lastSearch: data.lastSearch,
        avgResults: Math.round(data.totalResults / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)

    return NextResponse.json({
      recent: searches?.slice(0, 100) || [],
      popular,
    })
  } catch (error) {
    console.error('Erro ao listar pesquisas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
