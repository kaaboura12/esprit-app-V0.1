"use client"

import { useState, useRef, useEffect } from 'react'
import { Check, X, Edit3, Loader2 } from 'lucide-react'

interface EditableNoteFieldProps {
  value: number | null
  onSave: (value: number | null) => Promise<boolean>
  placeholder?: string
  maxValue?: number
  disabled?: boolean
  className?: string
}

export function EditableNoteField({ 
  value, 
  onSave, 
  placeholder = "Note", 
  maxValue = 20,
  disabled = false,
  className = ""
}: EditableNoteFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<string>(value?.toString() || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    if (disabled) return
    setEditValue(value?.toString() || '')
    setError(null)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (isSaving) return

    // Validate input
    if (editValue.trim() === '') {
      // Empty value means no note
      setIsSaving(true)
      try {
        const success = await onSave(null)
        if (success) {
          setIsEditing(false)
          setError(null)
          setShowSuccess(true)
          // Hide success message after 2 seconds
          setTimeout(() => setShowSuccess(false), 2000)
        }
      } catch (err) {
        setError('Erreur lors de la sauvegarde')
      } finally {
        setIsSaving(false)
      }
      return
    }

    const numValue = parseFloat(editValue)
    if (isNaN(numValue)) {
      setError('Veuillez entrer un nombre valide')
      return
    }

    if (numValue < 0 || numValue > maxValue) {
      setError(`La note doit être entre 0 et ${maxValue}`)
      return
    }

    setIsSaving(true)
    try {
      const success = await onSave(numValue)
      if (success) {
        setIsEditing(false)
        setError(null)
        setShowSuccess(true)
        // Hide success message after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setEditValue(value?.toString() || '')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const getNoteColor = (note: number | null) => {
    if (note === null) return 'text-gray-400'
    if (note >= 16) return 'text-green-600'
    if (note >= 12) return 'text-blue-600'
    if (note >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isEditing) {
    return (
      <div className="relative">
        <div className="flex items-center space-x-1">
          <input
            ref={inputRef}
            type="number"
            min="0"
            max={maxValue}
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
            placeholder={placeholder}
            disabled={isSaving}
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
            title="Sauvegarder"
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Annuler"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        {error && (
          <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 z-10">
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        onClick={handleStartEdit}
        className={`cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors ${getNoteColor(value)} ${className}`}
        title={disabled ? undefined : "Cliquez pour modifier"}
      >
        {value !== null ? (
          <span className="font-medium">{value}</span>
        ) : (
          <span className="text-gray-400 italic">-</span>
        )}
        {!disabled && (
          <Edit3 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      
      {/* Success message */}
      {showSuccess && (
        <div className="absolute top-full left-0 mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 z-10">
          ✓ Sauvegardé
        </div>
      )}
    </div>
  )
} 