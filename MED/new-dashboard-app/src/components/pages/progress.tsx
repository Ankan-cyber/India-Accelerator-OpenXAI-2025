"use client"

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Target,
  Activity,
  Calendar as CalendarIcon,
  PieChart,
  BarChart3,
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
import { EmergencyContactsDisplayDialog } from "@/components/emergency-contacts-display-dialog";
import AppLayout from "@/components/app-layout";
import AppHeader from "@/components/app-header";

export default function Progress() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

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

  // Calculate progress statistics with medication date ranges
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

    // Calculate total expected doses in the time range, considering medication start/end dates
    let totalExpected = 0;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // For each day in the range, calculate expected doses based on active medications
    for (let currentDate = new Date(filterDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayString = currentDate.toISOString().split('T')[0];
      
      medications.forEach(med => {
        const createdDate = new Date(med.createdAt);
        const medStartDate = med.startDate ? new Date(med.startDate) : createdDate;
        const medEndDate = med.endDate ? new Date(med.endDate) : null;
        
        // Check if medication was active on this day
        const dayDate = new Date(dayString);
        const isAfterCreation = dayDate >= createdDate;
        const isAfterStart = dayDate >= medStartDate;
        const isBeforeEnd = !medEndDate || dayDate <= medEndDate;
        
        if (isAfterCreation && isAfterStart && isBeforeEnd) {
          totalExpected += med.times.length;
        }
      });
    }

    const totalTaken = filteredLogs.length;
    const adherenceRate = totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;

    // Calculate current streak - consecutive days of perfect adherence
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if today is complete first
    const todayString = today.toISOString().split('T')[0];
    const todayLogs = sortedLogs.filter(log => log.date === todayString);
    let todayExpected = 0;
    
    medications.forEach(med => {
      const createdDate = new Date(med.createdAt);
      const medStartDate = med.startDate ? new Date(med.startDate) : createdDate;
      const medEndDate = med.endDate ? new Date(med.endDate) : null;
      
      const isAfterCreation = today >= createdDate;
      const isAfterStart = today >= medStartDate;
      const isBeforeEnd = !medEndDate || today <= medEndDate;
      
      if (isAfterCreation && isAfterStart && isBeforeEnd) {
        todayExpected += med.times.length;
      }
    });
    
    // Start checking from today if it's complete, otherwise start from yesterday
    const checkDate = new Date(today);
    if (todayExpected > 0 && todayLogs.length >= todayExpected) {
      currentStreak = 1; // Today is complete
      checkDate.setDate(today.getDate() - 1); // Start checking from yesterday
    } else if (todayExpected === 0) {
      // No medications expected today, start from yesterday
      checkDate.setDate(today.getDate() - 1);
    } else {
      // Today is incomplete, start from yesterday
      checkDate.setDate(today.getDate() - 1);
    }

    // Only check up to 365 days or until we find the first medication
    const earliestMedicationDate = medications.length > 0 
      ? Math.min(...medications.map(med => new Date(med.createdAt).getTime()))
      : Date.now();
    
    while (checkDate.getTime() >= earliestMedicationDate) {
      const dateString = checkDate.toISOString().split('T')[0];
      const dayDate = new Date(dateString);
      const dayLogs = sortedLogs.filter(log => log.date === dateString);
      
      // Calculate expected doses for this day based on active medications
      let expectedForDay = 0;
      medications.forEach(med => {
        const createdDate = new Date(med.createdAt);
        const medStartDate = med.startDate ? new Date(med.startDate) : createdDate;
        const medEndDate = med.endDate ? new Date(med.endDate) : null;
        
        const isAfterCreation = dayDate >= createdDate;
        const isAfterStart = dayDate >= medStartDate;
        const isBeforeEnd = !medEndDate || dayDate <= medEndDate;
        
        if (isAfterCreation && isAfterStart && isBeforeEnd) {
          expectedForDay += med.times.length;
        }
      });
      
      // Only count days where medications were expected
      if (expectedForDay > 0) {
        if (dayLogs.length >= expectedForDay) {
          currentStreak++;
        } else {
          // Streak broken - stop counting
          break;
        }
      }
      // If no medications expected on this day, continue without breaking streak
      
      checkDate.setDate(checkDate.getDate() - 1);
      
      // Safety break to prevent infinite loops
      if (currentStreak > 365) break;
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

  // Get daily adherence for the last 30 days with medication date ranges
  const getDailyAdherence = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayLogs = logs.filter(log => log.date === dateString);
      
      // Calculate expected doses for this day based on active medications
      let expectedForDay = 0;
      medications.forEach(med => {
        const createdDate = new Date(med.createdAt);
        const medStartDate = med.startDate ? new Date(med.startDate) : createdDate;
        const medEndDate = med.endDate ? new Date(med.endDate) : null;
        
        const isAfterCreation = date >= createdDate;
        const isAfterStart = date >= medStartDate;
        const isBeforeEnd = !medEndDate || date <= medEndDate;
        
        if (isAfterCreation && isAfterStart && isBeforeEnd) {
          expectedForDay += med.times.length;
        }
      });
      
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

  // Get medication-specific stats with date-based calculation
  const getMedicationStats = () => {
    return medications.map(med => {
      const medLogs = logs.filter(log => log.medicationId === med.id);
      
      // Calculate expected doses for the last 30 days for this medication
      let totalExpected = 0;
      const now = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        const createdDate = new Date(med.createdAt);
        const medStartDate = med.startDate ? new Date(med.startDate) : createdDate;
        const medEndDate = med.endDate ? new Date(med.endDate) : null;
        
        const isAfterCreation = date >= createdDate;
        const isAfterStart = date >= medStartDate;
        const isBeforeEnd = !medEndDate || date <= medEndDate;
        
        if (isAfterCreation && isAfterStart && isBeforeEnd) {
          totalExpected += med.times.length;
        }
      }
      
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
    <AppLayout>
      <AppHeader 
        title="Progress Tracking 📊"
        subtitle="Monitor your medication adherence and achievements"
        onEmergencyContacts={() => setShowEmergencyContacts(true)}
      />

      {/* Main Content */}
      <main className="mobile-padding p-6 relative z-10">
        {/* Time Range Selector */}
        <Card className="glass-card border-white/20 mobile-section-spacing">
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
        <div className="mobile-grid mobile-section-spacing">
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
                  <p className="text-sm text-gray-300">
                    {stats.currentStreak === 1 ? 'perfect day' : 'perfect days'}
                  </p>
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
        <Card className="glass-card border-white/20 mobile-section-spacing">
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
        <Card className="glass-card border-white/20 mobile-section-spacing">
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
    </AppLayout>
  );
}
