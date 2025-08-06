"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNotes } from '@/presentation/hooks/useNotes'
import { useTeacherClasses } from '@/presentation/hooks/useTeacherClasses'
import { useTeacherSubjects } from '@/presentation/hooks/useTeacherSubjects'
import { ExcelNotesImportModal } from '@/presentation/components/ExcelNotesImportModal'
import { EditableNoteField } from '@/presentation/components/EditableNoteField'
import { RoleGuard } from '@/presentation/components/SideNavLayout'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Search, 
  Plus, 
  Upload,
  Download,
  Edit3,
  Eye,
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
  ArrowLeft,
  Mail,
  Calendar,
  MapPin,
  Save,
  RefreshCw
} from 'lucide-react'

export default function NotesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const matiereId = parseInt(params.matiereId as string)
  const classeId = parseInt(params.classeId as string)
  
  const { classes, loading: classesLoading } = useTeacherClasses()
  const { subjects, loading: subjectsLoading } = useTeacherSubjects()
  const { 
    students, 
    subject, 
    className, 
    statistics, 
    loading: notesLoading, 
    error: notesError, 
    updateNote,
    refreshNotes 
  } = useNotes(matiereId, classeId)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showExcelModal, setShowExcelModal] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Get current subject and class info
  const currentSubject = subjects.find(s => s.id === matiereId)
  const currentClass = classes.find(c => c.classeId === classeId)

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.studentFirstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentLastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentNumero.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Check if subject has TP component
  const hasTPComponent = subject?.noteConfig?.hasTPComponent || false

  const getNoteColor = (note: number | null) => {
    if (note === null) return 'text-gray-400'
    if (note >= 16) return 'text-green-600'
    if (note >= 12) return 'text-blue-600'
    if (note >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getNoteStatus = (note: number | null) => {
    if (note === null) return 'Non noté'
    if (note >= 16) return 'Excellent'
    if (note >= 12) return 'Bien'
    if (note >= 10) return 'Passable'
    return 'Insuffisant'
  }

  const handleUpdateNote = async (studentId: number, noteType: 'noteCC' | 'noteTP' | 'noteDV', value: number | null) => {
    const updateData: any = {}
    updateData[noteType] = value
    return await updateNote(studentId, updateData)
  }

  const handleExport = async () => {
    if (!subject || !currentClass) return
    
    setExporting(true)
    try {
      const params = new URLSearchParams({
        matiereId: matiereId.toString(),
        classeId: classeId.toString(),
        format: 'csv'
      })

      const response = await fetch(`/api/notes/export?${params}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `notes_${subject.nommatiere}_${currentClass.className}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to export notes:', errorData.error)
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
    <RoleGuard requiredRole="teacher">
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
              {/* Breadcrumb */}
              <div className="mb-4">
                <Link
                  href="/gestion-classroom"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour aux classes
                </Link>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Notes</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      {subject && currentClass 
                        ? `${subject.nommatiere} - ${currentClass.className}`
                        : 'Chargement...'
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
                    disabled={exporting || !subject || !currentClass}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
                  >
                    {exporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {exporting ? 'Export...' : 'Exporter'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subject and Class Info */}
          {subject && currentClass && (
            <div className="px-4 sm:px-6 md:px-8 py-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{subject.nommatiere}</h2>
                      <p className="text-gray-600 text-sm sm:text-base">{currentClass.className}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calculator className="w-4 h-4" />
                          <span>Coefficient {subject.coefficient}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{statistics.totalStudents} étudiants</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-2 rounded-full text-xs sm:text-sm font-medium ${
                      subject.coefficient >= 3 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {subject.coefficient >= 3 ? (
                        <>
                          <Star className="w-4 h-4 mr-1" />
                          Matière importante
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Matière standard
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="px-4 sm:px-6 md:px-8 py-6">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics.totalStudents}</span>
                </div>
                <span className="text-[#374151] text-xs sm:text-sm">Total Étudiants</span>
                <div className="mt-4 flex items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Inscrits</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics.studentsWithNotes}</span>
                </div>
                <span className="text-[#374151] text-xs sm:text-sm">Notés</span>
                <div className="mt-4 flex items-center text-xs sm:text-sm">
                  <span className="text-gray-600">
                    {statistics.totalStudents > 0 ? Math.round((statistics.studentsWithNotes / statistics.totalStudents) * 100) : 0}% du total
                  </span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics.averageGrade || 0}/20</span>
                </div>
                <span className="text-[#374151] text-xs sm:text-sm">Moyenne</span>
                <div className="mt-4 flex items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Note finale</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[#ef4444] font-bold text-xl sm:text-2xl">{statistics.passRate}%</span>
                </div>
                <span className="text-[#374151] text-xs sm:text-sm">Taux de réussite</span>
                <div className="mt-4 flex items-center text-xs sm:text-sm">
                  <span className="text-yellow-600 font-medium">≥ 10/20</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-lg mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                <div className="flex-1 max-w-lg w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher un étudiant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4" />
                    <span>{filteredStudents.length} étudiant(s)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Notes des Étudiants</h2>
                  <span className="text-xs sm:text-sm text-gray-500">
                    Cliquez sur une note pour la modifier
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Étudiant</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">CC</th>
                      {hasTPComponent && (
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">TP</th>
                      )}
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">DV</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Note Finale</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {notesLoading ? (
                      <tr>
                        <td colSpan={hasTPComponent ? 6 : 5} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                          </div>
                        </td>
                      </tr>
                    ) : notesError ? (
                      <tr>
                        <td colSpan={hasTPComponent ? 6 : 5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                            <p className="text-red-600 font-medium">Erreur lors du chargement</p>
                            <p className="text-gray-500 text-sm mt-1">{notesError}</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={hasTPComponent ? 6 : 5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Users className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">
                              {students.length === 0 
                                ? "Aucun étudiant trouvé" 
                                : "Aucun étudiant ne correspond à votre recherche"
                              }
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              {students.length === 0 
                                ? "Cette classe n'a pas encore d'étudiants"
                                : "Essayez de modifier votre recherche"
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {student.studentFirstname[0]}{student.studentLastname[0]}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {student.studentFirstname} {student.studentLastname}
                                </div>
                                <div className="text-sm text-gray-500">{student.studentNumero}</div>
                              </div>
                            </div>
                          </td>
                                                   <td className="px-6 py-4 text-center">
                           <EditableNoteField
                             value={student.note?.noteCC ?? null}
                             onSave={(value) => handleUpdateNote(student.studentId, 'noteCC', value)}
                             placeholder="CC"
                             maxValue={20}
                           />
                         </td>
                         {hasTPComponent && (
                           <td className="px-6 py-4 text-center">
                             <EditableNoteField
                               value={student.note?.noteTP ?? null}
                               onSave={(value) => handleUpdateNote(student.studentId, 'noteTP', value)}
                               placeholder="TP"
                               maxValue={20}
                             />
                           </td>
                         )}
                         <td className="px-6 py-4 text-center">
                           <EditableNoteField
                             value={student.note?.noteDV ?? null}
                             onSave={(value) => handleUpdateNote(student.studentId, 'noteDV', value)}
                             placeholder="DV"
                             maxValue={20}
                           />
                         </td>
                         <td className="px-6 py-4 text-center">
                           <div className={`font-bold text-lg ${getNoteColor(student.note?.noteFinale ?? null)}`}>
                             {student.note?.noteFinale !== null && student.note ? student.note.noteFinale : '-'}/20
                           </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                           {student.note?.noteFinale !== null && student.note ? (
                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                               student.note.noteFinale >= 16 ? 'bg-green-100 text-green-700' :
                               student.note.noteFinale >= 12 ? 'bg-blue-100 text-blue-700' :
                               student.note.noteFinale >= 10 ? 'bg-yellow-100 text-yellow-700' :
                               'bg-red-100 text-red-700'
                             }`}>
                               {getNoteStatus(student.note.noteFinale)}
                             </span>
                           ) : (
                             <span className="text-gray-400 text-sm">Non noté</span>
                           )}
                         </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Excel Import Modal */}
        {showExcelModal && subject && currentClass && (
          <ExcelNotesImportModal
            isOpen={showExcelModal}
            onClose={() => setShowExcelModal(false)}
            onImportSuccess={() => {
              setShowExcelModal(false)
              refreshNotes()
            }}
            matiereId={matiereId}
            classeId={classeId}
            subjectName={subject.nommatiere}
            className={currentClass.className}
            hasTPComponent={hasTPComponent}
          />
        )}
      </>
    </RoleGuard>
  )
} 