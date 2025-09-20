export enum NotificationType {
  MEDICATION_REMINDER = 'medication_reminder',
  MEDICATION_OVERDUE = 'medication_overdue',
  HEALTH_TIP = 'health_tip',
  PROGRESS_REPORT = 'progress_report',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  MEDICATION_RUNNING_LOW = 'medication_running_low',
  EMERGENCY_CONTACT_UPDATE = 'emergency_contact_update',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  DISMISSED = 'dismissed',
  FAILED = 'failed',
}

export interface NotificationData {
  medicationId?: string;
  medicationName?: string;
  scheduledTime?: string;
  healthTip?: string;
  progressData?: {
    adherenceRate: number;
    totalMedications: number;
    takenCount: number;
    missedCount: number;
    period: string;
  };
  emergencyContact?: string;
  [key: string]: string | number | boolean | object | undefined;
}

export interface INotification {
  _id?: string;
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  priority: NotificationPriority;
  status: NotificationStatus;
  scheduledFor: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  medicationReminders: {
    enabled: boolean;
    reminderMinutes: number[];
    sound: boolean;
    vibration: boolean;
  };
  healthTips: {
    enabled: boolean;
    dailyTime: string;
    sound: boolean;
  };
  progressReports: {
    enabled: boolean;
    weeklyDay: number; // 0 = Sunday, 1 = Monday, etc.
    weeklyTime: string;
  };
  overdueAlerts: {
    enabled: boolean;
    intervalMinutes: number;
    maxReminders: number;
  };
  general: {
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    sound: boolean;
    vibration: boolean;
    showOnLockScreen: boolean;
  };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  medicationReminders: {
    enabled: true,
    reminderMinutes: [15, 0], // 15 minutes before and at scheduled time
    sound: true,
    vibration: true,
  },
  healthTips: {
    enabled: true,
    dailyTime: '09:00',
    sound: false,
  },
  progressReports: {
    enabled: true,
    weeklyDay: 0, // Sunday
    weeklyTime: '18:00',
  },
  overdueAlerts: {
    enabled: true,
    intervalMinutes: 30,
    maxReminders: 3,
  },
  general: {
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
    },
    sound: true,
    vibration: true,
    showOnLockScreen: true,
  },
};