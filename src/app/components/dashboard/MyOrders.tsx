import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Search,
  ChevronDown,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MapPin,
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { FirestoreOrder } from '@/lib/firestore-schema';

interface OrderWithId extends FirestoreOrder {
  id: string;
}

export function MyOrders() {
  const { user } = useFirebaseAuth();
  const [orders, setOrders] = useState<OrderWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    if (DEMO_MODE) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrderWithId[];

      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Unable to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items && order.items.some(item =>
        item.productSnapshot?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ));

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-card border-2 border-border rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No orders found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : "You haven't placed any orders yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border-2 border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">Order #{order.id.slice(-8).toUpperCase()}</h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {order.createdAt ? format(order.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    GH₵ {(order.total || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-background rounded-xl">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{item.productSnapshot?.name || 'Unknown Product'}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity || 0} × GH₵ {(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="font-bold">
                        GH₵ {(item.subtotal || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>
              )}

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="flex items-start gap-2 p-3 bg-background rounded-xl mb-4">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-bold mb-1">Shipping Address</div>
                    <div className="text-muted-foreground">
                      {order.shippingAddress.street}, {order.shippingAddress.city}
                      {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </motion.button>
                {order.status === 'shipped' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-secondary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Track Order
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
