import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100">
        {/* Geometric shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-red-500/3 to-slate-500/3 rounded-full blur-3xl"></div>
        
        {/* Triangular decorative elements */}
        <div className="absolute top-1/4 left-20 w-0 h-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-red-500/20 border-r-[30px] border-r-transparent transform rotate-45"></div>
        <div className="absolute top-1/3 right-32 w-0 h-0 border-l-[25px] border-l-transparent border-b-[40px] border-b-red-500/15 border-r-[25px] border-r-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/4 left-1/4 w-0 h-0 border-l-[20px] border-l-transparent border-b-[35px] border-b-red-500/25 border-r-[20px] border-r-transparent transform rotate-90"></div>
        <div className="absolute top-2/3 right-1/3 w-0 h-0 border-l-[35px] border-l-transparent border-b-[60px] border-b-red-500/10 border-r-[35px] border-r-transparent transform -rotate-30"></div>
        <div className="absolute bottom-1/3 right-20 w-0 h-0 border-l-[15px] border-l-transparent border-b-[25px] border-b-red-500/30 border-r-[15px] border-r-transparent transform rotate-15"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Esprit Logo"
                width={140}
                height={45}
                className="h-10 w-auto"
              />
            </div>
            <nav className="flex space-x-4 md:space-x-8 items-center">
              <a href="#features" className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium text-sm md:text-base">
                Fonctionnalités
              </a>
              <a href="#about" className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium text-sm md:text-base">
                À propos
              </a>
              <a href="#contact" className="text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium text-sm md:text-base">
                Contact
              </a>
              <Link href="/login" className="bg-black text-white px-4 md:px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 text-sm md:text-base">
                Connexion
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex items-center justify-center min-h-screen px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-red-600 px-6 py-3 rounded-full text-sm font-medium shadow-lg border border-red-100">
              <Sparkles className="w-4 h-4" />
              <span>Plateforme éducative nouvelle génération</span>
            </div>

            {/* Hero Text */}
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Bienvenue sur
                <span className="block text-red-500 mt-4">Esprit</span>
              </h1>
              
              <p className="text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light">
                La plateforme qui révolutionne l&apos;apprentissage.
                <br />
                <span className="font-medium text-gray-900">Se former autrement</span> avec élégance et simplicité.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link href="/gestion-classroom" className="group inline-flex items-center justify-center px-10 py-4 bg-black text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                <span>Commencer maintenant</span>
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <button className="inline-flex items-center justify-center px-10 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full font-semibold text-lg hover:bg-white hover:text-red-500 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200">
                Découvrir la plateforme
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                © 2024 Esprit. Tous droits réservés.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-sm">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-sm">
                Conditions d&apos;utilisation
              </a>
              <a href="#" className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-sm">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
} 