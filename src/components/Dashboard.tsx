'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CarListing } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';
import EditListingModal from './EditListingModal';
import RejectModal from './RejectModal';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Search, 
  LogOut, 
  Calendar,
  DollarSign,
  MapPin,
  Car,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  initialListings: CarListing[];
  initialTotal: number;
  initialPage: number;
}

export default function Dashboard({ initialListings, initialTotal, initialPage }: DashboardProps) {
  const [listings, setListings] = useState<CarListing[]>(initialListings);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingListing, setEditingListing] = useState<CarListing | null>(null);
  const [rejectingListing, setRejectingListing] = useState<CarListing | null>(null);
  
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const limit = 10;

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/listings?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings);
        setTotal(data.total);
      } else {
        showNotification('Failed to fetch listings', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while fetching listings', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, status, search, showNotification]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      showNotification('Logout failed', 'error');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/listings/${id}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        showNotification('Listing approved successfully', 'success');
        fetchListings();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to approve listing', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while approving the listing', 'error');
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectingListing) return;

    try {
      const response = await fetch(`/api/listings/${rejectingListing.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        showNotification('Listing rejected successfully', 'success');
        fetchListings();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to reject listing', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while rejecting the listing', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Car Rental Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/audit')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Audit Trail
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="status-filter" className="sr-only">Filter by status</label>
              <select
                id="status-filter"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => {
                setPage(1);
                fetchListings();
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-2xl font-semibold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Car Listings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review and manage user-submitted car rental listings.
            </p>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No listings found matching your criteria.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <li key={listing.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={listing.imageUrl}
                          alt={listing.title}
                        />
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {listing.title}
                          </p>
                          {getStatusBadge(listing.status)}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Car className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <p className="truncate">{listing.brand} {listing.model} ({listing.year})</p>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <p className="truncate">{listing.location}</p>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <p>${listing.pricePerDay}/day</p>
                          <Calendar className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4" />
                          <p>{new Date(listing.submittedAt).toLocaleDateString()}</p>
                        </div>
                        {listing.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded-md">
                            <p className="text-sm text-red-800">
                              <strong>Rejection Reason:</strong> {listing.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(listing.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingListing(listing)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditingListing(listing)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
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

      {/* Modals */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          isOpen={true}
          onClose={() => setEditingListing(null)}
          onUpdate={fetchListings}
        />
      )}

      {rejectingListing && (
        <RejectModal
          isOpen={true}
          onClose={() => setRejectingListing(null)}
          onReject={handleReject}
          listingTitle={rejectingListing.title}
        />
      )}
    </div>
  );
}
