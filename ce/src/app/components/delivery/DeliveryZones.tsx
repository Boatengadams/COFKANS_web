import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Edit2, Trash2, Plus, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DeliveryZone {
  id: string;
  name: string;
  region: 'kumasi' | 'accra' | 'other';
  fee: number;
  freeDeliveryMinimum?: number;
  estimatedDays: number;
  active: boolean;
}

export function DeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([
    {
      id: 'zone-1',
      name: 'Kumasi - Adum',
      region: 'kumasi',
      fee: 0,
      freeDeliveryMinimum: 500,
      estimatedDays: 0, // Same day
      active: true
    },
    {
      id: 'zone-2',
      name: 'Kumasi - Asokwa',
      region: 'kumasi',
      fee: 0,
      freeDeliveryMinimum: 500,
      estimatedDays: 0,
      active: true
    },
    {
      id: 'zone-3',
      name: 'Kumasi - Bantama',
      region: 'kumasi',
      fee: 0,
      freeDeliveryMinimum: 500,
      estimatedDays: 0,
      active: true
    },
    {
      id: 'zone-4',
      name: 'Kumasi - Tech Junction',
      region: 'kumasi',
      fee: 0,
      freeDeliveryMinimum: 500,
      estimatedDays: 0,
      active: true
    },
    {
      id: 'zone-5',
      name: 'Kumasi - Ayigya',
      region: 'kumasi',
      fee: 0,
      freeDeliveryMinimum: 500,
      estimatedDays: 0,
      active: true
    },
    {
      id: 'zone-6',
      name: 'Kumasi - Other Areas',
      region: 'kumasi',
      fee: 20,
      freeDeliveryMinimum: 800,
      estimatedDays: 1,
      active: true
    },
    {
      id: 'zone-7',
      name: 'Accra - Greater Accra',
      region: 'accra',
      fee: 50,
      freeDeliveryMinimum: 1500,
      estimatedDays: 3,
      active: true
    },
    {
      id: 'zone-8',
      name: 'Takoradi - Western Region',
      region: 'other',
      fee: 70,
      freeDeliveryMinimum: 2000,
      estimatedDays: 5,
      active: true
    },
    {
      id: 'zone-9',
      name: 'Tamale - Northern Region',
      region: 'other',
      fee: 80,
      freeDeliveryMinimum: 2000,
      estimatedDays: 5,
      active: true
    },
    {
      id: 'zone-10',
      name: 'Cape Coast - Central Region',
      region: 'other',
      fee: 60,
      freeDeliveryMinimum: 1800,
      estimatedDays: 4,
      active: true
    },
    {
      id: 'zone-11',
      name: 'Ho - Volta Region',
      region: 'other',
      fee: 65,
      freeDeliveryMinimum: 1800,
      estimatedDays: 4,
      active: true
    },
    {
      id: 'zone-12',
      name: 'Koforidua - Eastern Region',
      region: 'other',
      fee: 55,
      freeDeliveryMinimum: 1500,
      estimatedDays: 4,
      active: true
    }
  ]);

  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState<Partial<DeliveryZone>>({
    name: '',
    region: 'other',
    fee: 0,
    freeDeliveryMinimum: 500,
    estimatedDays: 3,
    active: true
  });

  const handleSaveZone = () => {
    if (editingZone) {
      // Update existing zone
      setZones(zones.map(z => z.id === editingZone.id ? { ...editingZone, ...formData } : z));
      setEditingZone(null);
    } else {
      // Add new zone
      const newZone: DeliveryZone = {
        id: `zone-${Date.now()}`,
        name: formData.name || '',
        region: formData.region || 'other',
        fee: formData.fee || 0,
        freeDeliveryMinimum: formData.freeDeliveryMinimum,
        estimatedDays: formData.estimatedDays || 3,
        active: formData.active !== undefined ? formData.active : true
      };
      setZones([...zones, newZone]);
      setIsAddingZone(false);
    }

    // Reset form
    setFormData({
      name: '',
      region: 'other',
      fee: 0,
      freeDeliveryMinimum: 500,
      estimatedDays: 3,
      active: true
    });
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData(zone);
    setIsAddingZone(true);
  };

  const handleDeleteZone = (zoneId: string) => {
    if (confirm('Are you sure you want to delete this delivery zone?')) {
      setZones(zones.filter(z => z.id !== zoneId));
    }
  };

  const toggleZoneStatus = (zoneId: string) => {
    setZones(zones.map(z => z.id === zoneId ? { ...z, active: !z.active } : z));
  };

  const getRegionColor = (region: string) => {
    switch (region) {
      case 'kumasi': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'accra': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    }
  };

  const getDeliveryTimeText = (days: number) => {
    if (days === 0) return 'Same Day';
    if (days === 1) return 'Next Day';
    return `${days} Days`;
  };

  const regionCounts = {
    kumasi: zones.filter(z => z.region === 'kumasi').length,
    accra: zones.filter(z => z.region === 'accra').length,
    other: zones.filter(z => z.region === 'other').length
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Delivery Zones</h1>
            <p className="text-muted-foreground">Manage delivery areas and pricing across Ghana</p>
          </div>

          <button
            onClick={() => setIsAddingZone(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Zone
          </button>
        </div>

        {/* Region Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{regionCounts.kumasi}</p>
            <p className="text-sm text-muted-foreground">Kumasi Zones</p>
            <p className="text-xs text-green-600 font-semibold mt-2">Same-Day Delivery</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{regionCounts.accra}</p>
            <p className="text-sm text-muted-foreground">Accra Zones</p>
            <p className="text-xs text-blue-600 font-semibold mt-2">3-Day Standard</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{regionCounts.other}</p>
            <p className="text-sm text-muted-foreground">Other Regions</p>
            <p className="text-xs text-purple-600 font-semibold mt-2">4-5 Day Standard</p>
          </div>
        </div>

        {/* Zones List */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="text-xl font-bold mb-6">All Delivery Zones ({zones.length})</h2>

          <div className="space-y-3">
            {zones.map((zone) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  zone.active ? 'border-border' : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-3 h-3 rounded-full ${zone.active ? 'bg-green-500' : 'bg-gray-400'}`} />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{zone.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRegionColor(zone.region)}`}>
                          {zone.region.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-muted-foreground text-xs">Delivery Fee</p>
                            <p className="font-semibold">{zone.fee === 0 ? 'FREE' : `GH₵${zone.fee}`}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-muted-foreground text-xs">Free Above</p>
                            <p className="font-semibold">{zone.freeDeliveryMinimum ? `GH₵${zone.freeDeliveryMinimum}` : 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-muted-foreground text-xs">Delivery Time</p>
                            <p className="font-semibold">{getDeliveryTimeText(zone.estimatedDays)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${zone.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <div>
                            <p className="text-muted-foreground text-xs">Status</p>
                            <p className="font-semibold">{zone.active ? 'Active' : 'Inactive'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleZoneStatus(zone.id)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        zone.active
                          ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                          : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20'
                      }`}
                    >
                      {zone.active ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() => handleEditZone(zone)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-primary" />
                    </button>

                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add/Edit Zone Modal */}
        {isAddingZone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-8 max-w-2xl w-full border border-border"
            >
              <h2 className="text-2xl font-bold mb-6">{editingZone ? 'Edit' : 'Add'} Delivery Zone</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Zone Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kumasi - Adum"
                    className="w-full px-4 py-3 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Region *</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
                    className="w-full px-4 py-3 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none"
                  >
                    <option value="kumasi">Kumasi (Same-Day)</option>
                    <option value="accra">Accra (3 Days)</option>
                    <option value="other">Other Regions (4-5 Days)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Delivery Fee (GH₵)</label>
                    <input
                      type="number"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) })}
                      min="0"
                      step="5"
                      className="w-full px-4 py-3 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Free Delivery Above (GH₵)</label>
                    <input
                      type="number"
                      value={formData.freeDeliveryMinimum || ''}
                      onChange={(e) => setFormData({ ...formData, freeDeliveryMinimum: e.target.value ? parseFloat(e.target.value) : undefined })}
                      min="0"
                      step="100"
                      placeholder="Optional"
                      className="w-full px-4 py-3 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Estimated Delivery Days</label>
                  <input
                    type="number"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) })}
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 bg-background rounded-lg border-2 border-border focus:border-primary focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">0 = Same Day, 1 = Next Day, etc.</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-border"
                  />
                  <label htmlFor="active" className="text-sm font-semibold">Active (available for customers)</label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsAddingZone(false);
                    setEditingZone(null);
                    setFormData({
                      name: '',
                      region: 'other',
                      fee: 0,
                      freeDeliveryMinimum: 500,
                      estimatedDays: 3,
                      active: true
                    });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-border rounded-xl font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveZone}
                  disabled={!formData.name}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingZone ? 'Update' : 'Add'} Zone
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
