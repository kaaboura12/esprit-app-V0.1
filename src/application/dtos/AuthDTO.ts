/**
 * Authentication DTOs - Application layer
 * These define the structure for transferring authentication data between layers
 */

/**
 * Request DTO for teacher login
 */
export interface LoginRequestDTO {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Response DTO for successful authentication
 */
export interface AuthResponseDTO {
  success: boolean
  token?: string
  teacher?: {
    id: number
    firstname: string
    lastname: string
    email: string
    departement: string
    photoUrl?: string
    role: string
  }
  expiresAt?: string // ISO string format
  error?: string
}

/**
 * Request DTO for token validation
 */
export interface ValidateTokenRequestDTO {
  token: string
}

/**
 * Response DTO for token validation
 */
export interface ValidateTokenResponseDTO {
  valid: boolean
  teacher?: {
    id: number
    firstname: string
    lastname: string
    email: string
    departement: string
    photoUrl?: string
    role: string
  }
  expiresAt?: string
  error?: string
}

/**
 * Request DTO for token refresh
 */
export interface RefreshTokenRequestDTO {
  token: string
}

/**
 * Response DTO for token refresh
 */
export interface RefreshTokenResponseDTO {
  success: boolean
  token?: string
  expiresAt?: string
  error?: string
} 