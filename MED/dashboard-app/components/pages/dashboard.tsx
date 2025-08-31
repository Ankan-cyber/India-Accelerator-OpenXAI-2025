"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MedicationCard } from "@/components/medication-card";
import { AddMedicationDialog } from "@/components/add-medication-dialog";
import { EmergencyContactsDialog } from "@/components/emergency-contacts-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
  PieChart
} from "lucide-react";
import type { IMedication, IMedicationLog, IEmergencyContact } from "@/lib/models";

interface HealthTip {
  tip: string;
  category: string;
}

export default function Dashboard() {
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [dailyTip, setDailyTip] = useState<HealthTip | null>(null);
  
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

  const { data: emergencyContacts = [] } = useQuery<IEmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
    queryFn: async () => {
      const response = await fetch('/api/emergency-contacts');
      if (!response.ok) throw new Error('Failed to fetch emergency contacts');
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
      icon: <PieChart className="text-blue-600" size={28} />,
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Next Medication",
      value: upcomingMedications.length > 0 ? upcomingMedications[0].scheduledTime : "None",
      subtitle: upcomingMedications.length > 0 ? upcomingMedications[0].name : "All done for today!",
      icon: <Clock className="text-green-600" size={28} />,
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Active Medications",
      value: medications.length.toString(),
      subtitle: "medications tracked",
      icon: <PillBottle className="text-purple-600" size={28} />,
      color: "bg-purple-50 border-purple-200"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2 flex-wrap gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
                  {greeting}! 👋
                </h1>
                <div className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                  <span className="text-sm sm:text-lg font-semibold">💊 PillPal</span>
                </div>
              </div>
              <p className="text-base sm:text-xl text-muted-foreground">{dateString}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowEmergencyContacts(true)}
                className="text-sm sm:text-lg px-2 sm:px-4"
                data-testid="button-emergency-contacts"
              >
                <Phone size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Emergency</span>
              </Button>
              <Button
                variant="outline" 
                size="lg"
                className="text-sm sm:text-lg px-2 sm:px-4"
                data-testid="button-settings"
              >
                <Settings size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className={`${stat.color} border-2`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                  </div>
                  <div className="p-3 rounded-full bg-background">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overdue Medications Alert */}
        {overdueMedications.length > 0 && (
          <Card className="border-warning bg-warning/10 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-warning text-warning-foreground mr-4">
                  <Clock size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-warning mb-2">
                    Overdue Medications
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    You have {overdueMedications.length} medication{overdueMedications.length !== 1 ? 's' : ''} that should have been taken already.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Health Tip */}
        {dailyTip && (
          <Card className="mb-8 border-2 border-accent">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-accent text-accent-foreground">
                  <Lightbulb size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Daily Health Tip</h3>
                  <p className="text-lg leading-relaxed mb-2">{dailyTip.tip}</p>
                  <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                    {dailyTip.category}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Medications */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold">Today's Medications</h2>
            <Button
              onClick={() => setShowAddMedication(true)}
              size="lg"
              className="text-sm sm:text-lg px-3 sm:px-4 whitespace-nowrap"
              data-testid="button-add-medication"
            >
              <Plus size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Add Medication</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          {medicationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-muted h-32 rounded-lg"></div>
              ))}
            </div>
          ) : todaysSchedule.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <PillBottle className="mx-auto mb-4 text-muted-foreground" size={64} />
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">No medications scheduled</h3>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Add your first medication to get started with tracking.
                </p>
                <Button
                  onClick={() => setShowAddMedication(true)}
                  size="lg"
                  className="text-sm sm:text-lg px-4 sm:px-6 w-full sm:w-auto"
                  data-testid="button-add-first-medication"
                >
                  <Plus size={16} className="mr-2" />
                  <span className="hidden sm:inline">Add Your First Medication</span>
                  <span className="sm:hidden">Start Tracking</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/schedule">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="mx-auto mb-3 text-blue-600" size={32} />
                <h4 className="font-semibold text-lg">Schedule</h4>
                <p className="text-sm text-muted-foreground">View weekly plan</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/health-tips">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Lightbulb className="mx-auto mb-3 text-yellow-600" size={32} />
                <h4 className="font-semibold text-lg">Health Tips</h4>
                <p className="text-sm text-muted-foreground">Personalized advice</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="mx-auto mb-3 text-green-600" size={32} />
                <h4 className="font-semibold text-lg">Progress</h4>
                <p className="text-sm text-muted-foreground">Track adherence</p>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowEmergencyContacts(true)}
          >
            <CardContent className="p-6 text-center">
              <Heart className="mx-auto mb-3 text-red-600" size={32} />
              <h4 className="font-semibold text-lg">Emergency</h4>
              <p className="text-sm text-muted-foreground">Quick contacts</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center space-x-8">
            <Button
              variant="ghost"
              size="lg"
              className="nav-button active text-lg"
              data-testid="nav-dashboard"
            >
              <Home size={24} />
              <span className="ml-2">Home</span>
            </Button>
            <Link href="/schedule">
              <Button
                variant="ghost"
                size="lg"
                className="nav-button text-lg"
                data-testid="nav-schedule"
              >
                <Calendar size={24} />
                <span className="ml-2">Schedule</span>
              </Button>
            </Link>
            <Link href="/health-tips">
              <Button
                variant="ghost"
                size="lg"
                className="nav-button text-lg"
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
                className="nav-button text-lg"
                data-testid="nav-progress"
              >
                <TrendingUp size={24} />
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
    </div>
  );
}