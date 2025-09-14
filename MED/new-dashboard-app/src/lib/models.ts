import { Schema, model, models } from 'mongoose'

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
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

// Medication Log Schema
const medicationLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
  takenAt: { type: Date, required: true },
  scheduledTime: { type: String, required: true }, // Time string like "09:00"
  date: { type: String, required: true }, // Date string like "2024-12-11"
})

// Emergency Contact Schema
const emergencyContactSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
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
  isActive: boolean
  createdAt: Date
}

export interface IMedicationLog {
  _id?: string
  id?: string
  userId: string
  medicationId: string
  takenAt: Date
  scheduledTime: string
  date: string
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

export interface InsertMedication {
  userId: string
  name: string
  dosage: string
  instructions?: string
  times: string[]
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

// Models
export const User = models.User || model<IUser>('User', userSchema)
export const Medication = models.Medication || model<IMedication>('Medication', medicationSchema)
export const MedicationLog = models.MedicationLog || model<IMedicationLog>('MedicationLog', medicationLogSchema)
export const EmergencyContact = models.EmergencyContact || model<IEmergencyContact>('EmergencyContact', emergencyContactSchema)