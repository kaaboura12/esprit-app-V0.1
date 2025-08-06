import { PasswordResetTokenRepository } from "@/core/interfaces/PasswordResetTokenRepository"
import { PasswordResetToken } from "@/core/entities/PasswordResetToken"
import { Email } from "@/core/value-objects/Email"
import { supabase } from "@/infrastructure/config/database"

/**
 * Supabase Password Reset Token Repository Implementation - Infrastructure layer
 */
export class MySQLPasswordResetTokenRepository implements PasswordResetTokenRepository {
  
  async save(token: PasswordResetToken): Promise<void> {
    try {
      // First, delete any existing tokens for this email
      await this.deleteByEmail(token.getEmailValue())
      
      const { error } = await supabase
        .from('password_reset_tokens')
        .insert([
          {
            id: token.getId(),
            email: token.getEmailValue(),
            code: token.getCode(),
            expires_at: token.getExpiresAt().toISOString(),
            is_used: token.getIsUsed(),
            created_at: token.getCreatedAt().toISOString()
          }
        ])
      
      if (error) throw error
    } catch (error) {
      console.error('Error saving password reset token:', error)
      throw new Error('Database error occurred while saving password reset token')
    }
  }

  async findByEmail(email: string): Promise<PasswordResetToken | null> {
    try {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      if (!data) return null
      
      return new PasswordResetToken(
        data.id,
        new Email(data.email),
        data.code,
        new Date(data.expires_at),
        data.is_used,
        new Date(data.created_at)
      )
    } catch (error) {
      console.error('Error finding password reset token by email:', error)
      throw new Error('Database error occurred while finding password reset token')
    }
  }

  async findByCode(code: string): Promise<PasswordResetToken | null> {
    try {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('code', code)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      if (!data) return null
      
      return new PasswordResetToken(
        data.id,
        new Email(data.email),
        data.code,
        new Date(data.expires_at),
        data.is_used,
        new Date(data.created_at)
      )
    } catch (error) {
      console.error('Error finding password reset token by code:', error)
      throw new Error('Database error occurred while finding password reset token')
    }
  }

  async deleteByEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('email', email)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting password reset tokens by email:', error)
      throw new Error('Database error occurred while deleting password reset tokens')
    }
  }

  async deleteExpired(): Promise<void> {
    try {
      const { error } = await supabase
        .from('password_reset_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString())
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting expired password reset tokens:', error)
      throw new Error('Database error occurred while deleting expired tokens')
    }
  }
} 