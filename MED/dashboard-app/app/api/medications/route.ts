import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Medication } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()
    const medications = await Medication.find({ isActive: true }).sort({ createdAt: -1 })
    
    // Transform MongoDB documents to match expected format
    const formattedMedications = medications.map(med => ({
      id: med._id.toString(),
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
    await connectDB()
    const body = await request.json()
    
    const medication = new Medication({
      name: body.name,
      dosage: body.dosage,
      instructions: body.instructions,
      times: body.times,
      isActive: body.isActive ?? true,
    })
    
    const savedMedication = await medication.save()
    
    const formattedMedication = {
      id: savedMedication._id.toString(),
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