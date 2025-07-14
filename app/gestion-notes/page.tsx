"use client"

import { useState, useEffect } from 'react'
import { SideNavLayout } from '@/presentation/components/SideNavLayout'
import { useTeacherSubjects } from '@/presentation/hooks/useTeacherSubjects'
import { useTeacherClasses } from '@/presentation/hooks/useTeacherClasses'
import { useNotes } from '@/presentation/hooks/useNotes'
import { ExcelNotesImportModal } from '@/presentation/components/ExcelNotesImportModal'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Search, 
  Filter, 
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
  Activity
} from 'lucide-react'

export default function GestionNotesPage() {
  const { subjects, loading: subjectsLoading, error: subjectsError } = useTeacherSubjects()
  const { classes, loading: classesLoading } = useTeacherClasses()
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showExcelModal, setShowExcelModal] = useState(false)

  // Get all class-subject combinations for the teacher
  const getClassSubjectCombinations = () => {
    const combinations = []
    for (const subject of subjects) {
      for (const classe of classes) {
        // Check if this teacher teaches this subject to this class
        const teachesSubjectToClass = classes.some(c => 
          c.classeId === classe.classeId && c.matiereId === subject.id
        )
        if (teachesSubjectToClass) {
          combinations.push({
            subjectId: subject.id,
            subjectName: subject.nommatiere,
            classId: classe.classeId,
            className: classe.className,
            coefficient: subject.coefficient,
            description: subject.description
          })
        }
      }
    }
    return combinations
  }

  const combinations = getClassSubjectCombinations()

  // Filter combinations based on search
  const filteredCombinations = combinations.filter(combo =>
    combo.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    combo.className.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate statistics
  const totalSubjects = subjects.length
  const totalClasses = classes.length
  const totalCombinations = combinations.length
  const highCoefficientSubjects = subjects.filter(s => s.coefficient >= 3).length

  return (
    <SideNavLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Notes</h1>
                <p className="text-gray-600 mt-1">Saisissez et gérez les notes de vos étudiants</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowExcelModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Excel
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Matières enseignées</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalSubjects}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">Actives</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Classes assignées</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalClasses}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">Toutes actives</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Combinaisons</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalCombinations}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">Classe-Matière</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Coefficient élevé</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{highCoefficientSubjects}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600 font-medium">≥ 3 points</span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par matière ou classe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>{filteredCombinations.length} résultat(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subject-Class Combinations Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Matières et Classes</h2>
                <span className="text-sm text-gray-500">
                  Sélectionnez une combinaison pour gérer les notes
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {subjectsLoading || classesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : subjectsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Erreur lors du chargement</p>
                  <p className="text-gray-500 text-sm mt-1">{subjectsError}</p>
                </div>
              ) : filteredCombinations.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    {combinations.length === 0 
                      ? "Aucune matière assignée" 
                      : "Aucun résultat trouvé"
                    }
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {combinations.length === 0 
                      ? "Contactez l'administration pour obtenir vos affectations"
                      : "Essayez de modifier votre recherche"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCombinations.map((combo, index) => (
                    <Link
                      key={`${combo.subjectId}-${combo.classId}`}
                      href={`/gestion-notes/${combo.subjectId}/${combo.classId}`}
                      className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-black transition-colors">
                            {combo.subjectName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{combo.className}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {combo.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {combo.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calculator className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Coefficient {combo.coefficient}
                            </span>
                          </div>
                          
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            combo.coefficient >= 3 
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {combo.coefficient >= 3 ? (
                              <>
                                <Star className="w-3 h-3 mr-1" />
                                Important
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Standard
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-500">
                              <Activity className="w-4 h-4" />
                              <span>Gestion des notes</span>
                            </div>
                            <div className="flex items-center space-x-1 text-red-600 group-hover:text-red-700 transition-colors">
                              <span className="font-medium">Accéder</span>
                              <Edit3 className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Statistiques globales</h3>
                  <p className="text-sm text-gray-600">Vue d'ensemble des performances</p>
                </div>
              </div>
              <button className="w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                Voir les statistiques
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Rapports de notes</h3>
                  <p className="text-sm text-gray-600">Générer des rapports détaillés</p>
                </div>
              </div>
              <button className="w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                Générer rapport
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Configuration notes</h3>
                  <p className="text-sm text-gray-600">Paramètres de notation</p>
                </div>
              </div>
              <button className="w-full py-2 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                Configurer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Excel Import Modal */}
      {showExcelModal && (
        <ExcelNotesImportModal
          isOpen={showExcelModal}
          onClose={() => setShowExcelModal(false)}
          onImportComplete={() => {
            setShowExcelModal(false)
            // Refresh data if needed
          }}
          matiereId={selectedSubject}
          classeId={selectedClass}
        />
      )}
    </SideNavLayout>
  )
} 