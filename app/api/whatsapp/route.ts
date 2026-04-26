import { NextResponse } from 'next/server'
import { listWhatsAppContacts, upsertWhatsAppContacts } from '@/lib/supabase-whatsapp'
import type { WhatsAppContact } from '@/lib/whatsapp-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const contacts = await listWhatsAppContacts()
    return NextResponse.json({ contacts }, { status: 200 })
  } catch (error) {
    console.error('[api/whatsapp] GET falhou:', error)
    return NextResponse.json({ contacts: [], error: String(error) }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { contacts: WhatsAppContact[] }
    if (!Array.isArray(body.contacts)) {
      return NextResponse.json({ error: 'contacts deve ser array' }, { status: 400 })
    }
    await upsertWhatsAppContacts(body.contacts)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('[api/whatsapp] POST falhou:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
