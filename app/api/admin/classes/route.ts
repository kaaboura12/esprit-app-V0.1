import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/infrastructure/middleware/authMiddleware'
import { supabase } from '@/infrastructure/config/supabaseClient'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Get all classes with student count
    const { data: classes, error } = await supabase
      .from('classe')
      .select(`
        id,
        nom_classe,
        bloc,
        numclasse,
        nbre_etudiant_max,
        nbre_etudiant_actuel
      `)
      .order('nom_classe', { ascending: true })
      .order('numclasse', { ascending: true })

    if (error) {
      console.error('Error fetching classes:', error)
      throw error
    }

    // Get teacher assignments for each class
    const classesWithDetails = await Promise.all(
      classes.map(async (classe) => {
        // Get teacher assignments for this class
        const { data: teacherAssignments, error: assignmentError } = await supabase
          .from('teacher_classe')
          .select(`
            id,
            teacher:teacher_id(id, firstname, lastname, email, departement),
            matiere:matiere_id(id, nommatiere, coefficient)
          `)
          .eq('classe_id', classe.id)

        if (assignmentError) {
          console.error('Error fetching teacher assignments:', assignmentError)
        }

        return {
          id: classe.id,
          nomClasse: classe.nom_classe,
          bloc: classe.bloc,
          numclasse: classe.numclasse,
          nbreEtudiantMax: classe.nbre_etudiant_max || 35,
          nbreEtudiantActuel: classe.nbre_etudiant_actuel || 0,
          teacherAssignments: teacherAssignments || [],
          capacityPercentage: classe.nbre_etudiant_max 
            ? Math.round(((classe.nbre_etudiant_actuel || 0) / classe.nbre_etudiant_max) * 100)
            : 0,
          availableSpots: (classe.nbre_etudiant_max || 35) - (classe.nbre_etudiant_actuel || 0)
        }
      })
    )

    return NextResponse.json({
      classes: classesWithDetails,
      total: classesWithDetails.length,
      statistics: {
        totalClasses: classesWithDetails.length,
        totalStudents: classesWithDetails.reduce((sum, c) => sum + c.nbreEtudiantActuel, 0),
        averageCapacity: classesWithDetails.length > 0 
          ? Math.round(classesWithDetails.reduce((sum, c) => sum + c.capacityPercentage, 0) / classesWithDetails.length)
          : 0,
        fullClasses: classesWithDetails.filter(c => c.capacityPercentage >= 100).length,
        emptyClasses: classesWithDetails.filter(c => c.nbreEtudiantActuel === 0).length
      }
    })
  } catch (error) {
    console.error('Error in admin classes GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(getHandler) 