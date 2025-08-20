"use client"

import { useState } from 'react'
import { X, Building, Hash, Users, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export interface AddClassFormDataAdmin {
  nomClasse: string
  bloc: string
  numclasse: number
  nbreEtudiantMax: number
}

interface AddClassModalAdminProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddClassFormDataAdmin) => Promise<void>
  isLoading?: boolean
}

export function AddClassModalAdmin({ isOpen, onClose, onSubmit, isLoading = false }: AddClassModalAdminProps) {
  const [formData, setFormData] = useState<AddClassFormDataAdmin>({
    nomClasse: '',
    bloc: '',
    numclasse: 1,
    nbreEtudiantMax: 35
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nomClasse.trim()) {
      newErrors.nomClasse = 'Le nom de la classe est requis'
    } else if (formData.nomClasse.length > 50) {
      newErrors.nomClasse = 'Le nom de la classe ne peut pas dépasser 50 caractères'
    }

    if (!formData.bloc.trim()) {
      newErrors.bloc = 'Le bloc est requis'
    } else if (formData.bloc.length > 10) {
      newErrors.bloc = 'Le bloc ne peut pas dépasser 10 caractères'
    }

    if (formData.numclasse < 1) {
      newErrors.numclasse = 'Le numéro de classe doit être positif'
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
      setSuccessMessage('Classe créée avec succès!')
      setFormData({ nomClasse: '', bloc: '', numclasse: 1, nbreEtudiantMax: 35 })
      setErrors({})
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
        setSuccessMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error creating class:', error)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ nomClasse: '', bloc: '', numclasse: 1, nbreEtudiantMax: 35 })
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
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nouvelle Classe</h2>
              <p className="text-sm text-gray-600">Ajouter une nouvelle classe au système</p>
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
          {/* Class Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Building className="w-4 h-4 text-red-500" />
              <span>Nom de la classe *</span>
            </label>
            <input
              type="text"
              value={formData.nomClasse}
              onChange={(e) => setFormData({ ...formData, nomClasse: e.target.value })}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.nomClasse ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              placeholder="Ex: Informatique"
              disabled={isLoading}
            />
            {errors.nomClasse && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.nomClasse}</span>
              </div>
            )}
          </div>

          {/* Bloc */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Hash className="w-4 h-4 text-red-500" />
              <span>Bloc *</span>
            </label>
            <input
              type="text"
              value={formData.bloc}
              onChange={(e) => setFormData({ ...formData, bloc: e.target.value })}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.bloc ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              placeholder="Ex: A, B, C..."
              disabled={isLoading}
            />
            {errors.bloc && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.bloc}</span>
              </div>
            )}
          </div>

          {/* Class Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Hash className="w-4 h-4 text-red-500" />
              <span>Numéro de classe *</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.numclasse}
              onChange={(e) => setFormData({ ...formData, numclasse: parseInt(e.target.value) || 1 })}
              className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                errors.numclasse ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60'
              }`}
              placeholder="Ex: 1, 2, 3..."
              disabled={isLoading}
            />
            {errors.numclasse && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.numclasse}</span>
              </div>
            )}
          </div>

          {/* Max Students */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Users className="w-4 h-4 text-red-500" />
              <span>Nombre maximum d'étudiants</span>
            </label>
            <input
              type="number"
              value={35}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200/60 rounded-xl cursor-not-allowed"
              placeholder="35"
              disabled={true}
              readOnly
            />
            <p className="text-xs text-gray-500">
              Fixé à 35 étudiants par classe
            </p>
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
                  <Building className="w-4 h-4 mr-2" />
                  Créer la classe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 