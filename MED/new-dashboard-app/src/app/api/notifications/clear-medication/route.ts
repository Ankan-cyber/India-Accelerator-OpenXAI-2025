import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/lib/models';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { medicationId, date } = await request.json();

    if (!medicationId || !date) {
      return NextResponse.json({ error: 'medicationId and date are required' }, { status: 400 });
    }

    await connectDB();

    // Delete pending medication notifications for this medication on this date
    const startOfDay = new Date(date);
    const endOfDay = new Date(date + 'T23:59:59');

    const result = await Notification.deleteMany({
      userId: session.userId,
      type: 'medication_reminder',
      'data.medicationId': medicationId,
      status: 'pending',
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    console.log(`Cleared ${result.deletedCount} pending notifications for medication ${medicationId} on ${date}`);

    return NextResponse.json({ 
      success: true, 
      clearedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Failed to clear medication notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}