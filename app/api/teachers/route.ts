import { NextResponse } from 'next/server'
import { getConnectionPool } from '@/infrastructure/config/database'

export async function GET() {
  try {
    const pool = getConnectionPool()
    const [rows] = await pool.execute(
      'SELECT id, firstname, lastname, departement FROM teacher ORDER BY firstname, lastname'
    )
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 