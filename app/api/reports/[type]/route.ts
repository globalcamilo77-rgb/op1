import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ReportType = 'orders' | 'leads' | 'events' | 'pix' | 'ip-blocks'

const TABLE_BY_TYPE: Record<ReportType, { table: string; orderBy?: string }> = {
  orders: { table: 'orders', orderBy: 'created_at' },
  leads: { table: 'leads', orderBy: 'created_at' },
  events: { table: 'analytics_events', orderBy: 'created_at' },
  pix: { table: 'pix_webhook_log', orderBy: 'created_at' },
  'ip-blocks': { table: 'ip_blocks', orderBy: 'created_at' },
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let str: string
  if (typeof value === 'object') {
    try {
      str = JSON.stringify(value)
    } catch {
      str = String(value)
    }
  } else {
    str = String(value)
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowsToCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(','))
  }
  return lines.join('\r\n')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params
  const config = TABLE_BY_TYPE[type as ReportType]
  if (!config) {
    return NextResponse.json({ error: 'Tipo de relatorio invalido' }, { status: 400 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase nao configurado' }, { status: 503 })
  }

  // Filtro opcional por intervalo de datas (?from=ISO&to=ISO)
  const from = request.nextUrl.searchParams.get('from')
  const to = request.nextUrl.searchParams.get('to')

  let query = supabase.from(config.table).select('*').limit(5000)
  if (config.orderBy) query = query.order(config.orderBy, { ascending: false })
  if (from) query = query.gte(config.orderBy ?? 'created_at', from)
  if (to) query = query.lte(config.orderBy ?? 'created_at', to)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>

  // ?format=json retorna JSON, default retorna CSV
  const format = request.nextUrl.searchParams.get('format')
  if (format === 'json') {
    return NextResponse.json({ count: rows.length, rows })
  }

  const csv = rowsToCsv(rows)
  const filename = `${type}-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
