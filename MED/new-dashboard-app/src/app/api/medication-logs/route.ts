import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { MedicationLog } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    let query = {}
    if (date) {
      query = { date }
    }
    
    const logs = await MedicationLog.find(query).sort({ takenAt: -1 })
    
    // Transform MongoDB documents to match expected format
    const formattedLogs = logs.map(log => ({
      id: log._id.toString(),
      medicationId: log.medicationId.toString(),
      takenAt: log.takenAt,
      scheduledTime: log.scheduledTime,
      date: log.date,
    }))
    
    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error('Failed to fetch medication logs:', error)
    return NextResponse.json({ error: 'Failed to fetch medication logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const log = new MedicationLog({
      medicationId: body.medicationId,
      takenAt: new Date(body.takenAt || Date.now()),
      scheduledTime: body.scheduledTime,
      date: body.date,
    })
    
    const savedLog = await log.save()
    
    const formattedLog = {
      id: savedLog._id.toString(),
      medicationId: savedLog.medicationId.toString(),
      takenAt: savedLog.takenAt,
      scheduledTime: savedLog.scheduledTime,
      date: savedLog.date,
    }
    
    return NextResponse.json(formattedLog, { status: 201 })
  } catch (error) {
    console.error('Failed to create medication log:', error)
    return NextResponse.json({ error: 'Invalid medication log data' }, { status: 400 })
  }
}