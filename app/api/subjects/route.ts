import { NextResponse } from 'next/server'
import { getConnectionPool } from '@/infrastructure/config/database'

export async function GET() {
  try {
    const pool = getConnectionPool()
    const [rows] = await pool.execute(
      'SELECT id, nommatiere FROM matiere ORDER BY nommatiere'
    )
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 