// Core type definitions for enterprise security
export type UserRole = 'customer' | 'technician' | 'manager' | 'driver' | 'management_support';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  provider: 'google' | 'apple' | 'email';
  verified: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId?: string;
  productName?: string;
  serviceType: 'installation' | 'repair' | 'consultation' | 'maintenance';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  location: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
