"use client"

import { useState } from "react"
import { X, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export function PasswordResetModal({ isOpen, onClose, email }: PasswordResetModalProps) {
  const [step, setStep] = useState<'code' | 'password'>('code')
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Veuillez saisir un code de 6 caractères')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (data.success) {
        setStep('password')
        setSuccess('Code vérifié avec succès')
        setError(null)
      } else {
        setError(data.error || 'Code invalide')
      }
    } catch (err) {
      console.error('Verify code error:', err)
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Veuillez saisir tous les champs')
      return
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, newPassword }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Mot de passe réinitialisé avec succès')
        setTimeout(() => {
          onClose()
          // Reset form
          setStep('code')
          setCode("")
          setNewPassword("")
          setConfirmPassword("")
          setError(null)
          setSuccess(null)
        }, 2000)
      } else {
        setError(data.error || 'Erreur lors de la réinitialisation')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Enhanced Beautiful Background - Same as LoginPage */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100">
        {/* Enhanced Geometric shapes */}
        <div className="absolute top-10 left-20 w-80 h-80 bg-gradient-to-r from-red-500/6 to-pink-500/4 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-gradient-to-l from-slate-500/5 to-blue-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-red-500/3 to-slate-500/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Triangular decorative elements */}
        <div className="absolute top-1/4 left-20 w-0 h-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-red-500/20 border-r-[30px] border-r-transparent transform rotate-45"></div>
        <div className="absolute top-1/3 right-32 w-0 h-0 border-l-[25px] border-l-transparent border-b-[40px] border-b-red-500/15 border-r-[25px] border-r-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/4 left-1/4 w-0 h-0 border-l-[20px] border-l-transparent border-b-[35px] border-b-red-500/25 border-r-[20px] border-r-transparent transform rotate-90"></div>
        <div className="absolute top-2/3 right-1/3 w-0 h-0 border-l-[35px] border-l-transparent border-b-[60px] border-b-red-500/10 border-r-[35px] border-r-transparent transform -rotate-30"></div>
        <div className="absolute bottom-1/3 right-20 w-0 h-0 border-l-[15px] border-l-transparent border-b-[25px] border-b-red-500/30 border-r-[15px] border-r-transparent transform rotate-15"></div>
        
        {/* Enhanced grid pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M40 40c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-20 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm20-20c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-20 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-slate-400/20 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-red-300/40 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Modal Content */}
      <div className="relative z-10 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 max-w-md w-full p-6 space-y-6 hover:shadow-3xl transition-all duration-500">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <div></div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            {step === 'code' ? 'Vérification du code' : 'Nouveau mot de passe'}
          </h2>
          <p className="text-gray-600 font-medium">
            {step === 'code' ? 'Saisissez le code envoyé à votre email' : 'Choisissez un nouveau mot de passe sécurisé'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === 'code' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 'code' ? '1' : <CheckCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1 h-1 bg-gray-200 rounded">
            <div className={`h-full rounded transition-all duration-300 ${
              step === 'password' ? 'bg-green-500' : 'bg-gray-200'
            }`} style={{ width: step === 'password' ? '100%' : '0%' }}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === 'password' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step === 'password' ? '2' : '2'}
          </div>
        </div>

        {/* Email display */}
        <div className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Email de récupération</p>
              <p className="text-sm text-gray-900 font-medium">{email}</p>
            </div>
          </div>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Step 1: Code Verification */}
        {step === 'code' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-gray-900 font-medium hover:border-gray-300 text-center text-xl font-mono tracking-widest"
                placeholder="123456"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Saisissez le code de 6 caractères envoyé à votre email
              </p>
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={isLoading || code.length !== 6}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-black to-gray-800 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                              {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Vérification...</span>
                  </div>
                ) : (
                  'Vérifier le code'
                )}
              </div>
            </button>
          </div>
        )}

        {/* Step 2: New Password */}
        {step === 'password' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-gray-900 font-medium hover:border-gray-300"
                  placeholder="Nouveau mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Le mot de passe doit contenir :</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li className={newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                    Au moins 6 caractères
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    Au moins une lettre majuscule
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    Au moins une lettre minuscule
                  </li>
                  <li className={/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    Au moins un chiffre
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-gray-900 font-medium hover:border-gray-300"
                  placeholder="Confirmer le mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-black to-gray-800 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Réinitialisation...</span>
                  </div>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 