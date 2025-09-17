"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PillBottle, ArrowLeft, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  variant?: 'auth' | 'app'
  showBackButton?: boolean
  backHref?: string
  title?: string
  actions?: React.ReactNode
}

export default function Navbar({ 
  variant = 'auth', 
  showBackButton = false, 
  backHref = '/',
  title,
  actions 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="mobile-padding py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center justify-between" role="navigation">
            {/* Left side - Logo/Back button */}
            <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
              {showBackButton ? (
                <Link 
                  href={backHref}
                  className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 group"
                  aria-label="Go back"
                >
                  <div className="p-2 sm:p-3 lg:p-4 bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl group-hover:bg-white/20 transition-all duration-300 border border-white/10">
                    <ArrowLeft className="text-purple-400 h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                  </div>
                  {title && (
                    <div className="hidden sm:block">
                      <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{title}</h1>
                    </div>
                  )}
                </Link>
              ) : (
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 group"
                  aria-label="PillPal Home"
                >
                  <div className="p-2 sm:p-3 lg:p-4 bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl group-hover:bg-white/20 transition-all duration-300 border border-white/10 group-hover:border-white/20">
                    <PillBottle className="text-purple-400 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-4xl font-bold text-white group-hover:text-purple-100 transition-colors">
                      PillPal
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400 group-hover:text-gray-300 transition-colors hidden sm:block">
                      Your AI Health Companion
                    </p>
                  </div>
                </Link>
              )}
            </div>

            {/* Center - Page title for mobile when back button is shown */}
            {showBackButton && title && (
              <div className="flex-1 text-center sm:hidden">
                <h1 className="text-lg font-bold text-white truncate">{title}</h1>
              </div>
            )}

            {/* Right side - Actions or Auth links */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              {variant === 'auth' && isAuthPage && (
                <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
                  {pathname === '/login' ? (
                    <Link
                      href="/register"
                      className="text-sm lg:text-base xl:text-lg font-medium text-gray-300 hover:text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      Create Account
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="text-sm lg:text-base xl:text-lg font-medium text-gray-300 hover:text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}

              {actions && (
                <>
                  {/* Desktop actions */}
                  <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
                    {actions}
                  </div>

                  {/* Mobile menu button */}
                  <div className="sm:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10"
                      aria-label="Toggle menu"
                    >
                      {isMobileMenuOpen ? (
                        <X className="h-5 w-5 text-white" />
                      ) : (
                        <Menu className="h-5 w-5 text-white" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu dropdown */}
          {isMobileMenuOpen && actions && (
            <div className="sm:hidden mt-4 p-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col space-y-3">
                {actions}
                {variant === 'auth' && isAuthPage && (
                  <div className="pt-3 border-t border-white/10">
                    {pathname === '/login' ? (
                      <Link
                        href="/register"
                        className="block text-center py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Create Account
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="block text-center py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}