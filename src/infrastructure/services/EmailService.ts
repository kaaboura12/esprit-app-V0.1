import nodemailer from 'nodemailer'

/**
 * Email Service - Infrastructure layer
 * This service handles email operations like sending password reset emails
 */
export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER || 'sayariemin@gmail.com',
        to: email,
        subject: 'Code de vérification - Réinitialisation de mot de passe ESPRIT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; margin: 0; font-size: 28px;">ESPRIT</h1>
                <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">École Supérieure Privée d'Ingénierie et de Technologies</p>
              </div>
              
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Code de vérification</h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Bonjour,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Vous avez demandé la réinitialisation de votre mot de passe pour votre compte enseignant ESPRIT.
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Utilisez le code de vérification ci-dessous pour continuer :
              </p>
              
              <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                <p style="color: #991b1b; font-size: 14px; margin: 0 0 15px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Code de vérification
                </p>
                <div style="background-color: #fee2e2; border: 2px dashed #fca5a5; border-radius: 8px; padding: 20px; margin: 10px 0;">
                  <p style="color: #dc2626; font-size: 32px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 8px;">
                    ${code}
                  </p>
                </div>
                <p style="color: #991b1b; font-size: 12px; margin: 15px 0 0 0; font-weight: 500;">
                  ⏰ Ce code expire dans 15 minutes
                </p>
              </div>
              
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #0369a1; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>🔒 Sécurité :</strong> Ne partagez jamais ce code avec qui que ce soit. L'équipe ESPRIT ne vous demandera jamais ce code par téléphone ou email.
                </p>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et contacter immédiatement l'administrateur système.
              </p>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Cordialement,<br>
                  <strong>L'équipe technique ESPRIT</strong>
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                  Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
              </div>
            </div>
          </div>
        `
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Password reset verification code sent successfully to: ${email}`)
      
    } catch (error) {
      console.error('Error sending password reset email:', error)
      throw new Error('Failed to send password reset email')
    }
  }
} 