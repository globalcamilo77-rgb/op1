import { NextResponse } from 'next/server'
import { listCities, upsertCity, deleteCity } from '@/lib/supabase-cities'
import type { CityPage } from '@/lib/cities-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const cities = await listCities()
    return NextResponse.json({ cities }, { status: 200 })
  } catch (error) {
    console.error('[api/cities] GET falhou:', error)
    return NextResponse.json({ cities: [], error: String(error) }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { city?: CityPage; cities?: CityPage[] }
    if (body.cities && Array.isArray(body.cities)) {
      for (const c of body.cities) {
        await upsertCity(c)
      }
    } else if (body.city) {
      await upsertCity(body.city)
    } else {
      return NextResponse.json({ error: 'city ou cities obrigatorio' }, { status: 400 })
    }
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('[api/cities] POST falhou:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
    }
    await deleteCity(id)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('[api/cities] DELETE falhou:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
