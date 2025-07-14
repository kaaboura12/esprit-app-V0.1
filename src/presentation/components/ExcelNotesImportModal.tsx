"use client"

import React, { useState, useCallback, useRef } from 'react'
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Download, 
  Info,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Award,
  BookOpen,
  Calculator,
  Eye,
  RefreshCw
} from 'lucide-react'
import { ImportNotesFromExcelResponseDTO, ImportNotesResultsDTO } from '@/application/dtos/ExcelNotesImportDTO'

export interface ExcelNotesImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: (results: ImportNotesResultsDTO) => void
  matiereId: number
  classeId: number
  subjectName: string
  className: string
  hasTPComponent: boolean
}

export function ExcelNotesImportModal({ 
  isOpen, 
  onClose, 
  onImportSuccess, 
  matiereId,
  classeId,
  subjectName,
  className,
  hasTPComponent
}: ExcelNotesImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResults, setImportResults] = useState<ImportNotesFromExcelResponseDTO | null>(null)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setFile(null)
    setImportResults(null)
    setUploadProgress(0)
    setIsUploading(false)
    setShowDetails(false)
    setOverwriteExisting(false)
  }, [])

  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetState()
      onClose()
    }
  }, [resetState, onClose, isUploading])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const excelFile = droppedFiles.find(file => 
      file.name.match(/\.(xlsx|xls)$/i)
    )
    
    if (excelFile) {
      setFile(excelFile)
      setImportResults(null)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setImportResults(null)
    }
  }, [])

  const handleImport = useCallback(async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setImportResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('matiereId', matiereId.toString())
      formData.append('classeId', classeId.toString())
      formData.append('overwriteExisting', overwriteExisting.toString())

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/notes/import-excel', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result: ImportNotesFromExcelResponseDTO = await response.json()
      setImportResults(result)

      if (result.success && result.results) {
        onImportSuccess(result.results)
      }

    } catch (error) {
      console.error('Import error:', error)
      setImportResults({
        success: false,
        error: 'Network error occurred during import'
      })
    } finally {
      setIsUploading(false)
    }
  }, [file, matiereId, classeId, overwriteExisting, onImportSuccess])

  const downloadTemplate = useCallback(async () => {
    setIsGeneratingTemplate(true)
    try {
      const params = new URLSearchParams({
        matiereId: matiereId.toString(),
        classeId: classeId.toString(),
        includeExistingNotes: 'false',
        includeStudentEmails: 'true'
      })

      const response = await fetch(`/api/notes/import-excel/template?${params}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `notes_template_${subjectName}_${className}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to download template:', errorData.error)
        // You could add a toast notification here for better UX
        alert(`Erreur lors du téléchargement: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Template download error:', error)
      alert('Erreur de connexion lors du téléchargement du modèle')
    } finally {
      setIsGeneratingTemplate(false)
    }
  }, [matiereId, classeId, subjectName, className])

  const getResultsIcon = () => {
    if (!importResults) return null
    
    if (importResults.success) {
      return <CheckCircle className="w-8 h-8 text-green-500" />
    } else {
      return <AlertCircle className="w-8 h-8 text-red-500" />
    }
  }

  const getResultsColor = () => {
    if (!importResults) return 'border-gray-200'
    
    if (importResults.success) {
      return 'border-green-200 bg-green-50'
    } else {
      return 'border-red-200 bg-red-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-red-50 to-red-50/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Importer des Notes</h2>
              <p className="text-sm text-gray-600">
                Importer depuis un fichier Excel pour {subjectName} - {className}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Import Instructions */}
          <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Format Excel Requis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
                  <div>
                    <p className="font-medium mb-1">Colonnes Requises:</p>
                    <ul className="space-y-1">
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">prenom</code> - Prénom</li>
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">nom</code> - Nom</li>
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">numeroetudiant</code> - Numéro étudiant</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Colonnes de Notes:</p>
                    <ul className="space-y-1">
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">noteCC</code> - Note CC (0-20)</li>
                      {hasTPComponent && (
                        <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">noteTP</code> - Note TP (0-20)</li>
                      )}
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">noteDV</code> - Note DV (0-20)</li>
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">email</code> - Email (optionnel)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-3">
                  <button
                    onClick={downloadTemplate}
                    disabled={isGeneratingTemplate}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isGeneratingTemplate ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Télécharger le Modèle</span>
                  </button>
                  <div className="text-xs text-red-700">
                    <span className="font-medium">Note:</span> Les notes finales seront calculées automatiquement
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-gray-300 hover:border-red-400 hover:bg-red-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Glissez votre fichier Excel ici
                  </h3>
                  <p className="text-gray-600 mb-4">
                    ou cliquez pour sélectionner un fichier
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Sélectionner un fichier
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  Formats supportés: .xlsx, .xls • Taille max: 10MB
                </div>
              </div>
            </div>

            {/* Selected File Info */}
            {file && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Options d'importation</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">
                    Écraser les notes existantes
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-7">
                  Si désactivé, les notes existantes seront ignorées
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900">Importation en cours...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-700 mt-2">{uploadProgress}% terminé</p>
            </div>
          )}

          {/* Results */}
          {importResults && (
            <div className={`border rounded-xl p-6 ${getResultsColor()}`}>
              <div className="flex items-start space-x-4">
                {getResultsIcon()}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {importResults.success ? 'Importation réussie!' : 'Erreur d\'importation'}
                  </h3>
                  
                  {importResults.success && importResults.results ? (
                    <div className="space-y-4">
                      <p className="text-green-700">
                        {importResults.message}
                      </p>
                      
                      {/* Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/60 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Total</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{importResults.results.totalRows}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Réussis</span>
                          </div>
                          <p className="text-lg font-bold text-green-600">{importResults.results.successfulImports}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-gray-700">Échoués</span>
                          </div>
                          <p className="text-lg font-bold text-red-600">{importResults.results.failedImports}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Moyenne</span>
                          </div>
                          <p className="text-lg font-bold text-blue-600">
                            {importResults.results.statistics.averageFinal?.toFixed(1) || '--'}
                          </p>
                        </div>
                      </div>

                      {/* Detailed Results */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowDetails(!showDetails)}
                          className="flex items-center space-x-2 text-sm text-green-700 hover:text-green-800"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{showDetails ? 'Masquer' : 'Afficher'} les détails</span>
                        </button>
                      </div>

                      {showDetails && (
                        <div className="bg-white/60 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Notes créées:</strong> {importResults.results.createdNotes}</p>
                              <p><strong>Notes mises à jour:</strong> {importResults.results.updatedNotes}</p>
                              <p><strong>Étudiants non trouvés:</strong> {importResults.results.studentsNotFound}</p>
                            </div>
                            <div>
                              <p><strong>Taux de réussite:</strong> {importResults.results.statistics.passRate}%</p>
                              <p><strong>Taux de completion:</strong> {importResults.results.statistics.completionRate}%</p>
                              <p><strong>Composant TP:</strong> {importResults.results.hasTPComponent ? 'Oui' : 'Non'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-red-700">{importResults.error}</p>
                      {importResults.results?.errors && importResults.results.errors.length > 0 && (
                        <div className="bg-white/60 rounded-lg p-3">
                          <p className="font-medium text-red-800 mb-2">Erreurs détaillées:</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            {importResults.results.errors.slice(0, 5).map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                            {importResults.results.errors.length > 5 && (
                              <li className="text-red-600">... et {importResults.results.errors.length - 5} autres erreurs</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {importResults?.success ? 'Fermer' : 'Annuler'}
            </button>
            
            <div className="flex space-x-3">
              {importResults?.success && importResults.results && (
                <button
                  onClick={() => {
                    resetState()
                    setImportResults(null)
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Nouveau Import</span>
                </button>
              )}
              
              {file && !importResults?.success && (
                <button
                  onClick={handleImport}
                  disabled={isUploading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Importer les Notes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 