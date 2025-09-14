import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'

const secretKey = process.env.JWT_SECRET_KEY
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set in the environment variables.')
}
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Set a 7-day expiration
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = ''): Promise<JWTPayload | null> {
  if (!session) {
    return null
  }
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    // This is expected if the token is expired or invalid
    console.error('Failed to verify session:', error)
    return null
  }
}
