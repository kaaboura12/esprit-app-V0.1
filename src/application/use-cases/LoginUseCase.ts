import { AuthRepository } from "@/core/interfaces/AuthRepository"
import { TokenService } from "@/core/interfaces/TokenService"
import { Email } from "@/core/value-objects/Email"
import { Password } from "@/core/value-objects/Password"
import { AuthToken } from "@/core/entities/AuthToken"

/**
 * Login Use Case - Application layer
 * This handles teacher authentication business logic
 */
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(email: string, password: string, rememberMe: boolean = false): Promise<{
    success: boolean
    token?: AuthToken
    error?: string
  }> {
    try {
      // Validate input using value objects
      const emailVO = new Email(email)
      const passwordVO = new Password(password)

      // Find teacher by email
      const teacher = await this.authRepository.findTeacherByEmail(emailVO)
      if (!teacher) {
        return {
          success: false,
          error: 'Invalid credentials'
        }
      }

      // Verify password
      const isPasswordValid = await this.authRepository.verifyPassword(
        passwordVO.getValue(),
        teacher.getHashedPassword()
      )

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid credentials'
        }
      }

      // Generate JWT token with remember me option
      const authToken = await this.tokenService.generateToken(teacher, rememberMe)

      return {
        success: true,
        token: authToken
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  }
} 