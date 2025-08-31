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
  ChevronRight,
  Award,
  Target,
  Clock,
  BarChart3
} from "lucide-react";
import type { IMedication, IMedicationLog } from "@/lib/models";

export default function ProgressPage() {
  const [currentMonthStart, setCurrentMonthStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
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

  // Calculate date ranges
  const currentMonth = currentMonthStart.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const goToPreviousMonth = () => {
    setCurrentMonthStart(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonthStart(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonthStart(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Get days in current month
  const daysInMonth = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 0).getDate();
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentMonthStart);
    date.setDate(i + 1);
    return date;
  });

  // Calculate statistics
  const getMonthStats = () => {
    const monthStart = currentMonthStart.toISOString().split('T')[0];
    const monthEnd = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 0)
      .toISOString().split('T')[0];

    const monthLogs = logs.filter(log => log.date >= monthStart && log.date <= monthEnd);
    
    // Calculate total scheduled doses for the month
    const totalScheduledDoses = monthDates.reduce((total, date) => {
      if (date <= new Date()) { // Only count past and current days
        return total + medications.reduce((medTotal, med) => medTotal + med.times.length, 0);
      }
      return total;
    }, 0);

    const adherenceRate = totalScheduledDoses > 0 ? Math.round((monthLogs.length / totalScheduledDoses) * 100) : 0;

    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      const dayMeds = medications.reduce((total, med) => total + med.times.length, 0);
      const dayTaken = logs.filter(log => log.date === dateString).length;
      
      if (dayMeds > 0 && dayTaken === dayMeds) {
        currentStreak++;
      } else if (dayMeds > 0) {
        break;
      }
    }

    return {
      adherenceRate,
      totalTaken: monthLogs.length,
      totalScheduled: totalScheduledDoses,
      currentStreak
    };
  };

  const stats = getMonthStats();

  // Weekly breakdown
  const getWeeklyBreakdown = () => {
    const weeks = [];
    const monthStart = new Date(currentMonthStart);
    const monthEnd = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 0);
    
    // Find the first Sunday of the month view
    const firstDay = new Date(monthStart);
    firstDay.setDate(1);
    const startDay = firstDay.getDay();
    const weekStart = new Date(firstDay);
    weekStart.setDate(1 - startDay);

    for (let week = 0; week < 6; week++) {
      const weekStartDate = new Date(weekStart);
      weekStartDate.setDate(weekStart.getDate() + (week * 7));
      
      if (weekStartDate > monthEnd) break;

      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(weekStartDate);
        currentDate.setDate(weekStartDate.getDate() + day);
        
        const dateString = currentDate.toISOString().split('T')[0];
        const isInMonth = currentDate.getMonth() === currentMonthStart.getMonth();
        const isPast = currentDate <= new Date();
        
        if (isInMonth && isPast) {
          const dayScheduled = medications.reduce((total, med) => total + med.times.length, 0);
          const dayTaken = logs.filter(log => log.date === dateString).length;
          const dayRate = dayScheduled > 0 ? Math.round((dayTaken / dayScheduled) * 100) : 0;
          
          weekDays.push({
            date: currentDate.getDate(),
            rate: dayRate,
            taken: dayTaken,
            scheduled: dayScheduled,
            isToday: currentDate.toDateString() === new Date().toDateString()
          });
        }
      }
      
      if (weekDays.length > 0) {
        weeks.push(weekDays);
      }
    }
    
    return weeks;
  };

  const weeklyData = getWeeklyBreakdown();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Progress Tracking 📊
              </h1>
              <p className="text-xl text-muted-foreground">
                Monitor your medication adherence
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
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={goToPreviousMonth}
            variant="outline"
            size="lg"
            className="text-lg"
            data-testid="button-previous-month"
          >
            <ChevronLeft size={20} />
            Previous Month
          </Button>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{currentMonth}</h2>
            <Button
              onClick={goToCurrentMonth}
              variant="ghost"
              className="text-primary"
              data-testid="button-current-month"
            >
              Go to current month
            </Button>
          </div>

          <Button
            onClick={goToNextMonth}
            variant="outline"
            size="lg"
            className="text-lg"
            data-testid="button-next-month"
          >
            Next Month
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-success bg-success/5">
            <CardContent className="p-6 text-center">
              <Target className="mx-auto mb-3 text-success" size={32} />
              <h3 className="text-lg font-semibold mb-1">Adherence Rate</h3>
              <p className="text-3xl font-bold text-success">{stats.adherenceRate}%</p>
              <p className="text-sm text-muted-foreground">
                {stats.totalTaken}/{stats.totalScheduled} doses
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning bg-warning/5">
            <CardContent className="p-6 text-center">
              <Award className="mx-auto mb-3 text-warning" size={32} />
              <h3 className="text-lg font-semibold mb-1">Current Streak</h3>
              <p className="text-3xl font-bold text-warning">{stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">
                {stats.currentStreak === 1 ? 'day' : 'days'} perfect
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="p-6 text-center">
              <PillBottle className="mx-auto mb-3 text-primary" size={32} />
              <h3 className="text-lg font-semibold mb-1">Medications</h3>
              <p className="text-3xl font-bold text-primary">{medications.length}</p>
              <p className="text-sm text-muted-foreground">actively tracked</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent bg-accent/5">
            <CardContent className="p-6 text-center">
              <Clock className="mx-auto mb-3 text-accent-foreground" size={32} />
              <h3 className="text-lg font-semibold mb-1">This Month</h3>
              <p className="text-3xl font-bold text-accent-foreground">{stats.totalTaken}</p>
              <p className="text-sm text-muted-foreground">doses taken</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Calendar View */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-2xl font-semibold mb-6 flex items-center">
              <BarChart3 className="mr-3 text-primary" size={28} />
              Daily Adherence
            </h3>
            
            <div className="space-y-4">
              {weeklyData.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`p-3 rounded-lg border text-center ${
                        day.isToday 
                          ? 'border-primary border-2 bg-primary/10' 
                          : 'border-border'
                      } ${
                        day.rate === 100 
                          ? 'bg-success/20 text-success-foreground' 
                          : day.rate >= 75 
                          ? 'bg-warning/20 text-warning-foreground'
                          : day.rate > 0 
                          ? 'bg-destructive/20 text-destructive-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-lg font-bold">{day.date}</div>
                      <div className="text-sm">{day.rate}%</div>
                      <div className="text-xs text-muted-foreground">
                        {day.taken}/{day.scheduled}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-success/20 rounded mr-2"></div>
                <span>100% (Perfect)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-warning/20 rounded mr-2"></div>
                <span>75-99% (Good)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-destructive/20 rounded mr-2"></div>
                <span>1-74% (Needs improvement)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-muted rounded mr-2"></div>
                <span>0% (Missed)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="mb-8 border-2 border-accent">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-accent text-accent-foreground">
                <Award size={28} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Keep Up the Great Work!</h3>
                {stats.adherenceRate >= 90 ? (
                  <p className="text-lg">
                    Excellent adherence! You're doing a fantastic job staying on track with your medications.
                  </p>
                ) : stats.adherenceRate >= 75 ? (
                  <p className="text-lg">
                    Good progress! Try to maintain consistency with your medication schedule for better results.
                  </p>
                ) : (
                  <p className="text-lg">
                    Taking medications at the same time each day helps build a strong routine and 
                    improves effectiveness.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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

          <Link href="/health-tips">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Lightbulb className="mx-auto mb-3 text-yellow-600" size={32} />
                <h4 className="font-semibold text-lg">Health Tips</h4>
                <p className="text-sm text-muted-foreground">Personalized advice</p>
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
            <Button
              variant="ghost"
              size="lg"
              className="nav-button active text-lg"
              data-testid="nav-progress"
            >
              <TrendingUp size={24} />
              <span className="ml-2">Progress</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}