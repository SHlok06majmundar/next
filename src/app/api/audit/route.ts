import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/database';
// No auth import needed for the demo

export async function GET(request: Request) {
  // For the demo, we're making the audit API public
  // In a real application, you'd want proper authentication here
  
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  try {
    // Get audit logs from database
    const { logs, total } = await getAuditLogs({ page, limit });
    
    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}