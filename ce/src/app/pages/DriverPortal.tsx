import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Truck,
  Package,
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Clock,
  Camera,
  User,
  Search,
} from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface DriverPortalProps {
  onBack: () => void;
}

interface Delivery {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
    additionalInfo?: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  priority: 'standard' | 'express' | 'urgent';
  assignedDriver?: string;
  scheduledDate?: any;
  pickedUpAt?: any;
  deliveredAt?: any;
  proofOfDelivery?: string;
  deliveryNotes?: string;
  createdAt: any;
  updatedAt: any;
}

export function DriverPortal({ onBack }: DriverPortalProps) {
  const { user } = useFirebaseAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, [user]);

  const loadDeliveries = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const deliveriesQuery = query(
        collection(db, 'deliveries'),
        where('assignedDriver', '==', user.id),
        orderBy('scheduledDate', 'asc')
      );

      const snapshot = await getDocs(deliveriesQuery);
      const deliveriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Delivery[];

      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
      toast.error('Unable to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: Delivery['status']) => {
    try {
      setUpdating(true);

      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === 'picked_up') {
        updateData.pickedUpAt = serverTimestamp();
      } else if (newStatus === 'delivered') {
        updateData.deliveredAt = serverTimestamp();
        if (deliveryNotes) {
          updateData.deliveryNotes = deliveryNotes;
        }
      }

      await updateDoc(doc(db, 'deliveries', deliveryId), updateData);

      toast.success(`Delivery marked as ${newStatus.replace('_', ' ')}`);
      await loadDeliveries();

      if (selectedDelivery?.id === deliveryId) {
        setSelectedDelivery(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Failed to update delivery:', error);
      toast.error('Unable to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const openMaps = (address: Delivery['deliveryAddress']) => {
    const fullAddress = `${address.street}, ${address.city}, ${address.state}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'picked_up':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'in_transit':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getPriorityBadge = (priority: Delivery['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded text-xs font-bold">URGENT</span>;
      case 'express':
        return <span className="px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded text-xs font-bold">EXPRESS</span>;
      default:
        return null;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
    const matchesSearch =
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.deliveryAddress.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending' || d.status === 'picked_up').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    completed: deliveries.filter(d => d.status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading deliveries...</p>
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
                <Truck className="w-6 h-6 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Driver Portal</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your delivery assignments
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
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.inTransit}</div>
              <div className="text-sm text-muted-foreground">In Transit</div>
            </div>
            <div className="bg-background rounded-xl p-4 border-2 border-border">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Deliveries List */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Deliveries</h2>
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
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            {filteredDeliveries.length === 0 ? (
              <div className="bg-card border-2 border-border rounded-2xl p-12 text-center">
                <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No deliveries</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterStatus !== 'all'
                    ? 'No deliveries match your filters'
                    : "You don't have any assigned deliveries"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredDeliveries.map((delivery) => (
                  <motion.div
                    key={delivery.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedDelivery(delivery)}
                    className={`bg-card border-2 rounded-xl p-4 cursor-pointer transition ${
                      selectedDelivery?.id === delivery.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{delivery.customerName}</h3>
                          {getPriorityBadge(delivery.priority)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Order #{delivery.orderId.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{delivery.items.length} items</span>
                      </div>
                      {delivery.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(delivery.scheduledDate.toDate(), 'MMM dd, HH:mm')}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Details */}
          <div className="lg:sticky lg:top-6 h-fit">
            {selectedDelivery ? (
              <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedDelivery.customerName}</h2>
                      <p className="text-sm text-muted-foreground">
                        Order #{selectedDelivery.orderId.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(selectedDelivery.status)}`}>
                      {selectedDelivery.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 bg-background rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">Delivery Address</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openMaps(selectedDelivery.deliveryAddress)}
                      className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg text-sm font-bold cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate
                    </motion.button>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>{selectedDelivery.deliveryAddress.street}</p>
                    <p>{selectedDelivery.deliveryAddress.city}, {selectedDelivery.deliveryAddress.state}</p>
                    {selectedDelivery.deliveryAddress.postalCode && (
                      <p>{selectedDelivery.deliveryAddress.postalCode}</p>
                    )}
                    {selectedDelivery.deliveryAddress.additionalInfo && (
                      <p className="text-muted-foreground italic mt-2">
                        Note: {selectedDelivery.deliveryAddress.additionalInfo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Contact */}
                <div className="p-4 bg-background rounded-xl space-y-3">
                  <h3 className="font-bold">Customer Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedDelivery.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`tel:${selectedDelivery.customerPhone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedDelivery.customerPhone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 bg-background rounded-xl space-y-3">
                  <h3 className="font-bold">Items ({selectedDelivery.items.length})</h3>
                  <div className="space-y-2">
                    {selectedDelivery.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.productName}</span>
                        <span className="font-bold">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h3 className="font-bold">Update Status</h3>

                  {selectedDelivery.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateDeliveryStatus(selectedDelivery.id, 'picked_up')}
                      disabled={updating}
                      className="w-full px-4 py-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <Package className="w-4 h-4 inline mr-2" />
                      Mark as Picked Up
                    </motion.button>
                  )}

                  {selectedDelivery.status === 'picked_up' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateDeliveryStatus(selectedDelivery.id, 'in_transit')}
                      disabled={updating}
                      className="w-full px-4 py-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl font-bold hover:bg-purple-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <Truck className="w-4 h-4 inline mr-2" />
                      Start Delivery
                    </motion.button>
                  )}

                  {selectedDelivery.status === 'in_transit' && (
                    <div className="space-y-3">
                      <textarea
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Delivery notes (optional)..."
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary resize-none"
                        rows={3}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateDeliveryStatus(selectedDelivery.id, 'delivered')}
                        disabled={updating}
                        className="w-full px-4 py-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl font-bold hover:bg-green-500/20 transition cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Complete Delivery
                      </motion.button>
                    </div>
                  )}

                  {selectedDelivery.status === 'delivered' && (
                    <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-xl text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="font-bold text-green-600 dark:text-green-400">
                        Delivery Completed
                      </p>
                      {selectedDelivery.deliveredAt && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(selectedDelivery.deliveredAt.toDate(), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card border-2 border-border rounded-2xl p-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Delivery Selected</h3>
                <p className="text-muted-foreground">
                  Select a delivery from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
