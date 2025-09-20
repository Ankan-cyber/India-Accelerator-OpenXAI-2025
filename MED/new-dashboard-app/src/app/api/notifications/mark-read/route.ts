import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/lib/models';
import { getSession } from '@/lib/session';
import { NotificationStatus } from '@/lib/notification-types';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: session.userId },
      { 
        status: NotificationStatus.READ,
        readAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}