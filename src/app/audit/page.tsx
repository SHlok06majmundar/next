'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuditLog } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  Edit3,
  Loader2
} from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const { showNotification } = useNotification();

  const loadAuditLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/audit?${params}`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setLogs(data.logs);
        setTotalPages(Math.ceil(data.total / 20));
      } else {
        showNotification(data.error || 'Failed to load audit logs', 'error');
      }
    } catch (error) {
      showNotification('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'reject':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'edit':
        return <Edit3 className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const configs = {
      approve: 'bg-emerald-100 text-emerald-800 ring-emerald-600/30',
      reject: 'bg-red-100 text-red-800 ring-red-600/30',
      edit: 'bg-blue-100 text-blue-800 ring-blue-600/30'
    };
    
    const config = configs[action as keyof typeof configs] || 'bg-gray-100 text-gray-800 ring-gray-600/30';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${config}`}>
        {getActionIcon(action)}
        <span className="ml-1.5">{action.charAt(0).toUpperCase() + action.slice(1)}</span>
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading audit trail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
                  <p className="text-sm text-gray-600">Monitor all administrative actions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs</h3>
              <p className="text-gray-600">No administrative actions have been recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {getActionBadge(log.action)}
                            <span className="text-sm text-gray-500">
                              Listing #{log.listingId}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">{log.adminUsername}</span>
                          <span className="mx-2">performed</span>
                          <span className="font-medium">{log.action}</span>
                          <span className="mx-2">action on listing</span>
                        </div>
                        {log.details && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Details:</span> {log.details}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </p>
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
