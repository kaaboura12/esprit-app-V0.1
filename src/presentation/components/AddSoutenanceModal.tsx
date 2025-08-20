"use client"

import React, { useState } from 'react'
import { X, GraduationCap, User, Calendar, FileText, Loader2, CheckCircle, AlertCircle, Users, BookOpen, GraduationCap as GraduationCapIcon } from 'lucide-react'
import { CreateSoutenanceRequest } from '../../application/use-cases/index'
import { useStudentsByTeacher } from '../hooks/useStudentsByTeacher'
import { StudentByTeacherDTO } from '../../application/dtos/StudentByTeacherDTO'

interface AddSoutenanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: CreateSoutenanceRequest) => Promise<void>
  currentTeacherId: number
}

export function AddSoutenanceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentTeacherId 
}: AddSoutenanceModalProps) {
  const { students, loading: studentsLoading, error: studentsError } = useStudentsByTeacher(currentTeacherId)
  
  const [formData, setFormData] = useState({
    etudiant_id: '',
    date_soutenance: '',
    sujet: ''
  })

  const [errors, setErrors] = useState<Partial<typeof formData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {}

    if (!formData.etudiant_id.trim()) {
      newErrors.etudiant_id = 'L\'étudiant est requis'
    }

    if (!formData.date_soutenance.trim()) {
      newErrors.date_soutenance = 'La date de soutenance est requise'
    } else if (new Date(formData.date_soutenance) < new Date()) {
      newErrors.date_soutenance = 'La date de soutenance ne peut pas être dans le passé'
    }

    // Check if students are available
    if (students.length === 0 && !studentsLoading && !studentsError) {
      newErrors.etudiant_id = 'Aucun étudiant disponible pour ce professeur'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        etudiant_id: parseInt(formData.etudiant_id),
        teacher_id: currentTeacherId,
        date_soutenance: new Date(formData.date_soutenance),
        sujet: formData.sujet || undefined
      })
      // Reset form on success
      setFormData({
        etudiant_id: '',
        date_soutenance: '',
        sujet: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        etudiant_id: '',
        date_soutenance: '',
        sujet: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-red-50 to-red-50/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nouvelle Soutenance</h2>
              <p className="text-sm text-gray-600">
                Créer une nouvelle soutenance PFE (assignée à vous)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Student Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <User className="w-4 h-4 text-red-500" />
              <span>Étudiant *</span>
            </label>
            
            {studentsLoading ? (
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200/60">
                <Loader2 className="w-5 h-5 animate-spin text-red-500 mr-2" />
                <span className="text-gray-600">Chargement des étudiants...</span>
              </div>
            ) : studentsError ? (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Erreur: {studentsError}</span>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-yellow-700 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Aucun étudiant trouvé pour ce professeur</span>
                </div>
              </div>
            ) : (
              <>
                <select
                  value={formData.etudiant_id}
                  onChange={(e) => handleInputChange('etudiant_id', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                    errors.etudiant_id ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner un étudiant</option>
                  {students.map((student: StudentByTeacherDTO) => (
                    <option key={`${student.student_id}-${student.matiere_id}`} value={student.student_id}>
                      {student.firstname} {student.lastname} - {student.subject_name} ({student.nom_classe} - {student.bloc}{student.numclasse})
                    </option>
                  ))}
                </select>
                
                {/* Students Summary */}
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200/60">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700 font-medium">
                      {students.length} étudiant(s) trouvé(s)
                    </span>
                    <div className="flex items-center space-x-2 text-red-600">
                      <GraduationCapIcon className="w-4 h-4" />
                      <span>{new Set(students.map(s => s.nom_classe)).size} classe(s)</span>
                      <BookOpen className="w-4 h-4" />
                      <span>{new Set(students.map(s => s.subject_name)).size} matière(s)</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {errors.etudiant_id && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.etudiant_id}</span>
              </div>
            )}
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>Date de Soutenance *</span>
            </label>
            <input
              type="date"
              value={formData.date_soutenance}
              onChange={(e) => handleInputChange('date_soutenance', e.target.value)}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.date_soutenance ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              disabled={isSubmitting}
            />
            {errors.date_soutenance && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.date_soutenance}</span>
              </div>
              )}
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-red-500" />
              <span>Sujet (Optionnel)</span>
            </label>
            <textarea
              value={formData.sujet}
              onChange={(e) => handleInputChange('sujet', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md border-gray-200/60 shadow-sm hover:shadow-md"
              placeholder="Entrez le sujet de la soutenance..."
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200/60">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || students.length === 0 || Boolean(studentsLoading) || Boolean(studentsError)}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : students.length === 0 ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Aucun étudiant disponible</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Créer la Soutenance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
