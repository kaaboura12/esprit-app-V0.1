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
  AlertTriangle
} from 'lucide-react'

export interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: (results: ImportResults) => void
  selectedClasseId: number
  selectedClassName: string
}

export interface ImportResults {
  totalRows: number
  validRows: number
  successfulImports: number
  failedImports: number
  skippedDuplicates: number
  importedStudents: {
    id: number
    fullName: string
    email: string
    numeroEtudiant: string
  }[]
}

export interface ImportResponse {
  success: boolean
  message: string
  results: ImportResults
  errors: string[]
  warnings: string[]
  importedStudents: {
    id: number
    fullName: string
    email: string
    numeroEtudiant: string
  }[]
}

export function ExcelImportModal({ 
  isOpen, 
  onClose, 
  onImportSuccess, 
  selectedClasseId, 
  selectedClassName 
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResults, setImportResults] = useState<ImportResponse | null>(null)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
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
      formData.append('classeId', selectedClasseId.toString())
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

      const response = await fetch('/api/students/import-excel', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result: ImportResponse = await response.json()
      setImportResults(result)

      if (result.success) {
        onImportSuccess(result.results)
      }

    } catch (error) {
      console.error('Import error:', error)
      setImportResults({
        success: false,
        message: 'Network error occurred during import',
        results: {
          totalRows: 0,
          validRows: 0,
          successfulImports: 0,
          failedImports: 0,
          skippedDuplicates: 0,
          importedStudents: []
        },
        errors: ['Network error occurred'],
        warnings: [],
        importedStudents: []
      })
    } finally {
      setIsUploading(false)
    }
  }, [file, selectedClasseId, overwriteExisting, onImportSuccess])

  const downloadTemplate = useCallback(() => {
    // Create a simple Excel template
    const csvContent = "prenom,nom,email,numeroetudiant,datenaissance\nAhmed,Ben Ali,ahmed.benali@esprit.tn,2021001234,15/03/2001\nFatima,Zahra,fatima.zahra@esprit.tn,2022005678,22/07/2002"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-red-50 to-red-50/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Importer des Étudiants</h2>
              <p className="text-sm text-gray-600">
                Importer depuis un fichier Excel vers la classe {selectedClassName}
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
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">email</code> - Email</li>
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">numeroetudiant</code> - Numéro étudiant</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Colonnes Optionnelles:</p>
                    <ul className="space-y-1">
                      <li>• <code className="bg-red-100/60 px-2 py-0.5 rounded">datenaissance</code> - Date de naissance</li>
                    </ul>
                    <button
                      onClick={downloadTemplate}
                      className="mt-3 inline-flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger le Modèle</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          {!importResults && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-red-400 bg-red-50/50'
                    : file
                    ? 'border-green-400 bg-green-50/50'
                    : 'border-gray-300/60 hover:border-red-300 hover:bg-red-50/20'
                }`}
              >
                {file ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <FileSpreadsheet className="w-12 h-12 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Supprimer le fichier
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <Upload className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Glissez et déposez votre fichier Excel ici
                      </p>
                      <p className="text-sm text-gray-500">
                        ou{' '}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          parcourir pour télécharger
                        </button>
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supporte les fichiers .xlsx et .xls (max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Import Options */}
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-white/90 border-gray-300 rounded focus:ring-red-500/20 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Remplacer les étudiants existants (par email ou numéro étudiant)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Importation en cours...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200/60 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Traitement des données...</span>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                importResults.success 
                  ? 'bg-green-50/50 border-green-200/60' 
                  : 'bg-red-50/50 border-red-200/60'
              }`}>
                <div className="flex items-start space-x-3">
                  {importResults.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-2 ${
                      importResults.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {importResults.success ? 'Importation Réussie!' : 'Erreur d\'Importation'}
                    </h3>
                    <p className={`text-sm ${
                      importResults.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {importResults.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{importResults.results.totalRows}</div>
                  <div className="text-sm text-gray-600">Total Lignes</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importResults.results.successfulImports}</div>
                  <div className="text-sm text-gray-600">Importés</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{importResults.results.failedImports}</div>
                  <div className="text-sm text-gray-600">Échecs</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{importResults.results.skippedDuplicates}</div>
                  <div className="text-sm text-gray-600">Doublons</div>
                </div>
              </div>

              {/* Error Details */}
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Voir les détails des erreurs ({importResults.errors.length})</span>
                  </button>
                  {showDetails && (
                    <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-4 max-h-40 overflow-y-auto">
                      <ul className="space-y-1 text-sm text-red-800">
                        {importResults.errors.map((error, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Imported Students List */}
              {importResults.results.importedStudents && importResults.results.importedStudents.length > 0 && (
                <div className="bg-green-50/50 border border-green-200/60 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Étudiants Importés ({importResults.results.importedStudents.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResults.results.importedStudents.map((student, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-900">{student.fullName}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.numeroEtudiant}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200/60">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {importResults ? 'Fermer' : 'Annuler'}
            </button>
            {!importResults && file && (
              <button
                onClick={handleImport}
                disabled={isUploading}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importation...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Importer les Étudiants</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 