import { NextResponse } from 'next/server'
import { supabase } from '@/infrastructure/config/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('teacher')
      .select('id, firstname, lastname, departement')
      .order('firstname')
      .order('lastname')

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 