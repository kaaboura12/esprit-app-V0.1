"use client"

import { useState } from 'react'
import { X, BookOpen, Calculator, FileText, Loader2, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react'

export interface AddSubjectFormData {
  nommatiere: string
  description: string
  coefficient: number
  noteConfig: 'cc-dv' | 'cc-tp-dv'
}

interface AddSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddSubjectFormData) => Promise<void>
  isLoading?: boolean
}

export function AddSubjectModal({ isOpen, onClose, onSubmit, isLoading = false }: AddSubjectModalProps) {
  const [formData, setFormData] = useState<AddSubjectFormData>({
    nommatiere: '',
    description: '',
    coefficient: 1.0,
    noteConfig: 'cc-dv'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nommatiere.trim()) {
      newErrors.nommatiere = 'Le nom de la matière est requis'
    } else if (formData.nommatiere.length > 100) {
      newErrors.nommatiere = 'Le nom de la matière ne peut pas dépasser 100 caractères'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La description ne peut pas dépasser 1000 caractères'
    }

    if (formData.coefficient < 0.1 || formData.coefficient > 10.0) {
      newErrors.coefficient = 'Le coefficient doit être entre 0.1 et 10.0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      setSuccessMessage('Matière créée avec succès!')
      setFormData({ nommatiere: '', description: '', coefficient: 1.0, noteConfig: 'cc-dv' })
      setErrors({})
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
        setSuccessMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error creating subject:', error)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ nommatiere: '', description: '', coefficient: 1.0, noteConfig: 'cc-dv' })
      setErrors({})
      setSuccessMessage(null)
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
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nouvelle Matière</h2>
              <p className="text-sm text-gray-600">Ajouter une nouvelle matière au système</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Subject Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-red-500" />
              <span>Nom de la matière *</span>
            </label>
            <input
              type="text"
              value={formData.nommatiere}
              onChange={(e) => setFormData({ ...formData, nommatiere: e.target.value })}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.nommatiere ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              placeholder="Ex: Mathématiques"
              disabled={isLoading}
            />
            {errors.nommatiere && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.nommatiere}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-red-500" />
              <span>Description</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md resize-none ${
                errors.description ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              placeholder="Description de la matière (optionnel)"
              rows={3}
              disabled={isLoading}
            />
            {errors.description && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.description}</span>
              </div>
            )}
          </div>

          {/* Coefficient */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-red-500" />
              <span>Coefficient *</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10.0"
              value={formData.coefficient}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                setFormData({ ...formData, coefficient: isNaN(value) ? 1.0 : value })
              }}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.coefficient ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              placeholder="1.0"
              disabled={isLoading}
            />
            {errors.coefficient && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.coefficient}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Le coefficient doit être entre 0.1 et 10.0
            </p>
          </div>

          {/* Note Configuration */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-red-500" />
              <span>Configuration des Notes *</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl cursor-pointer hover:bg-red-50/50 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md">
                <input
                  type="radio"
                  name="noteConfig"
                  value="cc-dv"
                  checked={formData.noteConfig === 'cc-dv'}
                  onChange={(e) => setFormData({ ...formData, noteConfig: e.target.value as 'cc-dv' | 'cc-tp-dv' })}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">CC + DV</div>
                  <div className="text-sm text-gray-600">40% CC + 60% DV</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-4 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl cursor-pointer hover:bg-red-50/50 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md">
                <input
                  type="radio"
                  name="noteConfig"
                  value="cc-tp-dv"
                  checked={formData.noteConfig === 'cc-tp-dv'}
                  onChange={(e) => setFormData({ ...formData, noteConfig: e.target.value as 'cc-dv' | 'cc-tp-dv' })}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">CC + TP + DV</div>
                  <div className="text-sm text-gray-600">20% CC + 30% TP + 50% DV</div>
                </div>
              </label>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Succès</span>
              </div>
              <p className="text-sm mt-1">{successMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200/60">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Créer la matière
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 