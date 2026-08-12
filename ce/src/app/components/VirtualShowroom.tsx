import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Info, ShoppingCart, Eye, X, MapPin, Clock } from 'lucide-react';

interface ShowroomRoom {
  id: string;
  name: string;
  image: string;
  description: string;
  products: Array<{
    name: string;
    price: number;
    position: { x: number; y: number };
  }>;
}

const showroomRooms: ShowroomRoom[] = [
  {
    id: 'luxury-chandeliers',
    name: 'Luxury Chandeliers Gallery',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200',
    description: 'Explore our curated collection of crystal chandeliers and statement pieces',
    products: [
      { name: 'Crystal Chandelier 8-Light', price: 12500, position: { x: 50, y: 30 } },
      { name: 'Premium Gold Chandelier', price: 18500, position: { x: 30, y: 25 } },
    ],
  },
  {
    id: 'modern-lighting',
    name: 'Modern & Contemporary',
    image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1200',
    description: 'Discover cutting-edge designs and minimalist elegance',
    products: [
      { name: 'Designer Pendant Collection', price: 2500, position: { x: 60, y: 40 } },
      { name: 'LED Panel Light 60x60cm', price: 680, position: { x: 75, y: 35 } },
    ],
  },
  {
    id: 'smart-home',
    name: 'Smart Home Solutions',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200',
    description: 'Experience the future of intelligent lighting control',
    products: [
      { name: 'Smart Control Panel', price: 8900, position: { x: 45, y: 50 } },
      { name: '13A Socket + USB Smart', price: 52, position: { x: 25, y: 60 } },
    ],
  },
  {
    id: 'outdoor-solar',
    name: 'Outdoor & Solar',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200',
    description: 'Sustainable solutions for gardens, pathways, and exteriors',
    products: [
      { name: '200W Solar Streetlight', price: 450, position: { x: 50, y: 45 } },
      { name: 'Solar Outdoor Lamp Pair', price: 1500, position: { x: 70, y: 40 } },
    ],
  },
];

export function VirtualShowroom() {
  const [selectedRoom, setSelectedRoom] = useState<ShowroomRoom | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShowroomRoom['products'][0] | null>(null);

  return (
    <div className="w-full py-32 bg-gradient-to-b from-background via-muted/10 to-background relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Eye className="w-4 h-4 text-primary" strokeWidth={2} />
            <span className="text-sm font-bold text-primary">360° Experience</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-luxury)' }}>
            Virtual Showroom Tour
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our premium collections from the comfort of your home. Click any room to discover products and
            pricing
          </p>
        </motion.div>

        {/* Showroom Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {showroomRooms.map((room, idx) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedRoom(room)}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              {/* Room Image */}
              <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Product Hotspots */}
              {room.products.map((product, pIdx) => (
                <motion.div
                  key={pIdx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + pIdx * 0.1 }}
                  className="absolute w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-150 transition-transform duration-300 z-10"
                  style={{ left: `${product.position.x}%`, top: `${product.position.y}%` }}
                >
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                </motion.div>
              ))}

              {/* Room Info */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{room.name}</h3>
                <p className="text-white/80 mb-4">{room.description}</p>

                <div className="flex items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" strokeWidth={2} />
                    <span>{room.products.length} Products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" strokeWidth={2} />
                    <span>Interactive Tour</span>
                  </div>
                </div>

                {/* View Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Maximize2 className="w-4 h-4" strokeWidth={2} />
                  <span>Explore Room</span>
                </motion.div>
              </div>

              {/* Corner Badge */}
              <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-white text-xs font-bold">Click to Explore</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visit CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 bg-card rounded-3xl border-2 border-border shadow-xl">
            <h3 className="text-2xl font-bold mb-3">Visit Our Physical Showroom</h3>
            <p className="text-muted-foreground mb-6 max-w-lg">
              Experience our products in person. Our consultants are ready to help bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Book Appointment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-card border-2 border-border hover:border-primary rounded-2xl font-bold transition-all duration-300"
              >
                View Locations
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Room Detail Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedRoom(null);
              setSelectedProduct(null);
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-2xl font-bold">{selectedRoom.name}</h3>
                  <p className="text-muted-foreground">{selectedRoom.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedRoom(null);
                    setSelectedProduct(null);
                  }}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" strokeWidth={2} />
                </button>
              </div>

              {/* Room Image with Hotspots */}
              <div className="relative">
                <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-auto" />

                {/* Interactive Hotspots */}
                {selectedRoom.products.map((product, pIdx) => (
                  <motion.button
                    key={pIdx}
                    whileHover={{ scale: 1.5 }}
                    onClick={() => setSelectedProduct(selectedProduct?.name === product.name ? null : product)}
                    className="absolute w-8 h-8 bg-primary rounded-full border-4 border-white shadow-2xl z-20 hover:z-30"
                    style={{ left: `${product.position.x}%`, top: `${product.position.y}%` }}
                  >
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                    <Info className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={2.5} />
                  </motion.button>
                ))}

                {/* Product Info Popup */}
                <AnimatePresence>
                  {selectedProduct && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card p-6 rounded-2xl shadow-2xl border-2 border-primary max-w-sm z-30"
                    >
                      <h4 className="font-bold text-lg mb-2">{selectedProduct.name}</h4>
                      <div className="text-2xl font-bold text-primary mb-4">
                        GH₵ {selectedProduct.price.toLocaleString()}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                        <span>Add to Cart</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Product List */}
              <div className="p-6 border-t border-border">
                <h4 className="font-bold text-lg mb-4">Products in this Room</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedRoom.products.map((product, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 bg-muted rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-primary font-bold">GH₵ {product.price.toLocaleString()}</div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-primary text-white rounded-lg"
                      >
                        <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
