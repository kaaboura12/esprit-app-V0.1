import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'
import { MySQLNotesRepository } from '@/infrastructure/repositories/MySQLNotesRepository'

/**
 * GET /api/notes/import-excel/template?matiereId=1&classeId=2&includeExistingNotes=false&includeStudentEmails=true
 * Downloads a CSV template for notes import
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const matiereIdParam = searchParams.get('matiereId')
    const classeIdParam = searchParams.get('classeId')
    const includeExistingNotes = searchParams.get('includeExistingNotes') === 'true'
    const includeStudentEmails = searchParams.get('includeStudentEmails') === 'true'

    if (!matiereIdParam || !classeIdParam) {
      return NextResponse.json({ error: 'Subject ID and Class ID are required' }, { status: 400 })
    }

    const matiereId = parseInt(matiereIdParam)
    const classeId = parseInt(classeIdParam)

    if (isNaN(matiereId) || isNaN(classeId) || matiereId <= 0 || classeId <= 0) {
      return NextResponse.json({ error: 'Invalid Subject ID or Class ID' }, { status: 400 })
    }

    // Get students for this class
    const notesRepository = new MySQLNotesRepository()
    const students = await notesRepository.findStudentsByClass(classeId)
    
    if (!students || students.length === 0) {
      return NextResponse.json({ error: 'No students found for this class' }, { status: 404 })
    }

    // Get subject info
    const subject = await notesRepository.findSubjectById(matiereId)
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Get note configuration to determine if TP is required
    const noteConfig = await notesRepository.findNoteConfigBySubject(matiereId)
    const hasTPComponent = noteConfig?.hasTPComponent() || false

    // Get existing notes if requested
    const existingNotes = includeExistingNotes ? await notesRepository.findNotesBySubjectAndClass(matiereId, classeId) : []

    // Create CSV content
    let csvContent = 'prenom,nom,numeroetudiant'
    
    // Add note columns
    csvContent += ',noteCC'
    if (hasTPComponent) {
      csvContent += ',noteTP'
    }
    csvContent += ',noteDV'
    
    if (includeStudentEmails) {
      csvContent += ',email'
    }
    
    csvContent += '\n'

    // Add student data
    for (const student of students) {
      const existingNote = existingNotes.find(note => note.getEtudiantId() === student.getId())
      
      // Student info
      csvContent += `"${student.getFirstname()}","${student.getLastname()}","${student.getNumeroEtudiant().getValue()}"`
      
      // Notes
      if (includeExistingNotes && existingNote) {
        csvContent += `,${existingNote.getNoteCC() || ''}`
        if (hasTPComponent) {
          csvContent += `,${existingNote.getNoteTP() || ''}`
        }
        csvContent += `,${existingNote.getNoteDV() || ''}`
      } else {
        csvContent += ','
        if (hasTPComponent) {
          csvContent += ','
        }
        csvContent += ','
      }
      
      // Email
      if (includeStudentEmails) {
        csvContent += `,"${student.getEmail().getValue()}"`
      }
      
      csvContent += '\n'
    }

    // Create response with CSV content
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="notes_template_${subject.getNommatiere()}_${classeId}.csv"`,
      },
    })

    return response

  } catch (error) {
    console.error('Template download API error:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
} 