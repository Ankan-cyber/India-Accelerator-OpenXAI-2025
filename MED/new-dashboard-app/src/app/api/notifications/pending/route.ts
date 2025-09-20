import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/lib/models';
import { getSession } from '@/lib/session';
import { NotificationStatus } from '@/lib/notification-types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const notifications = await Notification
      .find({ 
        userId: session.userId,
        status: NotificationStatus.PENDING,
        scheduledFor: { $lte: new Date() },
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      })
      .sort({ scheduledFor: 1 })
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch pending notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}