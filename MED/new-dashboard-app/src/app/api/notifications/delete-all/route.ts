import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/lib/models';
import { getSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      console.log('Dismiss all: No session or userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Delete all: Processing request for user ${session.userId}`);
    await connectDB();

    // Delete ALL notifications for the user (regardless of status)
    const result = await Notification.deleteMany({
      userId: session.userId
    });

    console.log(`Deleted ${result.deletedCount} notifications for user ${session.userId}`);

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Failed to dismiss all notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}