import { NextResponse } from 'next/server'
import { supabase } from '@/infrastructure/config/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('matiere')
      .select('id, nommatiere, coefficient')
      .order('nommatiere')

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 