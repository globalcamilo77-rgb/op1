import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const hasServerKey = Boolean(process.env.KOLISEU_API_KEY)
  return NextResponse.json({ hasServerKey })
}
