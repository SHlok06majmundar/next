import { jwtVerify, SignJWT } from 'jose';
import { NextRequest } from 'next/server';
import { AuthUser } from '@/types';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export async function signToken(payload: AuthUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (
      typeof payload.id === 'string' &&
      typeof payload.username === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string'
    ) {
      return {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role as 'admin' | 'user'
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

export async function auth() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const user = await verifyToken(token);
    return user ? { user } : null;
  } catch (error) {
    return null;
  }
}
