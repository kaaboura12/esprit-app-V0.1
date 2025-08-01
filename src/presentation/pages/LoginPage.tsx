"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { useState } from "react"
import { LoginRequestDTO, AuthResponseDTO } from "@/application/dtos/AuthDTO"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const loginRequest: LoginRequestDTO = {
        email,
        password,
        rememberMe: rememberMe
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      })

      const data: AuthResponseDTO = await response.json()

      if (data.success && data.token && data.teacher) {
        // Store token in localStorage for client-side access (optional)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('teacher', JSON.stringify(data.teacher))
        }

        // Redirect to dashboard
        window.location.href = '/gestion-classroom'
      } else {
        setError(data.error || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Beautiful Background */}
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="flex items-center space-x-3 justify-center mb-8">
              <Image
                src="/logo.png"
                alt="Esprit Logo"
                width={120}
                height={38}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Enhanced Login Card */}
          <div className="relative">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-slate-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 space-y-8 hover:shadow-3xl transition-all duration-500 group">
              {/* Enhanced Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                  Connexion
                </h2>
                <p className="text-gray-600 font-medium">
                  Accédez à votre espace enseignant
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4" />
                  <span>Sécurisé et professionnel</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Enhanced Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Enhanced Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-red-500" />
                    Adresse email
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-gray-900 font-medium hover:border-gray-300 group-hover:shadow-lg"
                      placeholder="votre.email@esprit.edu"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Enhanced Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-red-500" />
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-gray-900 font-medium hover:border-gray-300 group-hover:shadow-lg"
                      placeholder="••••••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Enhanced Remember Me */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center group">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded transition-all duration-200 group-hover:scale-110"
                      disabled={isLoading}
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                      Se souvenir de moi
                    </label>
                  </div>
                  {rememberMe && (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">30 jours</span>
                    </div>
                  )}
                </div>

                {/* Enhanced Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-black to-gray-800 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Connexion en cours...</span>
                      </div>
                    ) : (
                      <>
                        <span>Se connecter</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </div>
                </button>
              </form>


            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Vous n&apos;avez pas de compte ?{" "}
              <a href="#" className="text-red-500 hover:text-red-600 transition-colors font-semibold hover:underline">
                Contactez l&apos;administrateur
              </a>
            </p>
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <a href="#" className="hover:text-red-500 transition-colors font-medium">
                Politique de confidentialité
              </a>
              <span>•</span>
              <a href="#" className="hover:text-red-500 transition-colors font-medium">
                Conditions d&apos;utilisation
              </a>
              <span>•</span>
              <a href="#" className="hover:text-red-500 transition-colors font-medium">
                Support technique
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 