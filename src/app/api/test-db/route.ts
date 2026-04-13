import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const results: Record<string, unknown> = {}

  const tables = [
    'blood_donors',
    'organ_donors', 
    'hospitals',
    'recipients',
    'requests',
    'match_results'
  ]

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(3)
    
      results[table] = error 
        ? { status: 'ERROR', message: error.message, code: error.code }
        : { status: 'OK', rows: data?.length ?? 0, total_in_db: count }
    } catch (e: any) {
      results[table] = { status: 'EXCEPTION', message: e.message }
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}
