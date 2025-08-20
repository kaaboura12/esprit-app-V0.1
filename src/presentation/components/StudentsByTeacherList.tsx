import React from 'react'
import { useStudentsByTeacher } from '../hooks/useStudentsByTeacher'
import { Loader2, Users, BookOpen, GraduationCap } from 'lucide-react'

interface StudentsByTeacherListProps {
  teacherId: number
}

export function StudentsByTeacherList({ teacherId }: StudentsByTeacherListProps) {
  const { students, total, loading, error, refetch } = useStudentsByTeacher(teacherId)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des étudiants...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-700">
          <span className="text-sm">Erreur: {error}</span>
        </div>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Aucun étudiant trouvé pour ce professeur</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Étudiants ({total})
        </h3>
        <button
          onClick={refetch}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
        >
          Actualiser
        </button>
      </div>

      <div className="grid gap-4">
        {students.map((student) => (
          <div
            key={`${student.student_id}-${student.matiere_id}`}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {student.firstname.charAt(0)}{student.lastname.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {student.firstname} {student.lastname}
                    </h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Numéro:</span>
                    <span className="font-medium">{student.numero_etudiant}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Date de naissance:</span>
                    <span className="font-medium">{new Date(student.date_naissance).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">{student.nom_classe}</span>
                  <span className="text-xs text-gray-500">({student.bloc} - {student.numclasse})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{student.subject_name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
