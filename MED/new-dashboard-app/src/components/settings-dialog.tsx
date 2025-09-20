"use client"

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, User, Lock, Bell, Palette, LogOut, PillBottle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [medicationSettings, setMedicationSettings] = useState({
    keepLogsAfterDeletion: false,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    notificationsEnabled: true,
    medicationReminders: {
      enabled: true,
      reminderMinutes: [15, 0],
    },
    healthTips: {
      enabled: true,
      dailyTime: '09:00',
    },
    progressReports: {
      enabled: true,
      weeklyDay: 0,
      weeklyTime: '18:00',
    },
    overdueAlerts: {
      enabled: true,
      intervalMinutes: 30,
      maxReminders: 3,
    },
  });

  const [generalNotificationSettings, setGeneralNotificationSettings] = useState({
    sound: true,
    vibration: true,
    showOnLockScreen: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load user settings
  const { data: userSettings } = useQuery({
    queryKey: ['/api/user-settings'],
    queryFn: async () => {
      const response = await fetch('/api/user-settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  // Update medication settings when data loads
  useEffect(() => {
    if (userSettings) {
      setMedicationSettings({
        keepLogsAfterDeletion: userSettings.keepLogsAfterDeletion,
      });
      if (userSettings.notificationSettings) {
        setNotificationSettings(userSettings.notificationSettings);
      }
      if (userSettings.generalNotificationSettings) {
        setGeneralNotificationSettings(userSettings.generalNotificationSettings);
      }
    }
  }, [userSettings]);

  // Save medication settings mutation
  const saveMedicationSettingsMutation = useMutation({
    mutationFn: async (settings: typeof medicationSettings) => {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      toast({
        title: "Settings saved",
        description: "Your medication preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveNotificationSettingsMutation = useMutation({
    mutationFn: async (settings: { notificationSettings: typeof notificationSettings, generalNotificationSettings: typeof generalNotificationSettings }) => {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save notification settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onClose = () => onOpenChange(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) throw new Error('Failed to change password');

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to change password:', err);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'medications', label: 'Medications', icon: PillBottle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings size={28} />
            Settings
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-6 mt-6">
          {/* Sidebar */}
          <div className="w-full sm:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-400/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card className="glass-card border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="glass-button mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="glass-button mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="glass-button-primary"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="glass-card border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password" className="text-white">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="glass-button mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password" className="text-white">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="glass-button mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password" className="text-white">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="glass-button mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="glass-button-primary"
                    >
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'medications' && (
              <Card className="glass-card border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Medication Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Deletion Behavior</h4>
                      <p className="text-gray-300 mb-4">
                        Choose what happens to your medication history when you delete a medication.
                      </p>
                      
                      <div className="space-y-3">
                        <div 
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            medicationSettings.keepLogsAfterDeletion 
                              ? 'bg-purple-500/20 border-purple-400/50 text-purple-100' 
                              : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                          }`}
                          onClick={() => setMedicationSettings(prev => ({ ...prev, keepLogsAfterDeletion: true }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold">Keep medication logs</h5>
                              <p className="text-sm opacity-80">Preserve your medication history for progress tracking</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              medicationSettings.keepLogsAfterDeletion ? 'bg-purple-500 border-purple-400' : 'border-gray-400'
                            }`}>
                              {medicationSettings.keepLogsAfterDeletion && (
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            !medicationSettings.keepLogsAfterDeletion 
                              ? 'bg-red-500/20 border-red-400/50 text-red-100' 
                              : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                          }`}
                          onClick={() => setMedicationSettings(prev => ({ ...prev, keepLogsAfterDeletion: false }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold">Delete all data</h5>
                              <p className="text-sm opacity-80">Remove all logs when deleting medications (default)</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              !medicationSettings.keepLogsAfterDeletion ? 'bg-red-500 border-red-400' : 'border-gray-400'
                            }`}>
                              {!medicationSettings.keepLogsAfterDeletion && (
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => saveMedicationSettingsMutation.mutate(medicationSettings)}
                      className="glass-button-primary w-full"
                      disabled={saveMedicationSettingsMutation.isPending}
                    >
                      {saveMedicationSettingsMutation.isPending ? 'Saving...' : 'Save Medication Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="glass-card border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
                  <div className="space-y-6">
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Enable All Notifications</p>
                          <p className="text-gray-300 text-sm">Master switch for all app notifications</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${notificationSettings.notificationsEnabled ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setNotificationSettings(prev => ({
                            ...prev,
                            notificationsEnabled: !prev.notificationsEnabled
                          }))}
                        >
                          {notificationSettings.notificationsEnabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Medication Reminders */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">💊 Medication Reminders</p>
                          <p className="text-gray-300 text-sm">Get notified when it&apos;s time to take medications</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${notificationSettings.medicationReminders.enabled ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setNotificationSettings(prev => ({
                            ...prev,
                            medicationReminders: { ...prev.medicationReminders, enabled: !prev.medicationReminders.enabled }
                          }))}
                        >
                          {notificationSettings.medicationReminders.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      
                      {notificationSettings.medicationReminders.enabled && (
                        <div className="ml-4 space-y-3 border-l-2 border-white/10 pl-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Reminder Times (minutes before)</Label>
                            <div className="flex gap-2 mt-2">
                              {[5, 10, 15, 30, 60].map(minutes => (
                                <Button
                                  key={minutes}
                                  variant="outline"
                                  size="sm"
                                  className={`glass-button text-xs ${
                                    notificationSettings.medicationReminders.reminderMinutes.includes(minutes) 
                                      ? 'border-blue-400 text-blue-400' : ''
                                  }`}
                                  onClick={() => {
                                    const current = notificationSettings.medicationReminders.reminderMinutes;
                                    const updated = current.includes(minutes)
                                      ? current.filter(m => m !== minutes)
                                      : [...current, minutes].sort((a, b) => b - a);
                                    setNotificationSettings(prev => ({
                                      ...prev,
                                      medicationReminders: { ...prev.medicationReminders, reminderMinutes: updated }
                                    }));
                                  }}
                                >
                                  {minutes}m
                                </Button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Selected: {notificationSettings.medicationReminders.reminderMinutes.join(', ')}m before
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Health Tips */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">💡 Daily Health Tips</p>
                          <p className="text-gray-300 text-sm">Receive daily health tips and advice</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${notificationSettings.healthTips.enabled ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setNotificationSettings(prev => ({
                            ...prev,
                            healthTips: { ...prev.healthTips, enabled: !prev.healthTips.enabled }
                          }))}
                        >
                          {notificationSettings.healthTips.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      
                      {notificationSettings.healthTips.enabled && (
                        <div className="ml-4 space-y-3 border-l-2 border-white/10 pl-4">
                          <div>
                            <Label htmlFor="health-tip-time" className="text-gray-300 text-sm">Daily Time</Label>
                            <Input
                              id="health-tip-time"
                              type="time"
                              value={notificationSettings.healthTips.dailyTime}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                healthTips: { ...prev.healthTips, dailyTime: e.target.value }
                              }))}
                              className="glass-button mt-1 w-40"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Reports */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">📈 Progress Reports</p>
                          <p className="text-gray-300 text-sm">Weekly summaries of your medication adherence</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${notificationSettings.progressReports.enabled ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setNotificationSettings(prev => ({
                            ...prev,
                            progressReports: { ...prev.progressReports, enabled: !prev.progressReports.enabled }
                          }))}
                        >
                          {notificationSettings.progressReports.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      
                      {notificationSettings.progressReports.enabled && (
                        <div className="ml-4 space-y-3 border-l-2 border-white/10 pl-4">
                          <div className="flex gap-4">
                            <div>
                              <Label className="text-gray-300 text-sm">Day of Week</Label>
                              <select
                                value={notificationSettings.progressReports.weeklyDay}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  progressReports: { ...prev.progressReports, weeklyDay: parseInt(e.target.value) }
                                }))}
                                className="glass-button mt-1 w-full"
                              >
                                <option value={0}>Sunday</option>
                                <option value={1}>Monday</option>
                                <option value={2}>Tuesday</option>
                                <option value={3}>Wednesday</option>
                                <option value={4}>Thursday</option>
                                <option value={5}>Friday</option>
                                <option value={6}>Saturday</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-gray-300 text-sm">Time</Label>
                              <Input
                                type="time"
                                value={notificationSettings.progressReports.weeklyTime}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  progressReports: { ...prev.progressReports, weeklyTime: e.target.value }
                                }))}
                                className="glass-button mt-1 w-full"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Overdue Alerts */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">⚠️ Overdue Alerts</p>
                          <p className="text-gray-300 text-sm">Reminders for missed medications</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${notificationSettings.overdueAlerts.enabled ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setNotificationSettings(prev => ({
                            ...prev,
                            overdueAlerts: { ...prev.overdueAlerts, enabled: !prev.overdueAlerts.enabled }
                          }))}
                        >
                          {notificationSettings.overdueAlerts.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      
                      {notificationSettings.overdueAlerts.enabled && (
                        <div className="ml-4 space-y-3 border-l-2 border-white/10 pl-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Reminder Interval (minutes)</Label>
                            <Input
                              type="number"
                              value={notificationSettings.overdueAlerts.intervalMinutes}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                overdueAlerts: { ...prev.overdueAlerts, intervalMinutes: parseInt(e.target.value) }
                              }))}
                              className="glass-button mt-1 w-40"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Max Reminders</Label>
                            <Input
                              type="number"
                              value={notificationSettings.overdueAlerts.maxReminders}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                overdueAlerts: { ...prev.overdueAlerts, maxReminders: parseInt(e.target.value) }
                              }))}
                              className="glass-button mt-1 w-40"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* General Settings */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                       <h4 className="text-lg font-medium text-white">General Notification Settings</h4>
                       <div className="flex items-center justify-between">
                        <p className="text-gray-300">Sound</p>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${generalNotificationSettings.sound ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setGeneralNotificationSettings(prev => ({ ...prev, sound: !prev.sound }))}
                        >
                          {generalNotificationSettings.sound ? 'On' : 'Off'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-300">Vibration</p>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${generalNotificationSettings.vibration ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setGeneralNotificationSettings(prev => ({ ...prev, vibration: !prev.vibration }))}
                        >
                          {generalNotificationSettings.vibration ? 'On' : 'Off'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-300">Show on Lock Screen</p>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${generalNotificationSettings.showOnLockScreen ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setGeneralNotificationSettings(prev => ({ ...prev, showOnLockScreen: !prev.showOnLockScreen }))}
                        >
                          {generalNotificationSettings.showOnLockScreen ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">🌙 Quiet Hours</p>
                          <p className="text-gray-300 text-sm">Silence notifications during specific times</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className={`glass-button ${generalNotificationSettings.quietHours.enabled ? 'border-green-400 text-green-400' : ''}`}
                          onClick={() => setGeneralNotificationSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled }
                          }))}
                        >
                          {generalNotificationSettings.quietHours.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      
                      {generalNotificationSettings.quietHours.enabled && (
                        <div className="ml-4 flex gap-4 border-l-2 border-white/10 pl-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Start Time</Label>
                            <Input
                              type="time"
                              value={generalNotificationSettings.quietHours.startTime}
                              onChange={(e) => setGeneralNotificationSettings(prev => ({
                                ...prev,
                                quietHours: { ...prev.quietHours, startTime: e.target.value }
                              }))}
                              className="glass-button mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">End Time</Label>
                            <Input
                              type="time"
                              value={generalNotificationSettings.quietHours.endTime}
                              onChange={(e) => setGeneralNotificationSettings(prev => ({
                                ...prev,
                                quietHours: { ...prev.quietHours, endTime: e.target.value }
                              }))}
                              className="glass-button mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => saveNotificationSettingsMutation.mutate({ notificationSettings, generalNotificationSettings })}
                      className="glass-button-primary w-full mt-6"
                      disabled={saveNotificationSettingsMutation.isPending}
                    >
                      {saveNotificationSettingsMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card className="glass-card border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Appearance Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-white font-medium mb-2">Theme</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button variant="outline" className="glass-button justify-start">
                          🌙 Dark Mode (Current)
                        </Button>
                        <Button variant="outline" className="glass-button justify-start opacity-50">
                          ☀️ Light Mode (Coming Soon)
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-2">Text Size</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button variant="outline" className="glass-button">
                          Small
                        </Button>
                        <Button variant="outline" className="glass-button-primary">
                          Medium
                        </Button>
                        <Button variant="outline" className="glass-button">
                          Large
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/20">
          <Button
            onClick={() => {
              logout();
              onClose();
            }}
            variant="destructive"
            className="glass-button"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
          
          <Button onClick={onClose} className="glass-button">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}