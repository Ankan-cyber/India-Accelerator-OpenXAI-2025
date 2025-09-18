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
        reminderInterval: 15,
      })
      await settings.save()
    }

    const formattedSettings = {
      id: settings._id.toString(),
      userId: settings.userId,
      keepLogsAfterDeletion: settings.keepLogsAfterDeletion,
      notificationsEnabled: settings.notificationsEnabled,
      reminderInterval: settings.reminderInterval,
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
      reminderInterval: settings.reminderInterval,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    }

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error('Failed to update user settings:', error)
    return NextResponse.json({ error: 'Failed to update user settings' }, { status: 500 })
  }
}