"use client"

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { NotificationCenter } from './notification-center';
import { INotification } from '@/lib/notification-types';

export function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications = [] } = useQuery<INotification[]>({
    queryKey: ['/api/notifications', 'status=sent'],
    queryFn: async () => {
      const response = await fetch('/api/notifications?status=sent&limit=20');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter(n => n.status === 'sent').length;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(true)}
        className="glass-button relative"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationCenter
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </>
  );
}