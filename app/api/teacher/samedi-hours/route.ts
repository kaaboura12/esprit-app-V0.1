import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/infrastructure/config/supabaseClient'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

// Update samedi hours for alternance
export async function PUT(request: NextRequest) {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate token and get teacher ID
    const tokenService = JwtTokenServiceSingleton.getInstance()
    let teacherId: number
    
    try {
      const authToken = await tokenService.verifyToken(token)
      
      if (!authToken || !authToken.isValid()) {
        throw new Error('Invalid or expired token')
      }
      
      teacherId = authToken.getTeacherId()
      
      if (!teacherId || teacherId <= 0) {
        throw new Error('Invalid teacher ID in token')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    
    if (!academicYear) {
      return NextResponse.json({ error: 'Missing academicYear parameter' }, { status: 400 });
    }

    const { samedi_hours } = await request.json();

    if (samedi_hours === undefined || samedi_hours < 0) {
      return NextResponse.json({ error: 'Invalid samedi_hours value' }, { status: 400 });
    }

    try {
      // Update samedi hours in teacher_summary
      const { error: updateError } = await supabase
        .from('teacher_summary')
        .update({ hours_samedi: samedi_hours })
        .eq('teacher_id', teacherId)
        .eq('academic_year', academicYear)
        .eq('shift_type', 'alternance');

      if (updateError) {
        console.error('Error updating samedi hours:', updateError);
        return NextResponse.json({ error: 'Failed to update samedi hours' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Samedi hours updated successfully' });
    } catch (err) {
      console.error('Error updating samedi hours:', err);
      return NextResponse.json({ error: 'Failed to update samedi hours' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error in PUT /api/teacher/samedi-hours:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
