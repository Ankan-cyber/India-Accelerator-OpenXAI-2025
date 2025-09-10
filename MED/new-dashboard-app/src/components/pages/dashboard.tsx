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
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { 
  Phone,
  Settings,
  Home,
  Calendar,
  Lightbulb,
  TrendingUp,
  PillBottle,
  Clock,
  Heart,
  Plus,
  PieChart,
  LogOut,
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
  const [dailyTip, setDailyTip] = useState<HealthTip | null>(null);
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // No need to redirect here, ProtectedRoute will handle it
  };
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

  // Fetch daily health tip on mount
  useEffect(() => {
    const fetchDailyTip = async () => {
      try {
        const response = await fetch('/api/daily-health-tip');
        if (response.ok) {
          const tip = await response.json();
          setDailyTip(tip);
        }
      } catch (error) {
        console.error('Failed to fetch daily tip:', error);
      }
    };

    fetchDailyTip();
  }, []);

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
    <div className="min-h-screen relative z-10" role="main" aria-label="Medication Dashboard">
      
      {/* Live region for announcements */}
      <div id="live-region" className="live-region" role="status" aria-live="polite" aria-atomic="true"></div>
      
      {/* Floating Orbs */}
      <div className="floating-orb w-64 h-64 bg-purple-500/20 -top-32 -left-32" aria-hidden="true"></div>
      <div className="floating-orb w-48 h-48 bg-cyan-500/15 top-1/3 -right-24" style={{ animationDelay: '-2s' }} aria-hidden="true"></div>
      <div className="floating-orb w-32 h-32 bg-emerald-500/20 bottom-1/4 left-1/4" style={{ animationDelay: '-4s' }} aria-hidden="true"></div>

      {/* Header */}
      <header className="glass-card border-white/10 p-6 relative z-20 mx-6 mt-6 rounded-2xl" role="banner">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2 flex-wrap gap-2 sm:gap-4">
                <h1 className="senior-text-2xl sm:text-4xl font-bold text-white" id="main-heading">
                  {greeting}! 👋
                </h1>
                <div className="glass-button-primary px-3 sm:px-4 py-1 sm:py-2 rounded-full" aria-label="PillPal Application">
                  <span className="senior-text-lg font-semibold">💊 PillPal</span>
                </div>
              </div>
              <p className="senior-text-lg text-gray-300" aria-label={`Today's date: ${dateString}`}>{dateString}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowEmergencyContactsDisplay(true)}
                className="glass-button-primary senior-text-lg px-3 sm:px-4 large-touch-target interactive-feedback focus-ring-button"
                data-testid="button-emergency-contacts"
                aria-label="View emergency contacts"
              >
                <Phone size={20} className="sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Emergency</span>
              </Button>
              <Button
                variant="outline" 
                size="lg"
                className="glass-button senior-text-lg px-3 sm:px-4 large-touch-target interactive-feedback focus-ring-button"
                data-testid="button-settings"
                aria-label="Open settings"
                onClick={() => toast({ title: "Coming Soon!", description: "Settings page is under construction."})}
              >
                <Settings size={20} className="sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleLogout}
                className="glass-button senior-text-lg px-3 sm:px-4 large-touch-target interactive-feedback focus-ring-button"
                aria-label="Logout"
              >
                <LogOut size={20} className="sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto p-6 relative z-10" role="main" aria-labelledby="main-heading">
        {/* Quick Stats */}
        <section aria-label="Today's medication statistics">
          <h2 className="sr-only">Today&apos;s Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className={`glass-card border-white/20 bg-gradient-to-br ${stat.gradient} interactive-feedback focus-ring`} role="region" aria-label={stat.title} tabIndex={0}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="senior-text-lg font-semibold mb-1 text-white">{stat.title}</h3>
                      <p className="senior-text-2xl font-bold mb-1 text-white" aria-label={`${stat.title}: ${stat.value}`}>{stat.value}</p>
                      <p className="senior-text-base text-gray-300">{stat.subtitle}</p>
                    </div>
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md" aria-hidden="true">
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
          <section aria-label="Overdue medications alert" role="alert">
            <Card className="glass-card border-red-400/30 bg-gradient-to-br from-red-500/20 to-red-600/10 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-500/20 text-red-400 mr-4" aria-hidden="true">
                    <Clock size={32} />
                  </div>
                  <div>
                    <h3 className="senior-text-xl font-semibold text-red-400 mb-2">
                      ⚠️ Overdue Medications
                    </h3>
                    <p className="senior-text-lg text-gray-300">
                      You have {overdueMedications.length} medication{overdueMedications.length !== 1 ? 's' : ''} that should have been taken already.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Daily Health Tip */}
        {dailyTip && (
          <section aria-label="Daily health tip">
            <Card className="health-tip-card mb-8" tabIndex={0}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-purple-500/20 text-purple-400" aria-hidden="true">
                    <Lightbulb size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="senior-text-xl font-semibold mb-2 text-white">💡 Daily Health Tip</h3>
                    <p className="senior-text-lg leading-relaxed mb-2 text-gray-200">{dailyTip.tip}</p>
                    <span className="inline-block px-3 py-1 bg-white/10 text-purple-300 rounded-full senior-text-sm backdrop-blur-md">
                      {dailyTip.category}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Today's Medications */}
        <section aria-label="Today's medication schedule">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h2 className="senior-text-2xl font-bold text-white">📋 Today&apos;s Medications</h2>
              <Button
                onClick={() => setShowAddMedication(true)}
                size="lg"
                className="glass-button-primary senior-text-lg px-4 sm:px-6 whitespace-nowrap"
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
                  <div key={i} className="glass-card h-32 rounded-lg shimmer" aria-hidden="true"></div>
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
              <div className="space-y-4" role="list" aria-label="Today's medication schedule">
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
        <section aria-label="Quick actions">
          <h2 className="sr-only">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/schedule" className="focus-ring rounded-xl">
              <Card className="quick-action-card">
                <CardContent className="p-6 text-center">
                  <Calendar className="mx-auto mb-3 text-blue-400" size={40} aria-hidden="true" />
                  <h4 className="font-semibold senior-text-lg text-white">📅 Schedule</h4>
                  <p className="senior-text-sm text-gray-300">View weekly plan</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/health-tips" className="focus-ring rounded-xl">
              <Card className="quick-action-card">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="mx-auto mb-3 text-yellow-400" size={40} aria-hidden="true" />
                  <h4 className="font-semibold senior-text-lg text-white">💡 Health Tips</h4>
                  <p className="senior-text-sm text-gray-300">Personalized advice</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/progress" className="focus-ring rounded-xl">
              <Card className="quick-action-card">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="mx-auto mb-3 text-green-400" size={40} aria-hidden="true" />
                  <h4 className="font-semibold senior-text-lg text-white">📈 Progress</h4>
                  <p className="senior-text-sm text-gray-300">Track adherence</p>
                </CardContent>
              </Card>
            </Link>

            <Card 
              className="quick-action-card"
              onClick={() => setShowEmergencyContacts(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowEmergencyContacts(true);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="View emergency contacts"
            >
              <CardContent className="p-6 text-center">
                <Heart className="mx-auto mb-3 text-red-400" size={40} aria-hidden="true" />
                <h4 className="font-semibold senior-text-lg text-white">🚨 Emergency</h4>
                <p className="senior-text-sm text-gray-300">Quick contacts</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Bottom Spacing for Navigation */}
        <div className="h-24" aria-hidden="true"></div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 p-4 z-30" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center space-x-8">
            <Button
              variant="ghost"
              size="lg"
              className="glass-button-primary senior-text-lg large-touch-target interactive-feedback focus-ring-button"
              data-testid="nav-dashboard"
              aria-label="Dashboard - Current page"
              aria-current="page"
            >
              <Home size={28} aria-hidden="true" />
              <span className="ml-2">Home</span>
            </Button>
            <Link href="/schedule" className="focus-ring rounded-lg">
              <Button
                variant="ghost"
                size="lg"
                className="glass-button senior-text-lg text-gray-300 hover:text-white large-touch-target interactive-feedback focus-ring-button"
                data-testid="nav-schedule"
                aria-label="Go to schedule page"
              >
                <Calendar size={28} aria-hidden="true" />
                <span className="ml-2">Schedule</span>
              </Button>
            </Link>
            <Link href="/health-tips" className="focus-ring rounded-lg">
              <Button
                variant="ghost"
                size="lg"
                className="glass-button senior-text-lg text-gray-300 hover:text-white large-touch-target interactive-feedback focus-ring-button"
                data-testid="nav-health-tips"
                aria-label="Go to health tips page"
              >
                <Lightbulb size={28} aria-hidden="true" />
                <span className="ml-2">Tips</span>
              </Button>
            </Link>
            <Link href="/progress" className="focus-ring rounded-lg">
              <Button
                variant="ghost"
                size="lg"
                className="glass-button senior-text-lg text-gray-300 hover:text-white large-touch-target interactive-feedback focus-ring-button"
                data-testid="nav-progress"
                aria-label="Go to progress page"
              >
                <TrendingUp size={28} aria-hidden="true" />
                <span className="ml-2">Progress</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

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
    </div>
  );
}
