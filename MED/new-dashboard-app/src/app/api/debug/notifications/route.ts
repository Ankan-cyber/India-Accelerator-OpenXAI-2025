import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification, Medication } from '@/lib/models';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get medications for this user
    const medications = await Medication.find({ 
      userId: session.userId, 
      isActive: true 
    }).lean();

    // Get notifications for this user
    const notifications = await Notification.find({ 
      userId: session.userId 
    }).sort({ createdAt: -1 }).limit(10).lean();

    const currentTime = new Date();
    const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    return NextResponse.json({
      currentTime: currentTime.toISOString(),
      currentTimeString: timeString,
      medicationsCount: medications.length,
      notificationsCount: notifications.length,
      medications: medications.map(med => ({
        id: med._id,
        name: med.name,
        times: med.times,
        userId: med.userId
      })),
      recentNotifications: notifications.map(notif => ({
        id: notif._id,
        type: notif.type,
        title: notif.title,
        scheduledFor: notif.scheduledFor,
        status: notif.status,
        createdAt: notif.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug endpoint failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}