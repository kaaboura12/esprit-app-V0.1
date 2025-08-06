import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/infrastructure/middleware/authMiddleware'
import { supabase } from '@/infrastructure/config/supabaseClient'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Get all students with their class information
    const { data: students, error } = await supabase
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
      throw error
    }

    // Calculate age and additional information for each student
    const studentsWithDetails = students.map(student => {
      const birthDate = student.date_naissance ? new Date(student.date_naissance) : null
      const age = birthDate ? Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
      
      return {
        id: student.id,
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email,
        numeroEtudiant: student.numero_etudiant,
        dateNaissance: student.date_naissance,
        age: age,
        classe: student.classe,
        fullName: `${student.firstname} ${student.lastname}`,
        initials: `${student.firstname.charAt(0)}${student.lastname.charAt(0)}`.toUpperCase(),
        status: 'active', // You can add logic here based on your requirements
        generation: (student.classe as any)?.nom_classe || 'Unknown',
        academicYear: new Date().getFullYear().toString()
      }
    })

    // Calculate statistics
    const totalStudents = studentsWithDetails.length
    const studentsByClass = studentsWithDetails.reduce((acc, student) => {
      const className = (student.classe as any)?.nom_classe || 'Unknown'
      acc[className] = (acc[className] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageAge = studentsWithDetails.length > 0 
      ? Math.round(studentsWithDetails.filter(s => s.age).reduce((sum, s) => sum + (s.age || 0), 0) / studentsWithDetails.filter(s => s.age).length)
      : 0

    const studentsByBloc = studentsWithDetails.reduce((acc, student) => {
      const bloc = (student.classe as any)?.bloc || 'Unknown'
      acc[bloc] = (acc[bloc] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      students: studentsWithDetails,
      total: totalStudents,
      statistics: {
        totalStudents,
        averageAge,
        studentsByClass,
        studentsByBloc,
        totalClasses: Object.keys(studentsByClass).length,
        totalBlocs: Object.keys(studentsByBloc).length
      }
    })
  } catch (error) {
    console.error('Error in admin students GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(getHandler) 