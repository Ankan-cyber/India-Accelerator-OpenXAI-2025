import { NotificationService } from '@/lib/notification-service';
import { INotification } from '@/lib/notification-types';

export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private checkInterval: NodeJS.Timeout | null = null;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  public startScheduler(): void {
    if (this.checkInterval) {
      return; // Already running
    }

    console.log('Starting notification scheduler...');
    
    // Check every minute for pending notifications
    this.checkInterval = setInterval(async () => {
      await this.checkPendingNotifications();
    }, 60000); // 60 seconds

    // Also check immediately
    this.checkPendingNotifications();
  }

  public stopScheduler(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Notification scheduler stopped');
    }
  }

  private async checkPendingNotifications(): Promise<void> {
    try {
      // Get pending notifications from the database
      const response = await fetch('/api/notifications?status=pending&limit=50');
      if (!response.ok) return;

      const notifications: INotification[] = await response.json();
      const now = new Date();

      for (const notification of notifications) {
        const scheduledTime = new Date(notification.scheduledFor);
        
        // If notification time has passed or is now, check if medication is already taken
        if (scheduledTime <= now) {
          // For medication reminders, check if already taken
          if (notification.type === 'medication_reminder' && notification.data?.medicationId && notification.data?.scheduledTime) {
            const today = new Date().toISOString().split('T')[0];
            
            try {
              const logResponse = await fetch(`/api/medication-logs?medicationId=${notification.data.medicationId}&scheduledTime=${notification.data.scheduledTime}&date=${today}`);
              if (logResponse.ok) {
                const logs = await logResponse.json();
                if (logs.length > 0) {
                  console.log(`Medication already taken for ${notification.data.medicationId} at ${notification.data.scheduledTime}, skipping notification`);
                  
                  // Mark notification as dismissed since medication is already taken
                  await fetch('/api/notifications/mark-sent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      notificationId: notification.id || notification._id,
                      status: 'dismissed'
                    }),
                  });
                  
                  continue;
                }
              }
            } catch (error) {
              console.error('Error checking medication logs:', error);
            }
          }
          
          await this.notificationService.showNotification(notification);
          
          // Mark as sent
          await fetch('/api/notifications/mark-sent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              notificationId: notification.id || notification._id 
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error checking pending notifications:', error);
    }
  }

  public async scheduleNotificationsForMedication(
    userId: string,
    medicationId: string,
    medicationName: string,
    dosage: string,
    times: string[]
  ): Promise<void> {
    try {
      // Get user settings to determine reminder preferences
      const response = await fetch('/api/user-settings');
      const userSettings = response.ok ? await response.json() : null;
      
      const reminderMinutes = userSettings?.notificationSettings?.medicationReminders?.reminderMinutes || [15, 0];
      const notifications: Partial<INotification>[] = [];
      
      for (const time of times) {
        // Create reminders based on user preferences
        for (const minutes of reminderMinutes) {
          const reminder = this.notificationService.generateMedicationReminder(
            userId,
            medicationId,
            medicationName,
            dosage,
            time,
            minutes
          );
          notifications.push(reminder);
        }
      }

      // Save notifications to database
      await Promise.all(
        notifications.map(async notification => {
          console.log('Creating notification:', {
            title: notification.title,
            scheduledFor: notification.scheduledFor,
            medicationName
          });
          
          const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification),
          });
          
          if (!response.ok) {
            console.error('Failed to create notification:', await response.text());
          }
          
          return response;
        })
      );

      console.log(`Scheduled ${notifications.length} notifications for ${medicationName}`);
      
    } catch (error) {
      console.error('Failed to schedule medication notifications:', error);
    }
  }
}