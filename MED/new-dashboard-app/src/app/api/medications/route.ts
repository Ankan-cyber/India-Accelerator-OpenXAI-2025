import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Medication } from '@/lib/models'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const medications = await Medication.find({ userId: session.userId, isActive: true }).sort({ createdAt: -1 })

    const formattedMedications = medications.map(med => ({
      id: med._id.toString(),
      userId: med.userId,
      name: med.name,
      dosage: med.dosage,
      instructions: med.instructions,
      times: med.times,
      isActive: med.isActive,
      createdAt: med.createdAt,
    }))

    return NextResponse.json(formattedMedications)
  } catch (error) {
    console.error('Failed to fetch medications:', error)
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
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

    const medication = new Medication({
      userId: session.userId,
      name: body.name,
      dosage: body.dosage,
      instructions: body.instructions,
      times: body.times,
      isActive: body.isActive ?? true,
    })

    const savedMedication = await medication.save()

    const formattedMedication = {
      id: savedMedication._id.toString(),
      userId: savedMedication.userId,
      name: savedMedication.name,
      dosage: savedMedication.dosage,
      instructions: savedMedication.instructions,
      times: savedMedication.times,
      isActive: savedMedication.isActive,
      createdAt: savedMedication.createdAt,
    }

    return NextResponse.json(formattedMedication, { status: 201 })
  } catch (error) {
    console.error('Failed to create medication:', error)
    return NextResponse.json({ error: 'Invalid medication data' }, { status: 400 })
  }
}