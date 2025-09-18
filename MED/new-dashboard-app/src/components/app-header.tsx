"use client"

import { Button } from '@/components/ui/button'
import { Phone, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { SettingsDialog } from '@/components/settings-dialog'
import { useState } from 'react'

interface AppHeaderProps {
  title?: string
  subtitle?: string
  greeting?: string
  dateString?: string
  onEmergencyContacts?: () => void
  children?: React.ReactNode
}

export default function AppHeader({ 
  title,
  subtitle, 
  greeting,
  dateString,
  onEmergencyContacts,
  children 
}: AppHeaderProps) {
  const { logout } = useAuth()
  const { toast } = useToast()
  const [showSettings, setShowSettings] = useState(false)

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const handleSettings = () => {
    setShowSettings(true)
  }

  return (
    <header className="glass-card border-white/10 mobile-card relative z-20 mobile-padding mt-4 sm:mt-6 lg:mt-8 mx-4 sm:mx-6 lg:mx-8 rounded-2xl lg:rounded-3xl" role="banner">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            {greeting && (
                <div className="flex items-center mb-2 flex-wrap gap-2 sm:gap-4 lg:gap-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white" id="main-heading">
                  {greeting} 👋
                </h1>
                <div className="glass-button-primary px-4 py-2 rounded-full" aria-label="PillPal Application">
                  <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold">💊 PillPal</span>
                </div>
                </div>
            )}
            
            {title && !greeting && (
              <div className="flex items-center mb-2 flex-wrap gap-2 sm:gap-4 lg:gap-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white" id="main-heading">
                  {title}
                </h1>
                <div className="glass-button-primary px-4 py-2 rounded-full" aria-label="PillPal Application">
                  <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold">💊 PillPal</span>
                </div>
              </div>
            )}

            {dateString && (
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-300" aria-label={`Today's date: ${dateString}`}>
                {dateString}
              </p>
            )}

            {subtitle && (
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-300">
                {subtitle}
              </p>
            )}

            {children}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
            {onEmergencyContacts && (
              <Button
                variant="outline"
                size="lg"
                onClick={onEmergencyContacts}
                className="glass-button-primary mobile-button large-touch-target interactive-feedback focus-ring-button lg:px-6 lg:py-3 lg:text-lg px-4 py-3"
                data-testid="button-emergency-contacts"
                aria-label="View emergency contacts"
              >
                <Phone size={18} className="mr-2 lg:mr-3 lg:w-6 lg:h-6" aria-hidden="true" />
                <span className="text-sm sm:text-base lg:text-lg">Emergency</span>
              </Button>
            )}

            <Button
              variant="outline" 
              size="lg"
              className="glass-button mobile-button large-touch-target interactive-feedback focus-ring-button lg:px-6 lg:py-3 lg:text-lg px-4 py-3"
              data-testid="button-settings"
              aria-label="Open settings"
              onClick={handleSettings}
            >
              <Settings size={18} className="mr-2 lg:mr-3 lg:w-6 lg:h-6" aria-hidden="true" />
              <span className="text-sm sm:text-base lg:text-lg">Settings</span>
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleLogout}
              className="glass-button mobile-button large-touch-target interactive-feedback focus-ring-button lg:px-6 lg:py-3 lg:text-lg px-4 py-3"
              aria-label="Logout"
            >
              <LogOut size={18} className="mr-2 lg:mr-3 lg:w-6 lg:h-6" aria-hidden="true" />
              <span className="text-sm sm:text-base lg:text-lg">Logout</span>
            </Button>
          </div>
        </div>
      </div>
      
      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
    </header>
  )
}