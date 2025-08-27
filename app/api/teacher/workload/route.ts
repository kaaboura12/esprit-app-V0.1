import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/infrastructure/config/supabaseClient'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

// Get teacher workload for a specific academic year
export async function GET(request: NextRequest) {
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

    // Get workload data
    const { data: workloadData, error: workloadError } = await supabase
      .from('teacher_workload')
      .select(`
        id,
        teacher_id,
        matiere_id,
        classe_id,
        shift_type,
        period,
        hours,
        academic_year,
        created_at,
        updated_at,
        matiere:matiere_id(id, nommatiere),
        classe:classe_id(id, nom_classe)
      `)
      .eq('teacher_id', teacherId)
      .eq('academic_year', academicYear)
      .order('shift_type', { ascending: true })
      .order('matiere_id', { ascending: true })
      .order('classe_id', { ascending: true });

    if (workloadError) {
      console.error('Error fetching workload:', workloadError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get summary data
    const { data: summaryData, error: summaryError } = await supabase
      .from('teacher_summary')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('academic_year', academicYear);

    if (summaryError) {
      console.error('Error fetching summary:', summaryError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get annual summary
    const { data: annualData, error: annualError } = await supabase
      .from('teacher_annual_summary')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('academic_year', academicYear)
      .maybeSingle();

    if (annualError) {
      console.error('Error fetching annual summary:', annualError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      workload: workloadData || [],
      summary: summaryData || [],
      annual: annualData || null
    });
  } catch (err) {
    console.error('Error in GET /api/teacher/workload:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Save teacher workload
export async function POST(request: NextRequest) {
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

    const { workload, samedi_hours } = await request.json();
    
    try {
      // Delete existing workload for this teacher/year
      const { error: deleteError } = await supabase
        .from('teacher_workload')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('academic_year', academicYear);

      if (deleteError) {
        console.error('Error deleting existing workload:', deleteError);
        return NextResponse.json({ error: 'Failed to delete existing workload' }, { status: 500 });
      }

      // Insert new workload data
      const workloadEntries = [];
      
      // Type definition for assignment
      interface WorkloadAssignment {
        matiere_id: string;
        classe_id: string;
        P1: number;
        P2: number;
        P3: number;
        P4: number;
      }

      for (const [shiftType, assignments] of Object.entries(workload)) {
        for (const assignment of Object.values(assignments as Record<string, WorkloadAssignment>)) {
          if (assignment.matiere_id && assignment.classe_id) {
            // Insert data for each period
            for (const period of ['P1', 'P2', 'P3', 'P4'] as const) {
              if (assignment[period] && assignment[period] > 0) {
                workloadEntries.push({
                  teacher_id: teacherId,
                  matiere_id: assignment.matiere_id,
                  classe_id: assignment.classe_id,
                  shift_type: shiftType,
                  period: period,
                  hours: assignment[period],
                  academic_year: academicYear
                });
              }
            }
          }
        }
      }

      if (workloadEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('teacher_workload')
          .insert(workloadEntries);

        if (insertError) {
          console.error('Error inserting workload:', insertError);
          return NextResponse.json({ error: 'Failed to insert workload data' }, { status: 500 });
        }
      }

      // Update samedi hours for alternance if provided
      if (samedi_hours !== undefined) {
        // Note: This would require the database function to be available
        // For now, we'll update the summary directly
        const { error: samediError } = await supabase
          .from('teacher_summary')
          .update({ hours_samedi: samedi_hours })
          .eq('teacher_id', teacherId)
          .eq('academic_year', academicYear)
          .eq('shift_type', 'alternance');

        if (samediError) {
          console.error('Error updating samedi hours:', samediError);
          // Don't fail the entire operation for this
        }
      }

      return NextResponse.json({ message: 'Workload saved successfully' });
    } catch (err) {
      console.error('Error saving workload:', err);
      return NextResponse.json({ error: 'Failed to save workload' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error in POST /api/teacher/workload:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
