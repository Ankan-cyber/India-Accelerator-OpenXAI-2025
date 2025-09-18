"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/app-layout";
import AppHeader from "@/components/app-header";
import { useToast } from "@/hooks/use-toast";
import {
  PillBottle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
} from "lucide-react";
import { useState } from "react";
import type { IMedication, IMedicationLog } from "@/lib/models";
import { EmergencyContactsDisplayDialog } from "@/components/emergency-contacts-display-dialog";

export default function Schedule() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  // Mark medication as taken mutation
  const markTakenMutation = useMutation({
    mutationFn: async ({ medicationId, scheduledTime, date }: { medicationId: string; scheduledTime: string; date: string }) => {
      const response = await fetch('/api/medication-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId,
          scheduledTime,
          date,
          takenAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to mark medication as taken');
      return response.json();
    },
    onMutate: async ({ medicationId, scheduledTime, date }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['/api/medication-logs'] });

      // Snapshot the previous value
      const previousLogs = queryClient.getQueryData(['/api/medication-logs']);

      // Optimistically update to the new value
      queryClient.setQueryData(['/api/medication-logs'], (old: IMedicationLog[] = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          userId: 'current-user',
          medicationId,
          takenAt: new Date(),
          scheduledTime,
          date,
        }
      ]);

      // Return a context with the previous and new logs
      return { previousLogs };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context we returned above
      if (context?.previousLogs) {
        queryClient.setQueryData(['/api/medication-logs'], context.previousLogs);
      }
      toast({
        title: "Error",
        description: "Failed to mark medication as taken. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate queries to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/medication-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      toast({
        title: "Medication marked as taken",
        description: "Great job staying on track with your medication!",
      });
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
    const currentDate = new Date(dateString);
    
    return medications
      .filter(medication => {
        // Only include medications that should be active on this date
        const createdDate = new Date(medication.createdAt);
        const startDate = medication.startDate ? new Date(medication.startDate) : createdDate;
        const endDate = medication.endDate ? new Date(medication.endDate) : null;
        
        // Ensure we don't show medications before they were created
        const isAfterCreation = currentDate >= new Date(createdDate.toISOString().split('T')[0]);
        
        // Check if the current date is after the start date
        const isAfterStart = currentDate >= new Date(startDate.toISOString().split('T')[0]);
        
        // Check if the current date is before the end date (if end date exists)
        const isBeforeEnd = !endDate || currentDate <= new Date(endDate.toISOString().split('T')[0]);
        
        // Only include active medications that fall within the date range and after creation
        return medication.isActive && isAfterCreation && isAfterStart && isBeforeEnd;
      })
      .flatMap(medication =>
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
      )
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <AppLayout>
      <AppHeader 
        title="Weekly Schedule 📅"
        subtitle="Your medication schedule at a glance"
        onEmergencyContacts={() => setShowEmergencyContacts(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mobile-padding p-6 relative z-10">
        {/* Week Navigation */}
        <Card className="glass-card border-white/20 mobile-section-spacing">
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
        <div className="mobile-card-spacing mobile-section-spacing">
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
                              {!item.isTaken && date.toDateString() <= new Date().toDateString() ? (
                                <Button
                                  onClick={() => markTakenMutation.mutate({
                                    medicationId: item.id!,
                                    scheduledTime: item.scheduledTime,
                                    date: item.date
                                  })}
                                  disabled={markTakenMutation.isPending}
                                  size="sm"
                                  className="glass-button-primary text-xs px-3 py-1 h-auto"
                                >
                                  {markTakenMutation.isPending ? (
                                    <span className="inline-block animate-spin mr-1">⏳</span>
                                  ) : (
                                    <Check size={12} className="mr-1" />
                                  )}
                                  {markTakenMutation.isPending ? 'Marking...' : 'Mark Taken'}
                                </Button>
                              ) : !item.isTaken && date.toDateString() > new Date().toDateString() ? (
                                <span className="text-xs text-gray-500 px-3 py-1 bg-gray-500/10 rounded-md">
                                  Future
                                </span>
                              ) : (
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
    </AppLayout>
  );
}
