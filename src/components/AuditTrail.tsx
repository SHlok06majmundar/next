'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuditLog } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';
import { ArrowLeft, User, Calendar, FileText } from 'lucide-react';

interface AuditTrailProps {
  initialLogs: AuditLog[];
  initialTotal: number;
}

export default function AuditTrail({ initialLogs, initialTotal }: AuditTrailProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const limit = 20;

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/audit?page=${page}&limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotal(data.total);
      } else {
        showNotification('Failed to fetch audit logs', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while fetching audit logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approve':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'reject':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      case 'edit':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Edited</span>;
      case 'delete':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Deleted</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{action}</span>;
    }
  };

  const formatChanges = (previousData: any, newData: any): React.ReactElement | null => {
    if (!previousData && !newData) return null;
    
    const changes: React.ReactElement[] = [];
    
    if (newData) {
      Object.keys(newData).forEach(key => {
        if (previousData && previousData[key] !== newData[key]) {
          changes.push(
            <div key={key} className="text-sm">
              <span className="font-medium">{key}:</span>{' '}
              <span className="text-red-600 line-through">{previousData[key]}</span>
              {' → '}
              <span className="text-green-600">{newData[key]}</span>
            </div>
          );
        } else if (!previousData) {
          changes.push(
            <div key={key} className="text-sm">
              <span className="font-medium">{key}:</span>{' '}
              <span className="text-green-600">{newData[key]}</span>
            </div>
          );
        }
      });
    }
    
    return changes.length > 0 ? <div className="mt-2 space-y-1">{changes}</div> : null;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <FileText className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Actions Log</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Track all administrative actions performed on car listings.
            </p>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No audit logs found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {logs.map((log) => (
                <li key={log.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getActionBadge(log.action)}
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            Listing ID: {log.listingId}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <time>{new Date(log.timestamp).toLocaleString()}</time>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span>Admin: {log.adminUsername}</span>
                      </div>
                      
                      {log.reason && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <strong>Reason:</strong> {log.reason}
                          </p>
                        </div>
                      )}
                      
                      {(log.previousData || log.newData) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Changes:</h4>
                          {formatChanges(log.previousData, log.newData)}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(page - 1) * limit + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, total)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{total}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
