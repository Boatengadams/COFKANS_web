import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Package, Clock, CheckCircle, XCircle, MapPin, User, Calendar, BarChart3 } from 'lucide-react';

export function DeliveryAnalytics() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const stats = {
    today: {
      totalDeliveries: 45,
      completed: 38,
      inProgress: 5,
      cancelled: 2,
      onTimeRate: 92,
      avgDeliveryTime: 28, // minutes
      revenue: 12450,
      topZone: 'Kumasi - Adum'
    },
    week: {
      totalDeliveries: 312,
      completed: 285,
      inProgress: 18,
      cancelled: 9,
      onTimeRate: 89,
      avgDeliveryTime: 32,
      revenue: 87600,
      topZone: 'Kumasi - Asokwa'
    },
    month: {
      totalDeliveries: 1284,
      completed: 1165,
      inProgress: 78,
      cancelled: 41,
      onTimeRate: 91,
      avgDeliveryTime: 30,
      revenue: 342000,
      topZone: 'Kumasi - Adum'
    }
  };

  const currentStats = stats[timeRange];

  const driverPerformance = [
    { name: 'Yaw Boateng', deliveries: 156, onTime: 95, rating: 4.9, earnings: 4680 },
    { name: 'Ama Osei', deliveries: 148, onTime: 93, rating: 4.8, earnings: 4440 },
    { name: 'Kwame Mensah', deliveries: 142, onTime: 91, rating: 4.7, earnings: 4260 },
    { name: 'Abena Asante', deliveries: 138, onTime: 88, rating: 4.6, earnings: 4140 }
  ];

  const zoneStats = [
    { zone: 'Kumasi - Adum', deliveries: 285, avgTime: 25, revenue: 85500 },
    { zone: 'Kumasi - Asokwa', deliveries: 242, avgTime: 28, revenue: 72600 },
    { zone: 'Kumasi - Bantama', deliveries: 198, avgTime: 32, revenue: 59400 },
    { zone: 'Kumasi - Tech', deliveries: 176, avgTime: 30, revenue: 52800 },
    { zone: 'Kumasi - Ayigya', deliveries: 154, avgTime: 35, revenue: 46200 }
  ];

  const hourlyDistribution = [
    { hour: '8-10 AM', orders: 12 },
    { hour: '10-12 PM', orders: 28 },
    { hour: '12-2 PM', orders: 45 },
    { hour: '2-4 PM', orders: 38 },
    { hour: '4-6 PM', orders: 52 },
    { hour: '6-8 PM', orders: 31 }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Delivery Analytics</h1>
            <p className="text-muted-foreground">Performance metrics and insights</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 bg-card rounded-xl p-1 border border-border">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-primary" />
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+12%</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{currentStats.totalDeliveries}</p>
            <p className="text-sm text-muted-foreground">Total Deliveries</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+8%</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{currentStats.onTimeRate}%</p>
            <p className="text-sm text-muted-foreground">On-Time Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-500" />
              <div className="flex items-center gap-1 text-green-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-semibold">-5 min</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{currentStats.avgDeliveryTime} min</p>
            <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border-2 border-primary/20"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-primary">GH₵</span>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+15%</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{currentStats.revenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Delivery Revenue</p>
          </motion.div>
        </div>

        {/* Delivery Status Breakdown */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentStats.completed / currentStats.totalDeliveries) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentStats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentStats.inProgress / currentStats.totalDeliveries) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentStats.cancelled}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentStats.cancelled / currentStats.totalDeliveries) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Driver Performance */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Top Drivers This Month
            </h3>

            <div className="space-y-4">
              {driverPerformance.map((driver, index) => (
                <div key={driver.name} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold">{driver.name}</p>
                      <p className="text-sm font-semibold">{driver.rating} ⭐</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Deliveries</p>
                        <p className="font-semibold">{driver.deliveries}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">On-Time</p>
                        <p className="font-semibold text-green-600">{driver.onTime}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Earnings</p>
                        <p className="font-semibold">GH₵{driver.earnings}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Performance */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Top Zones This Month
            </h3>

            <div className="space-y-4">
              {zoneStats.map((zone, index) => (
                <div key={zone.zone} className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary text-sm">
                        {index + 1}
                      </div>
                      <p className="font-bold">{zone.zone}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">GH₵{zone.revenue.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Deliveries</p>
                      <p className="font-semibold">{zone.deliveries}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Time</p>
                      <p className="font-semibold">{zone.avgTime} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Delivery Volume by Time of Day
          </h3>

          <div className="flex items-end gap-4 h-64">
            {hourlyDistribution.map((data) => {
              const maxOrders = Math.max(...hourlyDistribution.map(d => d.orders));
              const heightPercent = (data.orders / maxOrders) * 100;

              return (
                <div key={data.hour} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg relative group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded text-sm font-semibold whitespace-nowrap">
                        {data.orders} orders
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">{data.hour}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
