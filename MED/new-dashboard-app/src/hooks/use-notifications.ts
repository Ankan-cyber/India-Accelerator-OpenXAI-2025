"use client"

import { useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/lib/notification-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/providers/auth-provider';
import { NotificationScheduler } from '@/lib/notification-scheduler';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const notificationService = NotificationService.getInstance();
  const notificationScheduler = NotificationScheduler.getInstance();

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Delete all notifications mutation
  const dismissAllMutation = useMutation({
    mutationFn: async () => {
      console.log('useNotifications: Calling deleteAllNotifications...');
      await notificationService.deleteAllNotifications();
    },
    onSuccess: () => {
      console.log('useNotifications: Delete all successful, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All notifications deleted",
        description: "All pending notifications have been removed.",
      });
    },
    onError: (error) => {
      console.error('useNotifications: Delete all failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete notifications. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle notification actions
  const handleNotificationAction = useCallback(async (
    notificationId: string, 
    action: string, 
    actionData?: Record<string, unknown>
  ) => {
    try {
      if (action === 'taken' && actionData?.medicationId && actionData?.scheduledTime) {
        // Stop overdue reminders for this medication
        const logDate = actionData.date as string || new Date().toISOString().split('T')[0];
        notificationService.stopOverdueReminderLoop(
          actionData.medicationId as string,
          actionData.scheduledTime as string,
          logDate
        );
      }
      
      await notificationService.handleNotificationAction(notificationId, action, actionData);
      
      if (action === 'taken') {
        toast({
          title: "Medication recorded",
          description: "Your medication has been marked as taken.",
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['/api/medication-logs'] });
        queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      } else if (action === 'snooze') {
        toast({
          title: "Reminder snoozed",
          description: "You'll be reminded again in 10 minutes.",
        });
      }
      
      // Mark notification as read
      markAsReadMutation.mutate(notificationId);
    } catch (error) {
      console.error('Failed to handle notification action:', error);
      toast({
        title: "Error",
        description: "Failed to process notification action.",
        variant: "destructive",
      });
    }
  }, [notificationService, toast, queryClient, markAsReadMutation]);

  const handleServiceWorkerMessage = useCallback((event: MessageEvent) => {
    const { type, data } = event.data;
    
    switch (type) {
      case 'NOTIFICATION_ACTION':
        handleNotificationAction(data.notificationId, data.action, data.actionData);
        break;
      case 'NOTIFICATION_CLICKED':
        // Mark notification as read
        markAsReadMutation.mutate(data.notificationId);
        break;
    }
  }, [markAsReadMutation, handleNotificationAction]);

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      // Request notification permission
      const permission = await notificationService.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notifications enabled');
        // Start the notification scheduler
        notificationScheduler.startScheduler();
      }

      // Register service worker event handlers
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        return () => {
          navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
          notificationScheduler.stopScheduler();
        };
      }
    };

    initializeNotifications();
  }, [notificationService, notificationScheduler, handleServiceWorkerMessage]);

  // Schedule medication reminders
  const scheduleMedicationReminders = useCallback(async (
    medicationId: string,
    medicationName: string,
    dosage: string,
    times: string[]
  ) => {
    if (!user?.id) {
      console.error('User not logged in - cannot schedule reminders');
      return;
    }

    try {
      // First, clear any existing pending notifications for this medication today
      const today = new Date().toISOString().split('T')[0];
      try {
        await fetch('/api/notifications/clear-medication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            medicationId,
            date: today
          }),
        });
      } catch (error) {
        console.warn('Failed to clear existing notifications:', error);
      }

      // Use the new scheduler to create and schedule notifications
      await notificationScheduler.scheduleNotificationsForMedication(
        user.id,
        medicationId,
        medicationName,
        dosage,
        times
      );

      // Start overdue reminder loops for each scheduled time
      for (const time of times) {
        notificationService.startOverdueReminderLoop(
          user.id,
          medicationId,
          medicationName,
          dosage,
          time
        );
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      console.log(`Reminders scheduled for ${medicationName} at ${times.join(', ')}`);
      
    } catch (error) {
      console.error('Failed to schedule medication reminders:', error);
      toast({
        title: "Error",
        description: "Failed to schedule medication reminders. Please try again.",
        variant: "destructive",
      });
    }
  }, [notificationService, notificationScheduler, queryClient, user?.id, toast]);

  // Generate and send health tip notification
  const sendHealthTipNotification = useCallback(async (
    healthTip: string,
    category: string = 'General'
  ) => {
    if (!user?.id) {
      console.error('User not logged in - cannot send notification');
      return;
    }

    try {
      const notification = notificationService.generateHealthTipNotification(
        user.id,
        healthTip,
        category
      );

      // Save notification to database
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });

      // Show immediately
      await notificationService.showNotification(notification);
      
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    } catch (error) {
      console.error('Failed to send health tip notification:', error);
    }
  }, [notificationService, queryClient, user?.id]);

  return {
    notificationService,
    scheduleMedicationReminders,
    sendHealthTipNotification,
    handleNotificationAction,
    dismissAllMutation,
  };
}