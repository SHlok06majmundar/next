'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CarListing } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';
import { Edit, Check, X, Search, Filter, LogOut, Car, Calendar, DollarSign, MapPin } from 'lucide-react';

interface ListingModalProps {
  listing: CarListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (listing: CarListing) => void;
}

function EditListingModal({ listing, isOpen, onClose, onSave }: ListingModalProps) {
  const [editData, setEditData] = useState<Partial<CarListing>>({});

  useEffect(() => {
    if (listing) {
      setEditData({
        title: listing.title,
        description: listing.description,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
        pricePerDay: listing.pricePerDay,
        location: listing.location,
        imageUrl: listing.imageUrl
      });
    }
  }, [listing]);

  const handleSave = () => {
    if (listing) {
      onSave({ ...listing, ...editData });
    }
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Edit Listing</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={editData.title || ''}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={editData.brand || ''}
                onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={editData.model || ''}
                onChange={(e) => setEditData({ ...editData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="number"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={editData.year || ''}
                onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price per Day ($)</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={editData.pricePerDay || ''}
                onChange={(e) => setEditData({ ...editData, pricePerDay: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={editData.location || ''}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={editData.imageUrl || ''}
              onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingListing, setEditingListing] = useState<CarListing | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const router = useRouter();
  const { showNotification } = useNotification();

  const loadListings = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter,
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/listings?${params}`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setListings(data.listings);
        setTotalPages(Math.ceil(data.total / 10));
      } else {
        showNotification(data.error || 'Failed to load listings', 'error');
      }
    } catch (error) {
      showNotification('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [currentPage, statusFilter, searchQuery]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/listings/${id}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        showNotification('Listing approved successfully', 'success');
        loadListings();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to approve listing', 'error');
      }
    } catch (error) {
      showNotification('Network error occurred', 'error');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      showNotification('Please provide a rejection reason', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/listings/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        showNotification('Listing rejected successfully', 'success');
        setShowRejectModal(null);
        setRejectionReason('');
        loadListings();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to reject listing', 'error');
      }
    } catch (error) {
      showNotification('Network error occurred', 'error');
    }
  };

  const handleEdit = async (listing: CarListing) => {
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listing),
      });

      if (response.ok) {
        showNotification('Listing updated successfully', 'success');
        setEditingListing(null);
        loadListings();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to update listing', 'error');
      }
    } catch (error) {
      showNotification('Network error occurred', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      showNotification('Logout failed', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status as keyof typeof classes]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
              <Car className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Car Rental Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/audit')}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Audit Trail
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search listings..."
                className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <li key={listing.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        className="h-16 w-16 rounded-lg object-cover"
                        src={listing.imageUrl}
                        alt={listing.title}
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <Car className="w-4 h-4 mr-1" />
                            {listing.brand} {listing.model} {listing.year}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${listing.pricePerDay}/day
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {listing.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(listing.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(listing.status)}
                          {listing.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">
                              Reason: {listing.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingListing(listing)}
                        className="p-2 text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(listing.id)}
                            className="p-2 text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowRejectModal(listing.id)}
                            className="p-2 text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
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
        </div>
      </div>

      <EditListingModal
        listing={editingListing}
        isOpen={!!editingListing}
        onClose={() => setEditingListing(null)}
        onSave={handleEdit}
      />

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Reject Listing</h3>
            <textarea
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Please provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
