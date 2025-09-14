import 'server-only'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import type { JWTPayload } from 'jose'

export async function getSession(): Promise<JWTPayload | null> {
  const sessionCookie = (await cookies()).get('session')?.value
  if (!sessionCookie) {
    return null
  }
  const session = await decrypt(sessionCookie)
  return session
}
