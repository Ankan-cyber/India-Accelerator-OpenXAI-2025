import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MedicationLog } from '@/lib/models';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    await connectDB();

    if (action === 'taken' || action === 'dismissed') {
      const { medicationId, scheduledTime } = data;
      
      if (!medicationId || !scheduledTime) {
        return NextResponse.json({ error: 'Missing medication data' }, { status: 400 });
      }

      // Create or update medication log
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingLog = await MedicationLog.findOne({
        userId: session.userId,
        medicationId,
        scheduledTime,
        logDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      if (existingLog) {
        // Update existing log
        existingLog.taken = action === 'taken';
        existingLog.dismissed = action === 'dismissed';
        if (action === 'taken') {
          existingLog.takenAt = new Date();
        }
        await existingLog.save();
      } else {
        // Create new log
        await MedicationLog.create({
          userId: session.userId,
          medicationId,
          scheduledTime,
          logDate: today,
          taken: action === 'taken',
          dismissed: action === 'dismissed',
          takenAt: action === 'taken' ? new Date() : undefined,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to handle notification action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}