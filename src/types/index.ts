export interface CarListing {
  id: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: 'approve' | 'reject' | 'edit' | 'delete';
  listingId: string;
  adminId: string;
  adminUsername: string;
  previousData?: Partial<CarListing>;
  newData?: Partial<CarListing>;
  reason?: string;
  timestamp: Date;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface PaginationParams {
  page: number;
  limit: number;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  search?: string;
}
