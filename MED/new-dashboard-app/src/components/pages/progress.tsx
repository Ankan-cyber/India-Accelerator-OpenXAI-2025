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
  Settings,
  Trophy,
  Target,
  Activity,
  Calendar as CalendarIcon,
  PieChart,
  BarChart3,
  Phone,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { IMedication, IMedicationLog } from "@/lib/models";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { EmergencyContactsDisplayDialog } from "@/components/emergency-contacts-display-dialog";

export default function Progress() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
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

  // Calculate progress statistics
  const calculateStats = () => {
    const now = new Date();
    const filterDate = new Date();
    
    if (timeRange === 'week') {
      filterDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      filterDate.setDate(now.getDate() - 30);
    } else {
      filterDate.setTime(0); // All time
    }

    const filteredLogs = logs.filter(log => 
      new Date(log.date) >= filterDate
    );

    // Calculate total expected doses in the time range
    const days = Math.max(1, Math.ceil((now.getTime() - filterDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalExpected = medications.reduce((acc, med) => acc + (med.times.length * days), 0);
    const totalTaken = filteredLogs.length;
    const adherenceRate = totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;

    // Calculate streaks
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const dateString = checkDate.toISOString().split('T')[0];
      const dayLogs = sortedLogs.filter(log => log.date === dateString);
      const expectedForDay = medications.reduce((acc, med) => acc + med.times.length, 0);
      
      if (expectedForDay === 0 || dayLogs.length >= expectedForDay) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      
      if (currentStreak > 365) break; // Safety break
    }

    return {
      adherenceRate,
      totalTaken,
      totalExpected,
      currentStreak,
      missedDoses: Math.max(0, totalExpected - totalTaken)
    };
  };

  const stats = calculateStats();

  // Get daily adherence for the last 30 days
  const getDailyAdherence = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayLogs = logs.filter(log => log.date === dateString);
      const expectedForDay = medications.reduce((acc, med) => acc + med.times.length, 0);
      const adherence = expectedForDay > 0 ? Math.round((dayLogs.length / expectedForDay) * 100) : 0;
      
      days.push({
        name: `${dayName} ${date.getDate()}`,
        adherence,
        taken: dayLogs.length,
        expected: expectedForDay
      });
    }
    
    return days;
  };

  const dailyAdherence = getDailyAdherence();

  // Get medication-specific stats
  const getMedicationStats = () => {
    return medications.map(med => {
      const medLogs = logs.filter(log => log.medicationId === med.id);
      const totalExpected = med.times.length * 30; // Last 30 days
      const adherence = totalExpected > 0 ? Math.round((medLogs.length / totalExpected) * 100) : 0;
      
      return {
        ...med,
        adherence,
        taken: medLogs.length,
        expected: totalExpected
      };
    }).sort((a, b) => b.adherence - a.adherence);
  };

  const medicationStats = getMedicationStats();

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAdherenceGradient = (percentage: number) => {
    if (percentage >= 90) return 'from-emerald-500 to-emerald-600';
    if (percentage >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
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
                  Progress Tracking 📊
                </h1>
              </div>
              <p className="text-base sm:text-xl text-gray-300">Monitor your medication adherence and achievements</p>
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
        {/* Time Range Selector */}
        <Card className="glass-card border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Time Range</h3>
              <div className="flex space-x-2">
                {(['week', 'month', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    onClick={() => setTimeRange(range)}
                    className={timeRange === range ? 'glass-button-primary' : 'glass-button text-white hover:text-white'}
                    size="sm"
                  >
                    {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card border-white/20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">Adherence Rate</h3>
                  <p className={`text-3xl font-bold mb-1 ${getAdherenceColor(stats.adherenceRate)}`}>
                    {stats.adherenceRate}%
                  </p>
                  <p className="text-sm text-gray-300">{stats.totalTaken}/{stats.totalExpected} doses</p>
                </div>
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md">
                  <Target className="text-emerald-400" size={28} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-white/20 bg-gradient-to-br from-purple-500/20 to-purple-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">Current Streak</h3>
                  <p className="text-3xl font-bold mb-1 text-purple-400">{stats.currentStreak}</p>
                  <p className="text-sm text-gray-300">perfect days</p>
                </div>
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md">
                  <Trophy className="text-purple-400" size={28} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-white/20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">Doses Taken</h3>
                  <p className="text-3xl font-bold mb-1 text-cyan-400">{stats.totalTaken}</p>
                  <p className="text-sm text-gray-300">in selected period</p>
                </div>
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md">
                  <Activity className="text-cyan-400" size={28} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-white/20 bg-gradient-to-br from-orange-500/20 to-orange-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">Missed Doses</h3>
                  <p className="text-3xl font-bold mb-1 text-orange-400">{stats.missedDoses}</p>
                  <p className="text-sm text-gray-300">opportunities to improve</p>
                </div>
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md">
                  <CalendarIcon className="text-orange-400" size={28} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Adherence Chart */}
        <Card className="glass-card border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Daily Adherence (Last 30 Days)</h3>
              <BarChart3 className="text-gray-400" size={24} />
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <AreaChart
                  data={dailyAdherence}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(20, 20, 30, 0.8)',
                      borderColor: 'rgba(136, 132, 216, 0.5)',
                      color: '#fff'
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="adherence"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorAdherence)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Medication-Specific Progress */}
        <Card className="glass-card border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Medication Progress (Last 30 Days)</h3>
              <PieChart className="text-gray-400" size={24} />
            </div>
            
            {medicationStats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No medications to track</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicationStats.map((med, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{med.name}</h4>
                        <p className="text-sm text-gray-300">{med.dosage}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getAdherenceColor(med.adherence)}`}>
                          {med.adherence}%
                        </p>
                        <p className="text-sm text-gray-300">
                          {med.taken}/{med.expected}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${getAdherenceGradient(med.adherence)} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${med.adherence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="health-tip-card mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-400">
                <Trophy size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-white">Achievements</h3>
                <div className="space-y-2">
                  {stats.currentStreak >= 7 && (
                    <div className="flex items-center space-x-2">
                      <Trophy className="text-yellow-400" size={16} />
                      <span className="text-gray-200">Week Warrior - 7 day streak!</span>
                    </div>
                  )}
                  {stats.adherenceRate >= 90 && (
                    <div className="flex items-center space-x-2">
                      <Target className="text-emerald-400" size={16} />
                      <span className="text-gray-200">Excellence - 90%+ adherence rate!</span>
                    </div>
                  )}
                  {stats.totalTaken >= 50 && (
                    <div className="flex items-center space-x-2">
                      <Activity className="text-cyan-400" size={16} />
                      <span className="text-gray-200">Dedicated - 50+ doses taken!</span>
                    </div>
                  )}
                  {stats.currentStreak === 0 && stats.adherenceRate < 70 && (
                    <p className="text-gray-300">Keep going! Your first achievement is just around the corner.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
            <Button
              variant="ghost"
              size="lg"
              className="nav-button active text-lg text-white"
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
