"use client"

import { useState } from 'react'
import { useTeacherClasses } from '@/presentation/hooks/useTeacherClasses'
import { Users, BookOpen, User, Search, Loader2, AlertCircle, ChevronRight, Edit3 } from 'lucide-react'
import Link from 'next/link'
import { AddClassModal, AddClassFormData } from '@/presentation/components/AddClassModal'

export default function GestionClassroomPage() {
  const { classes, loading: classesLoading, error: classesError, refreshClasses } = useTeacherClasses()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [isAddingClass, setIsAddingClass] = useState(false)

  // Filter classes based on search
  const filteredClasses = classes.filter(classe => {
    const matchesSearch = classe.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classe.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      'vous'.includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Statistic calculations
  const totalClasses = classes.length
  const totalStudents = classes.reduce((sum, c) => sum + c.currentStudents, 0)
  const averageCapacity = classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + c.capacityPercentage, 0) / classes.length) : 0
  const nearlyFullClasses = classes.filter(c => c.capacityPercentage >= 90).length

  // Color palette
  const red = 'bg-[#ef4444]'
  const redText = 'text-[#ef4444]'
  const black = 'bg-black'
  const blackText = 'text-black'
  const grayBg = 'bg-[#f3f4f6]'
  const grayBorder = 'border-[#e5e7eb]'
  const grayText = 'text-[#374151]'

  const handleAddClass = async (data: AddClassFormData) => {
    setIsAddingClass(true)
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          className: data.className,
          bloc: data.bloc,
          subjectId: data.subjectId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'ajout de la classe')
      }

      const result = await response.json()
      console.log('Classe ajoutée avec succès:', result)
      
      // After adding, refresh the class list
      refreshClasses()
      setShowAddClassModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la classe:', error)
      throw error
    } finally {
      setIsAddingClass(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#f3f4f6] via-white to-gray-100">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-[#e5e7eb] sticky top-0 z-40">
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-black">Gestion des Classes</h1>
                  <p className="text-[#6b7280] mt-1 text-sm sm:text-base">Visualisez et gérez vos classes de façon moderne</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddClassModal(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#ef4444] text-white rounded-xl font-semibold hover:bg-[#dc2626] transition-colors shadow-md mt-2 md:mt-0 w-full md:w-auto justify-center"
              >
                <span className="text-lg font-bold">+</span>
                Ajouter une classe
              </button>
            </div>
            <div className="relative w-full max-w-full sm:max-w-md mt-2 md:mt-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ef4444] w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une classe, matière ou enseignant..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Statistic Cards */}
        <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e7eb] shadow flex flex-col items-start">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{totalClasses}</span>
            </div>
            <span className="text-[#374151] text-xs sm:text-sm">Total classes</span>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e7eb] shadow flex flex-col items-start">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{totalStudents}</span>
            </div>
            <span className="text-[#374151] text-xs sm:text-sm">Total étudiants</span>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e7eb] shadow flex flex-col items-start">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-white font-bold text-lg">%</div>
              </div>
              <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{averageCapacity}%</span>
            </div>
            <span className="text-[#374151] text-xs sm:text-sm">Capacité moyenne</span>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e5e7eb] shadow flex flex-col items-start">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{nearlyFullClasses}</span>
            </div>
            <span className="text-[#374151] text-xs sm:text-sm">Classes presque pleines</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10">
          {classesLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-[#ef4444]" />
            </div>
          ) : classesError ? (
            <div className="flex flex-col items-center justify-center py-24">
              <AlertCircle className="w-12 h-12 text-[#ef4444] mb-4" />
              <p className="text-[#ef4444] font-semibold text-lg">Erreur lors du chargement</p>
              <button
                onClick={refreshClasses}
                className="mt-4 px-6 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium"
              >
                Réessayer
              </button>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <BookOpen className="w-16 h-16 text-[#e5e7eb] mb-4" />
              <p className="text-[#6b7280] font-medium text-lg">Aucune classe trouvée</p>
              <p className="text-[#9ca3af] text-sm mt-1">Essayez de modifier votre recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map(classe => (
                <div
                  key={classe.id}
                  className="group relative bg-white border-2 border-[#e5e7eb] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 flex flex-col"
                >
                  {/* Bloc Red Circle */}
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ef4444] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg border-4 border-white">
                      {classe.bloc}
                    </div>
                  </div>
                  {/* Class Name & Subject */}
                  <div className="flex items-center mb-3 sm:mb-4 gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-[#ef4444] text-white font-bold text-xs shadow-lg">
                      {classe.className}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-[#ef4444]" />
                        <span className="text-xs sm:text-sm text-[#374151] truncate">{classe.subjectName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher */}
                  <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#ef4444]" />
                    <span className="text-xs sm:text-sm text-[#374151] font-medium truncate">Vous</span>
                  </div>

                  {/* Students & Progress */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#ef4444]" />
                    <span className="text-xs sm:text-sm text-[#374151]">{classe.currentStudents} / {classe.maxStudents} étudiants</span>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-2 mb-3 sm:mb-4">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${classe.capacityPercentage}%`,
                        background: classe.capacityPercentage >= 90
                          ? '#ef4444'
                          : classe.capacityPercentage >= 70
                          ? '#f59e42'
                          : '#22c55e'
                      }}
                    ></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
                    <Link
                      href={`/gestion-etudiants?classeId=${classe.classeId}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#ef4444] text-white rounded-xl font-semibold hover:bg-[#dc2626] transition-colors shadow-md w-full"
                    >
                      <Users className="w-4 h-4" />
                      Voir étudiants
                    </Link>
                    <Link
                      href={`/gestion-notes/${classe.matiereId}/${classe.classeId}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-semibold hover:bg-[#374151] transition-colors shadow-md w-full"
                    >
                      <Edit3 className="w-4 h-4" />
                      Notes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AddClassModal
        isOpen={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        onSubmit={handleAddClass}
        isLoading={isAddingClass}
      />
    </>
  )
} 