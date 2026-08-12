import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Lightbulb, Thermometer, Lock, Zap, Power } from 'lucide-react';

export function SmartHomeDemo() {
  const [activeRoom, setActiveRoom] = useState('living');
  const [selectedBulbIndex, setSelectedBulbIndex] = useState(2);
  const [temperature, setTemperature] = useState(22);
  const [lightsOn, setLightsOn] = useState(true);

  // LED Bulbs from product catalog
  const ledBulbs = [
    { wattage: 5, name: 'Kans LED 5W B22 (T-Type)', sku: 'KANS LED 5W B22 T' },
    { wattage: 7, name: 'Kans LED 7W E27 (T-Type)', sku: 'KANS LED 7W E27 T' },
    { wattage: 9, name: 'Kans LED 9W B22 (T-Type)', sku: 'KANS LED 9W B22 T' },
    { wattage: 15, name: 'Kans LED 15W B22 (T-Type)', sku: 'KANS LED 15W B22 T' },
    { wattage: 30, name: 'Kans LED 30W B22 (T-Type)', sku: 'KANS LED 30W B22 T' },
    { wattage: 50, name: 'Kans LED 50W E27 (Blue Box)', sku: 'KANS LED 50W E27 BL' },
  ];

  const rooms = [
    {
      id: 'living',
      name: 'Living Room',
      icon: Home,
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200',
      description: 'Modern luxury living space with premium lighting',
      recommendedBulbs: [2, 3, 4, 5] // 9W, 15W, 30W, 50W
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      icon: Lightbulb,
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200',
      description: 'Sophisticated bedroom with ambient controls',
      recommendedBulbs: [0, 1, 2, 3] // 5W, 7W, 9W, 15W
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      icon: Zap,
      image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200',
      description: 'Contemporary kitchen with smart illumination',
      recommendedBulbs: [2, 3, 4] // 9W, 15W, 30W
    },
  ];

  const currentRoom = rooms.find(r => r.id === activeRoom);
  const availableBulbs = currentRoom ? currentRoom.recommendedBulbs.map(i => ledBulbs[i]) : [];
  const currentBulb = ledBulbs[selectedBulbIndex];
  const brightness = (currentBulb.wattage / 50) * 100; // Convert wattage to percentage for visual effects

  const lightingScenes = [
    { name: 'Ambient', bulbIndex: 2, color: '#00F0FF' }, // 9W
    { name: 'Night', bulbIndex: 0, color: '#D4AF37' }, // 5W
  ];

  return (
    <div className="relative w-full">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Control Panel */}
        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-semibold mb-8">Room Selection</h3>
            <div className="grid grid-cols-3 gap-4">
              {rooms.map((room) => (
                <motion.button
                  key={room.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => {
                    setActiveRoom(room.id);
                    // Set to the middle bulb option for the new room
                    const midIndex = Math.floor(room.recommendedBulbs.length / 2);
                    setSelectedBulbIndex(room.recommendedBulbs[midIndex]);
                  }}
                  className={`p-6 rounded-2xl transition-all duration-300 border ${
                    activeRoom === room.id
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                      : 'bg-card hover:bg-muted border-border'
                  }`}
                >
                  <room.icon className="w-8 h-8 mx-auto mb-4" strokeWidth={1.5} />
                  <div className="text-sm font-semibold">{room.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Master Control */}
          <div className="bg-card p-10 rounded-3xl border border-border">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-lg font-semibold">Master Controls</h4>
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => setLightsOn(!lightsOn)}
                className={`p-4 rounded-full transition-all duration-300 ${
                  lightsOn
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/25'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Power className="w-6 h-6" strokeWidth={2} />
              </motion.button>
            </div>

            {/* Brightness Control */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-primary" strokeWidth={2} />
                  <span className="text-[15px] font-semibold">LED Bulb Selection</span>
                </div>
                <span className="text-primary font-mono font-bold text-lg">{currentBulb.wattage}W</span>
              </div>

              {/* Product Recommendation */}
              <div className="mb-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Recommended Product:</p>
                <p className="text-sm font-bold text-primary">{currentBulb.name}</p>
                <p className="text-xs text-muted-foreground mt-1">SKU: {currentBulb.sku}</p>
              </div>

              {/* Bulb Selection Grid */}
              <div className="grid grid-cols-3 gap-2">
                {availableBulbs.map((bulb, index) => {
                  const bulbIndex = ledBulbs.findIndex(b => b.wattage === bulb.wattage);
                  return (
                    <motion.button
                      key={bulb.wattage}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedBulbIndex(bulbIndex);
                        if (!lightsOn) setLightsOn(true);
                      }}
                      className={`p-3 rounded-xl transition-all duration-300 border ${
                        selectedBulbIndex === bulbIndex
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                          : 'bg-muted/50 hover:bg-muted border-border'
                      }`}
                    >
                      <div className="text-lg font-bold">{bulb.wattage}W</div>
                      <div className="text-[10px] opacity-80 mt-1">LED</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Temperature Control */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-secondary" strokeWidth={2} />
                  <span className="text-[15px] font-semibold">Temperature</span>
                </div>
                <span className="text-secondary font-mono font-bold text-lg">{temperature}°C</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="16"
                  max="30"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-secondary/25 [&::-webkit-slider-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--secondary) ${((temperature - 16) / 14) * 100}%, var(--muted) ${((temperature - 16) / 14) * 100}%)`,
                  }}
                />
              </div>
            </div>

            {/* Lighting Scenes */}
            <div>
              <h4 className="text-base font-semibold mb-5">Lighting Scenes</h4>
              <div className="grid grid-cols-2 gap-3">
                {lightingScenes.map((scene) => (
                  <motion.button
                    key={scene.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => {
                      setSelectedBulbIndex(scene.bulbIndex);
                      if (!lightsOn) setLightsOn(true);
                    }}
                    className="p-5 bg-muted/50 hover:bg-muted rounded-2xl text-left border border-border transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full shadow-md"
                        style={{
                          backgroundColor: scene.color,
                          boxShadow: `0 0 12px ${scene.color}60`,
                        }}
                      />
                      <span className="text-sm font-semibold">{scene.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{ledBulbs[scene.bulbIndex].wattage}W LED</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Photorealistic 3D Room Visualization */}
        <div className="relative">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-xl">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              {/* Room Background Images */}
              <AnimatePresence mode="wait">
                {rooms.map((room) => (
                  activeRoom === room.id && (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                      className="absolute inset-0"
                    >
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )
                ))}
              </AnimatePresence>

              {/* Lighting Overlay - Off State */}
              <motion.div
                animate={{
                  opacity: lightsOn ? 0 : 0.85,
                }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90 z-10"
              />

              {/* Dynamic Lighting Effects - On State */}
              <AnimatePresence>
                {lightsOn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 z-20"
                  >
                    {/* Main Ambient Light - Enhanced with Brightness */}
                    <motion.div
                      animate={{
                        opacity: Math.max(0.3, brightness / 100),
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(ellipse at 50% 35%, rgba(255, 245, 220, ${
                          (brightness / 100) * 0.7
                        }) 0%, rgba(255, 240, 200, ${(brightness / 100) * 0.4}) 40%, transparent 75%)`,
                      }}
                    />

                    {/* Temperature Color Overlay */}
                    <motion.div
                      animate={{
                        opacity: (brightness / 100) * 0.5,
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                      style={{
                        background: temperature < 20
                          ? `linear-gradient(180deg, rgba(180, 200, 255, ${(brightness / 100) * ((24 - temperature) / 14) * 0.3}) 0%, transparent 100%)`
                          : temperature > 24
                          ? `linear-gradient(180deg, rgba(255, 180, 120, ${(brightness / 100) * ((temperature - 20) / 10) * 0.3}) 0%, transparent 100%)`
                          : `linear-gradient(180deg, rgba(255, 235, 200, ${(brightness / 100) * 0.2}) 0%, transparent 100%)`,
                      }}
                    />

                    {/* Ceiling Light Bloom - Enhanced */}
                    <motion.div
                      animate={{
                        opacity: Math.max(0.4, brightness / 100),
                        scale: [1, 1.03, 1],
                      }}
                      transition={{
                        opacity: { duration: 0.3 },
                        scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                      }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-2/5"
                      style={{
                        background: temperature < 20
                          ? `radial-gradient(ellipse at center, rgba(200, 220, 255, ${(brightness / 100) * 0.8}) 0%, rgba(180, 210, 255, ${(brightness / 100) * 0.4}) 30%, transparent 65%)`
                          : temperature > 24
                          ? `radial-gradient(ellipse at center, rgba(255, 200, 140, ${(brightness / 100) * 0.8}) 0%, rgba(255, 180, 120, ${(brightness / 100) * 0.4}) 30%, transparent 65%)`
                          : `radial-gradient(ellipse at center, rgba(255, 245, 210, ${(brightness / 100) * 0.8}) 0%, rgba(255, 240, 190, ${(brightness / 100) * 0.4}) 30%, transparent 65%)`,
                        filter: `blur(${30 + (brightness / 100) * 20}px)`,
                      }}
                    />

                    {/* Side Accent Lights - Enhanced */}
                    <motion.div
                      animate={{
                        opacity: (brightness / 100) * 0.6,
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute left-0 top-1/4 w-2/5 h-3/5"
                      style={{
                        background: `radial-gradient(ellipse at left, rgba(212, 175, 55, ${
                          (brightness / 100) * 0.35
                        }) 0%, rgba(212, 175, 55, ${(brightness / 100) * 0.15}) 40%, transparent 75%)`,
                        filter: `blur(${25 + (brightness / 100) * 15}px)`,
                      }}
                    />

                    <motion.div
                      animate={{
                        opacity: (brightness / 100) * 0.6,
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute right-0 top-1/4 w-2/5 h-3/5"
                      style={{
                        background: `radial-gradient(ellipse at right, rgba(212, 175, 55, ${
                          (brightness / 100) * 0.35
                        }) 0%, rgba(212, 175, 55, ${(brightness / 100) * 0.15}) 40%, transparent 75%)`,
                        filter: `blur(${25 + (brightness / 100) * 15}px)`,
                      }}
                    />

                    {/* Volumetric Light Rays - Enhanced */}
                    {brightness > 40 && (
                      <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [
                                ((brightness - 40) / 60) * 0.12,
                                ((brightness - 40) / 60) * 0.2,
                                ((brightness - 40) / 60) * 0.12
                              ],
                            }}
                            transition={{
                              duration: 3.5,
                              repeat: Infinity,
                              delay: i * 0.3,
                              ease: 'easeInOut',
                            }}
                            className="absolute top-0"
                            style={{
                              left: `${12 + i * 15}%`,
                              width: '9%',
                              height: '100%',
                              background: temperature < 20
                                ? 'linear-gradient(180deg, rgba(200, 220, 255, 0.4) 0%, transparent 75%)'
                                : temperature > 24
                                ? 'linear-gradient(180deg, rgba(255, 200, 140, 0.4) 0%, transparent 75%)'
                                : 'linear-gradient(180deg, rgba(255, 245, 220, 0.4) 0%, transparent 75%)',
                              transform: 'skewX(-10deg)',
                              filter: `blur(${18 + (brightness / 100) * 10}px)`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Global Brightness Overlay */}
                    <motion.div
                      animate={{
                        opacity: (brightness / 100) * 0.25,
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                      style={{
                        background: 'rgba(255, 250, 240, 1)',
                        mixBlendMode: 'screen',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Glass Overlay for Depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-30 pointer-events-none" />

              {/* Status Indicators */}
              <div className="absolute top-6 right-6 space-y-3 z-40">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2.5 glass-luxury rounded-full text-xs border border-white/20 backdrop-blur-xl"
                >
                  <Lock className="w-4 h-4 text-secondary" strokeWidth={2} />
                  <span className="font-semibold text-white">Secured</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2.5 glass-luxury rounded-full text-xs border border-white/20 backdrop-blur-xl"
                >
                  <Zap className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span className="font-mono font-bold text-white">{currentBulb.wattage}W</span>
                </motion.div>
              </div>

              {/* Room Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-40">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="glass-luxury p-6 rounded-2xl border border-white/20 backdrop-blur-xl"
                >
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {rooms.find((r) => r.id === activeRoom)?.name}
                    </h4>
                    <p className="text-sm text-white/80 font-medium">
                      {rooms.find((r) => r.id === activeRoom)?.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Enhanced Floating Stats */}
          <div className="absolute -bottom-8 -right-8">
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              className="bg-card p-6 rounded-2xl border border-border shadow-2xl text-center backdrop-blur-sm"
            >
              <div className="text-3xl font-bold text-secondary mb-2">-45%</div>
              <div className="text-xs text-muted-foreground font-semibold tracking-wide">Energy Saved</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
