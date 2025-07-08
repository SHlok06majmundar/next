import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DatabaseService } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import AuditTrail from '@/components/AuditTrail';
import { NotificationProvider } from '@/contexts/NotificationContext';
import Notification from '@/components/Notification';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/');
  }

  const user = await verifyToken(token);
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const page = parseInt(searchParams.page || '1');

  try {
    const result = await DatabaseService.fetchAuditHistory(page, 20);

    return (
      <NotificationProvider>
        <AuditTrail
          initialLogs={result.logs}
          initialTotal={result.total}
        />
        <Notification />
      </NotificationProvider>
    );
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    redirect('/dashboard');
  }
}
