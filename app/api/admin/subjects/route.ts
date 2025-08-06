import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/infrastructure/middleware/authMiddleware'
import { supabase } from '@/infrastructure/config/supabaseClient'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Get all subjects with teacher assignments and note configurations
    const { data: subjects, error } = await supabase
      .from('matiere')
      .select(`
        id,
        nommatiere,
        coefficient,
        description,
        note_config:note_config(
          id,
          pourcentage_cc,
          pourcentage_tp,
          pourcentage_dv
        )
      `)
      .order('nommatiere', { ascending: true })

    if (error) {
      console.error('Error fetching subjects:', error)
      throw error
    }

    // Get teacher assignments for each subject
    const subjectsWithDetails = await Promise.all(
      subjects.map(async (subject) => {
        // Get teacher assignments for this subject
        const { data: teacherAssignments, error: assignmentError } = await supabase
          .from('teacher_classe')
          .select(`
            id,
            teacher:teacher_id(id, firstname, lastname, email, departement),
            classe:classe_id(id, nom_classe, bloc, numclasse)
          `)
          .eq('matiere_id', subject.id)

        if (assignmentError) {
          console.error('Error fetching teacher assignments:', assignmentError)
        }

        // Count unique teachers and classes for this subject
        const uniqueTeachers = new Set(teacherAssignments?.map(ta => (ta.teacher as any)?.id || 0).filter(id => id > 0) || [])
        const uniqueClasses = new Set(teacherAssignments?.map(ta => (ta.classe as any)?.id || 0).filter(id => id > 0) || [])

        return {
          id: subject.id,
          nommatiere: subject.nommatiere,
          coefficient: subject.coefficient,
          description: subject.description,
          noteConfig: subject.note_config?.[0] || null,
          teacherAssignments: teacherAssignments || [],
          uniqueTeachersCount: uniqueTeachers.size,
          uniqueClassesCount: uniqueClasses.size,
          totalAssignments: teacherAssignments?.length || 0,
          isImportant: subject.coefficient >= 3,
          hasTPComponent: subject.note_config?.[0]?.pourcentage_tp > 0 || subject.nommatiere.toLowerCase().includes('tp') || subject.nommatiere.toLowerCase().includes('pratique')
        }
      })
    )

    // Calculate statistics
    const totalSubjects = subjectsWithDetails.length
    const importantSubjects = subjectsWithDetails.filter(s => s.isImportant).length
    const subjectsWithTP = subjectsWithDetails.filter(s => s.hasTPComponent).length
    const averageCoefficient = subjectsWithDetails.length > 0 
      ? Math.round((subjectsWithDetails.reduce((sum, s) => sum + s.coefficient, 0) / subjectsWithDetails.length) * 10) / 10
      : 0

    const subjectsByCoefficient = subjectsWithDetails.reduce((acc, subject) => {
      const coeff = subject.coefficient
      if (coeff >= 3) acc.high = (acc.high || 0) + 1
      else if (coeff >= 2) acc.medium = (acc.medium || 0) + 1
      else acc.low = (acc.low || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      subjects: subjectsWithDetails,
      total: totalSubjects,
      statistics: {
        totalSubjects,
        importantSubjects,
        subjectsWithTP,
        averageCoefficient,
        subjectsByCoefficient,
        totalAssignments: subjectsWithDetails.reduce((sum, s) => sum + s.totalAssignments, 0)
      }
    })
  } catch (error) {
    console.error('Error in admin subjects GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { nommatiere, description, coefficient, noteConfig } = body

    // Validate required fields
    if (!nommatiere || !nommatiere.trim()) {
      return NextResponse.json(
        { error: 'Le nom de la matière est requis' },
        { status: 400 }
      )
    }

    if (nommatiere.length > 100) {
      return NextResponse.json(
        { error: 'Le nom de la matière ne peut pas dépasser 100 caractères' },
        { status: 400 }
      )
    }

    if (description && description.length > 1000) {
      return NextResponse.json(
        { error: 'La description ne peut pas dépasser 1000 caractères' },
        { status: 400 }
      )
    }

    if (coefficient < 0.1 || coefficient > 10.0) {
      return NextResponse.json(
        { error: 'Le coefficient doit être entre 0.1 et 10.0' },
        { status: 400 }
      )
    }

    // Validate note configuration
    if (!noteConfig || !['cc-dv', 'cc-tp-dv'].includes(noteConfig)) {
      return NextResponse.json(
        { error: 'Configuration de notes invalide' },
        { status: 400 }
      )
    }

    // Check if subject already exists
    const { data: existingSubject, error: checkError } = await supabase
      .from('matiere')
      .select('id')
      .eq('nommatiere', nommatiere.trim())
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing subject:', checkError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de la matière existante' },
        { status: 500 }
      )
    }

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Une matière avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    // Get the next available ID
    const { data: maxIdResult, error: maxIdError } = await supabase
      .from('matiere')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    let nextId = 1
    if (!maxIdError && maxIdResult) {
      nextId = maxIdResult.id + 1
    }
    
    // Create the subject with explicit ID
    const insertData = {
      id: nextId,
      nommatiere: nommatiere.trim(),
      description: description?.trim() || null,
      coefficient: parseFloat(coefficient)
    }

    const { data: newSubject, error: insertError } = await supabase
      .from('matiere')
      .insert([insertData])
      .select('id, nommatiere, coefficient, description')
      .single()

    if (insertError) {
      console.error('Error creating subject:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la matière' },
        { status: 500 }
      )
    }

    // Get the next available ID for note_config
    const { data: maxNoteConfigIdResult, error: maxNoteConfigIdError } = await supabase
      .from('note_config')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    let nextNoteConfigId = 1
    if (!maxNoteConfigIdError && maxNoteConfigIdResult) {
      nextNoteConfigId = maxNoteConfigIdResult.id + 1
    }

    // Create note configuration based on selection
    let noteConfigData
    if (noteConfig === 'cc-dv') {
      noteConfigData = {
        id: nextNoteConfigId,
        matiere_id: newSubject.id,
        pourcentage_cc: 40.00,
        pourcentage_tp: 0.00,
        pourcentage_dv: 60.00
      }
    } else if (noteConfig === 'cc-tp-dv') {
      noteConfigData = {
        id: nextNoteConfigId,
        matiere_id: newSubject.id,
        pourcentage_cc: 20.00,
        pourcentage_tp: 30.00,
        pourcentage_dv: 50.00
      }
    }

    // Insert note configuration
    const { error: noteConfigError } = await supabase
      .from('note_config')
      .insert([noteConfigData])

    if (noteConfigError) {
      console.error('Error creating note configuration:', noteConfigError)
      // Note: We don't fail here as the subject was created successfully
      // The note config can be added later if needed
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Matière créée avec succès',
        subject: newSubject
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in admin subjects POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(getHandler)
export const POST = withAdminAuth(postHandler) 