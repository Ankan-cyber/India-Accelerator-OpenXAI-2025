"use client"

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Home,
  Calendar,
  Lightbulb,
  TrendingUp,
  PillBottle,
  Settings,
  Clock,
  ChevronLeft,
  ChevronRight,
  Phone,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import type { IMedication, IMedicationLog } from "@/lib/models";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { EmergencyContactsDisplayDialog } from "@/components/emergency-contacts-display-dialog";

export default function Schedule() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const { data: medications = [] } = useQuery<IMedication[]>({
    queryKey: ['/api/medications'],
    queryFn: async () => {
      const response = await fetch('/api/medications');
      if (!response.ok) throw new Error('Failed to fetch medications');
      return response.json();
    },
  });

  const { data: logs = [] } = useQuery<IMedicationLog[]>({
    queryKey: ['/api/medication-logs'],
    queryFn: async () => {
      const response = await fetch('/api/medication-logs');
      if (!response.ok) throw new Error('Failed to fetch medication logs');
      return response.json();
    },
  });

  // Get current week dates
  const getWeekDates = (weekOffset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay + (weekOffset * 7));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const today = new Date().toDateString();

  // Get schedule for a specific day
  const getDaySchedule = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return medications.flatMap(medication =>
      medication.times.map(time => ({
        ...medication,
        scheduledTime: time,
        date: dateString,
        isTaken: logs.some(log =>
          log.medicationId === medication.id &&
          log.scheduledTime === time &&
          log.date === dateString
        )
      }))
    ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen relative z-10">
      {/* Floating Orbs */}
      <div className="floating-orb w-64 h-64 bg-purple-500/20 -top-32 -left-32"></div>
      <div className="floating-orb w-48 h-48 bg-cyan-500/15 top-1/3 -right-24" style={{ animationDelay: '-2s' }}></div>
      <div className="floating-orb w-32 h-32 bg-emerald-500/20 bottom-1/4 left-1/4" style={{ animationDelay: '-4s' }}></div>

      {/* Header */}
      <header className="dashboard-header border-b border-white/10 p-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2 flex-wrap gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-white">
                  Weekly Schedule 📅
                </h1>
              </div>
              <p className="text-base sm:text-xl text-gray-300">Your medication schedule at a glance</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowEmergencyContacts(true)}
                className="glass-button-primary senior-text-lg px-3 sm:px-4 large-touch-target interactive-feedback focus-ring-button"
              >
                <Phone size={20} className="sm:mr-2" />
                <span className="hidden sm:inline">Emergency</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="glass-button senior-text-lg px-3 sm:px-4 large-touch-target interactive-feedback focus-ring-button"
                onClick={() => toast({ title: "Coming Soon!", description: "Settings page is under construction."})}
              >
                <Settings size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleLogout}
                className="glass-button senior-text-lg px-3 sm:px-4 large-touch-target interactive-feedback focus-ring-button"
              >
                <LogOut size={20} className="sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Week Navigation */}
        <Card className="glass-card border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(prev => prev - 1)}
                className="glass-button text-white hover:text-white"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous Week
              </Button>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                {currentWeek === 0 && (
                  <p className="text-sm text-gray-300">This Week</p>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="glass-button text-white hover:text-white"
              >
                Next Week
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
          {weekDates.map((date, index) => {
            const daySchedule = getDaySchedule(date);
            const isToday = date.toDateString() === today;
            const takenCount = daySchedule.filter(item => item.isTaken).length;
            const totalCount = daySchedule.length;
            
            return (
              <Card key={index} className={`glass-card border ${
                isToday ? 'border-purple-400/50 bg-purple-500/10' : 'border-white/20'
              }`}>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <h4 className={`font-semibold ${isToday ? 'text-purple-300' : 'text-white'}`}>
                      {dayNames[index]}
                    </h4>
                    <p className={`text-sm ${isToday ? 'text-purple-400' : 'text-gray-300'}`}>
                      {date.getDate()}
                    </p>
                    {isToday && (
                      <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs mt-1">
                        Today
                      </span>
                    )}
                  </div>

                  {daySchedule.length === 0 ? (
                    <div className="text-center py-4">
                      <PillBottle className="mx-auto mb-2 text-gray-500" size={24} />
                      <p className="text-xs text-gray-400">No medications</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-300">Progress</span>
                        <span className="text-xs text-gray-300">{takenCount}/{totalCount}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                      
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {daySchedule.map((item, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded text-xs ${
                              item.isTaken 
                                ? 'bg-emerald-500/20 text-emerald-300' 
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="opacity-75">{item.dosage}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono">{item.scheduledTime}</p>
                              {item.isTaken && (
                                <p className="text-emerald-400">✓</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today&apos;s Focus (if viewing current week) */}
        {currentWeek === 0 && (
          <Card className="health-tip-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                  <Clock size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">Today&apos;s Focus</h3>
                  <p className="text-lg leading-relaxed text-gray-200">
                    {(() => {
                      const todaySchedule = getDaySchedule(new Date());
                      const remaining = todaySchedule.filter(item => !item.isTaken);
                      
                      if (remaining.length === 0) {
                        return "Great job! You've completed all your medications for today. 🎉";
                      } else if (remaining.length === 1) {
                        return `You have 1 medication remaining: ${remaining[0].name} at ${remaining[0].scheduledTime}.`;
                      } else {
                        return `You have ${remaining.length} medications remaining today. Next up: ${remaining[0].name} at ${remaining[0].scheduledTime}.`;
                      }
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Spacing for Navigation */}
        <div className="h-24"></div>
      </main>

      <EmergencyContactsDisplayDialog
        open={showEmergencyContacts}
        onClose={() => setShowEmergencyContacts(false)}
      />

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 dashboard-navigation border-t border-white/10 p-4 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center space-x-8">
            <Link href="/">
              <Button
                variant="ghost"
                size="lg"
                className="nav-button text-lg text-gray-300 hover:text-white"
                data-testid="nav-dashboard"
              >
                <Home size={24} />
                <span className="ml-2">Home</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="nav-button active text-lg text-white"
              data-testid="nav-schedule"
            >
              <Calendar size={24} />
              <span className="ml-2">Schedule</span>
            </Button>
            <Link href="/health-tips">
              <Button
                variant="ghost"
                size="lg"
                className="nav-button text-lg text-gray-300 hover:text-white"
                data-testid="nav-health-tips"
              >
                <Lightbulb size={24} />
                <span className="ml-2">Tips</span>
              </Button>
            </Link>
            <Link href="/progress">
              <Button
                variant="ghost"
                size="lg"
                className="nav-button text-lg text-gray-300 hover:text-white"
                data-testid="nav-progress"
              >
                <TrendingUp size={24} />
                <span className="ml-2">Progress</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
