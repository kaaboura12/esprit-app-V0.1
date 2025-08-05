import { NextRequest, NextResponse } from 'next/server'
import { GetStudentNotesUseCase } from '@/application/use-cases/GetStudentNotesUseCase'
import { MySQLNotesRepository } from '@/infrastructure/repositories/MySQLNotesRepository'
import { GetStudentNotesRequestDTO } from '@/application/dtos/NoteDTO'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

/**
 * GET /api/notes/export?matiereId=1&classeId=2&format=excel
 * Exports student notes for a specific subject and class
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
    const matiereIdParam = searchParams.get('matiereId')
    const classeIdParam = searchParams.get('classeId')
    const format = searchParams.get('format') || 'csv'

    if (!matiereIdParam || !classeIdParam) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subject ID and Class ID are required' 
      }, { status: 400 })
    }

    const matiereId = parseInt(matiereIdParam)
    const classeId = parseInt(classeIdParam)

    if (isNaN(matiereId) || isNaN(classeId) || matiereId <= 0 || classeId <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Subject ID or Class ID' 
      }, { status: 400 })
    }

    // Create request DTO
    const requestDTO: GetStudentNotesRequestDTO = {
      matiereId,
      classeId
    }

    // Get student notes
    const notesRepository = new MySQLNotesRepository()
    const getStudentNotesUseCase = new GetStudentNotesUseCase(notesRepository)
    
    const result = await getStudentNotesUseCase.execute(requestDTO)
    
    if (!result.success || !result.data) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to fetch notes data' 
      }, { status: 400 })
    }

    const { students, subject, className } = result.data
    const hasTPComponent = subject.noteConfig?.hasTPComponent || false

    // Generate CSV content
    let csvContent = ''
    
    // Headers
    const headers = ['Prénom', 'Nom', 'Numéro étudiant', 'Email', 'Note CC']
    if (hasTPComponent) {
      headers.push('Note TP')
    }
    headers.push('Note DV', 'Note Finale', 'Statut')
    
    csvContent += headers.join(',') + '\n'

    // Add student data
    students.forEach(student => {
      const note = student.note
      const noteCC = note && note.noteCC !== null ? note.noteCC : ''
      const noteTP = hasTPComponent ? (note && note.noteTP !== null ? note.noteTP : '') : ''
      const noteDV = note && note.noteDV !== null ? note.noteDV : ''
      const noteFinale = note && note.noteFinale !== null ? note.noteFinale : ''
      
      // Determine status
      let status = 'Non noté'
      if (noteFinale !== '') {
        const finalGrade = parseFloat(noteFinale.toString())
        if (finalGrade >= 16) status = 'Excellent'
        else if (finalGrade >= 12) status = 'Bien'
        else if (finalGrade >= 10) status = 'Passable'
        else status = 'Insuffisant'
      }

      const row = [
        `"${student.studentFirstname}"`,
        `"${student.studentLastname}"`,
        `"${student.studentNumero}"`,
        `"${student.studentEmail}"`,
        noteCC
      ]
      
      if (hasTPComponent) {
        row.push(noteTP)
      }
      
      row.push(noteDV, noteFinale, `"${status}"`)
      
      csvContent += row.join(',') + '\n'
    })

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `notes_${subject.nommatiere}_${className}_${timestamp}.csv`

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
    console.error('Export notes API error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
} 