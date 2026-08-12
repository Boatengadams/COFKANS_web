import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TechnicianPortalProps {
  onBack: () => void;
}

interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  scheduledDate?: any;
  completedDate?: any;
  notes: string[];
  createdAt: any;
  updatedAt: any;
}

export function TechnicianPortal({ onBack }: TechnicianPortalProps) {
  const { user } = useFirebaseAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadServiceRequests();
  }, [user]);

  const loadServiceRequests = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load requests assigned to this technician
      const requestsQuery = query(
        collection(db, 'serviceRequests'),
        where('assignedTo', '==', user.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(requestsQuery);
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceRequest[];

      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to load service requests:', error);
      toast.error('Unable to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: ServiceRequest['status']) => {
    try {
      setUpdating(true);

      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === 'completed') {
        updateData.completedDate = serverTimestamp();
      } else if (newStatus === 'in_progress' && selectedRequest?.status === 'assigned') {
        updateData.startedDate = serverTimestamp();
      }

      await updateDoc(doc(db, 'serviceRequests', requestId), updateData);

      toast.success(`Status updated to ${newStatus}`);
      await loadServiceRequests();

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Unable to update status');
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!selectedRequest || !newNote.trim()) return;

    try {
      setUpdating(true);

      const updatedNotes = [...(selectedRequest.notes || []), {
        text: newNote,
        technicianId: user?.id,
        technicianName: user?.displayName,
        timestamp: new Date().toISOString(),
      }];

      await updateDoc(doc(db, 'serviceRequests', selectedRequest.id), {
        notes: updatedNotes,
        updatedAt: serverTimestamp(),
      });

      setNewNote('');
      toast.success('Note added');
      await loadServiceRequests();
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error('Unable to add note');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'assigned':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'in_progress':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: ServiceRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'high':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch =
      request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending' || r.status === 'assigned').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-3 rounded-xl border-2 border-border hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Wrench className="w-6 h-6 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Technician Portal</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your assigned service requests
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-xl p-4 border-2 border-border">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Assigned</div>
            </div>
            <div className="bg-background rounded-xl p-4 border-2 border-border">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="bg-background rounded-xl p-4 border-2 border-border">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="bg-background rounded-xl p-4 border-2 border-border">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Service Requests List */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Service Requests</h2>
              <div className="ml-auto flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-card border-2 border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-card border-2 border-border rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="bg-card border-2 border-border rounded-2xl p-12 text-center">
                <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No service requests</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterStatus !== 'all'
                    ? 'No requests match your filters'
                    : "You don't have any assigned service requests"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedRequest(request)}
                    className={`bg-card border-2 rounded-xl p-4 cursor-pointer transition ${
                      selectedRequest?.id === request.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold">{request.serviceType}</h3>
                        <p className="text-sm text-muted-foreground">{request.customerName}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{request.address.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(request.createdAt.toDate(), 'MMM dd')}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Service Request Details */}
          <div className="lg:sticky lg:top-6 h-fit">
            {selectedRequest ? (
              <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedRequest.serviceType}</h2>
                      <p className="text-sm text-muted-foreground">
                        Request #{selectedRequest.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 bg-background rounded-xl">
                    <h3 className="font-bold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-background rounded-xl space-y-3">
                  <h3 className="font-bold">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedRequest.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedRequest.customerPhone}`} className="text-primary hover:underline">
                        {selectedRequest.customerPhone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedRequest.customerEmail}`} className="text-primary hover:underline">
                        {selectedRequest.customerEmail}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div>{selectedRequest.address.street}</div>
                        <div>{selectedRequest.address.city}, {selectedRequest.address.state}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="space-y-3">
                  <h3 className="font-bold">Update Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.status !== 'in_progress' && selectedRequest.status !== 'completed' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateRequestStatus(selectedRequest.id, 'in_progress')}
                        disabled={updating}
                        className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg font-bold hover:bg-purple-500/20 transition cursor-pointer disabled:opacity-50"
                      >
                        Start Work
                      </motion.button>
                    )}
                    {selectedRequest.status === 'in_progress' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg font-bold hover:bg-green-500/20 transition cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Complete
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <h3 className="font-bold">Service Notes</h3>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedRequest.notes && selectedRequest.notes.length > 0 ? (
                      selectedRequest.notes.map((note: any, index) => (
                        <div key={index} className="p-3 bg-background rounded-lg text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            <span className="font-bold text-xs">{note.technicianName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(note.timestamp), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{note.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                      onKeyPress={(e) => e.key === 'Enter' && addNote()}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addNote}
                      disabled={!newNote.trim() || updating}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border-2 border-border rounded-2xl p-12 text-center">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Request Selected</h3>
                <p className="text-muted-foreground">
                  Select a service request from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
