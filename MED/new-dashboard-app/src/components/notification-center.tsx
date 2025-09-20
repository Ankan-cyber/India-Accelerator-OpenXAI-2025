"use client"

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bell,
  Check,
  Clock,
  Heart,
  TrendingUp,
  AlertCircle,
  PillBottle,
  Settings,
  Trash2,
  Mail,
  X,
} from 'lucide-react';
import { NotificationType, NotificationPriority, INotification } from '@/lib/notification-types';
import { NotificationService } from '@/lib/notification-service';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notificationIcons = {
  [NotificationType.MEDICATION_REMINDER]: PillBottle,
  [NotificationType.MEDICATION_OVERDUE]: AlertCircle,
  [NotificationType.HEALTH_TIP]: Heart,
  [NotificationType.PROGRESS_REPORT]: TrendingUp,
  [NotificationType.APPOINTMENT_REMINDER]: Clock,
  [NotificationType.MEDICATION_RUNNING_LOW]: AlertCircle,
  [NotificationType.EMERGENCY_CONTACT_UPDATE]: AlertCircle,
  [NotificationType.SYSTEM_ANNOUNCEMENT]: Bell,
};

const priorityColors = {
  [NotificationPriority.LOW]: 'text-green-400 border-green-400/20',
  [NotificationPriority.MEDIUM]: 'text-yellow-400 border-yellow-400/20',
  [NotificationPriority.HIGH]: 'text-orange-400 border-orange-400/20',
  [NotificationPriority.URGENT]: 'text-red-400 border-red-400/20',
};

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'medication' | 'health'>('all');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notificationService = NotificationService.getInstance();
  const { dismissAllMutation } = useNotifications();

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    const permission = await notificationService.requestPermission();
    setPermissionGranted(permission === 'granted');
    
    if (permission === 'granted') {
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive medication reminders and health tips.",
      });
    } else {
      toast({
        title: "Notifications Denied",
        description: "Please enable notifications in your browser settings to receive reminders.",
        variant: "destructive",
      });
    }
  };

  const { data: notifications = [], isLoading } = useQuery<INotification[]>({
    queryKey: ['/api/notifications', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('status', 'sent');
      if (filter === 'medication') params.append('type', NotificationType.MEDICATION_REMINDER);
      if (filter === 'health') params.append('type', NotificationType.HEALTH_TIP);
      
      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: open,
  });

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

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => n.status === 'sent');
      await Promise.all(
        unreadNotifications.map(notification => {
          const notificationId = notification.id || String((notification as { _id?: string })._id);
          return markAsReadMutation.mutateAsync(notificationId);
        })
      );
    },
    onSuccess: () => {
      toast({
        title: "All notifications marked as read",
        description: "Your notification center has been cleared.",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    },
  });

  const handleNotificationAction = async (notification: INotification, action: string) => {
    if ((action === 'taken' || action === 'dismissed') && notification.type === NotificationType.MEDICATION_REMINDER) {
      try {
        // Use the new notification action API
        const response = await fetch('/api/notifications/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            data: {
              medicationId: notification.data?.medicationId,
              scheduledTime: notification.data?.scheduledTime,
            },
          }),
        });
        
        if (response.ok) {
          const actionText = action === 'taken' ? 'taken' : 'dismissed';
          toast({
            title: `Medication ${actionText}`,
            description: `${notification.data?.medicationName} marked as ${actionText}!`,
          });
          
          // Mark notification as read
          const notificationId = notification.id || String((notification as { _id?: string })._id);
          markAsReadMutation.mutate(notificationId);
        }
      } catch (error) {
        console.error(`Failed to mark medication as ${action}:`, error);
        toast({
          title: "Error",
          description: `Failed to mark medication as ${action}. Please try again.`,
          variant: "destructive",
        });
      }
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => n.status === 'sent').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[80vh] border-white/20 text-white overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-blue-400" />
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Notifications
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </DialogDescription>
              </div>
            </div>
            
            {!permissionGranted && (
              <Button
                onClick={requestNotificationPermission}
                size="sm"
                className="glass-button-primary text-sm"
              >
                <Bell size={16} className="mr-2" />
                Enable Alerts
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Filter tabs */}
        <div className="flex gap-2 py-4 border-b border-white/10">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'medication', label: 'Medication', count: notifications.filter(n => n.type === NotificationType.MEDICATION_REMINDER).length },
            { key: 'health', label: 'Health Tips', count: notifications.filter(n => n.type === NotificationType.HEALTH_TIP).length },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(tab.key as 'all' | 'unread' | 'medication' | 'health')}
              className={`text-sm ${filter === tab.key ? 'glass-button-primary' : 'glass-button'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.key ? 'bg-white/20' : 'bg-blue-500/20'
                }`}>
                  {tab.count}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex gap-2 py-2">
            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                size="sm"
                variant="outline"
                className="glass-button text-sm"
                disabled={markAllAsReadMutation.isPending}
              >
                <Check size={16} className="mr-2" />
                Mark all as read
              </Button>
            )}
            <Button
              onClick={() => dismissAllMutation.mutate()}
              size="sm"
              variant="outline"
              className="glass-button text-sm"
              disabled={dismissAllMutation.isPending}
            >
              <X size={16} className="mr-2" />
              Delete all
            </Button>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card h-20 rounded-lg shimmer" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto mb-4 text-gray-500" size={48} />
              <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
              <p className="text-gray-300">
                {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications found.`}
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = notificationIcons[notification.type] || Bell;
              const isUnread = notification.status === 'sent';
              const isOverdue = notification.data?.isOverdue || false;
              const notificationId = notification.id || String((notification as { _id?: string })._id);
              
              return (
                <Card
                  key={notificationId}
                  className={`glass-card border-white/20 transition-all duration-200 hover:border-white/30 ${
                    isUnread ? 'bg-blue-500/10 border-blue-400/30' : ''
                  } ${
                    isOverdue ? 'border-red-400/50 bg-red-500/10' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${priorityColors[notification.priority]}`}>
                        <IconComponent size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm leading-tight">
                            {isOverdue && '⚠️ '}{notification.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {getRelativeTime(notification.createdAt)}
                            </span>
                            {isUnread && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {notification.type === NotificationType.MEDICATION_REMINDER && (
                            <>
                              <Button
                                onClick={() => handleNotificationAction(notification, 'taken')}
                                size="sm"
                                className="glass-button-primary text-xs px-3 py-1"
                              >
                                <Check size={14} className="mr-1" />
                                Mark as Taken
                              </Button>
                              <Button
                                onClick={() => handleNotificationAction(notification, 'dismissed')}
                                size="sm"
                                variant="outline"
                                className="glass-button text-xs px-3 py-1 text-yellow-400 hover:text-yellow-300"
                              >
                                <X size={14} className="mr-1" />
                                Dismiss
                              </Button>
                            </>
                          )}
                          
                          {isUnread && (
                            <Button
                              onClick={() => markAsReadMutation.mutate(notificationId)}
                              size="sm"
                              variant="outline"
                              className="glass-button text-xs px-3 py-1"
                            >
                              <Mail size={14} className="mr-1" />
                              Mark as Read
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => deleteNotificationMutation.mutate(notificationId)}
                            size="sm"
                            variant="outline"
                            className="glass-button text-xs px-3 py-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Settings link */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <Button
            onClick={() => {
              onOpenChange(false);
              // You can add navigation to settings here
            }}
            variant="outline"
            size="sm"
            className="glass-button text-sm w-full"
          >
            <Settings size={16} className="mr-2" />
            Notification Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}