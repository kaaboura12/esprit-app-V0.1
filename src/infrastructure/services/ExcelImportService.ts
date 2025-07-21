import * as XLSX from 'xlsx'
import { Email } from '@/core/value-objects/Email'
import { StudentNumber } from '@/core/value-objects/StudentNumber'

/**
 * Excel Import Service - Infrastructure layer
 * This service handles Excel file parsing and data extraction
 */

export interface ExcelStudentData {
  prenom: string
  nom: string
  email: string
  numeroetudiant: string
  datenaissance?: string
}

export interface ImportResult {
  success: boolean
  data?: ExcelStudentData[]
  errors?: string[]
  totalRows?: number
  validRows?: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  data?: {
    firstname: string
    lastname: string
    email: string
    numeroEtudiant: string
    dateNaissance?: Date
  }
}

export interface BatchProcessResult {
  batchNumber: number
  processed: number
  successful: number
  failed: number
  errors: string[]
}

export class ExcelImportService {
  private readonly REQUIRED_COLUMNS = ['prenom', 'nom', 'email', 'numeroetudiant']
  private readonly OPTIONAL_COLUMNS = ['datenaissance']
  private readonly MAX_ROWS = 1000 // Prevent processing extremely large files
  private readonly BATCH_SIZE = 50 // Process in batches for better performance

