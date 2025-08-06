"use client"

import { useState } from 'react'
import { useAdminClasses } from '@/presentation/hooks/useAdminClasses'
import { RoleGuard } from '@/presentation/components/SideNavLayout'
import { AddClassModalAdmin, AddClassFormData } from '@/presentation/components/AddClassModalAdmin'
import { 
  BookOpen, 
  Users, 
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
  AlertTriangle
} from 'lucide-react'

export default function GestionClassesPage() {
  const { classes, statistics, loading, error, refreshClasses } = useAdminClasses()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [showClassDetails, setShowClassDetails] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [addClassError, setAddClassError] = useState<string | null>(null)
  const [addClassSuccess, setAddClassSuccess] = useState<string | null>(null)

  // Filter classes based on search
  const filteredClasses = classes.filter(classe => {
    const matchesSearch = classe.nomClasse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classe.bloc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classe.numclasse.toString().includes(searchTerm)
    return matchesSearch
  })

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100 text-red-700 border-red-200'
    if (percentage >= 80) return 'bg-orange-100 text-orange-700 border-orange-200'
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const getCapacityIcon = (percentage: number) => {
    if (percentage >= 100) return <XCircle className="w-4 h-4" />
    if (percentage >= 80) return <AlertTriangle className="w-4 h-4" />
    if (percentage >= 50) return <Clock className="w-4 h-4" />
    return <CheckCircle2 className="w-4 h-4" />
  }

  const getCapacityStatus = (percentage: number) => {
    if (percentage >= 100) return 'Complet'
    if (percentage >= 80) return 'Presque complet'
    if (percentage >= 50) return 'Moyen'
    return 'Disponible'
  }

  const handleClassClick = (classe: any) => {
    setSelectedClass(classe)
    setShowClassDetails(true)
  }

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  const getFullName = (firstname: string, lastname: string) => {
    return `${firstname} ${lastname}`
  }

  const handleAddClass = async (classData: AddClassFormData) => {
    setIsAddingClass(true)
    setAddClassError(null)
    setAddClassSuccess(null)
    
    try {
      const response = await fetch('/api/admin/classes/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(classData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la classe')
      }

      const result = await response.json()
      console.log('Classe créée avec succès:', result)
      
      // Show success message
      setAddClassSuccess(`Classe ${classData.nomClasse} créée avec succès!`)
      
      // Refresh the classes list
      await refreshClasses()
      setShowAddModal(false)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setAddClassSuccess(null), 3000)
    } catch (error) {
      console.error('Erreur lors de la création de la classe:', error)
      setAddClassError(error instanceof Error ? error.message : 'Erreur lors de la création de la classe')
      throw error
    } finally {
      setIsAddingClass(false)
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
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Classes</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Gérez toutes les classes de l'institution
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter Classe
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
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics?.totalClasses || 0}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Total Classes</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+3</span>
                <span className="text-gray-500 ml-1">ce mois</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics?.totalStudents || 0}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Total Étudiants</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">Inscrits</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics?.averageCapacity || 0}%</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Capacité Moyenne</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">Toutes classes</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics?.fullClasses || 0}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Classes Complètes</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-red-600 font-medium">100% capacité</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg mb-6">
            <div className="flex items-center w-full">
              <Search className="absolute left-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all w-full"
              />
            </div>
          </div>

          {/* Classes List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Liste des Classes
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">{filteredClasses.length} classe(s)</span>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Erreur lors du chargement</p>
                  <p className="text-gray-500 text-sm mt-1">{error}</p>
                  <button 
                    onClick={refreshClasses}
                    className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucune classe trouvée</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {classes.length === 0 
                      ? "Aucune classe n'est enregistrée"
                      : "Aucune classe ne correspond à vos critères de recherche"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredClasses.map((classe) => (
                    <div
                      key={classe.id}
                      onClick={() => handleClassClick(classe)}
                      className="p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {classe.nomClasse.charAt(0)}{classe.numclasse}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            classe.capacityPercentage >= 100 ? 'bg-red-500' :
                            classe.capacityPercentage >= 80 ? 'bg-orange-500' :
                            classe.capacityPercentage >= 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-black transition-colors">
                            {classe.nomClasse} - {classe.numclasse}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">Bloc {classe.bloc}</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getCapacityColor(classe.capacityPercentage)}`}>
                            {getCapacityIcon(classe.capacityPercentage)}
                            <span className="ml-1">{getCapacityStatus(classe.capacityPercentage)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Étudiants</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {classe.nbreEtudiantActuel}/{classe.nbreEtudiantMax}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Target className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Places libres</span>
                          </div>
                          <span className="font-medium text-gray-900">{classe.availableSpots}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Enseignants</span>
                          </div>
                          <span className="font-medium text-gray-900">{classe.teacherAssignments.length}</span>
                        </div>
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

      {/* Class Details Modal */}
      {showClassDetails && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {selectedClass.nomClasse.charAt(0)}{selectedClass.numclasse}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedClass.nomClasse} - {selectedClass.numclasse}</h2>
                    <p className="text-gray-600">Bloc {selectedClass.bloc}</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getCapacityColor(selectedClass.capacityPercentage)}`}>
                      {getCapacityIcon(selectedClass.capacityPercentage)}
                      <span className="ml-2">{getCapacityStatus(selectedClass.capacityPercentage)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowClassDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Class Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Étudiants</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedClass.nbreEtudiantActuel}/{selectedClass.nbreEtudiantMax}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedClass.capacityPercentage}% de capacité
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Places libres</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedClass.availableSpots}
                  </div>
                  <div className="text-sm text-gray-500">
                    places disponibles
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Enseignants</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedClass.teacherAssignments.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    assignations
                  </div>
                </div>
              </div>

              {/* Teacher Assignments */}
              {selectedClass.teacherAssignments.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enseignants assignés</h3>
                  <div className="space-y-3">
                    {selectedClass.teacherAssignments.map((assignment: any) => (
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
                          <div className="font-medium text-gray-900">{assignment.matiere.nommatiere}</div>
                          <div className="text-sm text-gray-500">Coeff. {assignment.matiere.coefficient}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucun enseignant assigné</p>
                  <p className="text-gray-400 text-sm mt-1">Cette classe n'a pas encore d'enseignants assignés</p>
                </div>
              )}
              
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowClassDetails(false)}
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

      {/* Add Class Modal */}
      {showAddModal && (
        <AddClassModalAdmin
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setAddClassError(null)
            setAddClassSuccess(null)
          }}
          onSubmit={handleAddClass}
          isLoading={isAddingClass}
        />
      )}

      {/* Error Message Toast */}
      {addClassError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium">Erreur</span>
          </div>
          <p className="text-sm mt-1">{addClassError}</p>
          <button
            onClick={() => setAddClassError(null)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Message Toast */}
      {addClassSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Succès</span>
          </div>
          <p className="text-sm mt-1">{addClassSuccess}</p>
          <button
            onClick={() => setAddClassSuccess(null)}
            className="absolute top-2 right-2 text-green-400 hover:text-green-600"
          >
            ✕
          </button>
        </div>
      )}
    </RoleGuard>
  )
} 