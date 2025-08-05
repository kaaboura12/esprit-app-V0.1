import { NextRequest, NextResponse } from 'next/server'
import { GetStudentsByClasseUseCase } from '@/application/use-cases/GetStudentsByClasseUseCase'
import { MySQLStudentRepository } from '@/infrastructure/repositories/MySQLStudentRepository'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

/**
 * GET /api/students/export?classeId=1
 * Exports students for a specific class
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(request)
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
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
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid authentication token' 
      }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const classeIdParam = searchParams.get('classeId')

    if (!classeIdParam) {
      return NextResponse.json({ 
        success: false, 
        error: 'Class ID is required' 
      }, { status: 400 })
    }

    const classeId = parseInt(classeIdParam)

    if (isNaN(classeId) || classeId <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Class ID' 
      }, { status: 400 })
    }

    // Get students for the class
    const studentRepository = new MySQLStudentRepository()
    const getStudentsUseCase = new GetStudentsByClasseUseCase(studentRepository)
    
    const students = await getStudentsUseCase.execute(Number(classeId))
    
    if (!students || students.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No students found for this class' 
      }, { status: 404 })
    }

    // Get class name from teacher classes API
    let className = `Classe_${classeId}`
    try {
      const classResponse = await fetch(`${request.nextUrl.origin}/api/teachers/classes`, {
        method: 'GET',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
          'Content-Type': 'application/json',
        },
      })
      
      if (classResponse.ok) {
        const classData = await classResponse.json()
        if (classData.success && classData.classes) {
          const classInfo = classData.classes.find((c: any) => c.classeId === classeId)
          if (classInfo) {
            className = classInfo.className
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch class name, using default:', error)
    }

    // Generate CSV content
    let csvContent = ''
    
    // Headers
    const headers = [
      'Prénom', 
      'Nom', 
      'Numéro étudiant', 
      'Email', 
      'Date de naissance', 
      'Âge', 
      'Statut', 
      'Génération', 
      'Année académique'
    ]
    
    csvContent += headers.join(',') + '\n'

    // Add student data
    students.forEach(student => {
      const dateNaissance = student.getDateNaissance() 
        ? new Date(student.getDateNaissance()).toLocaleDateString('fr-FR')
        : ''
      
      const age = student.getDateNaissance() 
        ? Math.floor((new Date().getTime() - new Date(student.getDateNaissance()).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : ''

      const row = [
        `"${student.getFirstname()}"`,
        `"${student.getLastname()}"`,
        `"${student.getNumeroEtudiant().getValue()}"`,
        `"${student.getEmail().getValue()}"`,
        `"${dateNaissance}"`,
        age,
        `"${student.getStatus() || 'active'}"`,
        `"${student.getGeneration() || ''}"`,
        `"${student.getAcademicYear() || ''}"`
      ]
      
      csvContent += row.join(',') + '\n'
    })

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `etudiants_${className}_${timestamp}.csv`

    // Return CSV file
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

    return response

  } catch (error) {
    console.error('Export students API error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
} 