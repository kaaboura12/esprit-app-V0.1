"use client"

import React, { useState, useEffect, useRef } from 'react'
import { X, Users, Hash, BookOpen, Layers, Loader2, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'
import { useSubjects } from '@/presentation/hooks/useSubjects'
import { useClasses } from '@/presentation/hooks/useClasses'

export interface AddClassFormData {
  className: string
  bloc: string
  maxStudents: number
  subjectId: number
  subjectName: string
  coefficient: number
}

interface AddClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddClassFormData) => Promise<void>
  isLoading?: boolean
}

export function AddClassModal({ isOpen, onClose, onSubmit, isLoading = false }: AddClassModalProps) {
  const { subjects, loading: subjectsLoading } = useSubjects()
  const { classes, loading: classesLoading } = useClasses()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const classDropdownRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<AddClassFormData>({
    className: '',
    bloc: '',
    maxStudents: 35,
    subjectId: 0,
    subjectName: '',
    coefficient: 1
  })
  const [errors, setErrors] = useState<Partial<AddClassFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [showClassDropdown, setShowClassDropdown] = useState(false)

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSubjectDropdown(false)
      }
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setShowClassDropdown(false)
      }
    }

    if (showSubjectDropdown || showClassDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSubjectDropdown, showClassDropdown])

  const handleInputChange = (field: keyof AddClassFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubjectSelect = (subjectId: number, subjectName: string, coefficient: any) => {
    // Ensure coefficient is properly converted to number
    let coefficientValue: number
    if (typeof coefficient === 'string') {
      // Replace comma with dot for proper number parsing
      coefficientValue = Number(coefficient.replace(',', '.'))
    } else {
      coefficientValue = Number(coefficient)
    }
    
    console.log('Subject selected:', {
      subjectId,
      subjectName,
      originalCoefficient: coefficient,
      type: typeof coefficient,
      convertedCoefficient: coefficientValue
    })
    
    setFormData(prev => ({ 
      ...prev, 
      subjectId, 
      subjectName,
      coefficient: coefficientValue
    }))
    setShowSubjectDropdown(false)
    if (errors.subjectName) {
      setErrors(prev => ({ ...prev, subjectName: undefined }))
    }
    if (errors.coefficient) {
      setErrors(prev => ({ ...prev, coefficient: undefined }))
    }
  }

  const handleClassSelect = (className: string, bloc: string) => {
    setFormData(prev => ({ 
      ...prev, 
      className, 
      bloc
    }))
    setShowClassDropdown(false)
    if (errors.className) {
      setErrors(prev => ({ ...prev, className: undefined }))
    }
    if (errors.bloc) {
      setErrors(prev => ({ ...prev, bloc: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AddClassFormData> = {}
    if (!formData.className.trim()) newErrors.className = 'Le nom de la classe est requis'
    if (!formData.bloc.trim()) newErrors.bloc = 'Le bloc est requis'
    if (!formData.subjectId || formData.subjectId === 0) newErrors.subjectName = 'La matière est requise'
    if (!formData.maxStudents || formData.maxStudents < 1) newErrors.maxStudents = 'Nombre d\'étudiants invalide'
    
    // Convert coefficient to number and validate
    // Handle both dot and comma decimal separators
    let coefficientValue: number
    if (typeof formData.coefficient === 'string') {
      // Replace comma with dot for proper number parsing
      coefficientValue = Number(formData.coefficient.replace(',', '.'))
    } else {
      coefficientValue = Number(formData.coefficient)
    }
    
    console.log('Validating coefficient:', {
      original: formData.coefficient,
      type: typeof formData.coefficient,
      converted: coefficientValue,
      isNaN: isNaN(coefficientValue),
      isPositive: coefficientValue > 0
    })
    
    if (isNaN(coefficientValue) || coefficientValue <= 0) {
      newErrors.coefficient = 'Coefficient invalide'
      console.log('Coefficient validation failed')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({ className: '', bloc: '', maxStudents: 35, subjectId: 0, subjectName: '', coefficient: 1 })
      setErrors({})
      onClose()
    } catch (error) {
      // Optionally handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ className: '', bloc: '', maxStudents: 35, subjectId: 0, subjectName: '', coefficient: 1 })
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
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nouvelle Classe</h2>
              <p className="text-sm text-gray-600">Ajouter une nouvelle classe à la liste</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Hash className="w-4 h-4 text-red-500" />
                <span>Nom de la classe *</span>
              </label>
              <div className="relative" ref={classDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                  disabled={isSubmitting || classesLoading}
                  className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between ${errors.className ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'} ${isSubmitting || classesLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={formData.className ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.className || 'Sélectionner une classe'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showClassDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showClassDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {classesLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                        Chargement des classes...
                      </div>
                    ) : classes.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Aucune classe disponible
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {classes.map(classe => (
                          <button
                            key={classe.id}
                            type="button"
                            onClick={() => handleClassSelect(classe.nom_classe, classe.bloc)}
                            className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {classe.nom_classe}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.className && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.className}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-500" />
                <span>Bloc *</span>
              </label>
              <input
                type="text"
                value={formData.bloc}
                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl ${formData.className ? 'border-gray-200/60' : 'border-gray-200/60 bg-gray-100 cursor-not-allowed'}`}
                placeholder="Sélectionnez d'abord une classe"
                disabled={true}
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Users className="w-4 h-4 text-red-500" />
                <span>Nombre max. d'étudiants *</span>
              </label>
              <input
                type="number"
                value={35}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200/60 rounded-xl cursor-not-allowed"
                disabled={true}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-red-500" />
                <span>Matière *</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                  disabled={isSubmitting || subjectsLoading}
                  className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between ${errors.subjectName ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'} ${isSubmitting || subjectsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={formData.subjectName ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.subjectName || 'Sélectionner une matière'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showSubjectDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showSubjectDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {subjectsLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                        Chargement des matières...
                      </div>
                    ) : subjects.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Aucune matière disponible
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {subjects.map(subject => (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => handleSubjectSelect(subject.id, subject.nommatiere, subject.coefficient)}
                            className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {subject.nommatiere}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.subjectName && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.subjectName}</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Hash className="w-4 h-4 text-red-500" />
              <span>Coefficient *</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.coefficient}
              onChange={e => handleInputChange('coefficient', Number(e.target.value))}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${errors.coefficient ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'} ${formData.subjectId === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ex: 1.5"
              disabled={isSubmitting || formData.subjectId === 0}
            />
            {errors.coefficient && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.coefficient}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 bg-[#ef4444] text-white rounded-xl font-semibold hover:bg-[#dc2626] transition-colors shadow-md disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              Ajouter la classe
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 