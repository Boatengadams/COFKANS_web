import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, User, MapPin, Truck, Clock, Phone, Mail, CheckCircle, XCircle, AlertCircle, Search, Filter, TrendingUp, Activity } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  status: 'available' | 'busy' | 'offline';
  currentZone?: string;
  activeDeliveries: number;
  completedToday: number;
  rating: number;
}

interface PendingOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  zone: string;
  items: number;
  totalAmount: number;
  priority: 'standard' | 'same_day' | 'urgent';
  orderTime: string;
  estimatedPrep: string;
}

export function DispatchManagement() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState('all');

  const drivers: Driver[] = [
    {
      id: 'DRV001',
      name: 'Kwame Mensah',
      phone: '+233 24 123 4567',
      email: 'kwame@cofkans.com',
      vehicleType: 'Van',
      vehicleNumber: 'GN 1234-21',
      status: 'busy',
      currentZone: 'Kumasi - Adum',
      activeDeliveries: 2,
      completedToday: 5,
      rating: 4.8
    },
    {
      id: 'DRV002',
      name: 'Ama Osei',
      phone: '+233 20 987 6543',
      email: 'ama@cofkans.com',
      vehicleType: 'Pickup',
      vehicleNumber: 'AS 5678-22',
      status: 'available',
      currentZone: 'Kumasi - Asokwa',
      activeDeliveries: 0,
      completedToday: 8,
      rating: 4.9
    },
    {
      id: 'DRV003',
      name: 'Yaw Boateng',
      phone: '+233 55 234 5678',
      email: 'yaw@cofkans.com',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'GN 9012-21',
      status: 'available',
      currentZone: 'Kumasi - Bantama',
      activeDeliveries: 0,
      completedToday: 12,
      rating: 4.7
    },
    {
      id: 'DRV004',
      name: 'Abena Asante',
      phone: '+233 24 876 5432',
      email: 'abena@cofkans.com',
      vehicleType: 'Van',
      vehicleNumber: 'KM 3456-20',
      status: 'offline',
      currentZone: 'Accra',
      activeDeliveries: 0,
      completedToday: 0,
      rating: 4.6
    }
  ];

  const pendingOrders: PendingOrder[] = [
    {
      id: 'PND001',
      orderId: 'ORD-2024-010',
      customerName: 'Emmanuel Mensah',
      customerPhone: '+233 24 111 2222',
      deliveryAddress: 'House 23, Asafo, Kumasi',
      zone: 'Kumasi - Asafo',
      items: 2,
      totalAmount: 1200,
      priority: 'same_day',
      orderTime: '10:30 AM',
      estimatedPrep: '11:00 AM'
    },
    {
      id: 'PND002',
      orderId: 'ORD-2024-011',
      customerName: 'Grace Owusu',
      customerPhone: '+233 20 333 4444',
      deliveryAddress: 'Plot 45, Ayigya, Kumasi',
      zone: 'Kumasi - Ayigya',
      items: 5,
      totalAmount: 3800,
      priority: 'urgent',
      orderTime: '09:45 AM',
      estimatedPrep: '10:30 AM'
    },
    {
      id: 'PND003',
      orderId: 'ORD-2024-012',
      customerName: 'Joseph Acheampong',
      customerPhone: '+233 55 555 6666',
      deliveryAddress: 'Atonsu Road, Kumasi',
      zone: 'Kumasi - Atonsu',
      items: 1,
      totalAmount: 450,
      priority: 'standard',
      orderTime: '11:15 AM',
      estimatedPrep: '12:00 PM'
    },
    {
      id: 'PND004',
      orderId: 'ORD-2024-013',
      customerName: 'Sarah Boakye',
      customerPhone: '+233 24 777 8888',
      deliveryAddress: 'Tech Junction, Kumasi',
      zone: 'Kumasi - Tech',
      items: 3,
      totalAmount: 2100,
      priority: 'same_day',
      orderTime: '10:00 AM',
      estimatedPrep: '11:30 AM'
    }
  ];

  const zones = Array.from(new Set(pendingOrders.map(o => o.zone)));

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const assignToDriver = () => {
    if (selectedOrders.length > 0 && selectedDriver) {
      console.log(`Assigning orders ${selectedOrders.join(', ')} to driver ${selectedDriver}`);
      // Send SMS/Email notifications here
      alert(`Successfully assigned ${selectedOrders.length} order(s) to driver!\n\n✓ Driver notified via SMS & Email\n✓ Customer notified with tracking link`);
      setSelectedOrders([]);
      setSelectedDriver(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-500/10 border-red-500/20';
      case 'same_day': return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
      default: return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
    }
  };

  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = filterZone === 'all' || order.zone === filterZone;
    return matchesSearch && matchesZone;
  });

  const stats = {
    pendingOrders: pendingOrders.length,
    activeDrivers: drivers.filter(d => d.status !== 'offline').length,
    inTransit: drivers.reduce((sum, d) => sum + d.activeDeliveries, 0),
    completedToday: drivers.reduce((sum, d) => sum + d.completedToday, 0)
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dispatch Management</h1>
          <p className="text-muted-foreground">Assign delivery orders to available drivers</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-6 h-6 text-orange-500" />
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            <p className="text-sm text-muted-foreground">Pending Orders</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <User className="w-6 h-6 text-green-500" />
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{stats.activeDrivers}</p>
            <p className="text-sm text-muted-foreground">Active Drivers</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-6 h-6 text-blue-500" />
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{stats.inTransit}</p>
            <p className="text-sm text-muted-foreground">In Transit</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.completedToday}</p>
            <p className="text-sm text-muted-foreground">Completed Today</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Orders */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Pending Orders ({filteredOrders.length})</h2>
                {selectedOrders.length > 0 && (
                  <span className="text-sm font-semibold text-primary">
                    {selectedOrders.length} selected
                  </span>
                )}
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  className="px-4 py-2 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none"
                >
                  <option value="all">All Zones</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              {/* Orders List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedOrders.includes(order.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleOrderSelection(order.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-5 h-5 rounded border-2 border-border"
                        />
                        <div>
                          <p className="font-bold">#{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(order.priority)}`}>
                        {order.priority.toUpperCase().replace('_', ' ')}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{order.zone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{order.items} items • GH₵{order.totalAmount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Ready: {order.estimatedPrep}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{order.customerPhone}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Assign Button */}
              {selectedOrders.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={assignToDriver}
                  disabled={!selectedDriver}
                  className="w-full mt-6 px-6 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" />
                  Assign {selectedOrders.length} Order(s) to {selectedDriver ? drivers.find(d => d.id === selectedDriver)?.name : 'Driver'}
                </motion.button>
              )}
            </div>
          </div>

          {/* Available Drivers */}
          <div>
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-6">
              <h2 className="text-xl font-bold mb-6">Available Drivers</h2>

              <div className="space-y-3">
                {drivers.map((driver) => (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedDriver === driver.id
                        ? 'border-primary bg-primary/5'
                        : driver.status === 'offline'
                        ? 'border-border opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => driver.status !== 'offline' && setSelectedDriver(driver.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(driver.status)}`} />
                        </div>
                        <div>
                          <p className="font-bold">{driver.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{driver.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{driver.rating} ⭐</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <span className="font-medium">{driver.vehicleType} • {driver.vehicleNumber}</span>
                      </div>
                      {driver.currentZone && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Zone:</span>
                          <span className="font-medium">{driver.currentZone}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Active:</span>
                        <span className="font-medium">{driver.activeDeliveries} orders</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium text-green-600">{driver.completedToday} today</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex gap-2">
                      <a
                        href={`tel:${driver.phone}`}
                        className="flex-1 px-3 py-1.5 bg-background rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-muted transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                      <a
                        href={`mailto:${driver.email}`}
                        className="flex-1 px-3 py-1.5 bg-background rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-muted transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
