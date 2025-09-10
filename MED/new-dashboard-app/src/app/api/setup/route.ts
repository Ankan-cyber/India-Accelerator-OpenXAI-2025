import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { EmergencyContact } from '@/lib/models'

export async function POST() {
  try {
    await connectDB()
    
    // Check if emergency contacts already exist
    const existingContacts = await EmergencyContact.find()
    if (existingContacts.length > 0) {
      return NextResponse.json({ message: 'Emergency contacts already exist' })
    }
    
    // Create default emergency contacts
    const defaultContacts = [
      {
        name: "Emergency Services",
        phone: "911",
        relationship: "Emergency",
        isPrimary: true,
      },
      {
        name: "Dr. Sarah Johnson",
        phone: "(555) 123-4567",
        relationship: "Primary Care Doctor",
        isPrimary: false,
      },
      {
        name: "St. Mary's Hospital",
        phone: "(555) 987-6543",
        relationship: "Hospital",
        isPrimary: false,
      },
      {
        name: "John Smith",
        phone: "(555) 456-7890",
        relationship: "Son",
        isPrimary: false,
      }
    ]
    
    await EmergencyContact.insertMany(defaultContacts)
    
    return NextResponse.json({ 
      message: 'Default emergency contacts created successfully',
      count: defaultContacts.length 
    })
  } catch (error) {
    console.error('Failed to create default emergency contacts:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}