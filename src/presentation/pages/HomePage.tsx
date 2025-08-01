"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles, Menu, X } from "lucide-react"
import { useState } from "react"


export function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100">
        {/* Geometric shapes - responsive positioning */}
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-slate-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] sm:w-[600px] sm:h-[450px] lg:w-[800px] lg:h-[600px] bg-gradient-to-r from-red-500/3 to-slate-500/3 rounded-full blur-3xl"></div>
        
        {/* Triangular decorative elements - responsive positioning */}
        <div className="absolute top-1/4 left-5 sm:left-20 w-0 h-0 border-l-[20px] sm:border-l-[30px] border-l-transparent border-b-[35px] sm:border-b-[50px] border-b-red-500/20 border-r-[20px] sm:border-r-[30px] border-r-transparent transform rotate-45"></div>
        <div className="absolute top-1/3 right-8 sm:right-32 w-0 h-0 border-l-[15px] sm:border-l-[25px] border-l-transparent border-b-[25px] sm:border-b-[40px] border-b-red-500/15 border-r-[15px] sm:border-r-[25px] border-r-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/4 left-1/4 w-0 h-0 border-l-[15px] sm:border-l-[20px] border-l-transparent border-b-[25px] sm:border-b-[35px] border-b-red-500/25 border-r-[15px] sm:border-r-[20px] border-r-transparent transform rotate-90"></div>
        <div className="absolute top-2/3 right-1/3 w-0 h-0 border-l-[20px] sm:border-l-[35px] border-l-transparent border-b-[35px] sm:border-b-[60px] border-b-red-500/10 border-r-[20px] sm:border-r-[35px] border-r-transparent transform -rotate-30"></div>
        <div className="absolute bottom-1/3 right-5 sm:right-20 w-0 h-0 border-l-[10px] sm:border-l-[15px] border-l-transparent border-b-[15px] sm:border-b-[25px] border-b-red-500/30 border-r-[10px] sm:border-r-[15px] border-r-transparent transform rotate-15"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Esprit Logo"
                width={140}
                height={45}
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center">
              <a href="#features" className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium text-sm lg:text-base">
                Fonctionnalités
              </a>
              <a href="#about" className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium text-sm lg:text-base">
                À propos
              </a>
              <a href="#contact" className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium text-sm lg:text-base">
                Contact
              </a>
              <Link href="/login" className="bg-black text-white px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 text-sm lg:text-base">
                Connexion
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-red-500 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200">
              <nav className="flex flex-col space-y-2 p-4">
                <a 
                  href="#features" 
                  className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium py-2 px-3 rounded-md hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Fonctionnalités
                </a>
                <a 
                  href="#about" 
                  className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium py-2 px-3 rounded-md hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  À propos
                </a>
                <a 
                  href="#contact" 
                  className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium py-2 px-3 rounded-md hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <Link 
                  href="/login" 
                  className="bg-black text-white px-4 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium shadow-lg border border-red-100">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Plateforme éducative nouvelle génération</span>
              <span className="sm:hidden">Plateforme éducative</span>
            </div>

            {/* Hero Text */}
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight px-2">
                Bienvenue sur
                <span className="block text-red-500 mt-2 sm:mt-4">Esprit</span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light px-4">
                La plateforme qui révolutionne l&apos;apprentissage.
                <br className="hidden sm:block" />
                <span className="font-medium text-gray-900">Se former autrement</span> avec élégance et simplicité.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-4 sm:pt-6 lg:pt-8 px-4">
              <Link 
                href="/gestion-classroom" 
                className="group inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-black text-white rounded-full font-semibold text-base sm:text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <button className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full font-semibold text-base sm:text-lg hover:bg-white hover:text-red-500 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200">
                Découvrir la plateforme
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-xs sm:text-sm">
                © 2024 Esprit. Tous droits réservés.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 sm:gap-6">
              <a href="#" className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-xs sm:text-sm">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-xs sm:text-sm">
                Conditions d&apos;utilisation
              </a>
              <a href="#" className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-xs sm:text-sm">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
} 