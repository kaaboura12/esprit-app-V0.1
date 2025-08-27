import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/infrastructure/config/supabaseClient'

// Get all matieres (subjects)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('matiere')
      .select('id, nommatiere')
      .order('nommatiere')

    if (error) {
      console.error('Error fetching matieres:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/matieres:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
