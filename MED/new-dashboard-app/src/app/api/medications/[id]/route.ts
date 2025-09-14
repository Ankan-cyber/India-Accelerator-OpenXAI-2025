import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Medication } from '@/lib/models'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    
    const medication = await Medication.findByIdAndUpdate(
      id,
      body,
      { new: true }
    )
    
    if (!medication) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
    }
    
    const formattedMedication = {
      id: medication._id.toString(),
      name: medication.name,
      dosage: medication.dosage,
      instructions: medication.instructions,
      times: medication.times,
      isActive: medication.isActive,
      createdAt: medication.createdAt,
    }
    
    return NextResponse.json(formattedMedication)
  } catch (error) {
    console.error('Failed to update medication:', error)
    return NextResponse.json({ error: 'Invalid medication data' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const medication = await Medication.findByIdAndDelete(id)
    
    if (!medication) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete medication:', error)
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 })
  }
}
