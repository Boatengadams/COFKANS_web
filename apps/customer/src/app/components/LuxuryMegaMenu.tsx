import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, Home, Lightbulb, Zap, Sun, Settings, Award } from 'lucide-react';

interface MegaMenuCategory {
  name: string;
  icon: React.ElementType;
  products: Array<{
    name: string;
    description: string;
    image: string;
    badge?: string;
  }>;
  featured?: {
    title: string;
    description: string;
    image: string;
    cta: string;
  };
}

const megaMenuData: MegaMenuCategory[] = [
  {
    name: 'Luxury Lighting',
    icon: Sparkles,
    products: [
      {
        name: 'Crystal Chandeliers',
        description: 'European luxury pieces',
        image: '/images/products/PREMIUM LAYERED CRYSTAL CHANDELIER SELECTION.png',
        badge: 'Premium',
      },
      {
        name: 'Designer Pendants',
        description: 'Contemporary masterpieces',
        image: '/images/products/NORDIC GOLD-LINED DOME PENDANT LAMP.png',
        badge: 'New',
      },
      {
        name: 'Statement Ceiling',
        description: 'Architectural lighting',
        image: '/images/products/SLIM PANEL LED FIXTURE SET.png',
      },
      {
        name: 'Wall Sconces',
        description: 'Elegant accent pieces',
        image: '/images/products/AMBER GLASS CYLINDER INDOOR SCONCE.png',
      },
    ],
    featured: {
      title: '2024 Luxury Collection',
      description: 'Exclusive European designs now available in Ghana',
      image: '/images/products/PREMIUM LAYERED CRYSTAL CHANDELIER SELECTION.png',
      cta: 'View Collection',
    },
  },
  {
    name: 'Smart Home',
    icon: Zap,
    products: [
      {
        name: 'Smart Control Panels',
        description: 'Intelligent home automation',
        image: '/images/products/E324 UNIVERSAL (WH & AC) SWITCH GOLD.png',
        badge: 'Smart',
      },
      {
        name: 'Voice Control',
        description: 'Alexa & Google compatible',
        image: '/images/products/VP324J-AC AIR CONDITION SWITCH GOLD.png',
        badge: 'AI',
      },
      {
        name: 'App Integration',
        description: 'Control from anywhere',
        image: '/images/products/91408MB 13A DOUBLE MULTI SOCKET+USB.png',
      },
      {
        name: 'Energy Monitoring',
        description: 'Track & optimize usage',
        image: '/images/products/AVR AUTOMATIC VOLTAGE REGULATOR DUAL PACK.png',
      },
    ],
    featured: {
      title: 'Smart Home Solutions',
      description: 'Transform your space with intelligent automation',
      image: '/images/products/E324 UNIVERSAL (WH & AC) SWITCH GOLD.png',
      cta: 'Get Started',
    },
  },
  {
    name: 'Solar Solutions',
    icon: Sun,
    products: [
      {
        name: 'Solar Streetlights',
        description: 'High-power outdoor',
        image: '/images/products/SOLAR FLOODLIGHT KIT WITH PANEL 100W.png',
        badge: 'Eco',
      },
      {
        name: 'Garden Lighting',
        description: 'Aesthetic outdoor',
        image: '/images/products/AMBER GLOBE GARDEN BOLLARD.png',
      },
      {
        name: 'Solar Panels',
        description: 'Renewable energy',
        image: '/images/products/SOLAR FLOODLIGHT KIT WITH PANEL 100W.png',
      },
      {
        name: 'Security Lights',
        description: 'Motion-activated',
        image: '/images/products/300W LED FLOODLIGHT.png',
      },
    ],
    featured: {
      title: 'Sustainable Energy',
      description: 'Go green with premium solar solutions',
      image: '/images/products/SOLAR FLOODLIGHT KIT WITH PANEL 100W.png',
      cta: 'Learn More',
    },
  },
  {
    name: 'Electrical Fittings',
    icon: Settings,
    products: [
      {
        name: 'Premium Switches',
        description: 'Luxury finishes available',
        image: '/images/products/71304W 2 GANG 2 WAY SWITCH WIDE DOLLY.png',
      },
      {
        name: 'Designer Sockets',
        description: 'USB & wireless charging',
        image: '/images/products/C408M 13A DOUBLE MULTI SOCKET.png',
      },
      {
        name: 'Cable Management',
        description: 'Professional grade',
        image: '/images/products/W509 13A SINGLE MULTI SOCKET ADAPTOR+ USB.png',
      },
      {
        name: 'Circuit Breakers',
        description: 'Safety first',
        image: '/images/products/3-POLE CIRCUIT BREAKER 100A.png',
      },
    ],
    featured: {
      title: 'Complete Solutions',
      description: 'Everything you need for your electrical project',
      image: '/images/products/71304W 2 GANG 2 WAY SWITCH WIDE DOLLY.png',
      cta: 'Shop Now',
    },
  },
];

export function LuxuryMegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative">
      <div className="hidden lg:flex items-center gap-6 xl:gap-8">
        {megaMenuData.map((category) => (
          <div
            key={category.name}
            onMouseEnter={() => {
              setActiveCategory(category.name);
              setIsMenuOpen(true);
            }}
            onMouseLeave={() => {
              setActiveCategory(null);
              setIsMenuOpen(false);
            }}
            className="relative"
          >
            {/* Category Button */}
            <button className="flex items-center gap-2 py-2 group">
              <category.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2} />
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                  activeCategory === category.name ? 'rotate-180' : ''
                }`}
                strokeWidth={2}
              />
            </button>

            {/* Mega Menu Dropdown */}
            <AnimatePresence>
              {isMenuOpen && activeCategory === category.name && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full pt-4 z-50"
                  style={{ minWidth: 'min(800px, 90vw)' }}
                >
                  <div className="bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="grid grid-cols-3 gap-8 p-8">
                      {/* Products Grid */}
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        {category.products.map((product, idx) => (
                          <motion.a
                            key={idx}
                            href="#"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            className="group relative bg-muted rounded-2xl overflow-hidden hover:bg-muted/70 transition-all duration-300"
                          >
                            <div className="aspect-video relative overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                              {/* Badge */}
                              {product.badge && (
                                <div className="absolute top-2 right-2 px-3 py-1 bg-primary rounded-full">
                                  <span className="text-xs font-bold text-white">{product.badge}</span>
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">{product.description}</p>
                            </div>
                          </motion.a>
                        ))}
                      </div>

                      {/* Featured Section */}
                      {category.featured && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20"
                        >
                          <div className="aspect-[3/4] relative">
                            <img
                              src={category.featured.image}
                              alt={category.featured.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30 mb-3">
                                <Award className="w-3 h-3 text-primary" strokeWidth={2} />
                                <span className="text-xs font-bold text-white">Featured</span>
                              </div>

                              <h3 className="text-xl font-bold text-white mb-2">
                                {category.featured.title}
                              </h3>
                              <p className="text-sm text-white/80 mb-4">
                                {category.featured.description}
                              </p>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full py-3 bg-white text-foreground rounded-xl font-bold hover:bg-white/90 transition-colors"
                              >
                                {category.featured.cta}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </nav>
  );
}
