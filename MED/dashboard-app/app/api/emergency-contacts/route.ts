import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { EmergencyContact } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()
    const contacts = await EmergencyContact.find().sort({ isPrimary: -1, name: 1 })
    
    // Transform MongoDB documents to match expected format
    const formattedContacts = contacts.map(contact => ({
      id: contact._id.toString(),
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
    await connectDB()
    const body = await request.json()
    
    const contact = new EmergencyContact({
      name: body.name,
      phone: body.phone,
      relationship: body.relationship,
      isPrimary: body.isPrimary ?? false,
    })
    
    const savedContact = await contact.save()
    
    const formattedContact = {
      id: savedContact._id.toString(),
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