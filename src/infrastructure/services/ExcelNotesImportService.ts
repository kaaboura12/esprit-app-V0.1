import * as XLSX from 'xlsx'
import { Email } from '@/core/value-objects/Email'
import { StudentNumber } from '@/core/value-objects/StudentNumber'

/**
 * Excel Notes Import Service - Infrastructure layer
 * This service handles Excel file parsing and data extraction for notes
 */

export interface ExcelNoteData {
  prenom: string
  nom: string
  email?: string
  numeroetudiant: string
  noteCC?: number
  noteTP?: number
  noteDV?: number
}

export interface NotesImportResult {
  success: boolean
  data?: ExcelNoteData[]
  errors?: string[]
  warnings?: string[]
  totalRows?: number
  validRows?: number
  hasTPComponent?: boolean
}

export interface NotesValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  data?: {
    firstname: string
    lastname: string
    email?: string
    numeroEtudiant: string
    noteCC?: number
    noteTP?: number
    noteDV?: number
  }
}

export interface NotesBatchProcessResult {
  batchNumber: number
  processed: number
  successful: number
  failed: number
  errors: string[]
  warnings: string[]
}

export class ExcelNotesImportService {
  private readonly REQUIRED_COLUMNS = ['prenom', 'nom', 'numeroetudiant']
  private readonly OPTIONAL_COLUMNS = ['email', 'notecc', 'notetp', 'notedv']
  private readonly NOTE_COLUMNS = ['notecc', 'notetp', 'notedv']
  private readonly MAX_ROWS = 1000 // Prevent processing extremely large files
  private readonly BATCH_SIZE = 50 // Process in batches for better performance

  /**
   * Parse Excel file buffer and extract notes data
   */
  async parseExcelFile(buffer: Buffer): Promise<NotesImportResult> {
    try {
      // Read the Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        return {
          success: false,
          errors: ['No worksheets found in the Excel file']
        }
      }

      const worksheet = workbook.Sheets[sheetName]
      
