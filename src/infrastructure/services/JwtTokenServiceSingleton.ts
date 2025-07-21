import { JwtTokenService } from './JwtTokenService'

/**
 * Singleton JWT Token Service
 * Ensures consistent JWT secret across the application
 */
class JwtTokenServiceSingleton {
  private static instance: JwtTokenService | null = null

  static getInstance(): JwtTokenService {
    if (!JwtTokenServiceSingleton.instance) {
      JwtTokenServiceSingleton.instance = new JwtTokenService()
    }
    return JwtTokenServiceSingleton.instance
  }
}

export { JwtTokenServiceSingleton } 