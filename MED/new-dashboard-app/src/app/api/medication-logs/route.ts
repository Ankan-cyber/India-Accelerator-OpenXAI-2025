import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { MedicationLog } from '@/lib/models'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const medicationId = searchParams.get('medicationId')
    const scheduledTime = searchParams.get('scheduledTime')

    const query: { 
      userId: string; 
      logDate?: { $gte: Date; $lt: Date };
      medicationId?: string;
      scheduledTime?: string;
    } = { userId: session.userId as string }
    
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.logDate = { $gte: startOfDay, $lt: endOfDay };
    }
    
    if (medicationId) {
      query.medicationId = medicationId;
    }
    
    if (scheduledTime) {
      query.scheduledTime = scheduledTime;
    }

    const logs = await MedicationLog.find(query).sort({ takenAt: -1 })

    const formattedLogs = logs.map(log => ({
      id: log._id.toString(),
      userId: log.userId,
      medicationId: log.medicationId.toString(),
      takenAt: log.takenAt,
      scheduledTime: log.scheduledTime,
      logDate: log.logDate,
      taken: log.taken,
      dismissed: log.dismissed,
      // Keep date for backward compatibility
      date: log.logDate?.toISOString().split('T')[0],
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error('Failed to fetch medication logs:', error)
    return NextResponse.json({ error: 'Failed to fetch medication logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    const log = new MedicationLog({
      userId: session.userId,
      medicationId: body.medicationId,
      takenAt: new Date(body.takenAt || Date.now()),
      scheduledTime: body.scheduledTime,
      logDate: new Date(body.date || new Date().toISOString().split('T')[0]),
      taken: true,
      dismissed: false,
    })

    const savedLog = await log.save()

    const formattedLog = {
      id: savedLog._id.toString(),
      userId: savedLog.userId,
      medicationId: savedLog.medicationId.toString(),
      takenAt: savedLog.takenAt,
      scheduledTime: savedLog.scheduledTime,
      logDate: savedLog.logDate,
      taken: savedLog.taken,
      dismissed: savedLog.dismissed,
      // Keep date for backward compatibility
      date: savedLog.logDate?.toISOString().split('T')[0],
    }

    return NextResponse.json(formattedLog, { status: 201 })
  } catch (error) {
    console.error('Failed to create medication log:', error)
    return NextResponse.json({ error: 'Invalid medication log data' }, { status: 400 })
  }
}