import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await DatabaseService.findUserByLogin(username, password);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Invalid credentials or insufficient permissions' }, { status: 401 });
    }

    const authUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as 'admin' | 'user'
    };

    const token = await signToken(authUser);
    const response = NextResponse.json({ success: true, user: authUser });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
