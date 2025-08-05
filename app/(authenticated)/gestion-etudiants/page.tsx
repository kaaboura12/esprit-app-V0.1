"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useStudents } from '@/presentation/hooks/useStudents'
import { useTeacherClasses } from '@/presentation/hooks/useTeacherClasses'
import { AddStudentModal, AddStudentFormData } from '@/presentation/components/AddStudentModal'
import { ExcelImportModal } from '@/presentation/components/ExcelImportModal'
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Download,
  Upload,
  UserPlus,
  Mail,
  Calendar,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  BookOpen,
  Star,
  Award,
  Clock,
  MapPin,
  ArrowLeft
} from 'lucide-react'

export default function GestionEtudiantsPage() {
  const searchParams = useSearchParams()
  const { classes, loading: classesLoading } = useTeacherClasses()
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const { students, loading: studentsLoading, error: studentsError, classeName, refreshStudents } = useStudents(selectedClassId)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showExcelModal, setShowExcelModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [addStudentError, setAddStudentError] = useState<string | null>(null)
  const [addStudentSuccess, setAddStudentSuccess] = useState<string | null>(null)
  const [isAddingStudent, setIsAddingStudent] = useState(false)

  // Auto-select class from URL parameter or first class if available
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      // Check if there's a classeId in the URL parameters
      const urlClasseId = searchParams.get('classeId')
      if (urlClasseId) {
        const classIdFromUrl = parseInt(urlClasseId)
        // Verify that the class exists in the teacher's classes
        const classExists = classes.some(c => c.classeId === classIdFromUrl)
        if (classExists) {
          setSelectedClassId(classIdFromUrl)
          return
        }
      }
      // If no valid URL parameter, select the first class
      setSelectedClassId(classes[0].classeId)
    }
  }, [classes, selectedClassId, searchParams])

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.numeroEtudiant.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Calculate statistics
  const totalStudents = students.length
  const activeStudents = students.filter(s => s.status === 'active').length
  const newStudents = students.filter(s => s.status === 'new').length
  const averageAge = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length)
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'senior': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'new': return <UserPlus className="w-4 h-4" />
      case 'senior': return <Award className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student)
    setShowStudentDetails(true)
  }

  const handleExport = async () => {
    if (!selectedClassId || !classeName) return
    
    setExporting(true)
    try {
      const params = new URLSearchParams({
        classeId: selectedClassId.toString()
      })

      const response = await fetch(`/api/students/export?${params}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `etudiants_${classeName}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to export students:', errorData.error)
        alert(`Erreur lors de l'export: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Erreur de connexion lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            {/* Breadcrumb - show when coming from classroom */}
            {searchParams.get('classeId') && (
              <div className="mb-4">
                <Link
                  href="/gestion-classroom"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour aux classes
                </Link>
              </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Étudiants</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    {searchParams.get('classeId') 
                      ? `Gérez les étudiants de la classe sélectionnée`
                      : `Gérez les informations et parcours de vos étudiants`
                    }
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
                <button 
                  onClick={() => setShowExcelModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Excel
                </button>
                <button 
                  onClick={handleExport}
                  disabled={exporting || !selectedClassId || !classeName}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {exporting ? 'Export...' : 'Exporter'}
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 sm:px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-lg w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel Étudiant
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
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{totalStudents}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Total Étudiants</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+5</span>
                <span className="text-gray-500 ml-1">ce mois</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{activeStudents}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Étudiants Actifs</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">
                  {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}% du total
                </span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{newStudents}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Nouveaux</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-purple-600 font-medium">Cette semaine</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{averageAge}</span>
              </div>
              <span className="text-[#374151] text-xs sm:text-sm">Âge Moyen</span>
              <div className="mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">ans</span>
              </div>
            </div>
          </div>

          {/* Class Selection and Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedClassId || ''}
                    onChange={(e) => setSelectedClassId(e.target.value ? parseInt(e.target.value) : null)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-medium w-full sm:w-auto"
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map((classe) => (
                      <option key={classe.id} value={classe.classeId}>
                        {classe.className} - {classe.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedClassId && classeName && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200 w-full sm:w-auto">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">{classeName}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center w-full sm:w-auto mt-2 lg:mt-0">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all w-full sm:w-96"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {selectedClassId ? `Étudiants - ${classeName}` : 'Sélectionnez une classe'}
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">{filteredStudents.length} étudiant(s)</span>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {!selectedClassId ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Sélectionnez une classe</p>
                  <p className="text-gray-400 text-sm mt-1">Choisissez une classe pour voir les étudiants</p>
                </div>
              ) : studentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : studentsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Erreur lors du chargement</p>
                  <p className="text-gray-500 text-sm mt-1">{studentsError}</p>
                  <button 
                    onClick={refreshStudents}
                    className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucun étudiant trouvé</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {students.length === 0 
                      ? "Cette classe n'a pas encore d'étudiants"
                      : "Aucun étudiant ne correspond à vos critères de recherche"
                    }
                  </p>
                  {students.length === 0 && (
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un étudiant
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      className="p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {student.initials}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            student.status === 'active' ? 'bg-green-500' :
                            student.status === 'new' ? 'bg-blue-500' :
                            'bg-orange-500'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-black transition-colors">
                            {student.fullName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{student.numeroEtudiant}</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(student.status)}`}>
                            {getStatusIcon(student.status)}
                            <span className="ml-1 capitalize">{student.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{student.age} ans</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{student.generation}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Année académique</span>
                          <span className="font-medium text-gray-900">{student.academicYear}</span>
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

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {selectedStudent.initials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.fullName}</h2>
                    <p className="text-gray-600">{selectedStudent.numeroEtudiant}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStudentDetails(false)}
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
                    <span>{selectedStudent.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Âge</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{selectedStudent.age} ans</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getStatusColor(selectedStudent.status)}`}>
                    {getStatusIcon(selectedStudent.status)}
                    <span className="ml-2 capitalize">{selectedStudent.status}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Génération</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span>{selectedStudent.generation}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Année académique</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span>{selectedStudent.academicYear}</span>
                  </div>
                </div>
                
                {selectedStudent.dateNaissance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(selectedStudent.dateNaissance).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowStudentDetails(false)}
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

      {/* Add Student Modal */}
      {showAddModal && selectedClassId !== null && (
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setAddStudentError(null)
            setAddStudentSuccess(null)
          }}
          onSubmit={async (studentData) => {
            setIsAddingStudent(true)
            setAddStudentError(null)
            setAddStudentSuccess(null)
            
            try {
              const response = await fetch('/api/students', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
              })

              if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Erreur lors de la création de l\'étudiant')
              }

              const result = await response.json()
              console.log('Étudiant créé avec succès:', result)
              
              // Show success message
              setAddStudentSuccess(`Étudiant ${studentData.firstname} ${studentData.lastname} créé avec succès!`)
              
              // Refresh the students list
              await refreshStudents()
              setShowAddModal(false)
              
              // Auto-hide success message after 3 seconds
              setTimeout(() => setAddStudentSuccess(null), 3000)
            } catch (error) {
              console.error('Erreur lors de la création de l\'étudiant:', error)
              setAddStudentError(error instanceof Error ? error.message : 'Erreur lors de la création de l\'étudiant')
              throw error
            } finally {
              setIsAddingStudent(false)
            }
          }}
          classeId={selectedClassId}
          className={classeName || ''}
          isLoading={isAddingStudent}
        />
      )}

      {/* Error Message Toast */}
      {addStudentError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium">Erreur</span>
          </div>
          <p className="text-sm mt-1">{addStudentError}</p>
          <button
            onClick={() => setAddStudentError(null)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Message Toast */}
      {addStudentSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Succès</span>
          </div>
          <p className="text-sm mt-1">{addStudentSuccess}</p>
          <button
            onClick={() => setAddStudentSuccess(null)}
            className="absolute top-2 right-2 text-green-400 hover:text-green-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Excel Import Modal */}
      {showExcelModal && selectedClassId !== null && (
        <ExcelImportModal
          isOpen={showExcelModal}
          onClose={() => setShowExcelModal(false)}
          onImportSuccess={() => {
            refreshStudents()
            setShowExcelModal(false)
          }}
          selectedClasseId={selectedClassId}
          selectedClassName={classeName || ''}
        />
      )}
    </>
  )
} 