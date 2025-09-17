"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Lightbulb, TrendingUp } from 'lucide-react'

export default function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { 
      href: '/', 
      icon: Home, 
      label: 'Dashboard',
      testId: 'nav-dashboard'
    },
    { 
      href: '/schedule', 
      icon: Calendar, 
      label: 'Schedule',
      testId: 'nav-schedule'
    },
    { 
      href: '/health-tips', 
      icon: Lightbulb, 
      label: 'Tips',
      testId: 'nav-health-tips'
    },
    { 
      href: '/progress', 
      icon: TrendingUp, 
      label: 'Progress',
      testId: 'nav-progress'
    },
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 p-3 sm:p-4 z-30 safe-area-bottom" 
      role="navigation" 
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map(({ href, icon: Icon, label, testId }) => {
            const isActive = pathname === href
            
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-purple-500/20 text-purple-300 scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }
                `}
                data-testid={testId}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon 
                  size={20} 
                  className={`
                    mb-1 transition-all duration-200
                    ${isActive ? 'text-purple-300' : 'group-hover:scale-110'}
                  `} 
                />
                <span className={`
                  text-xs font-medium transition-all duration-200
                  ${isActive ? 'text-purple-200' : ''}
                `}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}