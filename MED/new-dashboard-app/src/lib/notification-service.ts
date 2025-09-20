import { NotificationType, NotificationPriority, NotificationStatus, INotification } from './notification-types';

interface UserNotificationSettings {
  notificationsEnabled?: boolean;
  notificationSettings?: {
    medicationReminders?: { enabled?: boolean; reminderMinutes?: number[] };
    healthTips?: { enabled?: boolean; dailyTime?: string };
    progressReports?: { enabled?: boolean; weeklyDay?: number; weeklyTime?: string };
    overdueAlerts?: { enabled?: boolean; intervalMinutes?: number; maxReminders?: number };
  };
  generalNotificationSettings?: {
    sound?: boolean;
    vibration?: boolean;
    showOnLockScreen?: boolean;
    quietHours?: {
      enabled?: boolean;
      startTime?: string;
      endTime?: string;
    };
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
  private overdueLoops: Map<string, { timeout: NodeJS.Timeout; count: number }> = new Map();

  private constructor() {
    this.initializeServiceWorker();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeServiceWorker(): Promise<void> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        this.registrationPromise = navigator.serviceWorker.register('/sw.js');
        const registration = await this.registrationPromise;
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        this.registrationPromise = Promise.resolve(null);
      }
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      this.permission = 'denied';
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  public async showNotification(notification: INotification): Promise<void> {
    if (typeof window === 'undefined' || this.permission !== 'granted') {
      console.warn('Notifications not permitted or not in browser environment');
      return;
    }

    // Check user settings before showing notification
    const userSettings = await this.getUserSettings();
    if (!this.shouldShowNotification(notification, userSettings)) {
      console.log('Notification blocked by user settings:', notification.title);
      return;
    }

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: notification.id || `notification-${Date.now()}`,
      requireInteraction: notification.priority === NotificationPriority.URGENT,
      silent: !userSettings?.generalNotificationSettings?.sound,
      data: {
        notificationId: notification.id,
        type: notification.type,
        ...notification.data,
      },
    };

    // Add action buttons for medication reminders
    if (notification.type === NotificationType.MEDICATION_REMINDER) {
      const extendedOptions = options as NotificationOptions & { actions?: { action: string; title: string }[] };
      extendedOptions.actions = [
        {
          action: 'taken',
          title: '✓ Mark as Taken',
        },
        {
          action: 'snooze',
          title: '⏰ Remind in 10 min',
        },
      ];
    }

    try {
      const registration = await this.registrationPromise;
      if (registration) {
        await registration.showNotification(notification.title, options);
      } else {
        // Fallback to basic notification
        new Notification(notification.title, options);
      }

      // Mark notification as sent
      await this.markNotificationAsSent(notification.id!);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  private async getUserSettings(): Promise<UserNotificationSettings | null> {
    try {
      const response = await fetch('/api/user-settings');
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      return null;
    }
  }

  private shouldShowNotification(notification: INotification, userSettings: UserNotificationSettings | null): boolean {
    if (!userSettings) return true; // Default to showing if settings unavailable

    // Check master notification switch
    if (!userSettings.notificationsEnabled) {
      return false;
    }

    // Check quiet hours
    if (userSettings.generalNotificationSettings?.quietHours?.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = this.parseTime(userSettings.generalNotificationSettings.quietHours.startTime || '22:00');
      const endTime = this.parseTime(userSettings.generalNotificationSettings.quietHours.endTime || '07:00');

      // Handle quiet hours that span midnight
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      } else {
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      }
    }

    // Check specific notification type settings
    switch (notification.type) {
      case NotificationType.MEDICATION_REMINDER:
        // Check if this is an overdue reminder
        if (notification.data?.isOverdue) {
          return userSettings.notificationSettings?.overdueAlerts?.enabled !== false;
        }
        return userSettings.notificationSettings?.medicationReminders?.enabled !== false;
      case NotificationType.HEALTH_TIP:
        return userSettings.notificationSettings?.healthTips?.enabled !== false;
      case NotificationType.PROGRESS_REPORT:
        return userSettings.notificationSettings?.progressReports?.enabled !== false;
      default:
        return true;
    }
  }

  private parseTime(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  public async scheduleNotification(notification: INotification): Promise<void> {
    const now = new Date();
    const scheduledTime = new Date(notification.scheduledFor);
    
    if (scheduledTime <= now) {
      // Show immediately if scheduled for now or in the past
      await this.showNotification(notification);
      return;
    }

    const delay = scheduledTime.getTime() - now.getTime();
    
    // Use setTimeout for notifications within the next 24 hours
    if (delay <= 24 * 60 * 60 * 1000) {
      setTimeout(async () => {
        await this.showNotification(notification);
      }, delay);
    } else {
      console.log('Notification scheduled for future processing:', notification.title);
    }
  }

  private async markNotificationAsSent(notificationId: string): Promise<void> {
    try {
      await fetch('/api/notifications/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error('Failed to mark notification as sent:', error);
    }
  }

  public async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  public async deleteAllNotifications(): Promise<void> {
    try {
      console.log('NotificationService: Deleting all notifications...');
      const response = await fetch('/api/notifications/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete notifications:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
      }
      
      const result = await response.json();
      console.log('NotificationService: Deleted notifications result:', result);
      
      // Close all visible notifications
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registration = await this.registrationPromise;
        if (registration) {
          const notifications = await registration.getNotifications();
          console.log(`Closing ${notifications.length} visible notifications`);
          notifications.forEach(notification => notification.close());
        }
      }
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      throw error;
    }
  }

  public async handleNotificationAction(
    notificationId: string, 
    action: string, 
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      await fetch('/api/notifications/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action, data }),
      });
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  }

  public generateMedicationReminder(
    userId: string,
    medicationId: string,
    medicationName: string,
    dosage: string,
    scheduledTime: string,
    reminderMinutes: number = 0
  ): INotification {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date();
    scheduledDateTime.setHours(hours, minutes - reminderMinutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledDateTime <= now) {
      scheduledDateTime.setDate(scheduledDateTime.getDate() + 1);
    }

    const isPreReminder = reminderMinutes > 0;
    const title = isPreReminder 
      ? `Medication Reminder - ${reminderMinutes} minutes`
      : 'Time for your medication!';
    
    const message = isPreReminder
      ? `Don't forget to take ${medicationName} (${dosage}) in ${reminderMinutes} minutes at ${scheduledTime}`
      : `Time to take ${medicationName} (${dosage})`;

    return {
      userId,
      type: NotificationType.MEDICATION_REMINDER,
      title,
      message,
      data: {
        medicationId,
        medicationName,
        scheduledTime,
      },
      priority: NotificationPriority.HIGH,
      status: NotificationStatus.PENDING,
      scheduledFor: scheduledDateTime,
      createdAt: now,
      updatedAt: now,
    };
  }

  public generateHealthTipNotification(
    userId: string,
    healthTip: string,
    category: string = 'General'
  ): INotification {
    const now = new Date();
    
    return {
      userId,
      type: NotificationType.HEALTH_TIP,
      title: `Daily Health Tip - ${category}`,
      message: healthTip,
      data: { healthTip, category },
      priority: NotificationPriority.LOW,
      status: NotificationStatus.PENDING,
      scheduledFor: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  public generateProgressReport(
    userId: string,
    progressData: {
      adherenceRate: number;
      totalMedications: number;
      takenCount: number;
      missedCount: number;
      period: string;
    }
  ): INotification {
    const now = new Date();
    const { adherenceRate, period } = progressData;
    
    let message = `Your ${period} medication report: `;
    if (adherenceRate >= 90) {
      message += `🎉 Excellent! ${adherenceRate.toFixed(1)}% adherence rate.`;
    } else if (adherenceRate >= 70) {
      message += `👍 Good progress! ${adherenceRate.toFixed(1)}% adherence rate.`;
    } else {
      message += `📈 Room for improvement: ${adherenceRate.toFixed(1)}% adherence rate.`;
    }

    return {
      userId,
      type: NotificationType.PROGRESS_REPORT,
      title: `${period} Progress Report`,
      message,
      data: { progressData },
      priority: NotificationPriority.MEDIUM,
      status: NotificationStatus.PENDING,
      scheduledFor: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  public generateOverdueReminder(
    userId: string,
    medicationId: string,
    medicationName: string,
    dosage: string,
    originalScheduledTime: string,
    minutesOverdue: number
  ): INotification {
    const now = new Date();
    
    return {
      userId,
      type: NotificationType.MEDICATION_REMINDER,
      title: `⚠️ Overdue Medication - ${minutesOverdue} min late`,
      message: `You missed ${medicationName} (${dosage}) scheduled for ${originalScheduledTime}. Please take it now or mark as skipped.`,
      data: {
        medicationId,
        medicationName,
        scheduledTime: originalScheduledTime,
        isOverdue: true,
        minutesOverdue,
      },
      priority: NotificationPriority.URGENT,
      status: NotificationStatus.PENDING,
      scheduledFor: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  public async startOverdueReminderLoop(
    userId: string,
    medicationId: string,
    medicationName: string,
    dosage: string,
    originalScheduledTime: string
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const loopKey = `${medicationId}-${originalScheduledTime}-${today}`;
    
    // Stop any existing loop for this medication/time combination
    this.stopOverdueReminderLoop(medicationId, originalScheduledTime, today);
    
    // Check if overdue alerts are enabled
    const userSettings = await this.getUserSettings();
    if (!userSettings?.notificationSettings?.overdueAlerts?.enabled) {
      console.log('Overdue alerts disabled, skipping reminder loop');
      return;
    }

    const intervalMinutes = userSettings.notificationSettings.overdueAlerts.intervalMinutes || 30;
    const maxReminders = userSettings.notificationSettings.overdueAlerts.maxReminders || 3;
    let reminderCount = this.overdueLoops.get(loopKey)?.count || 0;

    const checkOverdue = async () => {
      try {
        // Stop if max reminders reached
        if (reminderCount >= maxReminders) {
          console.log(`Max overdue reminders (${maxReminders}) reached for ${medicationName}`);
          this.overdueLoops.delete(loopKey);
          return;
        }

        // Check if medication was taken or dismissed
        const response = await fetch(`/api/medications/${medicationId}/status?time=${originalScheduledTime}&date=${today}`);
        if (response.ok) {
          const { taken, dismissed } = await response.json();
          if (taken || dismissed) {
            console.log(`Medication ${medicationName} at ${originalScheduledTime} was ${taken ? 'taken' : 'dismissed'}, stopping overdue reminders`);
            this.overdueLoops.delete(loopKey);
            return; // Stop the loop
          }
        }

        // Calculate minutes overdue
        const [hours, minutes] = originalScheduledTime.split(':').map(Number);
        const scheduledDateTime = new Date();
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        const now = new Date();
        const minutesOverdue = Math.floor((now.getTime() - scheduledDateTime.getTime()) / (1000 * 60));

        if (minutesOverdue > 0) {
          // Generate and send overdue reminder
          const overdueNotification = this.generateOverdueReminder(
            userId,
            medicationId,
            medicationName,
            dosage,
            originalScheduledTime,
            minutesOverdue
          );

          // Save notification to database
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(overdueNotification),
          });

          // Show notification (this will check user settings again)
          await this.showNotification(overdueNotification);
          
          reminderCount++;

          // Schedule next check based on user's interval setting
          const nextTimeout = setTimeout(checkOverdue, intervalMinutes * 60000);
          this.overdueLoops.set(loopKey, { timeout: nextTimeout, count: reminderCount });
        } else {
          // Not overdue yet, schedule next check
          const nextTimeout = setTimeout(checkOverdue, 60000); // Check every minute
          this.overdueLoops.set(loopKey, { timeout: nextTimeout, count: reminderCount });
        }
      } catch (error) {
        console.error('Error in overdue reminder loop:', error);
      }
    };

    // Start checking after the scheduled time has passed
    const [hours, minutes] = originalScheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date();
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    const now = new Date();
    
    if (scheduledDateTime <= now) {
      // Start immediately if already overdue
      checkOverdue();
    } else {
      // Wait until the scheduled time, then start checking
      const delay = scheduledDateTime.getTime() - now.getTime();
      setTimeout(checkOverdue, delay);
    }
  }

  public stopOverdueReminderLoop(
    medicationId: string,
    scheduledTime: string,
    date?: string
  ): void {
    const logDate = date || new Date().toISOString().split('T')[0];
    const key = `${medicationId}-${scheduledTime}-${logDate}`;
    
    const loop = this.overdueLoops.get(key);
    if (loop) {
      clearTimeout(loop.timeout);
      this.overdueLoops.delete(key);
      console.log(`Stopped overdue reminder loop for ${key}`);
    }
  }

  public stopAllOverdueReminders(): void {
    for (const [key, loop] of this.overdueLoops.entries()) {
      clearTimeout(loop.timeout);
      console.log(`Stopped overdue reminder loop for ${key}`);
    }
    this.overdueLoops.clear();
  }
}