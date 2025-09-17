"use client"

import BottomNavigation from '@/components/bottom-navigation'

interface AppLayoutProps {
  children: React.ReactNode
  showBottomNav?: boolean
}

export default function AppLayout({ children, showBottomNav = true }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      {/* Floating Orbs */}
      <div className="floating-orb w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-purple-500/20 -top-16 sm:-top-24 lg:-top-32 -left-16 sm:-left-24 lg:-left-32" aria-hidden="true"></div>
      <div className="floating-orb w-24 sm:w-32 lg:w-48 h-24 sm:h-32 lg:h-48 bg-cyan-500/15 top-1/3 -right-12 sm:-right-16 lg:-right-24" style={{ animationDelay: '-2s' }} aria-hidden="true"></div>
      <div className="floating-orb w-20 sm:w-24 lg:w-32 h-20 sm:h-24 lg:h-32 bg-emerald-500/20 bottom-1/4 left-1/4" style={{ animationDelay: '-4s' }} aria-hidden="true"></div>

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom spacing for navigation */}
      {showBottomNav && <div className="h-20 sm:h-24" aria-hidden="true"></div>}

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </main>
  )
}