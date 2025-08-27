"use client"

import { useState, useEffect } from 'react'
import { RoleGuard } from '@/presentation/components/SideNavLayout'
import { AddTeacherModal, AddTeacherFormData } from '@/presentation/components/AddTeacherModal'
import { useAuth } from '@/presentation/hooks/useAuth'
import { 
  Users, 
  Search, 
  Shield, 
  User, 
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Briefcase,
  Calendar,
  TrendingUp,
  Star,
  Award,
  Clock,
  MapPin,
  ArrowLeft,
  Crown,
  UserCheck,
  Plus,
  MoreVertical,
  Eye,
  Trash2
} from 'lucide-react'

interface Teacher {
  id: number
  firstname: string
  lastname: string
  email: string
  departement: string
  role: string
  photoUrl?: string
  lastLogin?: string
  isActive: boolean
}

export default function GestionTeachersPage() {
  const { isAdmin } = useAuth()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTeacher, setEditingTeacher] = useState<number | null>(null)
  const [updatingRole, setUpdatingRole] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isAddingTeacher, setIsAddingTeacher] = useState(false)
  const [addTeacherError, setAddTeacherError] = useState<string | null>(null)
  const [addTeacherSuccess, setAddTeacherSuccess] = useState<string | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [showTeacherDetails, setShowTeacherDetails] = useState(false)

  // Load teachers on component mount
  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/teachers', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to load teachers')
      }

      const data = await response.json()
      setTeachers(data.teachers || [])
    } catch (error) {
      console.error('Error loading teachers:', error)
      setError(error instanceof Error ? error.message : 'Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (teacherId: number, newRole: 'teacher' | 'admin') => {
    try {
      setUpdatingRole(teacherId)
      
      const response = await fetch('/api/teachers/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          teacherId,
          role: newRole
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update role')
      }

      const result = await response.json()
      
      // Update local state
      setTeachers(prev => prev.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, role: newRole }
          : teacher
      ))

      setSuccessMessage(result.message || 'Role updated successfully')
      setEditingTeacher(null)
      
      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error updating role:', error)
      alert(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setUpdatingRole(null)
    }
  }

  const handleAddTeacher = async (teacherData: AddTeacherFormData) => {
    setIsAddingTeacher(true)
    setAddTeacherError(null)
    setAddTeacherSuccess(null)
    
    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(teacherData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de l\'enseignant')
      }

      const result = await response.json()
      console.log('Enseignant créé avec succès:', result)
      
      // Show success message
      setAddTeacherSuccess(`Enseignant ${teacherData.firstname} ${teacherData.lastname} créé avec succès!`)
      
      // Refresh the teachers list
      await loadTeachers()
      setShowAddModal(false)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setAddTeacherSuccess(null), 3000)
    } catch (error) {
      console.error('Erreur lors de la création de l\'enseignant:', error)
      setAddTeacherError(error instanceof Error ? error.message : 'Erreur lors de la création de l\'enseignant')
      throw error
    } finally {
      setIsAddingTeacher(false)
    }
  }

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.departement.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Calculate statistics
  const totalTeachers = teachers.length
  const adminTeachers = teachers.filter(t => t.role === 'admin').length
  const regularTeachers = teachers.filter(t => t.role === 'teacher').length
  const activeTeachers = teachers.filter(t => t.isActive).length

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  const getFullName = (firstname: string, lastname: string) => {
    return `${firstname} ${lastname}`
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />
  }

  const handleTeacherClick = (teacher: any) => {
    setSelectedTeacher(teacher)
    setShowTeacherDetails(true)
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
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Enseignants</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Gérez les rôles et permissions des enseignants
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
                                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel Enseignant
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
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{totalTeachers}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Total Enseignants</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+2</span>
                <span className="text-gray-500 ml-1">ce mois</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{adminTeachers}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Administrateurs</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">
                  {totalTeachers > 0 ? Math.round((adminTeachers / totalTeachers) * 100) : 0}% du total
                </span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{regularTeachers}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Enseignants</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-blue-600 font-medium">Actifs</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{activeTeachers}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Actifs</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">en ligne</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg mb-6">
            <div className="flex items-center w-full">
              <Search className="absolute left-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un enseignant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all w-full"
              />
            </div>
          </div>

          {/* Teachers List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Liste des Enseignants
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">{filteredTeachers.length} enseignant(s)</span>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="min-h-screen bg-gradient-to-br from-[#f3f4f6] via-white to-gray-100 flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#ef4444]" />
                    <span className="text-lg font-medium">Chargement des enseignants...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Erreur lors du chargement</p>
                  <p className="text-gray-500 text-sm mt-1">{error}</p>
                  <button 
                    onClick={loadTeachers}
                    className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucun enseignant trouvé</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {teachers.length === 0 
                      ? "Aucun enseignant n'est enregistré"
                      : "Aucun enseignant ne correspond à vos critères de recherche"
                    }
                  </p>
                  {teachers.length === 0 && (
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un enseignant
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      onClick={() => handleTeacherClick(teacher)}
                      className="p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                            {teacher.photoUrl ? (
                              <img
                                src={teacher.photoUrl}
                                alt={getFullName(teacher.firstname, teacher.lastname)}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              getInitials(teacher.firstname, teacher.lastname)
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            teacher.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-black transition-colors">
                            {getFullName(teacher.firstname, teacher.lastname)}
                          </h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getRoleColor(teacher.role)}`}>
                            {getRoleIcon(teacher.role)}
                            <span className="ml-1 capitalize">{teacher.role}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{teacher.departement}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingTeacher(teacher.id)
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          disabled={updatingRole === teacher.id}
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

      {/* Teacher Details Modal */}
      {showTeacherDetails && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                    {selectedTeacher.photoUrl ? (
                      <img
                        src={selectedTeacher.photoUrl}
                        alt={getFullName(selectedTeacher.firstname, selectedTeacher.lastname)}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      getInitials(selectedTeacher.firstname, selectedTeacher.lastname)
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{getFullName(selectedTeacher.firstname, selectedTeacher.lastname)}</h2>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getRoleColor(selectedTeacher.role)}`}>
                      {getRoleIcon(selectedTeacher.role)}
                      <span className="ml-2 capitalize">{selectedTeacher.role}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTeacherDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedTeacher.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span>{selectedTeacher.departement}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${
                    selectedTeacher.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      selectedTeacher.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="capitalize">{selectedTeacher.isActive ? 'Actif' : 'Inactif'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getRoleColor(selectedTeacher.role)}`}>
                    {getRoleIcon(selectedTeacher.role)}
                    <span className="ml-2 capitalize">{selectedTeacher.role}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowTeacherDetails(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Fermer
                </button>
                <button 
                  onClick={() => {
                    setShowTeacherDetails(false)
                    setEditingTeacher(selectedTeacher.id)
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier le rôle
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

      {/* Role Edit Modal */}
      {editingTeacher !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Modifier le rôle</h2>
                <button
                  onClick={() => setEditingTeacher(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle de l'enseignant
                </label>
                <select
                  value={teachers.find(t => t.id === editingTeacher)?.role || 'teacher'}
                  onChange={(e) => handleUpdateRole(editingTeacher, e.target.value as 'teacher' | 'admin')}
                  disabled={updatingRole === editingTeacher}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="teacher">Enseignant</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={updatingRole === editingTeacher}
                >
                  Annuler
                </button>
                {updatingRole === editingTeacher && (
                  <div className="flex items-center px-4 py-2 text-gray-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Succès</span>
          </div>
          <p className="text-sm mt-1">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="absolute top-2 right-2 text-green-400 hover:text-green-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add Teacher Error Message Toast */}
      {addTeacherError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium">Erreur</span>
          </div>
          <p className="text-sm mt-1">{addTeacherError}</p>
          <button
            onClick={() => setAddTeacherError(null)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add Teacher Success Message Toast */}
      {addTeacherSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Succès</span>
          </div>
          <p className="text-sm mt-1">{addTeacherSuccess}</p>
          <button
            onClick={() => setAddTeacherSuccess(null)}
            className="absolute top-2 right-2 text-green-400 hover:text-green-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <AddTeacherModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setAddTeacherError(null)
            setAddTeacherSuccess(null)
          }}
          onSubmit={handleAddTeacher}
          isLoading={isAddingTeacher}
        />
      )}
    </RoleGuard>
  )
} 