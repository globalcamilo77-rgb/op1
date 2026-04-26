import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BACKUP_TABLES = [
  'cities',
  'city_contacts',
  'whatsapp_contacts',
  'appearance_settings',
  'products',
  'orders',
  'order_items',
  'leads',
  'analytics_events',
  'ip_blocks',
  'pix_webhook_log',
] as const

type BackupDump = {
  version: 1
  generatedAt: string
  tables: Record<string, unknown[]>
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase nao configurado' }, { status: 503 })
  }

  const dump: BackupDump = {
    version: 1,
    generatedAt: new Date().toISOString(),
    tables: {},
  }

  for (const table of BACKUP_TABLES) {
    const { data, error } = await supabase.from(table).select('*').limit(50000)
    if (error) {
      // Tabelas opcionais que podem nao existir sao puladas
      console.warn(`[backup] erro lendo ${table}:`, error.message)
      dump.tables[table] = []
      continue
    }
    dump.tables[table] = (data ?? []) as unknown[]
  }

  const filename = `alfa-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
  return new NextResponse(JSON.stringify(dump, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase nao configurado' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !('tables' in body)) {
    return NextResponse.json({ error: 'Backup invalido (sem campo tables)' }, { status: 400 })
  }

  const dump = body as { tables: Record<string, unknown[]> }
  const results: Record<string, { restored?: number; error?: string }> = {}

  for (const table of BACKUP_TABLES) {
    const rows = dump.tables[table]
    if (!Array.isArray(rows) || rows.length === 0) {
      results[table] = { restored: 0 }
      continue
    }
    const { error } = await supabase
      .from(table)
      .upsert(rows as never, { onConflict: 'id' })
    if (error) {
      results[table] = { error: error.message }
    } else {
      results[table] = { restored: rows.length }
    }
  }

  return NextResponse.json({ ok: true, results })
}
