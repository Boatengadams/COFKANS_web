import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wrench, Calendar, CheckCircle, Clock, AlertCircle, User, Phone, Mail, MapPin, Package, Search } from 'lucide-react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { ServiceRequest } from '../types';
import { AuditLogger } from '../utils/security';

export function TechnicianPortal() {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'pending' | 'in-progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadServiceRequests();
    AuditLogger.log('portal_accessed', 'technician_portal', { technicianId: user?.id });
  }, [user]);

  const loadServiceRequests = () => {
    // Mock service requests - in production, fetch from secure API
    const allRequests: ServiceRequest[] = [
      {
        id: 'SR001', customerId: 'CUST001', customerName: 'Kwame Mensah',
        customerEmail: 'kwame@email.com', customerPhone: '+233 24 123 4567',
        productName: 'High-End Pendant Light Installation', serviceType: 'installation',
        description: 'Need professional installation of luxury pendant lights in hotel lobby. 5 units total.',
        priority: 'high', status: 'assigned', assignedTechnicianId: user?.id, assignedTechnicianName: user?.name,
        location: 'Accra, Airport Residential', scheduledDate: '2026-05-18T09:00:00Z',
        createdAt: '2026-05-13T08:30:00Z', updatedAt: '2026-05-13T10:15:00Z'
      },
      {
        id: 'SR002', customerId: 'CUST002', customerName: 'Abena Osei',
        customerEmail: 'abena@email.com', customerPhone: '+233 20 987 6543',
        productName: '200W Streetlight Maintenance', serviceType: 'maintenance',
        description: 'Routine maintenance for solar streetlights.',
        priority: 'medium', status: 'pending', location: 'Kumasi, Ahodwo',
        scheduledDate: '2026-05-20T10:00:00Z', createdAt: '2026-05-12T14:20:00Z', updatedAt: '2026-05-12T14:20:00Z'
      },
      {
        id: 'SR003', customerId: 'CUST003', customerName: 'Kofi Antwi',
        customerEmail: 'kofi@business.com', customerPhone: '+233 24 555 7788',
        productName: '3-Phase Distribution Panel Repair', serviceType: 'repair',
        description: 'Main circuit breaker tripping. Need urgent diagnostic.',
        priority: 'urgent', status: 'in-progress', assignedTechnicianId: user?.id, assignedTechnicianName: user?.name,
        location: 'Tema, Industrial Area', scheduledDate: '2026-05-14T08:00:00Z',
        createdAt: '2026-05-13T16:45:00Z', updatedAt: '2026-05-13T17:00:00Z',
        notes: 'Customer reports power outages affecting production line.'
      }
    ];

    // SECURITY: Filter to show ONLY this technician's assigned jobs + unassigned pending jobs
    const technicianRequests = allRequests.filter(req =>
      !req.assignedTechnicianId || req.assignedTechnicianId === user?.id || req.status === 'pending'
    );

    setServiceRequests(technicianRequests);
  };

  const updateRequestStatus = (requestId: string, newStatus: ServiceRequest['status']) => {
    setServiceRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: newStatus, updatedAt: new Date().toISOString() } : req
      )
    );
    AuditLogger.log('service_request_updated', 'service_request', { requestId, newStatus, technicianId: user?.id });
  };

  const acceptRequest = (requestId: string) => {
    setServiceRequests(prev =>
      prev.map(req =>
        req.id === requestId ? {
          ...req, status: 'assigned', assignedTechnicianId: user?.id || '',
          assignedTechnicianName: user?.name || '', updatedAt: new Date().toISOString()
        } : req
      )
    );
    AuditLogger.log('service_request_accepted', 'service_request', { requestId, technicianId: user?.id });
  };

  const filteredRequests = serviceRequests
    .filter(req => filter === 'all' || req.status === filter)
    .filter(req =>
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    assigned: serviceRequests.filter(r => r.status === 'assigned').length,
    inProgress: serviceRequests.filter(r => r.status === 'in-progress').length,
    completed: serviceRequests.filter(r => r.status === 'completed').length,
    pending: serviceRequests.filter(r => r.status === 'pending').length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
      case 'assigned': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'in-progress': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl">
            <Wrench className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-luxury)' }}>Technician Portal</h1>
            <p className="text-muted-foreground text-lg">Welcome back, {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div whileHover={{ y: -4 }} className="p-6 bg-card rounded-2xl border-2 border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" strokeWidth={2} />
            </div>
            <span className="text-3xl font-bold">{stats.assigned}</span>
          </div>
          <p className="font-semibold text-sm">Assigned to You</p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="p-6 bg-card rounded-2xl border-2 border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-purple-600" strokeWidth={2} />
            </div>
            <span className="text-3xl font-bold">{stats.inProgress}</span>
          </div>
          <p className="font-semibold text-sm">In Progress</p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="p-6 bg-card rounded-2xl border-2 border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={2} />
            </div>
            <span className="text-3xl font-bold">{stats.completed}</span>
          </div>
          <p className="font-semibold text-sm">Completed</p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="p-6 bg-card rounded-2xl border-2 border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-orange-600" strokeWidth={2} />
            </div>
            <span className="text-3xl font-bold">{stats.pending}</span>
          </div>
          <p className="font-semibold text-sm">Available Jobs</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name or ID..." className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'assigned', 'in-progress', 'completed'] as const).map((status) => (
            <button key={status} onClick={() => setFilter(status)}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                filter === status ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/70'
              }`}>
              {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Service Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-xl font-semibold text-muted-foreground">No service requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-2xl border-2 border-border hover:border-primary transition-all shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{request.productName || request.serviceType}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">ID: {request.id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                      {request.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4">{request.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{request.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${request.customerPhone}`} className="hover:text-primary">{request.customerPhone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <a href={`mailto:${request.customerEmail}`} className="hover:text-primary truncate">{request.customerEmail}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{request.location}</span>
                    </div>
                  </div>

                  {request.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-secondary font-semibold">
                      <Calendar className="w-4 h-4" />
                      <span>Scheduled: {new Date(request.scheduledDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:w-48">
                  {request.status === 'pending' && (
                    <button onClick={() => acceptRequest(request.id)}
                      className="px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors">
                      Accept Job
                    </button>
                  )}
                  {request.status === 'assigned' && (
                    <button onClick={() => updateRequestStatus(request.id, 'in-progress')}
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors">
                      Start Work
                    </button>
                  )}
                  {request.status === 'in-progress' && (
                    <button onClick={() => updateRequestStatus(request.id, 'completed')}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors">
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
