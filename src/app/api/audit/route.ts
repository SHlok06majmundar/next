import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/database';

export async function GET(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  try {
    const { logs, total } = await getAuditLogs({ page, limit });
    
    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}