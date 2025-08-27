import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/infrastructure/config/supabaseClient'

// Get current academic year
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('academic_year')
      .select('*')
      .eq('is_current', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current academic year:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(data || null);
  } catch (err) {
    console.error('Error in GET /api/academic-year/current:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
