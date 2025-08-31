"use client"

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  Calendar, 
  Lightbulb, 
  TrendingUp,
  PillBottle,
  Phone,
  Settings,
  RefreshCw,
  Heart,
  Shield,
  Activity,
  AlertCircle
} from "lucide-react";
import type { IMedication } from "@/lib/models";

interface HealthTip {
  tip: string;
  category: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function HealthTipsPage() {
  const [personalizedTip, setPersonalizedTip] = useState<HealthTip | null>(null);
  const { toast } = useToast();

  const { data: medications = [] } = useQuery<IMedication[]>({
    queryKey: ['/api/medications'],
    queryFn: async () => {
      const response = await fetch('/api/medications');
      if (!response.ok) throw new Error('Failed to fetch medications');
      return response.json();
    },
  });

  const { data: dailyTip } = useQuery<HealthTip>({
    queryKey: ['/api/daily-health-tip'],
    queryFn: async () => {
      const response = await fetch('/api/daily-health-tip');
      if (!response.ok) throw new Error('Failed to fetch daily health tip');
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const generateTipMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/health-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications }),
      });
      if (!response.ok) throw new Error('Failed to generate tip');
      return response.json();
    },
    onSuccess: (data) => {
      setPersonalizedTip(data);
      toast({
        title: "New tip generated",
        description: "Here's a personalized health tip for you",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate personalized tip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const staticTips = [
    {
      tip: "Set up a daily routine for taking medications at the same time each day to improve adherence and effectiveness.",
      category: "Medication Management",
      priority: "high" as const,
      icon: <PillBottle className="text-blue-600" size={24} />
    },
    {
      tip: "Keep a medication list with you at all times, including doses and schedules, for medical appointments and emergencies.",
      category: "Safety",
      priority: "high" as const,
      icon: <Shield className="text-green-600" size={24} />
    },
    {
      tip: "Store medications in a cool, dry place away from direct sunlight. Avoid bathroom medicine cabinets due to humidity.",
      category: "Storage",
      priority: "medium" as const,
      icon: <Home className="text-purple-600" size={24} />
    },
    {
      tip: "Never share prescription medications with others, even if they have similar symptoms or conditions.",
      category: "Safety",
      priority: "high" as const,
      icon: <AlertCircle className="text-red-600" size={24} />
    },
    {
      tip: "Use a pill organizer to help you remember your daily medications and avoid missing doses.",
      category: "Organization",
      priority: "medium" as const,
      icon: <Activity className="text-orange-600" size={24} />
    },
    {
      tip: "Stay hydrated by drinking plenty of water throughout the day, especially when taking medications.",
      category: "General Health",
      priority: "medium" as const,
      icon: <Heart className="text-pink-600" size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-4xl font-bold text-foreground mr-4">
                  Health Tips 💡
                </h1>
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full">
                  <span className="text-lg font-semibold">🤖 PillPal AI</span>
                </div>
              </div>
              <p className="text-xl text-muted-foreground">
                AI-powered advice for better health
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                className="text-lg"
                data-testid="button-settings"
              >
                <Settings size={20} />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Daily Health Tip */}
        {dailyTip && (
          <Card className="mb-8 border-2 border-primary">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary text-primary-foreground">
                  <Lightbulb size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">Daily Health Tip</h3>
                  <p className="text-lg leading-relaxed mb-3">{dailyTip.tip}</p>
                  <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                    {dailyTip.category}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personalized Tip Generator */}
        <Card className="mb-8 border-2 border-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Get Personalized Advice</h3>
                <p className="text-lg text-muted-foreground">
                  Generate custom health tips based on your current medications
                </p>
              </div>
              <Button
                onClick={() => generateTipMutation.mutate()}
                disabled={generateTipMutation.isPending}
                size="lg"
                className="text-lg"
                data-testid="button-generate-tip"
              >
                {generateTipMutation.isPending ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    Generate Tip
                  </>
                )}
              </Button>
            </div>

            {personalizedTip && (
              <div className="mt-6 p-4 bg-accent/10 border border-accent rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Your Personalized Tip:</h4>
                <p className="text-base leading-relaxed mb-2">{personalizedTip.tip}</p>
                <div className="flex items-center space-x-2">
                  <span className="inline-block px-2 py-1 bg-muted text-muted-foreground rounded text-sm">
                    {personalizedTip.category}
                  </span>
                  {personalizedTip.priority && (
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      personalizedTip.priority === 'high' ? 'bg-destructive text-destructive-foreground' :
                      personalizedTip.priority === 'medium' ? 'bg-warning text-warning-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {personalizedTip.priority} priority
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Static Health Tips */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Essential Health Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staticTips.map((tip, index) => (
              <Card
                key={index}
                className={`border-2 ${
                  tip.priority === 'high' ? 'border-destructive/20 bg-destructive/5' :
                  tip.priority === 'medium' ? 'border-warning/20 bg-warning/5' :
                  'border-muted bg-muted/5'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-background border">
                      {tip.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{tip.category}</h4>
                      <p className="text-base leading-relaxed mb-3">{tip.tip}</p>
                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                        tip.priority === 'high' ? 'bg-destructive text-destructive-foreground' :
                        tip.priority === 'medium' ? 'bg-warning text-warning-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {tip.priority} priority
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Home className="mx-auto mb-3 text-blue-600" size={32} />
                <h4 className="font-semibold text-lg">Dashboard</h4>
                <p className="text-sm text-muted-foreground">Today's overview</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/schedule">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="mx-auto mb-3 text-green-600" size={32} />
                <h4 className="font-semibold text-lg">Schedule</h4>
                <p className="text-sm text-muted-foreground">Weekly plan</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="mx-auto mb-3 text-purple-600" size={32} />
                <h4 className="font-semibold text-lg">Progress</h4>
                <p className="text-sm text-muted-foreground">Track adherence</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <PillBottle className="mx-auto mb-3 text-orange-600" size={32} />
              <h4 className="font-semibold text-lg">Medications</h4>
              <p className="text-sm text-muted-foreground">Manage pills</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center space-x-8">
            <Link href="/">
              <Button
                variant="ghost"
                size="lg"
                className="nav-button text-lg"
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
                className="nav-button text-lg"
                data-testid="nav-schedule"
              >
                <Calendar size={24} />
                <span className="ml-2">Schedule</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="nav-button active text-lg"
              data-testid="nav-health-tips"
            >
              <Lightbulb size={24} />
              <span className="ml-2">Tips</span>
            </Button>
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
    </div>
  );
}