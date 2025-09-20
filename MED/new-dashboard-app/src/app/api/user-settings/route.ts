import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { UserSettings } from '@/lib/models'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    let settings = await UserSettings.findOne({ userId: session.userId })
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new UserSettings({
        userId: session.userId,
        keepLogsAfterDeletion: false,
        notificationsEnabled: true,
        notificationSettings: {
          medicationReminders: { enabled: true, reminderMinutes: [15, 0] },
          healthTips: { enabled: true, dailyTime: '09:00' },
          progressReports: { enabled: true, weeklyDay: 0, weeklyTime: '18:00' },
          overdueAlerts: { enabled: true, intervalMinutes: 30, maxReminders: 3 },
        },
        generalNotificationSettings: {
          sound: true,
          vibration: true,
          showOnLockScreen: true,
          quietHours: { enabled: false, startTime: '22:00', endTime: '07:00' },
        },
      })
      await settings.save()
    }

    const formattedSettings = {
      id: settings._id.toString(),
      userId: settings.userId,
      keepLogsAfterDeletion: settings.keepLogsAfterDeletion,
      notificationsEnabled: settings.notificationsEnabled,
      notificationSettings: settings.notificationSettings || {
        medicationReminders: { enabled: true, reminderMinutes: [15, 0] },
        healthTips: { enabled: true, dailyTime: '09:00' },
        progressReports: { enabled: true, weeklyDay: 0, weeklyTime: '18:00' },
        overdueAlerts: { enabled: true, intervalMinutes: 30, maxReminders: 3 },
      },
      generalNotificationSettings: settings.generalNotificationSettings || {
        sound: true,
        vibration: true,
        showOnLockScreen: true,
        quietHours: { enabled: false, startTime: '22:00', endTime: '07:00' },
      },
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    }

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error('Failed to fetch user settings:', error)
    return NextResponse.json({ error: 'Failed to fetch user settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId: session.userId },
      { 
        ...body, 
        updatedAt: new Date() 
      },
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true 
      }
    )

    const formattedSettings = {
      id: settings._id.toString(),
      userId: settings.userId,
      keepLogsAfterDeletion: settings.keepLogsAfterDeletion,
      notificationsEnabled: settings.notificationsEnabled,
      notificationSettings: settings.notificationSettings || {
        medicationReminders: { enabled: true, reminderMinutes: [15, 0] },
        healthTips: { enabled: true, dailyTime: '09:00' },
        progressReports: { enabled: true, weeklyDay: 0, weeklyTime: '18:00' },
        overdueAlerts: { enabled: true, intervalMinutes: 30, maxReminders: 3 },
      },
      generalNotificationSettings: settings.generalNotificationSettings || {
        sound: true,
        vibration: true,
        showOnLockScreen: true,
        quietHours: { enabled: false, startTime: '22:00', endTime: '07:00' },
      },
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    }

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error('Failed to update user settings:', error)
    return NextResponse.json({ error: 'Failed to update user settings' }, { status: 500 })
  }
}