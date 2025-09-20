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

    await connectDB();
    const body = await request.json();
    const { medicationId, scheduledTime, date } = body;

    // Check if a log already exists for this medication, time, and date
    const existingLog = await MedicationLog.findOne({
      userId: session.userId,
      medicationId,
      scheduledTime,
      $or: [
        { date }, // Old format
        { logDate: new Date(date) } // New format
      ]
    });

    if (existingLog) {
      // Update existing log to mark as taken
      existingLog.taken = true;
      existingLog.dismissed = false;
      existingLog.takenAt = new Date(body.takenAt || Date.now());
      await existingLog.save();

      const formattedLog = {
        id: existingLog._id.toString(),
        userId: existingLog.userId,
        medicationId: existingLog.medicationId.toString(),
        takenAt: existingLog.takenAt,
        scheduledTime: existingLog.scheduledTime,
        logDate: existingLog.logDate,
        taken: existingLog.taken,
        dismissed: existingLog.dismissed,
        date: existingLog.date || existingLog.logDate?.toISOString().split('T')[0],
      };

      return NextResponse.json(formattedLog, { status: 200 });
    } else {
      // Create new log
      const log = new MedicationLog({
        userId: session.userId,
        medicationId: body.medicationId,
        takenAt: new Date(body.takenAt || Date.now()),
        scheduledTime: body.scheduledTime,
        logDate: new Date(body.date || new Date().toISOString().split('T')[0]),
        taken: true,
        dismissed: false,
        date: body.date || new Date().toISOString().split('T')[0],
      });

      const savedLog = await log.save();

      const formattedLog = {
        id: savedLog._id.toString(),
        userId: savedLog.userId,
        medicationId: savedLog.medicationId.toString(),
        takenAt: savedLog.takenAt,
        scheduledTime: savedLog.scheduledTime,
        logDate: savedLog.logDate,
        taken: savedLog.taken,
        dismissed: savedLog.dismissed,
        date: savedLog.date || savedLog.logDate?.toISOString().split('T')[0],
      };

      return NextResponse.json(formattedLog, { status: 201 });
    }
  } catch (error) {
    console.error('Failed to mark medication as taken:', error);
    return NextResponse.json({ error: 'Invalid medication log data' }, { status: 400 });
  }
}