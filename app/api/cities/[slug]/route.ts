import { NextResponse } from 'next/server'
import { getCityBySlug } from '@/lib/supabase-cities'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params
    const city = await getCityBySlug(slug)
    if (!city) {
      return NextResponse.json({ city: null }, { status: 404 })
    }
    return NextResponse.json({ city }, { status: 200 })
  } catch (error) {
    console.error('[api/cities/[slug]] falhou:', error)
    return NextResponse.json({ city: null, error: String(error) }, { status: 500 })
  }
}
