"use client"

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
  RefreshCw,
  Heart,
  Shield,
  Activity,
  AlertCircle,
  Phone,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { EmergencyContactsDisplayDialog } from "@/components/emergency-contacts-display-dialog";

interface HealthTip {
  tip: string;
  category: string;
  priority?: 'high' | 'medium' | 'low';
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
}

export default function HealthTips() {
  const [personalizedTip, setPersonalizedTip] = useState<HealthTip | null>(null);
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

  const { data: dailyTip, refetch: refetchDailyTip, isFetching: isFetchingDailyTip } = useQuery<HealthTip>({
    queryKey: ['/api/daily-health-tip'],
    queryFn: async () => {
      const response = await fetch('/api/daily-health-tip');
      if (!response.ok) throw new Error('Failed to fetch daily health tip');
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
    queryFn: async () => {
      const response = await fetch('/api/medications');
      if (!response.ok) throw new Error('Failed to fetch medications');
      return response.json();
    },
  });

  const generateTipMutation = useMutation({
    mutationFn: async (meds: Medication[]) => {
      const response = await fetch('/api/health-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: meds }),
      });
      if (!response.ok) throw new Error('Failed to generate tip');
      return response.json();
    },
    onSuccess: (data) => {
      setPersonalizedTip(data);
    },
  });

  const staticTips = [
    {
      tip: "Set up a daily routine for taking medications at the same time each day to improve adherence and effectiveness.",
      category: "Medication Management",
      priority: "high" as const,
      icon: <PillBottle className="text-blue-400" size={24} />
    },
    {
      tip: "Keep a medication list with you at all times, including doses and schedules, for medical appointments and emergencies.",
      category: "Safety", 
      priority: "high" as const,
      icon: <Shield className="text-emerald-400" size={24} />
    },
    {
      tip: "Store medications in a cool, dry place away from direct sunlight. Avoid bathroom medicine cabinets due to humidity.",
      category: "Storage",
      priority: "medium" as const,
      icon: <Home className="text-purple-400" size={24} />
    },
    {
      tip: "Never share prescription medications with others, even if they have similar symptoms or conditions.",
      category: "Safety",
      priority: "high" as const,
      icon: <AlertCircle className="text-red-400" size={24} />
    },
    {
      tip: "Regular exercise can improve medication effectiveness and overall health. Consult your doctor about safe exercise routines.",
      category: "Lifestyle",
      priority: "medium" as const,
      icon: <Activity className="text-orange-400" size={24} />
    },
    {
      tip: "Stay hydrated by drinking plenty of water throughout the day, especially when taking medications that may cause dehydration.",
      category: "Lifestyle",
      priority: "medium" as const,
      icon: <Heart className="text-cyan-400" size={24} />
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400/30 bg-red-500/10';
      case 'medium': return 'border-yellow-400/30 bg-yellow-500/10';
      case 'low': return 'border-green-400/30 bg-green-500/10';
      default: return 'border-white/20 bg-white/5';
    }
  };

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
                  Health Tips 💡
                </h1>
              </div>
              <p className="text-base sm:text-xl text-gray-300">Personalized health guidance for you</p>
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
        {/* Daily Tip */}
        {dailyTip && (
          <Card className="health-tip-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                  <Lightbulb size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">Daily Health Tip</h3>
                  <p className="text-lg leading-relaxed mb-2 text-gray-200">{dailyTip.tip}</p>
                  <div className="flex items-center justify-between">
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

        {/* Personalized Tip Generator */}
        <Card className="glass-card border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Get Personalized Tips</h3>
                <p className="text-gray-300">
                  Generate custom health tips based on your current medications
                </p>
              </div>
              <Button
                onClick={() => generateTipMutation.mutate(medications || [])}
                disabled={generateTipMutation.isPending || !medications}
                className="glass-button-primary"
                data-testid="button-generate-tip"
              >
                {generateTipMutation.isPending ? (
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                Generate Tip
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Tip Display */}
        {personalizedTip && (
          <Card className="health-tip-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
                  <Heart size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">Your Personalized Tip</h3>
                  <p className="text-lg leading-relaxed mb-2 text-gray-200">{personalizedTip.tip}</p>
                  <span className="inline-block px-3 py-1 bg-white/10 text-cyan-300 rounded-full text-sm backdrop-blur-md">
                    {personalizedTip.category}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Static Tips */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">General Health Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staticTips.map((tip, index) => (
              <Card key={index} className={`glass-card border ${getPriorityColor(tip.priority || 'medium')}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md">
                      {tip.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{tip.category}</h4>
                        {tip.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tip.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            tip.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {tip.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200 leading-relaxed">{tip.tip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

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
            <Link href="/schedule">
              <Button
                variant="ghost"
                size="lg"
                className="nav-button text-lg text-gray-300 hover:text-white"
                data-testid="nav-schedule"
              >
                <Calendar size={24} />
                <span className="ml-2">Schedule</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="nav-button active text-lg text-white"
              data-testid="nav-health-tips"
            >
              <Lightbulb size={24} />
              <span className="ml-2">Tips</span>
            </Button>
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
