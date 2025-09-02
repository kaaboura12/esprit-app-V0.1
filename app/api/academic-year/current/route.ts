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
      // If academic_year table doesn't exist, return current year as fallback
      console.warn('Academic year table not found, using current year as fallback:', error);
      const currentYear = new Date().getFullYear();
      const fallbackYear = `${currentYear}-${currentYear + 1}`;
      return NextResponse.json({ year: fallbackYear });
    }

    return NextResponse.json(data || { year: getCurrentYearString() });
  } catch (err) {
    // Fallback to current year if any error occurs
    console.warn('Error in GET /api/academic-year/current, using fallback:', err);
    return NextResponse.json({ year: getCurrentYearString() });
  }
}

function getCurrentYearString(): string {
  const currentYear = new Date().getFullYear();
  return `${currentYear}-${currentYear + 1}`;
}
