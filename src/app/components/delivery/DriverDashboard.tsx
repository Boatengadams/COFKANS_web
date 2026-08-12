import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, MapPin, Phone, Navigation, Camera, CheckCircle, Clock, AlertCircle, User, Mail, FileSignature, Upload, ChevronRight, TrendingUp } from 'lucide-react';

interface DeliveryJob {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  zone: string;
  items: number;
  totalAmount: number;
  priority: 'standard' | 'same_day' | 'urgent';
  status: 'assigned' | 'picked_up' | 'in_transit' | 'arrived' | 'delivered';
  estimatedTime: string;
  specialInstructions?: string;
}

export function DriverDashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedJob, setSelectedJob] = useState<DeliveryJob | null>(null);
  const [showProofOfDelivery, setShowProofOfDelivery] = useState(false);
  const [deliveryProof, setDeliveryProof] = useState({
    recipientName: '',
    signature: null as string | null,
    photo: null as string | null,
    notes: ''
  });

  const activeJobs: DeliveryJob[] = [
    {
      id: 'DEL001',
      orderId: 'ORD-2024-001',
      customerName: 'Kwame Asante',
      customerPhone: '+233 24 123 4567',
      deliveryAddress: 'House No. 45, Adum, Kumasi',
      zone: 'Kumasi - Adum',
      items: 3,
      totalAmount: 2450,
      priority: 'same_day',
      status: 'picked_up',
      estimatedTime: '16:00',
      specialInstructions: 'Call before arrival - Gate code: 1234'
    },
    {
      id: 'DEL002',
      orderId: 'ORD-2024-002',
      customerName: 'Ama Osei',
      customerPhone: '+233 20 987 6543',
      deliveryAddress: 'Plot 12, Asokwa, Kumasi',
      zone: 'Kumasi - Asokwa',
      items: 1,
      totalAmount: 850,
      priority: 'same_day',
      status: 'assigned',
      estimatedTime: '17:30'
    },
    {
      id: 'DEL003',
      orderId: 'ORD-2024-003',
      customerName: 'Kofi Mensah',
      customerPhone: '+233 55 234 5678',
      deliveryAddress: 'No. 78, Bantama, Kumasi',
      zone: 'Kumasi - Bantama',
      items: 5,
      totalAmount: 4200,
      priority: 'urgent',
      status: 'assigned',
      estimatedTime: '15:30',
      specialInstructions: 'Large items - needs help unloading'
    }
  ];

  const completedJobs: DeliveryJob[] = [
    {
      id: 'DEL000',
      orderId: 'ORD-2024-000',
      customerName: 'Yaw Boateng',
      customerPhone: '+233 24 111 2222',
      deliveryAddress: 'Santasi Road, Kumasi',
      zone: 'Kumasi - Santasi',
      items: 2,
      totalAmount: 1500,
      priority: 'same_day',
      status: 'delivered',
      estimatedTime: '14:00'
    }
  ];

  const updateJobStatus = (jobId: string, newStatus: DeliveryJob['status']) => {
    // In real app, this would update the database
    console.log(`Updating job ${jobId} to status: ${newStatus}`);
  };

  const handleCompleteDelivery = () => {
    if (selectedJob && deliveryProof.recipientName && deliveryProof.signature) {
      updateJobStatus(selectedJob.id, 'delivered');
      setShowProofOfDelivery(false);
      setSelectedJob(null);
      setDeliveryProof({ recipientName: '', signature: null, photo: null, notes: '' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'same_day': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'in_transit': return 'text-blue-600';
      case 'picked_up': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  const todayStats = {
    totalDeliveries: 4,
    completed: 1,
    pending: 3,
    earnings: 280 // GH₵
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Driver Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Kwame Mensah</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-500/10 text-green-600 rounded-lg font-semibold border border-green-500/20">
                ● Active
              </div>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-primary" />
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{todayStats.totalDeliveries}</p>
              <p className="text-sm text-muted-foreground">Total Deliveries</p>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{todayStats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{todayStats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary font-bold">GH₵</span>
              </div>
              <p className="text-2xl font-bold">{todayStats.earnings}</p>
              <p className="text-sm text-muted-foreground">Today's Earnings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'active' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Jobs ({activeJobs.length})
            {activeTab === 'active' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'completed' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed ({completedJobs.length})
            {activeTab === 'completed' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {(activeTab === 'active' ? activeJobs : completedJobs).map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(job.priority)}`} />
                  <div>
                    <h3 className="font-bold text-lg">Order #{job.orderId}</h3>
                    <p className="text-sm text-muted-foreground">{job.zone} • ETA: {job.estimatedTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold capitalize ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">{job.items} items</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Details
                  </p>
                  <p className="font-medium">{job.customerName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${job.customerPhone}`} className="text-sm text-primary hover:underline">
                      {job.customerPhone}
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </p>
                  <p className="text-sm">{job.deliveryAddress}</p>
                </div>
              </div>

              {job.specialInstructions && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm font-semibold text-orange-600 mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Special Instructions
                  </p>
                  <p className="text-sm">{job.specialInstructions}</p>
                </div>
              )}

              <div className="flex gap-3">
                {job.status === 'assigned' && (
                  <button
                    onClick={() => updateJobStatus(job.id, 'picked_up')}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Mark as Picked Up
                  </button>
                )}

                {job.status === 'picked_up' && (
                  <button
                    onClick={() => updateJobStatus(job.id, 'in_transit')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Start Navigation
                  </button>
                )}

                {job.status === 'in_transit' && (
                  <button
                    onClick={() => updateJobStatus(job.id, 'arrived')}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Mark as Arrived
                  </button>
                )}

                {job.status === 'arrived' && (
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowProofOfDelivery(true);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Delivery
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.deliveryAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Proof of Delivery Modal */}
        {showProofOfDelivery && selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
            >
              <h2 className="text-2xl font-bold mb-6">Proof of Delivery</h2>

              <div className="space-y-6">
                {/* Recipient Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Recipient Name *</label>
                  <input
                    type="text"
                    value={deliveryProof.recipientName}
                    onChange={(e) => setDeliveryProof({ ...deliveryProof, recipientName: e.target.value })}
                    placeholder="Enter recipient's full name"
                    className="w-full px-4 py-3 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Signature */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Signature *</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <FileSignature className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Tap to capture signature</p>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm">
                      Capture Signature
                    </button>
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Delivery Photo (Optional)</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Take a photo of delivered items</p>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm">
                      Take Photo
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Delivery Notes (Optional)</label>
                  <textarea
                    value={deliveryProof.notes}
                    onChange={(e) => setDeliveryProof({ ...deliveryProof, notes: e.target.value })}
                    placeholder="Any additional notes about the delivery..."
                    rows={3}
                    className="w-full px-4 py-3 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowProofOfDelivery(false);
                      setDeliveryProof({ recipientName: '', signature: null, photo: null, notes: '' });
                    }}
                    className="flex-1 px-6 py-3 border-2 border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteDelivery}
                    disabled={!deliveryProof.recipientName || !deliveryProof.signature}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirm Delivery
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
