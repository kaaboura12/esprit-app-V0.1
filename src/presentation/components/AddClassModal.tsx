"use client"

import React, { useState } from 'react'
import { X, Users, Hash, BookOpen, Layers, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export interface AddClassFormData {
  className: string
  bloc: string
  maxStudents: number
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
  const [formData, setFormData] = useState<AddClassFormData>({
    className: '',
    bloc: '',
    maxStudents: 30,
    subjectName: '',
    coefficient: 1
  })
  const [errors, setErrors] = useState<Partial<AddClassFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof AddClassFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AddClassFormData> = {}
    if (!formData.className.trim()) newErrors.className = 'Le nom de la classe est requis'
    if (!formData.bloc.trim()) newErrors.bloc = 'Le bloc est requis'
    if (!formData.subjectName.trim()) newErrors.subjectName = 'La matière est requise'
    if (!formData.maxStudents || formData.maxStudents < 1) newErrors.maxStudents = 'Nombre d\'étudiants invalide'
    if (!formData.coefficient || formData.coefficient < 1) newErrors.coefficient = 'Coefficient invalide'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({ className: '', bloc: '', maxStudents: 30, subjectName: '', coefficient: 1 })
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
      setFormData({ className: '', bloc: '', maxStudents: 30, subjectName: '', coefficient: 1 })
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
              <input
                type="text"
                value={formData.className}
                onChange={e => handleInputChange('className', e.target.value)}
                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${errors.className ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'}`}
                placeholder="Ex: 3INFO1"
                disabled={isSubmitting}
              />
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
                onChange={e => handleInputChange('bloc', e.target.value)}
                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${errors.bloc ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'}`}
                placeholder="Ex: B1"
                disabled={isSubmitting}
              />
              {errors.bloc && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.bloc}</span>
                </div>
              )}
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
                min={1}
                value={formData.maxStudents}
                onChange={e => handleInputChange('maxStudents', Number(e.target.value))}
                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${errors.maxStudents ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'}`}
                placeholder="Ex: 30"
                disabled={isSubmitting}
              />
              {errors.maxStudents && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.maxStudents}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-red-500" />
                <span>Matière *</span>
              </label>
              <input
                type="text"
                value={formData.subjectName}
                onChange={e => handleInputChange('subjectName', e.target.value)}
                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${errors.subjectName ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'}`}
                placeholder="Ex: Mathématiques"
                disabled={isSubmitting}
              />
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
              min={1}
              value={formData.coefficient}
              onChange={e => handleInputChange('coefficient', Number(e.target.value))}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${errors.coefficient ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'}`}
              placeholder="Ex: 2"
              disabled={isSubmitting}
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