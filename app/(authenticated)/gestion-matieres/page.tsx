"use client"

import { useState } from 'react'
import { useAdminSubjects } from '@/presentation/hooks/useAdminSubjects'
import { RoleGuard } from '@/presentation/components/SideNavLayout'
import { AddSubjectModal, AddSubjectFormData } from '@/presentation/components/AddSubjectModal'
import { 
  BookOpen, 
  Search, 
  TrendingUp,
  Award,
  Target,
  BarChart3,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle,
  Star,
  FileText,
  Calculator,
  PieChart,
  Activity,
  Mail,
  Calendar,
  MapPin,
  User,
  Briefcase,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Building,
  Users2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  BookMarked,
  Layers
} from 'lucide-react'

export default function GestionMatieresPage() {
  const { subjects, statistics, loading, error, refreshSubjects } = useAdminSubjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [showSubjectDetails, setShowSubjectDetails] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [addSubjectError, setAddSubjectError] = useState<string | null>(null)
  const [addSubjectSuccess, setAddSubjectSuccess] = useState<string | null>(null)

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.nommatiere.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getCoefficientColor = (coefficient: number) => {
    if (coefficient >= 3) return 'bg-red-100 text-red-700 border-red-200'
    if (coefficient >= 2) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const getCoefficientIcon = (coefficient: number) => {
    if (coefficient >= 3) return <Star className="w-4 h-4" />
    if (coefficient >= 2) return <Award className="w-4 h-4" />
    return <CheckCircle2 className="w-4 h-4" />
  }

  const getCoefficientStatus = (coefficient: number) => {
    if (coefficient >= 3) return 'Important'
    if (coefficient >= 2) return 'Moyen'
    return 'Standard'
  }

  const handleSubjectClick = (subject: any) => {
    setSelectedSubject(subject)
    setShowSubjectDetails(true)
  }

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  const getFullName = (firstname: string, lastname: string) => {
    return `${firstname} ${lastname}`
  }

  const handleAddSubject = async (subjectData: AddSubjectFormData) => {
    setIsAddingSubject(true)
    setAddSubjectError(null)
    setAddSubjectSuccess(null)
    
    try {
      const response = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subjectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la matière')
      }

      const result = await response.json()
      console.log('Matière créée avec succès:', result)
      
      // Show success message
      setAddSubjectSuccess(`Matière ${subjectData.nommatiere} créée avec succès!`)
      
      // Refresh the subjects list
      await refreshSubjects()
      setShowAddModal(false)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setAddSubjectSuccess(null), 3000)
    } catch (error) {
      console.error('Erreur lors de la création de la matière:', error)
      setAddSubjectError(error instanceof Error ? error.message : 'Erreur lors de la création de la matière')
      throw error
    } finally {
      setIsAddingSubject(false)
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Matières</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Gérez toutes les matières de l'institution
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Matière
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics?.totalSubjects || 0}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Total Matières</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+2</span>
                <span className="text-gray-500 ml-1">ce mois</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics?.importantSubjects || 0}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Matières Importantes</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-red-600 font-medium">Coeff ≥ 3</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics?.averageCoefficient || 0}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Coefficient Moyen</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">Toutes matières</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics?.subjectsWithTP || 0}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Avec TP</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-blue-600 font-medium">Composant TP</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg mb-6">
            <div className="flex items-center w-full">
              <Search className="absolute left-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all w-full"
              />
            </div>
          </div>

          {/* Subjects List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Liste des Matières
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">{filteredSubjects.length} matière(s)</span>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="min-h-screen bg-gradient-to-br from-[#f3f4f6] via-white to-gray-100 flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#ef4444]" />
                    <span className="text-lg font-medium">Chargement des matières...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Erreur lors du chargement</p>
                  <p className="text-gray-500 text-sm mt-1">{error}</p>
                  <button 
                    onClick={refreshSubjects}
                    className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucune matière trouvée</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {subjects.length === 0 
                      ? "Aucune matière n'est enregistrée"
                      : "Aucune matière ne correspond à vos critères de recherche"
                    }
                  </p>
                  {subjects.length === 0 && (
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une matière
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      onClick={() => handleSubjectClick(subject)}
                      className="p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {subject.nommatiere.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            subject.isImportant ? 'bg-red-500' :
                            subject.coefficient >= 2 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-black transition-colors">
                            {subject.nommatiere}
                          </h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getCoefficientColor(subject.coefficient)}`}>
                            {getCoefficientIcon(subject.coefficient)}
                            <span className="ml-1">{getCoefficientStatus(subject.coefficient)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calculator className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Coefficient</span>
                          </div>
                          <span className="font-medium text-gray-900">{subject.coefficient}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Enseignants</span>
                          </div>
                          <span className="font-medium text-gray-900">{subject.uniqueTeachersCount}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Building className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Classes</span>
                          </div>
                          <span className="font-medium text-gray-900">{subject.uniqueClassesCount}</span>
                        </div>
                        
                        {subject.hasTPComponent && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <Layers className="w-4 h-4 mr-2 text-gray-400" />
                              <span>Composant TP</span>
                            </div>
                            <span className="font-medium text-blue-600">Oui</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle edit
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle delete
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Details Modal */}
      {showSubjectDetails && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {selectedSubject.nommatiere.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedSubject.nommatiere}</h2>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getCoefficientColor(selectedSubject.coefficient)}`}>
                      {getCoefficientIcon(selectedSubject.coefficient)}
                      <span className="ml-2">{getCoefficientStatus(selectedSubject.coefficient)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubjectDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Subject Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Coefficient</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedSubject.coefficient}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedSubject.isImportant ? 'Matière importante' : 'Matière standard'}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Enseignants</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedSubject.uniqueTeachersCount}
                  </div>
                  <div className="text-sm text-gray-500">
                    enseignants assignés
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Classes</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedSubject.uniqueClassesCount}
                  </div>
                  <div className="text-sm text-gray-500">
                    classes concernées
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Layers className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Composant TP</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedSubject.hasTPComponent ? 'Oui' : 'Non'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedSubject.hasTPComponent ? 'Avec travaux pratiques' : 'Sans TP'}
                  </div>
                </div>
              </div>

              {/* Teacher Assignments */}
              {selectedSubject.teacherAssignments.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignations Enseignants-Classes</h3>
                  <div className="space-y-3">
                    {selectedSubject.teacherAssignments.map((assignment: any) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(assignment.teacher.firstname, assignment.teacher.lastname)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {getFullName(assignment.teacher.firstname, assignment.teacher.lastname)}
                            </div>
                            <div className="text-sm text-gray-500">{assignment.teacher.email}</div>
                            <div className="text-xs text-gray-400">{assignment.teacher.departement}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{assignment.classe.nom_classe} - {assignment.classe.numclasse}</div>
                          <div className="text-sm text-gray-500">Bloc {assignment.classe.bloc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucune assignation</p>
                  <p className="text-gray-400 text-sm mt-1">Cette matière n'a pas encore d'enseignants assignés</p>
                </div>
              )}
              
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowSubjectDetails(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Fermer
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <AddSubjectModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setAddSubjectError(null)
            setAddSubjectSuccess(null)
          }}
          onSubmit={handleAddSubject}
          isLoading={isAddingSubject}
        />
      )}

      {/* Error Message Toast */}
      {addSubjectError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium">Erreur</span>
          </div>
          <p className="text-sm mt-1">{addSubjectError}</p>
          <button
            onClick={() => setAddSubjectError(null)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Message Toast */}
      {addSubjectSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Succès</span>
          </div>
          <p className="text-sm mt-1">{addSubjectSuccess}</p>
          <button
            onClick={() => setAddSubjectSuccess(null)}
            className="absolute top-2 right-2 text-green-400 hover:text-green-600"
          >
            ✕
          </button>
        </div>
      )}
    </RoleGuard>
  )
} 