"use client"

import { useQuery } from "@tanstack/react-query";
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
  Phone,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { IMedication, IMedicationLog } from "@/lib/models";

export default function SchedulePage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    return new Date(now.setDate(diff));
  });

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

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    setCurrentWeekStart(new Date(now.setDate(diff)));
  };

  const getDaySchedule = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return medications.flatMap(med =>
      med.times.map(time => ({
        ...med,
        scheduledTime: time,
        id: `${med.id}-${time}`,
        isTaken: logs.some(log =>
          log.medicationId === med.id &&
          log.scheduledTime === time &&
          log.date === dateString
        )
      }))
    ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Weekly Schedule 📅
              </h1>
              <p className="text-xl text-muted-foreground">
                Track your medication schedule
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
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={goToPreviousWeek}
            variant="outline"
            size="lg"
            className="text-lg"
            data-testid="button-previous-week"
          >
            <ChevronLeft size={20} />
            Previous Week
          </Button>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {
                new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              }
            </h2>
            <Button
              onClick={goToCurrentWeek}
              variant="ghost"
              className="text-primary"
              data-testid="button-current-week"
            >
              Go to current week
            </Button>
          </div>

          <Button
            onClick={goToNextWeek}
            variant="outline"
            size="lg"
            className="text-lg"
            data-testid="button-next-week"
          >
            Next Week
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Weekly Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
          {weekDates.map((date, index) => {
            const daySchedule = getDaySchedule(date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();
            const takenCount = daySchedule.filter(med => med.isTaken).length;
            const totalCount = daySchedule.length;
            
            return (
              <Card
                key={index}
                className={`${isToday(date) ? 'border-primary border-2 bg-primary/5' : ''} min-h-[300px]`}
              >
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <h3 className={`text-lg font-semibold ${isToday(date) ? 'text-primary' : ''}`}>
                      {dayName}
                    </h3>
                    <p className={`text-2xl font-bold ${isToday(date) ? 'text-primary' : ''}`}>
                      {dayNumber}
                    </p>
                    {totalCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {takenCount}/{totalCount} taken
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {daySchedule.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm">
                        No medications
                      </p>
                    ) : (
                      daySchedule.map((med) => (
                        <div
                          key={med.id}
                          className={`p-2 rounded border text-sm ${
                            med.isTaken
                              ? 'bg-success/10 border-success text-success-foreground'
                              : 'bg-muted border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium truncate">{med.name}</p>
                              <p className="text-xs text-muted-foreground">{med.dosage}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{med.scheduledTime}</p>
                              {med.isTaken && (
                                <p className="text-xs text-success">✓ Taken</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <PillBottle className="mx-auto mb-3 text-purple-600" size={32} />
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
            <Button
              variant="ghost"
              size="lg"
              className="nav-button active text-lg"
              data-testid="nav-schedule"
            >
              <Calendar size={24} />
              <span className="ml-2">Schedule</span>
            </Button>
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
    </div>
  );
}