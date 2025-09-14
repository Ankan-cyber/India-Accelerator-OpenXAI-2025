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
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentWeek(prev => prev - 1)}
                className="glass-button text-white hover:text-white text-lg px-6 py-3 w-full sm:w-auto large-touch-target"
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous Week
              </Button>
              
              <div className="text-center flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                {currentWeek === 0 && (
                  <div className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-base font-medium">
                    This Week
                  </div>
                )}
                {currentWeek > 0 && (
                  <div className="inline-block px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-base font-medium">
                    {currentWeek} week{currentWeek > 1 ? 's' : ''} ahead
                  </div>
                )}
                {currentWeek < 0 && (
                  <div className="inline-block px-4 py-2 bg-gray-500/20 text-gray-300 rounded-full text-base font-medium">
                    {Math.abs(currentWeek)} week{Math.abs(currentWeek) > 1 ? 's' : ''} ago
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="glass-button text-white hover:text-white text-lg px-6 py-3 w-full sm:w-auto large-touch-target"
              >
                Next Week
                <ChevronRight size={20} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule - Clean Day-by-Day View */}
        <div className="space-y-6 mb-8">
          {weekDates.map((date, index) => {
            const daySchedule = getDaySchedule(date);
            const isToday = date.toDateString() === today;
            const takenCount = daySchedule.filter(item => item.isTaken).length;
            const totalCount = daySchedule.length;
            
            return (
              <Card key={index} className={`glass-card border-2 transition-all duration-200 ${
                isToday 
                  ? 'border-purple-400/70 bg-purple-500/15 shadow-lg shadow-purple-500/20' 
                  : 'border-white/20 hover:border-white/30'
              }`}>
                <CardContent className="p-6 sm:p-8">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        isToday ? 'bg-purple-500/30' : 'bg-white/10'
                      }`}>
                        <Calendar className={`${
                          isToday ? 'text-purple-300' : 'text-white'
                        }`} size={24} />
                      </div>
                      <div>
                        <h3 className={`text-xl sm:text-2xl font-bold ${
                          isToday ? 'text-purple-200' : 'text-white'
                        }`}>
                          {dayNames[index]}
                        </h3>
                        <p className={`text-base sm:text-lg ${
                          isToday ? 'text-purple-300' : 'text-gray-300'
                        }`}>
                          {date.toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {isToday && (
                          <span className="inline-block px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm mt-2 font-medium">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {totalCount > 0 && (
                      <div className="text-right">
                        <div className={`text-2xl sm:text-3xl font-bold mb-1 ${
                          takenCount === totalCount ? 'text-emerald-400' : 
                          takenCount > 0 ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          {takenCount}/{totalCount}
                        </div>
                        <div className="w-24 bg-white/10 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              takenCount === totalCount ? 'bg-emerald-500' :
                              takenCount > 0 ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}
                            style={{ width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          {takenCount === totalCount ? 'Complete!' : 
                           takenCount > 0 ? 'In Progress' : 'Not Started'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Medications for the day */}
                  {daySchedule.length === 0 ? (
                    <div className="text-center py-12">
                      <PillBottle className="mx-auto mb-4 text-gray-500" size={48} />
                      <p className="text-lg text-gray-400">No medications scheduled</p>
                      <p className="text-sm text-gray-500 mt-2">Enjoy your day!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {daySchedule.map((item, idx) => (
                        <div 
                          key={idx}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            item.isTaken 
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100' 
                              : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg ${
                              item.isTaken ? 'bg-emerald-500/30' : 'bg-blue-500/20'
                            }`}>
                              <PillBottle className={`${
                                item.isTaken ? 'text-emerald-300' : 'text-blue-300'
                              }`} size={20} />
                            </div>
                            {item.isTaken && (
                              <div className="flex items-center space-x-1 text-emerald-400">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center">
                                  <span className="text-sm font-bold">✓</span>
                                </div>
                                <span className="text-sm font-medium">Taken</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg leading-tight">{item.name}</h4>
                            <p className={`text-sm ${
                              item.isTaken ? 'text-emerald-200' : 'text-gray-300'
                            }`}>
                              {item.dosage}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`font-mono text-lg font-bold ${
                                item.isTaken ? 'text-emerald-300' : 'text-blue-300'
                              }`}>
                                {item.scheduledTime}
                              </span>
                              {!item.isTaken && (
                                <Clock className="text-gray-400" size={16} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today's Focus (if viewing current week) */}
        {currentWeek === 0 && (
          <Card className="health-tip-card border-2 border-purple-400/30 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="p-4 rounded-xl bg-purple-500/20 text-purple-400 flex-shrink-0">
                  <Clock size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Today&apos;s Focus</h3>
                  <p className="text-lg sm:text-xl leading-relaxed text-gray-200">
                    {(() => {
                      const todaySchedule = getDaySchedule(new Date());
                      const remaining = todaySchedule.filter(item => !item.isTaken);
                      
                      if (remaining.length === 0 && todaySchedule.length > 0) {
                        return "🎉 Excellent work! You've completed all your medications for today. Keep up the great routine!";
                      } else if (remaining.length === 0) {
                        return "😊 No medications scheduled for today. Enjoy your day!";
                      } else if (remaining.length === 1) {
                        return `📋 You have 1 medication remaining today: ${remaining[0].name} at ${remaining[0].scheduledTime}.`;
                      } else {
                        const nextMed = remaining.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))[0];
                        return `📋 You have ${remaining.length} medications remaining today. Next up: ${nextMed.name} at ${nextMed.scheduledTime}.`;
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
