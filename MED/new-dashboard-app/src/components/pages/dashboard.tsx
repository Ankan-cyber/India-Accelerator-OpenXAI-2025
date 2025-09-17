"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MedicationCard } from "@/components/medication-card";
import { AddMedicationDialog } from "@/components/add-medication-dialog";
import { EmergencyContactsDialog } from "@/components/emergency-contacts-dialog";
import { EmergencyContactsDisplayDialog } from "@/components/emergency-contacts-display-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/app-layout";
import AppHeader from "@/components/app-header";
import Link from "next/link";
import { 
  Calendar,
  Lightbulb,
  TrendingUp,
  PillBottle,
  Clock,
  Heart,
  Plus,
  PieChart,
  RefreshCw,
} from "lucide-react";
import type { IMedication, IMedicationLog } from "@/lib/models";

interface HealthTip {
  tip: string;
  category: string;
}

export default function Dashboard() {
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showEmergencyContactsDisplay, setShowEmergencyContactsDisplay] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dailyTip, refetch: refetchDailyTip, isLoading: isDailyTipLoading, isFetching: isFetchingDailyTip } = useQuery<HealthTip>({
    queryKey: ['/api/daily-health-tip'],
    queryFn: async () => {
      const response = await fetch('/api/daily-health-tip');
      if (!response.ok) throw new Error('Failed to fetch daily health tip');
      return response.json();
    },
    staleTime: Infinity, // Will not refetch automatically
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get current date info
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  
  const greeting = now.getHours() < 12 ? "Good Morning" : 
                  now.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Queries
  const { data: medications = [], isLoading: medicationsLoading } = useQuery<IMedication[]>({
    queryKey: ['/api/medications'],
    queryFn: async () => {
      const response = await fetch('/api/medications');
      if (!response.ok) throw new Error('Failed to fetch medications');
      return response.json();
    },
  });

  const { data: logs = [] } = useQuery<IMedicationLog[]>({
    queryKey: ['/api/medication-logs', today],
    queryFn: async () => {
      const response = await fetch(`/api/medication-logs?date=${today}`);
      if (!response.ok) throw new Error('Failed to fetch medication logs');
      return response.json();
    },
  });

  // Mark medication as taken mutation
  const markTakenMutation = useMutation({
    mutationFn: async ({ medicationId, scheduledTime }: { medicationId: string; scheduledTime: string }) => {
      const response = await fetch('/api/medication-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId,
          scheduledTime,
          date: today,
          takenAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to mark medication as taken');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medication-logs', today] });
      toast({
        title: "Medication marked as taken",
        description: "Great job staying on track with your medication!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark medication as taken. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get today's medication schedule
  const todaysSchedule = medications.flatMap(medication =>
    medication.times.map(time => ({
      ...medication,
      scheduledTime: time,
      isTaken: logs.some(log =>
        log.medicationId === medication.id &&
        log.scheduledTime === time &&
        log.date === today
      )
    }))
  ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  // Calculate next medications
  const upcomingMedications = todaysSchedule.filter(med => 
    !med.isTaken && med.scheduledTime >= currentTime
  ).slice(0, 3);

  const overdueMedications = todaysSchedule.filter(med => 
    !med.isTaken && med.scheduledTime < currentTime
  );

  // Calculate statistics
  const totalToday = todaysSchedule.length;
  const takenToday = todaysSchedule.filter(med => med.isTaken).length;
  const adherenceRate = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  const quickStats = [
    {
      title: "Today's Progress",
      value: `${takenToday}/${totalToday}`,
      subtitle: `${adherenceRate}% complete`,
      icon: <PieChart className="text-purple-400" size={28} />,
      gradient: "from-purple-500/20 to-purple-600/10"
    },
    {
      title: "Next Medication",
      value: upcomingMedications.length > 0 ? upcomingMedications[0].scheduledTime : "None",
      subtitle: upcomingMedications.length > 0 ? upcomingMedications[0].name : "All done for today!",
      icon: <Clock className="text-cyan-400" size={28} />,
      gradient: "from-cyan-500/20 to-cyan-600/10"
    },
    {
      title: "Active Medications",
      value: medications.length.toString(),
      subtitle: "medications tracked",
      icon: <PillBottle className="text-emerald-400" size={28} />,
      gradient: "from-emerald-500/20 to-emerald-600/10"
    }
  ];

  return (
    <AppLayout>
      {/* Live region for announcements */}
      <div id="live-region" className="live-region" role="status" aria-live="polite" aria-atomic="true"></div>
      
      <AppHeader 
        greeting={greeting}
        dateString={dateString}
        onEmergencyContacts={() => setShowEmergencyContactsDisplay(true)}
      />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto mobile-padding p-6 relative z-10" role="main" aria-labelledby="main-heading">
        {/* Quick Stats */}
        <section aria-label="Today's medication statistics" className="mobile-section-spacing">
          <h2 className="sr-only">Today&apos;s Statistics</h2>
          <div className="mobile-grid">
            {quickStats.map((stat, index) => (
              <Card key={index} className={`glass-card border-white/20 bg-gradient-to-br ${stat.gradient} interactive-feedback focus-ring`} role="region" aria-label={stat.title} tabIndex={0}>
                <CardContent className="mobile-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold mb-1 text-white truncate">{stat.title}</h3>
                      <p className="text-xl sm:text-2xl font-bold mb-1 text-white" aria-label={`${stat.title}: ${stat.value}`}>{stat.value}</p>
                      <p className="text-sm sm:text-base text-gray-300 truncate">{stat.subtitle}</p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md flex-shrink-0 ml-2" aria-hidden="true">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Overdue Medications Alert */}
        {overdueMedications.length > 0 && (
          <section aria-label="Overdue medications alert" role="alert" className="mobile-section-spacing">
            <Card className="glass-card border-red-400/30 bg-gradient-to-br from-red-500/20 to-red-600/10">
              <CardContent className="mobile-card">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 rounded-full bg-red-500/20 text-red-400 flex-shrink-0" aria-hidden="true">
                    <Clock size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-red-400 mb-2">
                      ⚠️ Overdue Medications
                    </h3>
                    <p className="text-base sm:text-lg text-gray-300">
                      You have {overdueMedications.length} medication{overdueMedications.length !== 1 ? 's' : ''} that should have been taken already.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Daily Health Tip */}
        <section aria-label="Daily health tip" className="mobile-section-spacing">
          {!isMounted ? (
            <Card className="health-tip-card shimmer">
              <CardContent className="mobile-card">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 rounded-full bg-purple-500/20 text-purple-400 flex-shrink-0" aria-hidden="true">
                    <Lightbulb size={28} />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="h-5 sm:h-6 bg-gray-500/30 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-500/30 rounded w-full"></div>
                    <div className="h-4 bg-gray-500/30 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isDailyTipLoading ? (
            <Card className="health-tip-card border-purple-400/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <CardContent className="mobile-card">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 rounded-full bg-purple-500/20 text-purple-400 flex-shrink-0" aria-hidden="true">
                    <Lightbulb size={28} className="animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-2">
                      <h3 className="mobile-section-title font-semibold text-white">💡 Daily Health Tip</h3>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base sm:text-lg text-purple-200 animate-pulse">
                        🤖 AI is generating a personalized health tip for you...
                      </p>
                      <div className="h-4 bg-purple-500/20 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-purple-500/20 rounded w-3/4 animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-6 bg-purple-500/20 rounded-full w-20 animate-pulse"></div>
                      <Button
                        disabled
                        size="sm"
                        className="glass-button mobile-button opacity-50 cursor-not-allowed"
                      >
                        <RefreshCw size={16} className="mr-2 animate-spin text-purple-300" />
                        <span className="text-sm">Generating...</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : dailyTip && (
            <Card className="health-tip-card mb-6 sm:mb-8" tabIndex={0}>
              <CardContent className="mobile-card">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 rounded-full bg-purple-500/20 text-purple-400 flex-shrink-0" aria-hidden="true">
                    <Lightbulb size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mobile-section-title font-semibold mb-2 text-white">💡 Daily Health Tip</h3>
                    <p className="text-base sm:text-lg leading-relaxed mb-4 text-gray-200">{dailyTip.tip}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="inline-block px-3 py-1 bg-white/10 text-purple-300 rounded-full text-sm backdrop-blur-md">
                        {dailyTip.category}
                      </span>
                      <Button
                        onClick={() => refetchDailyTip()}
                        disabled={isFetchingDailyTip}
                        size="sm"
                        className="glass-button"
                      >
                        {isFetchingDailyTip ? (
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                        ) : (
                          <RefreshCw size={16} className="mr-2" />
                        )}
                        New Tip
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Today's Medications */}
        <section aria-label="Today's medication schedule" className="mobile-section-spacing">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <h2 className="mobile-section-title font-bold text-white">📋 Today&apos;s Medications</h2>
              <Button
                onClick={() => setShowAddMedication(true)}
                size="lg"
                className="glass-button-primary mobile-button"
                data-testid="button-add-medication"
                aria-label="Add a new medication"
              >
                <Plus size={20} className="sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Add Medication</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {medicationsLoading ? (
              <div className="space-y-4" aria-label="Loading medications" role="status">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card h-24 sm:h-32 rounded-lg shimmer" aria-hidden="true"></div>
                ))}
                <span className="sr-only">Loading your medications...</span>
              </div>
            ) : todaysSchedule.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <PillBottle className="mx-auto mb-4 text-gray-400" size={80} aria-hidden="true" />
                  <h3 className="senior-text-xl sm:text-2xl font-semibold mb-2 text-white">No medications scheduled</h3>
                  <p className="senior-text-lg text-gray-300 mb-6">
                    Add your first medication to get started with tracking.
                  </p>
                  <Button
                    onClick={() => setShowAddMedication(true)}
                    size="lg"
                    className="glass-button-primary senior-text-lg px-6 sm:px-8 w-full sm:w-auto"
                    data-testid="button-add-first-medication"
                    aria-label="Add your first medication to start tracking"
                  >
                    <Plus size={20} className="mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">Add Your First Medication</span>
                    <span className="sm:hidden">Start Tracking</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="mobile-card-spacing" role="list" aria-label="Today's medication schedule">
                {todaysSchedule.map((medication) => (
                  <MedicationCard
                    key={`${medication.id}-${medication.scheduledTime}`}
                    medication={medication}
                    onMarkAsTaken={() => markTakenMutation.mutate({
                      medicationId: medication.id!,
                      scheduledTime: medication.scheduledTime
                    })}
                    isLoading={markTakenMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section aria-label="Quick actions" className="mobile-section-spacing">
          <h2 className="sr-only">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Link href="/schedule" className="focus-ring rounded-xl">
              <Card className="quick-action-card">
                <CardContent className="mobile-card card-content-center">
                  <Calendar className="mb-2 sm:mb-3 text-blue-400" size={32} aria-hidden="true" />
                  <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-white">📅 Schedule</h4>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1">View weekly plan</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/health-tips" className="focus-ring rounded-xl">
              <Card className="quick-action-card">
                <CardContent className="mobile-card card-content-center">
                  <Lightbulb className="mb-2 sm:mb-3 text-yellow-400" size={32} aria-hidden="true" />
                  <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-white">💡 Health Tips</h4>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1">Personalized advice</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/progress" className="focus-ring rounded-xl">
              <Card className="quick-action-card">
                <CardContent className="mobile-card card-content-center">
                  <TrendingUp className="mb-2 sm:mb-3 text-green-400" size={32} aria-hidden="true" />
                  <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-white">📈 Progress</h4>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1">Track adherence</p>
                </CardContent>
              </Card>
            </Link>

            <Card 
              className="quick-action-card focus-ring rounded-xl cursor-pointer"
              onClick={() => setShowEmergencyContactsDisplay(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowEmergencyContactsDisplay(true);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="View emergency contacts"
            >
              <CardContent className="mobile-card card-content-center">
                <Heart className="mb-2 sm:mb-3 text-red-400" size={32} aria-hidden="true" />
                <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-white">🚨 Emergency</h4>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">Quick contacts</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Dialogs */}
      <AddMedicationDialog
        open={showAddMedication}
        onClose={() => setShowAddMedication(false)}
      />
      
      <EmergencyContactsDialog
        open={showEmergencyContacts}
        onClose={() => setShowEmergencyContacts(false)}
      />
      <EmergencyContactsDisplayDialog
        open={showEmergencyContactsDisplay}
        onClose={() => setShowEmergencyContactsDisplay(false)}
      />
    </AppLayout>
  );
}