      // Convert worksheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false
      }) as any[][]

      if (jsonData.length === 0) {
        return {
          success: false,
          errors: ['The Excel file is empty']
        }
      }

      // Validate headers
      const headers = jsonData[0]
      const headerValidation = this.validateHeaders(headers)
      if (!headerValidation.isValid) {
        return {
          success: false,
          errors: headerValidation.errors
        }
      }

      // Process data rows
      const dataRows = jsonData.slice(1)
      if (dataRows.length === 0) {
        return {
          success: false,
          errors: ['No data rows found in the Excel file']
        }
      }

      if (dataRows.length > this.MAX_ROWS) {
        return {
          success: false,
          errors: [`File contains too many rows (${dataRows.length}). Maximum allowed is ${this.MAX_ROWS}`]
        }
      }

      // Parse and validate each row
      const results = await this.parseDataRows(headers, dataRows)
      
      // Detect if TP component is present
      const hasTPComponent = results.validData.some(note => 
        note.noteTP !== undefined && note.noteTP !== null
      )
      
      return {
        success: results.validData.length > 0,
        data: results.validData,
        errors: results.errors,
        warnings: results.warnings,
        totalRows: dataRows.length,
        validRows: results.validData.length,
        hasTPComponent
      }

    } catch (error) {
      console.error('Error parsing Excel file:', error)
      return {
        success: false,
        errors: [`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  /**
   * Parse Excel file with progress tracking
   */
  async parseExcelFileWithProgress(
    buffer: Buffer,
    onProgress?: (progress: number, message: string) => void
  ): Promise<NotesImportResult> {
    try {
      onProgress?.(10, 'Reading Excel file...')
      
      // Read the Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      
      onProgress?.(20, 'Validating file structure...')
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        return {
          success: false,
          errors: ['No worksheets found in the Excel file']
        }
      }

      const worksheet = workbook.Sheets[sheetName]
      
      // Convert worksheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false
      }) as any[][]

      if (jsonData.length === 0) {
        return {
          success: false,
          errors: ['The Excel file is empty']
        }
      }

      onProgress?.(30, 'Validating headers...')
      
      // Validate headers
      const headers = jsonData[0]
      const headerValidation = this.validateHeaders(headers)
      if (!headerValidation.isValid) {
        return {
          success: false,
          errors: headerValidation.errors
        }
      }

      // Process data rows
      const dataRows = jsonData.slice(1)
      if (dataRows.length === 0) {
        return {
          success: false,
          errors: ['No data rows found in the Excel file']
        }
      }

      if (dataRows.length > this.MAX_ROWS) {
        return {
          success: false,
          errors: [`File contains too many rows (${dataRows.length}). Maximum allowed is ${this.MAX_ROWS}`]
        }
      }

      onProgress?.(40, 'Processing notes data...')
      
      // Parse and validate each row with progress tracking
      const results = await this.parseDataRowsWithProgress(headers, dataRows, onProgress)
      
      onProgress?.(100, 'Validation complete')
      
      // Detect if TP component is present
      const hasTPComponent = results.validData.some(note => 
        note.noteTP !== undefined && note.noteTP !== null
      )
      
      return {
        success: results.validData.length > 0,
        data: results.validData,
        errors: results.errors,
        warnings: results.warnings,
        totalRows: dataRows.length,
        validRows: results.validData.length,
        hasTPComponent
      }

    } catch (error) {
      console.error('Error parsing Excel file:', error)
      return {
        success: false,
        errors: [`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  /**
   * Process data in batches for better performance
   */
  async processBatch<T>(
    data: T[],
    batchSize: number,
    processor: (batch: T[], batchNumber: number) => Promise<NotesBatchProcessResult>
  ): Promise<NotesBatchProcessResult[]> {
    const results: NotesBatchProcessResult[] = []
    const totalBatches = Math.ceil(data.length / batchSize)

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, data.length)
      const batch = data.slice(start, end)

      try {
        const result = await processor(batch, i + 1)
        results.push(result)
      } catch (error) {
        results.push({
          batchNumber: i + 1,
          processed: batch.length,
          successful: 0,
          failed: batch.length,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        })
      }
    }

    return results
  }

  /**
   * Validate Excel headers
   */
  private validateHeaders(headers: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!headers || headers.length === 0) {
      errors.push('No headers found in the Excel file')
      return { isValid: false, errors }
    }

    // Normalize headers to lowercase for comparison
    const normalizedHeaders = headers.map(h => 
      typeof h === 'string' ? h.toLowerCase().trim() : ''
    )

    // Check required columns
    for (const requiredCol of this.REQUIRED_COLUMNS) {
      if (!normalizedHeaders.includes(requiredCol.toLowerCase())) {
        errors.push(`Missing required column: ${requiredCol}`)
      }
    }

    // Check if at least one note column is present
    const hasNoteColumns = this.NOTE_COLUMNS.some(noteCol => 
      normalizedHeaders.includes(noteCol.toLowerCase())
    )

    if (!hasNoteColumns) {
      errors.push('At least one note column (noteCC, noteTP, noteDV) must be present')
    }

    // Check for duplicate headers
    const duplicates = normalizedHeaders.filter((header, index) => 
      normalizedHeaders.indexOf(header) !== index && header !== ''
    )
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate headers found: ${duplicates.join(', ')}`)
    }

    return { isValid: errors.length === 0, errors }
  }

  /**
   * Parse data rows from Excel
   */
  private async parseDataRows(headers: any[], dataRows: any[][]): Promise<{
    validData: ExcelNoteData[]
    errors: string[]
    warnings: string[]
  }> {
    const validData: ExcelNoteData[] = []
    const errors: string[] = []
    const warnings: string[] = []

    const headerMap = this.createHeaderMap(headers)

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowIndex = i + 2 // +2 because Excel is 1-indexed and we skipped header

      const extractResult = this.extractNoteDataFromRow(row, headerMap, rowIndex)
      
      if (extractResult.success && extractResult.data) {
        validData.push(extractResult.data)
      }
      
      errors.push(...extractResult.errors)
      warnings.push(...extractResult.warnings)
    }

    return { validData, errors, warnings }
  }

  /**
   * Parse data rows with progress tracking
   */
  private async parseDataRowsWithProgress(
    headers: any[], 
    dataRows: any[][],
    onProgress?: (progress: number, message: string) => void
  ): Promise<{
    validData: ExcelNoteData[]
    errors: string[]
    warnings: string[]
  }> {
    const validData: ExcelNoteData[] = []
    const errors: string[] = []
    const warnings: string[] = []

    const headerMap = this.createHeaderMap(headers)
    const totalRows = dataRows.length

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowIndex = i + 2 // +2 because Excel is 1-indexed and we skipped header

      const extractResult = this.extractNoteDataFromRow(row, headerMap, rowIndex)
      
      if (extractResult.success && extractResult.data) {
        validData.push(extractResult.data)
      }
      
      errors.push(...extractResult.errors)
      warnings.push(...extractResult.warnings)

      // Update progress
      if (onProgress && i % 10 === 0) {
        const progress = 40 + Math.round((i / totalRows) * 50)
        onProgress(progress, `Processing row ${i + 1} of ${totalRows}...`)
      }
    }

    return { validData, errors, warnings }
  }

  /**
   * Create header mapping for column access
   */
  private createHeaderMap(headers: any[]): Record<string, number> {
    const headerMap: Record<string, number> = {}
    
    headers.forEach((header, index) => {
      if (typeof header === 'string') {
        const normalizedHeader = header.toLowerCase().trim()
        headerMap[normalizedHeader] = index
      }
    })

    return headerMap
  }

  /**
   * Extract note data from a single row
   */
  private extractNoteDataFromRow(
    row: any[], 
    headerMap: Record<string, number>, 
    rowIndex: number
  ): { success: boolean; data?: ExcelNoteData; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Extract required fields
      const prenom = this.getCellValue(row, headerMap['prenom'])
      const nom = this.getCellValue(row, headerMap['nom'])
      const numeroetudiant = this.getCellValue(row, headerMap['numeroetudiant'])

      // Validate required fields
      if (!prenom?.trim()) {
        errors.push(`Row ${rowIndex}: Missing or empty 'prenom' field`)
      }
      if (!nom?.trim()) {
        errors.push(`Row ${rowIndex}: Missing or empty 'nom' field`)
      }
      if (!numeroetudiant?.trim()) {
        errors.push(`Row ${rowIndex}: Missing or empty 'numeroetudiant' field`)
      }

      // Extract optional fields
      const email = this.getCellValue(row, headerMap['email'])
      
      // Extract note fields
      const noteCC = this.parseNoteValue(this.getCellValue(row, headerMap['notecc']), 'noteCC', rowIndex, errors, warnings)
      const noteTP = this.parseNoteValue(this.getCellValue(row, headerMap['notetp']), 'noteTP', rowIndex, errors, warnings)
      const noteDV = this.parseNoteValue(this.getCellValue(row, headerMap['notedv']), 'noteDV', rowIndex, errors, warnings)

      // Check if at least one note is provided
      if (noteCC === undefined && noteTP === undefined && noteDV === undefined) {
        warnings.push(`Row ${rowIndex}: No notes provided for student ${prenom} ${nom}`)
      }

      // If there are critical errors, return failure
      if (errors.length > 0) {
        return { success: false, errors, warnings }
      }

      const data: ExcelNoteData = {
        prenom: prenom.trim(),
        nom: nom.trim(),
        numeroetudiant: numeroetudiant.trim(),
        email: email?.trim() || undefined,
        noteCC: noteCC,
        noteTP: noteTP,
        noteDV: noteDV
      }

      return { success: true, data, errors, warnings }

    } catch (error) {
      errors.push(`Row ${rowIndex}: Error processing row - ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { success: false, errors, warnings }
    }
  }

  /**
   * Parse and validate note values
   */
  private parseNoteValue(
    value: string | undefined, 
    fieldName: string, 
    rowIndex: number, 
    errors: string[], 
    warnings: string[]
  ): number | undefined {
    if (!value || value.trim() === '') {
      return undefined
    }

    const trimmedValue = value.trim()
    
    // Handle common decimal separators
    const normalizedValue = trimmedValue.replace(',', '.')
    const parsedValue = parseFloat(normalizedValue)

    if (isNaN(parsedValue)) {
      errors.push(`Row ${rowIndex}: Invalid ${fieldName} value '${value}' - must be a number`)
      return undefined
    }

    if (parsedValue < 0 || parsedValue > 20) {
      errors.push(`Row ${rowIndex}: ${fieldName} value '${parsedValue}' is out of range (0-20)`)
      return undefined
    }

    // Round to 2 decimal places
    const roundedValue = Math.round(parsedValue * 100) / 100

    if (roundedValue !== parsedValue) {
      warnings.push(`Row ${rowIndex}: ${fieldName} value '${parsedValue}' rounded to '${roundedValue}'`)
    }

    return roundedValue
  }

  /**
   * Get cell value safely
   */
  private getCellValue(row: any[], columnIndex: number): string {
    if (columnIndex === undefined || columnIndex < 0 || columnIndex >= row.length) {
      return ''
    }

    const value = row[columnIndex]
    
    if (value === null || value === undefined) {
      return ''
    }

    return String(value).trim()
  }

  /**
   * Validate complete note data
   */
  validateNoteData(data: ExcelNoteData): NotesValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required fields
    if (!data.prenom?.trim()) {
      errors.push('First name is required')
    }
    if (!data.nom?.trim()) {
      errors.push('Last name is required')
    }
    if (!data.numeroetudiant?.trim()) {
      errors.push('Student number is required')
    }

    // Validate email if provided
    if (data.email) {
      try {
        new Email(data.email)
      } catch (error) {
        errors.push('Invalid email format')
      }
    }

    // Validate student number
    if (data.numeroetudiant) {
      try {
        new StudentNumber(data.numeroetudiant)
      } catch (error) {
        errors.push('Invalid student number format')
      }
    }

    // Validate notes
    if (data.noteCC !== undefined && (data.noteCC < 0 || data.noteCC > 20)) {
      errors.push('CC note must be between 0 and 20')
    }
    if (data.noteTP !== undefined && (data.noteTP < 0 || data.noteTP > 20)) {
      errors.push('TP note must be between 0 and 20')
    }
    if (data.noteDV !== undefined && (data.noteDV < 0 || data.noteDV > 20)) {
      errors.push('DV note must be between 0 and 20')
    }

    // Check if at least one note is provided
    if (data.noteCC === undefined && data.noteTP === undefined && data.noteDV === undefined) {
      warnings.push('No notes provided')
    }

    const isValid = errors.length === 0

    if (isValid) {
      return {
        isValid: true,
        errors: [],
        warnings,
        data: {
          firstname: data.prenom.trim(),
          lastname: data.nom.trim(),
          email: data.email?.trim(),
          numeroEtudiant: data.numeroetudiant.trim(),
          noteCC: data.noteCC,
          noteTP: data.noteTP,
          noteDV: data.noteDV
        }
      }
    }

    return { isValid: false, errors, warnings }
  }

  /**
   * Get file format information
   */
  getFileFormatInfo(): {
    supportedFormats: string[]
    maxFileSize: string
    maxRows: number
    requiredColumns: string[]
    optionalColumns: string[]
    noteColumns: string[]
  } {
    return {
      supportedFormats: ['.xlsx', '.xls'],
      maxFileSize: '10MB',
      maxRows: this.MAX_ROWS,
      requiredColumns: this.REQUIRED_COLUMNS,
      optionalColumns: this.OPTIONAL_COLUMNS.filter(col => !this.NOTE_COLUMNS.includes(col)),
      noteColumns: this.NOTE_COLUMNS
    }
  }
} 