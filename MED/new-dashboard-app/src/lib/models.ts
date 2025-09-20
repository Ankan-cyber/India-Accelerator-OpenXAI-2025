import { Schema, model, models } from 'mongoose'
import { NotificationType, NotificationPriority, NotificationStatus, NotificationSettings, INotification } from './notification-types'

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Medication Schema
const medicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  instructions: { type: String },
  times: [{ type: String, required: true }], // Array of time strings like "09:00"
  startDate: { type: Date, default: Date.now }, // When to start taking medication
  endDate: { type: Date }, // When to stop taking medication (optional)
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

// Medication Log Schema
const medicationLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
  takenAt: { type: Date },
  scheduledTime: { type: String, required: true }, // Time string like "09:00"
  logDate: { type: Date, required: true }, // Date for the medication log
  taken: { type: Boolean, default: false },
  dismissed: { type: Boolean, default: false },
  notes: { type: String },
  // Keep old date field for backward compatibility
  date: { type: String },
}, { timestamps: true })

// Emergency Contact Schema
const emergencyContactSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
})

// User Settings Schema
const userSettingsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  keepLogsAfterDeletion: { type: Boolean, default: false },
  
  // Main notification toggle
  notificationsEnabled: { type: Boolean, default: true },

  // Specific notification types
  notificationSettings: {
    medicationReminders: {
      enabled: { type: Boolean, default: true },
      reminderMinutes: { type: [Number], default: [15, 0] }, // e.g., [15, 0] for 15 mins before and at the time
    },
    healthTips: {
      enabled: { type: Boolean, default: true },
      dailyTime: { type: String, default: '09:00' }, // HH:mm format
    },
    progressReports: {
      enabled: { type: Boolean, default: true },
      weeklyDay: { type: Number, default: 0 }, // 0 for Sunday, 1 for Monday, etc.
      weeklyTime: { type: String, default: '18:00' },
    },
    overdueAlerts: {
      enabled: { type: Boolean, default: true },
      intervalMinutes: { type: Number, default: 30 },
      maxReminders: { type: Number, default: 3 },
    },
  },

  // General notification preferences
  generalNotificationSettings: {
    sound: { type: Boolean, default: true },
    vibration: { type: Boolean, default: true },
    showOnLockScreen: { type: Boolean, default: true },
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '22:00' },
      endTime: { type: String, default: '07:00' },
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Notification Schema
const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true,
    enum: Object.values(NotificationType)
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  priority: { 
    type: String, 
    required: true,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM
  },
  status: { 
    type: String, 
    required: true,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING
  },
  scheduledFor: { type: Date, required: true },
  sentAt: { type: Date },
  readAt: { type: Date },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Types
export interface IUser {
  _id?: string
  id?: string
  name: string
  email: string
  password: string
  createdAt: Date
}

export interface IMedication {
  _id?: string
  id?: string
  userId: string
  name: string
  dosage: string
  instructions?: string
  times: string[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
}

export interface IMedicationLog {
  _id?: string
  id?: string
  userId: string
  medicationId: string
  takenAt?: Date
  scheduledTime: string
  logDate: Date
  taken: boolean
  dismissed: boolean
  notes?: string
  createdAt?: Date
  updatedAt?: Date
  // Keep old date field for backward compatibility
  date?: string
}

export interface IEmergencyContact {
  _id?: string
  id?: string
  userId: string
  name: string
  phone: string
  relationship: string
  isPrimary: boolean
}

export interface IUserSettings {
  _id?: string
  id?: string
  userId: string
  keepLogsAfterDeletion: boolean
  notificationsEnabled: boolean
  reminderInterval: number
  notificationSettings?: NotificationSettings
  createdAt: Date
  updatedAt: Date
}

export interface InsertMedication {
  userId: string
  name: string
  dosage: string
  instructions?: string
  times: string[]
  startDate?: Date
  endDate?: Date
  isActive: boolean
}

export interface InsertMedicationLog {
  userId: string
  medicationId: string
  takenAt: Date
  scheduledTime: string
  date: string
}

export interface InsertEmergencyContact {
  userId: string
  name: string
  phone: string
  relationship: string
  isPrimary: boolean
}

export interface InsertUserSettings {
  userId: string
  keepLogsAfterDeletion: boolean
  notificationsEnabled: boolean
  reminderInterval: number
}

// Models
export const User = models.User || model<IUser>('User', userSchema)
export const Medication = models.Medication || model<IMedication>('Medication', medicationSchema)
export const MedicationLog = models.MedicationLog || model<IMedicationLog>('MedicationLog', medicationLogSchema)
export const EmergencyContact = models.EmergencyContact || model<IEmergencyContact>('EmergencyContact', emergencyContactSchema)
export const UserSettings = models.UserSettings || model<IUserSettings>('UserSettings', userSettingsSchema)
export const Notification = models.Notification || model<INotification>('Notification', notificationSchema)