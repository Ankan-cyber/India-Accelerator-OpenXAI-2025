import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Return user session data
    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
      }
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ error: 'Session check failed' }, { status: 500 })
  }
}
