import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const { data: funnel, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single()

    if (error || !funnel) {
      return NextResponse.json({ error: 'Funil nao encontrado' }, { status: 404 })
    }

    // Incrementar views (best effort)
    await supabase
      .from('funnels')
      .update({ total_views: (funnel.total_views || 0) + 1 })
      .eq('slug', slug)

    return NextResponse.json({ success: true, funnel })
  } catch (error) {
    console.error('[v0] Erro em /api/funnels/[slug]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
