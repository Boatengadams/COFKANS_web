import { useState } from 'react';
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
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400',
        badge: 'Premium',
      },
      {
        name: 'Designer Pendants',
        description: 'Contemporary masterpieces',
        image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400',
        badge: 'New',
      },
      {
        name: 'Statement Ceiling',
        description: 'Architectural lighting',
        image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',
      },
      {
        name: 'Wall Sconces',
        description: 'Elegant accent pieces',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400',
      },
    ],
    featured: {
      title: '2024 Luxury Collection',
      description: 'Exclusive European designs now available in Ghana',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
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
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
        badge: 'Smart',
      },
      {
        name: 'Voice Control',
        description: 'Alexa & Google compatible',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        badge: 'AI',
      },
      {
        name: 'App Integration',
        description: 'Control from anywhere',
        image: 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=400',
      },
      {
        name: 'Energy Monitoring',
        description: 'Track & optimize usage',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      },
    ],
    featured: {
      title: 'Smart Home Solutions',
      description: 'Transform your space with intelligent automation',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600',
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
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
        badge: 'Eco',
      },
      {
        name: 'Garden Lighting',
        description: 'Aesthetic outdoor',
        image: 'https://images.unsplash.com/photo-1585128792304-e6d78c1d7b6a?w=400',
      },
      {
        name: 'Solar Panels',
        description: 'Renewable energy',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      },
      {
        name: 'Security Lights',
        description: 'Motion-activated',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
      },
    ],
    featured: {
      title: 'Sustainable Energy',
      description: 'Go green with premium solar solutions',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
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
        image: 'https://5.imimg.com/data5/SELLER/Default/2024/2/386912098/VX/JN/RS/106303581/13-amp-electrical-switch-500x500.png',
      },
      {
        name: 'Designer Sockets',
        description: 'USB & wireless charging',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbcaRc4r_Hp7aESi01H7JiC9Y0K6-_X5sYNQ&s',
      },
      {
        name: 'Cable Management',
        description: 'Professional grade',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEA8sEZ4PNeH9QnxUmI8vIB_UICqojelegQ&s',
      },
      {
        name: 'Circuit Breakers',
        description: 'Safety first',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRBAxjLUjvZbwJLJ70X5PMx8fQ9eM9KvWvPw&s',
      },
    ],
    featured: {
      title: 'Complete Solutions',
      description: 'Everything you need for your electrical project',
      image: 'https://5.imimg.com/data5/SELLER/Default/2024/2/386912098/VX/JN/RS/106303581/13-amp-electrical-switch-500x500.png',
      cta: 'Shop Now',
    },
  },
];

export function LuxuryMegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative">
      <div className="flex items-center gap-8">
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
                  style={{ minWidth: '800px' }}
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
