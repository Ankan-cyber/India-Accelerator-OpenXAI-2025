import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { EmergencyContact } from '@/lib/models'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const contacts = await EmergencyContact.find({ userId: session.userId }).sort({ isPrimary: -1, name: 1 })

    const formattedContacts = contacts.map(contact => ({
      id: contact._id.toString(),
      userId: contact.userId,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary,
    }))

    return NextResponse.json(formattedContacts)
  } catch (error) {
    console.error('Failed to fetch emergency contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch emergency contacts' }, { status: 500 })
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

    const contact = new EmergencyContact({
      userId: session.userId,
      name: body.name,
      phone: body.phone,
      relationship: body.relationship,
      isPrimary: body.isPrimary ?? false,
    })

    const savedContact = await contact.save()

    const formattedContact = {
      id: savedContact._id.toString(),
      userId: savedContact.userId,
      name: savedContact.name,
      phone: savedContact.phone,
      relationship: savedContact.relationship,
      isPrimary: savedContact.isPrimary,
    }

    return NextResponse.json(formattedContact, { status: 201 })
  } catch (error) {
    console.error('Failed to create emergency contact:', error)
    return NextResponse.json({ error: 'Invalid contact data' }, { status: 400 })
  }
}