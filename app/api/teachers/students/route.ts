import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/infrastructure/middleware/authMiddleware'
import { supabase } from '@/infrastructure/config/database'
import { StudentByTeacherDTO, StudentsByTeacherResponseDTO } from '@/application/dtos/StudentByTeacherDTO'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacher_id')

    if (!teacherId) {
      return NextResponse.json(
        { error: 'teacher_id parameter is required' },
        { status: 400 }
      )
    }

    // Get students with their classes and subjects using a simpler approach
    const { data, error } = await supabase
      .from('etudiant')
      .select(`
        id,
        firstname,
        lastname,
        email,
        numero_etudiant,
        date_naissance,
        classe:classe_id(
          id,
          nom_classe,
          bloc,
          numclasse
        )
      `)
      .order('lastname', { ascending: true })
      .order('firstname', { ascending: true })

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    // Filter students by teacher's classes after fetching
    const { data: teacherClasses, error: teacherClassesError } = await supabase
      .from('teacher_classe')
      .select(`
        classe_id,
        matiere_id,
        matiere:matiere_id(
          id,
          nommatiere
        )
      `)
      .eq('teacher_id', teacherId)

    if (teacherClassesError) {
      console.error('Error fetching teacher classes:', teacherClassesError)
      return NextResponse.json(
        { error: 'Failed to fetch teacher classes' },
        { status: 500 }
      )
    }

    if (!teacherClasses || teacherClasses.length === 0) {
      return NextResponse.json({
        students: [],
        total: 0,
        teacher_id: parseInt(teacherId)
      })
    }

    // Get the class IDs where the teacher teaches
    const teacherClassIds = teacherClasses.map(tc => tc.classe_id)
    
    // Filter students to only include those in teacher's classes
    const filteredStudents = data?.filter(student => {
      const studentClass = student.classe as any
      return studentClass && studentClass.id && teacherClassIds.includes(studentClass.id)
    }) || []

    if (error) {
      console.error('Error fetching students by teacher:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    console.log(`Found ${filteredStudents.length} students for teacher ${teacherId}`)
    console.log(`Teacher teaches ${teacherClasses.length} class-subject combinations`)

    // Transform the nested data to match the expected response format
    // We need to match students with their subjects based on class
    const transformedData: StudentByTeacherDTO[] = filteredStudents.map(student => {
      const studentClass = student.classe as any
      // Find the subject for this student's class
      const teacherClass = teacherClasses.find(tc => tc.classe_id === studentClass.id)
      
      // Safety check for required fields
      if (!studentClass || !studentClass.id) {
        console.warn(`Student ${student.id} has no valid class information`)
        return null
      }
      
      return {
        student_id: student.id,
        firstname: student.firstname || '',
        lastname: student.lastname || '',
        email: student.email || '',
        numero_etudiant: student.numero_etudiant || '',
        date_naissance: student.date_naissance || '',
        classe_id: studentClass.id,
        nom_classe: studentClass.nom_classe || '',
        bloc: studentClass.bloc || '',
        numclasse: studentClass.numclasse || '',
        subject_name: (teacherClass?.matiere as any)?.nommatiere || '',
        matiere_id: (teacherClass?.matiere as any)?.id || 0
      }
    }).filter(Boolean) as StudentByTeacherDTO[]

    // Remove duplicates based on student_id and matiere_id combination
    const uniqueStudents = transformedData.filter((student, index, self) => 
      index === self.findIndex(s => 
        s.student_id === student.student_id && s.matiere_id === student.matiere_id
      )
    )

    console.log(`Transformed ${transformedData.length} records to ${uniqueStudents.length} unique students`)

    const response: StudentsByTeacherResponseDTO = {
      students: uniqueStudents,
      total: uniqueStudents.length,
      teacher_id: parseInt(teacherId)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in getStudentsByTeacher:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)
