import { NextResponse } from 'next/server'
import { getConnectionPool } from '@/infrastructure/config/database'

export async function GET() {
  try {
    const pool = getConnectionPool()
    const [rows] = await pool.execute(
      'SELECT id, nom_classe, bloc, numclasse FROM classe ORDER BY nom_classe'
    )
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 