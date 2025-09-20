import { useEffect } from 'react';
import { NotificationService } from '@/lib/notification-service';

export function useSimpleNotificationChecker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const notificationService = NotificationService.getInstance();
    let intervalId: NodeJS.Timeout;

    const checkNotifications = async () => {
      try {
        // Get pending notifications
        const response = await fetch('/api/notifications?status=pending&limit=20');
        if (!response.ok) return;

        const notifications = await response.json();
        const now = new Date();

        for (const notification of notifications) {
          const scheduledTime = new Date(notification.scheduledFor);
          
          // If it's time to show the notification (or overdue)
          if (scheduledTime <= now) {
            console.log('Showing notification:', notification.title);
            
            // Show the browser notification
            await notificationService.showNotification(notification);
            
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
        console.error('Error checking notifications:', error);
      }
    };

    // Check notifications every 30 seconds
    const startChecker = async () => {
      // Request permission first
      const permission = await notificationService.requestPermission();
      if (permission === 'granted') {
        console.log('Starting simple notification checker...');
        intervalId = setInterval(checkNotifications, 30000); // Check every 30 seconds
        checkNotifications(); // Check immediately
      }
    };

    startChecker();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('Notification checker stopped');
      }
    };
  }, []);
}