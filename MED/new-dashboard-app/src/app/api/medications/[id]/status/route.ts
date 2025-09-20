import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MedicationLog } from '@/lib/models';
import { getSession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const time = searchParams.get('time');

    if (!time) {
      return NextResponse.json({ error: 'Time parameter is required' }, { status: 400 });
    }

    await connectDB();

    // Check if medication was taken at the specified time today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const medicationLog = await MedicationLog.findOne({
      userId: session.userId,
      medicationId: id,
      scheduledTime: time,
      logDate: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const taken = medicationLog?.taken || false;
    const dismissed = medicationLog?.dismissed || false;

    return NextResponse.json({ 
      taken, 
      dismissed,
      logExists: !!medicationLog 
    });
  } catch (error) {
    console.error('Failed to check medication status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}