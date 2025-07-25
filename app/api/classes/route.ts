import { NextResponse } from 'next/server'
import { supabase } from '@/infrastructure/config/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('classe')
      .select('id, nom_classe, bloc, numclasse')
      .order('nom_classe')

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 