  /**
   * Parse Excel file buffer and extract student data
   */
  async parseExcelFile(buffer: Buffer): Promise<ImportResult> {
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
      
      return {
        success: results.validData.length > 0,
        data: results.validData,
        errors: results.errors,
        totalRows: dataRows.length,
        validRows: results.validData.length
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
  ): Promise<ImportResult> {
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

      onProgress?.(40, 'Processing student data...')
      
      // Parse and validate each row with progress tracking
      const results = await this.parseDataRowsWithProgress(headers, dataRows, onProgress)
      
      onProgress?.(100, 'Validation complete')
      
      return {
        success: results.validData.length > 0,
        data: results.validData,
        errors: results.errors,
        totalRows: dataRows.length,
        validRows: results.validData.length
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
    processor: (batch: T[], batchNumber: number) => Promise<BatchProcessResult>
  ): Promise<BatchProcessResult[]> {
    const results: BatchProcessResult[] = []
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
          errors: [error instanceof Error ? error.message : 'Unknown error']
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
      return { isValid: false, errors: ['No headers found in the Excel file'] }
    }

    // Normalize headers to lowercase for comparison
    const normalizedHeaders = headers.map(h => 
      typeof h === 'string' ? h.toLowerCase().trim() : ''
    )

    // Check for required columns
    for (const requiredCol of this.REQUIRED_COLUMNS) {
      if (!normalizedHeaders.includes(requiredCol.toLowerCase())) {
        errors.push(`Missing required column: ${requiredCol}`)
      }
    }

    // Check for duplicate headers
    const duplicates = normalizedHeaders.filter((item, index) => 
      item !== '' && normalizedHeaders.indexOf(item) !== index
    )
    if (duplicates.length > 0) {
      errors.push(`Duplicate column headers found: ${duplicates.join(', ')}`)
    }

    return { isValid: errors.length === 0, errors }
  }

  /**
   * Parse and validate data rows
   */
  private async parseDataRows(headers: any[], dataRows: any[][]): Promise<{
    validData: ExcelStudentData[]
    errors: string[]
  }> {
    const validData: ExcelStudentData[] = []
    const errors: string[] = []

    // Create header mapping
    const headerMap = this.createHeaderMap(headers)

    for (let i = 0; i < dataRows.length; i++) {
      const rowIndex = i + 2 // Excel row number (1-indexed + header row)
      const row = dataRows[i]

      try {
        const studentData = this.extractStudentDataFromRow(row, headerMap, rowIndex)
        
        if (studentData.success && studentData.data) {
          validData.push(studentData.data)
        } else {
          errors.push(...studentData.errors.map(err => `Row ${rowIndex}: ${err}`))
        }
      } catch (error) {
        errors.push(`Row ${rowIndex}: Unexpected error processing row`)
      }
    }

    return { validData, errors }
  }

  /**
   * Parse and validate data rows with progress tracking
   */
  private async parseDataRowsWithProgress(
    headers: any[], 
    dataRows: any[][],
    onProgress?: (progress: number, message: string) => void
  ): Promise<{
    validData: ExcelStudentData[]
    errors: string[]
  }> {
    const validData: ExcelStudentData[] = []
    const errors: string[] = []

    // Create header mapping
    const headerMap = this.createHeaderMap(headers)

    for (let i = 0; i < dataRows.length; i++) {
      const rowIndex = i + 2 // Excel row number (1-indexed + header row)
      const row = dataRows[i]

      try {
        const studentData = this.extractStudentDataFromRow(row, headerMap, rowIndex)
        
        if (studentData.success && studentData.data) {
          validData.push(studentData.data)
        } else {
          errors.push(...studentData.errors.map(err => `Row ${rowIndex}: ${err}`))
        }
      } catch (error) {
        errors.push(`Row ${rowIndex}: Unexpected error processing row`)
      }

      // Update progress
      if (onProgress && i % 10 === 0) {
        const progress = 40 + Math.round((i / dataRows.length) * 50)
        onProgress(progress, `Processing row ${i + 1} of ${dataRows.length}...`)
      }
    }

    return { validData, errors }
  }

  /**
   * Create mapping from headers to column indices
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
   * Extract student data from a single row
   */
  private extractStudentDataFromRow(
    row: any[], 
    headerMap: Record<string, number>, 
    rowIndex: number
  ): { success: boolean; data?: ExcelStudentData; errors: string[] } {
    const errors: string[] = []
    
    try {
      // Extract required fields
      const prenom = this.getCellValue(row, headerMap['prenom'])
      const nom = this.getCellValue(row, headerMap['nom'])
      const email = this.getCellValue(row, headerMap['email'])
      const numeroetudiant = this.getCellValue(row, headerMap['numeroetudiant'])
      
      // Extract optional fields
      const datenaissance = this.getCellValue(row, headerMap['datenaissance'])

      // Validate required fields
      if (!prenom || prenom.trim() === '') {
        errors.push('First name (prenom) is required')
      }
      if (!nom || nom.trim() === '') {
        errors.push('Last name (nom) is required')
      }
      if (!email || email.trim() === '') {
        errors.push('Email is required')
      }
      if (!numeroetudiant || numeroetudiant.trim() === '') {
        errors.push('Student number (numeroetudiant) is required')
      }

      // If we have validation errors, return early
      if (errors.length > 0) {
        return { success: false, errors }
      }

      // Additional validation using domain value objects
      try {
        new Email(email.trim())
      } catch (error) {
        errors.push(`Invalid email format: ${email}`)
      }

      try {
        new StudentNumber(numeroetudiant.trim())
      } catch (error) {
        errors.push(`Invalid student number format: ${numeroetudiant}`)
      }

      // Validate date format if provided
      let formattedDate: string | undefined
      if (datenaissance && datenaissance.trim() !== '') {
        const dateValidation = this.validateAndFormatDate(datenaissance.trim())
        if (!dateValidation.isValid) {
          errors.push(`Invalid date format: ${datenaissance}`)
        } else {
          formattedDate = dateValidation.formattedDate
        }
      }

      if (errors.length > 0) {
        return { success: false, errors }
      }

      return {
        success: true,
        data: {
          prenom: prenom.trim(),
          nom: nom.trim(),
          email: email.trim(),
          numeroetudiant: numeroetudiant.trim(),
          datenaissance: formattedDate
        },
        errors: []
      }

    } catch (error) {
      return { 
        success: false, 
        errors: [`Failed to process row data: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      }
    }
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
   * Validate and format date
   */
  private validateAndFormatDate(dateStr: string): { isValid: boolean; formattedDate?: string } {
    try {
      // Handle various date formats
      let date: Date
      
      // Try parsing Excel date number
      if (/^\d+(\.\d+)?$/.test(dateStr)) {
        const excelDate = parseFloat(dateStr)
        date = new Date((excelDate - 25569) * 86400 * 1000)
      } else {
        // Try parsing as regular date string
        date = new Date(dateStr)
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return { isValid: false }
      }
      
      // Check if date is reasonable (not too far in the past or future)
      const now = new Date()
      const minDate = new Date(now.getFullYear() - 100, 0, 1)
      const maxDate = new Date(now.getFullYear() + 10, 11, 31)
      
      if (date < minDate || date > maxDate) {
        return { isValid: false }
      }
      
      // Format as MySQL date string
      const formattedDate = date.toISOString().split('T')[0]
      
      return { isValid: true, formattedDate }
    } catch (error) {
      return { isValid: false }
    }
  }

  /**
   * Validate complete student data before database insertion
   */
  validateStudentData(data: ExcelStudentData): ValidationResult {
    const errors: string[] = []
    
    try {
      // Validate using domain value objects
      const email = new Email(data.email)
      const studentNumber = new StudentNumber(data.numeroetudiant)
      
      // Parse date if provided
      let dateNaissance: Date | undefined
      if (data.datenaissance) {
        dateNaissance = new Date(data.datenaissance)
        if (isNaN(dateNaissance.getTime())) {
          errors.push('Invalid birth date format')
        }
      }
      
      if (errors.length > 0) {
        return { isValid: false, errors }
      }
      
      return {
        isValid: true,
        errors: [],
        data: {
          firstname: data.prenom,
          lastname: data.nom,
          email: data.email,
          numeroEtudiant: data.numeroetudiant,
          dateNaissance
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Validation error')
      return { isValid: false, errors }
    }
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
  } {
    return {
      supportedFormats: ['.xlsx', '.xls'],
      maxFileSize: '10MB',
      maxRows: this.MAX_ROWS,
      requiredColumns: this.REQUIRED_COLUMNS,
      optionalColumns: this.OPTIONAL_COLUMNS
    }
  }
} 