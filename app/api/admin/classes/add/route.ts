import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/infrastructure/middleware/authMiddleware'
import { supabase } from '@/infrastructure/config/supabaseClient'

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { nomClasse, bloc, numclasse, nbreEtudiantMax } = body

    // Validate required fields
    if (!nomClasse || !nomClasse.trim()) {
      return NextResponse.json(
        { error: 'Le nom de la classe est requis' },
        { status: 400 }
      )
    }

    if (nomClasse.length > 50) {
      return NextResponse.json(
        { error: 'Le nom de la classe ne peut pas dépasser 50 caractères' },
        { status: 400 }
      )
    }

    if (!bloc || !bloc.trim()) {
      return NextResponse.json(
        { error: 'Le bloc est requis' },
        { status: 400 }
      )
    }

    if (bloc.length > 10) {
      return NextResponse.json(
        { error: 'Le bloc ne peut pas dépasser 10 caractères' },
        { status: 400 }
      )
    }

    if (numclasse < 1) {
      return NextResponse.json(
        { error: 'Le numéro de classe doit être positif' },
        { status: 400 }
      )
    }

    if (nbreEtudiantMax < 1 || nbreEtudiantMax > 100) {
      return NextResponse.json(
        { error: 'Le nombre maximum d\'étudiants doit être entre 1 et 100' },
        { status: 400 }
      )
    }

    // Check if class already exists
    const { data: existingClass, error: checkError } = await supabase
      .from('classe')
      .select('id')
      .eq('nom_classe', nomClasse.trim())
      .eq('bloc', bloc.trim())
      .eq('numclasse', numclasse)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing class:', checkError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de la classe existante' },
        { status: 500 }
      )
    }

    if (existingClass) {
      return NextResponse.json(
        { error: 'Une classe avec ces paramètres existe déjà' },
        { status: 409 }
      )
    }

    // Get the next available ID
    const { data: maxIdResult, error: maxIdError } = await supabase
      .from('classe')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    let nextId = 1
    if (!maxIdError && maxIdResult) {
      nextId = maxIdResult.id + 1
    }
    
    // Create the class with explicit ID
    const insertData = {
      id: nextId,
      nom_classe: nomClasse.trim(),
      bloc: bloc.trim(),
      numclasse: parseInt(numclasse),
      nbre_etudiant_max: parseInt(nbreEtudiantMax),
      nbre_etudiant_actuel: 0
    }

    const { data: newClass, error: insertError } = await supabase
      .from('classe')
      .insert([insertData])
      .select('id, nom_classe, bloc, numclasse, nbre_etudiant_max, nbre_etudiant_actuel')
      .single()

    if (insertError) {
      console.error('Error creating class:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la classe' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Classe créée avec succès',
        class: newClass
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in admin classes add POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuth(postHandler) 