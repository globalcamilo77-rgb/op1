import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = req.cookies.get('alfa-admin-session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const hasServerKey = Boolean(process.env.KOLISEU_API_KEY)
  return NextResponse.json({ hasServerKey })
}
