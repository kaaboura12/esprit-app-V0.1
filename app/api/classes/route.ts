import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/infrastructure/config/supabaseClient'
import { getTokenFromCookies } from '@/infrastructure/middleware/authMiddleware'
import { JwtTokenServiceSingleton } from '@/infrastructure/services/JwtTokenServiceSingleton'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('classe')
      .select('id, nom_classe, bloc, numclasse')
      .order('nom_classe')

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    
    // Validate required fields
    if (!body.className || !body.bloc || !body.subjectId) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Find the class by name and bloc
    const { data: classeData, error: classeError } = await supabase
      .from('classe')
      .select('id')
      .eq('nom_classe', body.className)
      .eq('bloc', body.bloc)
      .maybeSingle()

    if (classeError) {
      console.error('Error finding class:', classeError)
      return NextResponse.json(
        { error: 'Erreur lors de la recherche de la classe' },
        { status: 500 }
      )
    }

    if (!classeData) {
      return NextResponse.json(
        { error: 'Classe non trouvée' },
        { status: 404 }
      )
    }

    // Check if this teacher-class-subject assignment already exists
    const { data: existingAssignment, error: checkError } = await supabase
      .from('teacher_classe')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('classe_id', classeData.id)
      .eq('matiere_id', body.subjectId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing assignment:', checkError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de l\'assignation existante' },
        { status: 500 }
      )
    }

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Cette assignation classe-matière existe déjà pour cet enseignant' },
        { status: 409 }
      )
    }

    // Create the teacher-class-subject assignment
    const insertData = {
      teacher_id: teacherId,
      classe_id: classeData.id,
      matiere_id: body.subjectId
    }
    
    console.log('Inserting teacher class assignment:', insertData)
    
    // Try to get the next available ID first
    const { data: maxIdResult, error: maxIdError } = await supabase
      .from('teacher_classe')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    let nextId = 1
    if (!maxIdError && maxIdResult) {
      nextId = maxIdResult.id + 1
    }
    
    console.log('Next available ID:', nextId)
    
    const { data: newAssignment, error: insertError } = await supabase
      .from('teacher_classe')
      .insert({
        id: nextId,
        ...insertData
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating teacher class assignment:', insertError)
      
      // If it's a duplicate key error, provide a more specific message
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Cette assignation classe-matière existe déjà pour cet enseignant' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'assignation' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Classe ajoutée avec succès',
        assignment: newAssignment
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in POST /api/classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 