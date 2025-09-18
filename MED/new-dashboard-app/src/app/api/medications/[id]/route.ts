import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Medication, MedicationLog, UserSettings } from '@/lib/models'
import { getSession } from '@/lib/session'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB()
    const { id } = await params
    const body = await request.json()
    
    // Ensure medication belongs to the user
    const existingMedication = await Medication.findOne({
      _id: id,
      userId: session.userId
    });

    if (!existingMedication) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
    }
    
    const medication = await Medication.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    )
    
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
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB()
    const { id } = await params
    
    // Ensure medication belongs to the user
    const medication = await Medication.findOne({
      _id: id,
      userId: session.userId
    });

    if (!medication) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
    }

    // Check user settings to determine if logs should be kept
    const userSettings = await UserSettings.findOne({ userId: session.userId });
    const keepLogs = userSettings?.keepLogsAfterDeletion || false;

    // Delete related medication logs only if user setting allows it
    if (!keepLogs) {
      await MedicationLog.deleteMany({ medicationId: id });
    }

    // Delete the medication
    await Medication.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Medication deleted successfully',
      deletedId: id 
    });
  } catch (error) {
    console.error('Failed to delete medication:', error)
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 })
  }
}
