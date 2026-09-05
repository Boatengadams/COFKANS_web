import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, MapPin, Clock, CheckCircle, Truck, Home, Phone, Mail, Camera, FileText, Navigation } from 'lucide-react';

interface DeliveryTrackingProps {
  orderId: string;
  onClose?: () => void;
}

interface TrackingStatus {
  status: 'placed' | 'confirmed' | 'processing' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  timestamp: string;
  location: string;
  note?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedDelivery?: string;
  proofOfDelivery?: {
    signature?: string;
    photo?: string;
    recipientName?: string;
  };
}

export function DeliveryTracking({ orderId, onClose }: DeliveryTrackingProps) {
  const [trackingHistory, setTrackingHistory] = useState<TrackingStatus[]>([
    {
      status: 'placed',
      timestamp: '2026-05-16T09:30:00',
      location: 'Accra, Ghana',
      note: 'Order received and payment confirmed'
    },
    {
      status: 'confirmed',
      timestamp: '2026-05-16T09:45:00',
      location: 'Cofkans Warehouse, Accra',
      note: 'Order confirmed and being prepared'
    },
    {
      status: 'processing',
      timestamp: '2026-05-16T10:20:00',
      location: 'Cofkans Warehouse, Accra',
      note: 'Items picked and quality checked'
    },
    {
      status: 'dispatched',
      timestamp: '2026-05-16T11:00:00',
      location: 'Cofkans Warehouse, Accra',
      note: 'Package dispatched from warehouse',
      driverName: 'Kwame Mensah',
      driverPhone: '+233 24 123 4567'
    },
    {
      status: 'in_transit',
      timestamp: '2026-05-16T13:30:00',
      location: 'Kumasi Distribution Center',
      note: 'Package in transit to destination',
      estimatedDelivery: '2026-05-16T16:00:00'
    },
    {
      status: 'out_for_delivery',
      timestamp: '2026-05-16T15:00:00',
      location: 'Kumasi - Adum Area',
      note: 'Out for delivery - Driver is nearby',
      driverName: 'Kwame Mensah',
      driverPhone: '+233 24 123 4567',
      estimatedDelivery: '2026-05-16T16:00:00'
    }
  ]);

  const currentStatus = trackingHistory[trackingHistory.length - 1];

  const statusSteps = [
    { key: 'placed', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: FileText },
    { key: 'dispatched', label: 'Dispatched', icon: Truck },
    { key: 'in_transit', label: 'In Transit', icon: Navigation },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home }
  ];

  const getCurrentStepIndex = () => {
    const statusOrder = ['placed', 'confirmed', 'processing', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered'];
    return statusOrder.indexOf(currentStatus.status);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatETA = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Order ID: <span className="font-mono font-bold text-foreground">#{orderId}</span></p>
        </div>

        {/* Current Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8 border-2 border-primary/20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold capitalize">{currentStatus.status.replace('_', ' ')}</h2>
              <p className="text-muted-foreground">{currentStatus.location}</p>
            </div>
          </div>

          {currentStatus.estimatedDelivery && (
            <div className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-primary" />
              <span>Estimated Delivery: <strong>{formatETA(currentStatus.estimatedDelivery)}</strong></span>
            </div>
          )}

          {currentStatus.driverName && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-semibold mb-3">Your Delivery Driver</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{currentStatus.driverName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{currentStatus.driverPhone}</span>
                  </div>
                </div>
                <a
                  href={`tel:${currentStatus.driverPhone}`}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Call Driver
                </a>
              </div>
            </div>
          )}
        </motion.div>

        {/* Progress Timeline */}
        <div className="bg-card rounded-2xl p-8 mb-8 border border-border">
          <h3 className="text-xl font-bold mb-6">Delivery Progress</h3>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div
              className="absolute left-4 top-0 w-0.5 bg-primary transition-all duration-500"
              style={{ height: `${(getCurrentStepIndex() / (statusSteps.length - 1)) * 100}%` }}
            />

            {/* Steps */}
            <div className="space-y-8">
              {statusSteps.map((step, index) => {
                const isCompleted = getCurrentStepIndex() >= index;
                const isCurrent = getCurrentStepIndex() === index;
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    }`}>
                      <StepIcon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>

                    <div className="flex-1 pb-8">
                      <p className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">{currentStatus.note}</p>
                          <p className="text-sm text-muted-foreground mt-1">{formatTime(currentStatus.timestamp)}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full Tracking History */}
        <div className="bg-card rounded-2xl p-8 border border-border">
          <h3 className="text-xl font-bold mb-6">Tracking History</h3>

          <div className="space-y-4">
            {trackingHistory.slice().reverse().map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 pb-4 border-b border-border last:border-0"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold capitalize">{item.status.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(item.timestamp)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{item.location}</p>
                  {item.note && <p className="text-sm">{item.note}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Delivery Notifications */}
        <div className="mt-8 bg-muted/30 rounded-xl p-6 border border-border">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Delivery Notifications
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            You'll receive SMS and email updates at each delivery milestone
          </p>
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border">
              <Mail className="w-4 h-4" />
              <span>customer@email.com</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border">
              <Phone className="w-4 h-4" />
              <span>+233 XX XXX XXXX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
