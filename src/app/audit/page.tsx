'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuditLog } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';
import { ArrowLeft, Calendar, User, FileText, Clock } from 'lucide-react';

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

  const getActionColor = (action: string) => {
    const colors = {
      approve: 'text-green-600 bg-green-100',
      reject: 'text-red-600 bg-red-100',
      edit: 'text-blue-600 bg-blue-100',
      delete: 'text-gray-600 bg-gray-100'
    };
    return colors[action as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {logs.map((log) => (
                <li key={log.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                        <div className="ml-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="w-4 h-4 mr-1" />
                            <strong>{log.adminUsername}</strong>
                            <span className="ml-2">performed action on listing</span>
                            <strong className="ml-1">{log.listingId}</strong>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                          {log.reason && (
                            <div className="flex items-start text-sm text-gray-600 mt-2">
                              <FileText className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                              <span><strong>Reason:</strong> {log.reason}</span>
                            </div>
                          )}
                          {log.previousData && log.newData && (
                            <div className="mt-3 text-xs">
                              <details className="cursor-pointer">
                                <summary className="text-indigo-600 hover:text-indigo-800">
                                  View Changes
                                </summary>
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Before</h4>
                                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                        {JSON.stringify(log.previousData, null, 2)}
                                      </pre>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">After</h4>
                                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                        {JSON.stringify(log.newData, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}

          {logs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs</h3>
              <p className="mt-1 text-sm text-gray-500">
                No actions have been recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
