import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { collection, getDocs, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreOrder, FirestoreUser } from '@/types/firestore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface OrderManagementProps {
  onClose?: () => void;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type FilterStatus = 'all' | OrderStatus;

export const OrderManagement: React.FC<OrderManagementProps> = ({ onClose }) => {
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [drivers, setDrivers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<FirestoreOrder | null>(null);
  const [assigningDriver, setAssigningDriver] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreOrder[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'driver'));
      const snapshot = await getDocs(q);
      const driversData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreUser[];
      setDrivers(driversData);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now(),
      });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        assignedDriver: driverId,
        status: 'processing',
        updatedAt: Timestamp.now(),
      });
      toast.success('Driver assigned successfully!');
      setAssigningDriver(null);
      fetchOrders();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-600';
      case 'delivered':
        return 'bg-green-500/10 text-green-600';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Order Management</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">View and manage customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">Total</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Pending</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.pending}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Processing</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.processing}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Shipped</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.shipped}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Delivered</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.delivered}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <span className="text-sm text-[var(--color-text-secondary)]">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            GH₵ {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, email, or customer name..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-[var(--color-text-primary)]">
                        #{order.id.substring(0, 8)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">
                          {order.shippingAddress?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{order.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {order.createdAt
                        ? format(
                            order.createdAt instanceof Timestamp
                              ? order.createdAt.toDate()
                              : new Date(order.createdAt),
                            'MMM d, yyyy'
                          )
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--color-text-primary)]">
                        GH₵ {order.total?.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentMethod === 'flutterwave'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-green-500/10 text-green-600'
                        }`}
                      >
                        {order.paymentMethod === 'flutterwave' ? 'Card/Mobile' : 'Cash on Delivery'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {order.status === 'processing' && !order.assignedDriver && (
                          <button
                            onClick={() => setAssigningDriver(order.id)}
                            className="text-xs text-[var(--color-primary)] hover:underline"
                          >
                            Assign Driver
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--color-text-secondary)]">No orders found</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Order Details #{selectedOrder.id.substring(0, 8)}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-[var(--color-text-tertiary)]" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      <span className="text-[var(--color-text-secondary)]">
                        {selectedOrder.shippingAddress?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      <span className="text-[var(--color-text-secondary)]">{selectedOrder.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      <span className="text-[var(--color-text-secondary)]">
                        {selectedOrder.shippingAddress?.phone}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-[var(--color-text-tertiary)] mt-0.5" />
                      <span className="text-[var(--color-text-secondary)]">
                        {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},{' '}
                        {selectedOrder.shippingAddress?.state}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[var(--color-surface-hover)] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              Qty: {item.quantity} × GH₵ {item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-[var(--color-text-primary)]">
                          GH₵ {(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                      <span className="text-[var(--color-text-primary)]">
                        GH₵ {selectedOrder.subtotal?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">VAT (12.5%)</span>
                      <span className="text-[var(--color-text-primary)]">GH₵ {selectedOrder.vat?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">Shipping</span>
                      <span className="text-[var(--color-text-primary)]">
                        GH₵ {selectedOrder.shippingCost?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-[var(--color-border)] pt-2">
                      <span className="text-[var(--color-text-primary)]">Total</span>
                      <span className="text-[var(--color-primary)]">GH₵ {selectedOrder.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {assigningDriver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setAssigningDriver(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Assign Driver</h3>
              <div className="space-y-2">
                {drivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => assignDriver(assigningDriver, driver.id)}
                    className="w-full p-3 text-left border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <p className="font-medium text-[var(--color-text-primary)]">{driver.name}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{driver.email}</p>
                  </button>
                ))}
              </div>
              {drivers.length === 0 && (
                <p className="text-center text-[var(--color-text-secondary)] py-8">No drivers available</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
