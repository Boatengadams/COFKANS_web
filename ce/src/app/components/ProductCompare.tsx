import { motion, AnimatePresence } from 'motion/react';
import { X, Star, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  tradePrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  badge?: string;
  featured?: boolean;
  category: string;
  subcategory: string;
  specs?: string[];
}

interface ProductCompareProps {
  products: Product[];
  onClose: () => void;
  onRemove: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

export function ProductCompare({ products, onClose, onRemove, onAddToCart }: ProductCompareProps) {
  if (products.length === 0) return null;

  const specs = Array.from(
    new Set(
      products.flatMap(p => p.specs || [])
    )
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] overflow-y-auto"
      >
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-card rounded-t-3xl p-6 border-2 border-b-0 border-border shadow-xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
                    Compare Products
                  </h2>
                  <p className="text-muted-foreground">
                    Comparing {products.length} product{products.length > 1 ? 's' : ''}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-3 rounded-full hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-card rounded-b-3xl border-2 border-border shadow-xl overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {/* Product Images & Names */}
                  <tr className="border-b border-border">
                    <td className="p-6 font-bold text-sm text-muted-foreground w-48">
                      Product
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-6 min-w-[250px]">
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRemove(product.id)}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors cursor-pointer z-10"
                          >
                            <X className="w-3 h-3" strokeWidth={3} />
                          </motion.button>
                          <div className="aspect-square bg-muted rounded-2xl overflow-hidden mb-4">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain p-4"
                            />
                          </div>
                          <h4 className="font-bold text-sm mb-2 line-clamp-2">{product.name}</h4>
                          <code className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                            {product.sku}
                          </code>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Price */}
                  <tr className="border-b border-border bg-muted/30">
                    <td className="p-6 font-bold text-sm text-muted-foreground">
                      Price
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-6">
                        <div className="text-2xl font-bold text-primary">
                          GH₵ {product.price.toLocaleString()}
                        </div>
                        {product.tradePrice && product.tradePrice < product.price && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Trade: GH₵ {product.tradePrice.toLocaleString()}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr className="border-b border-border">
                    <td className="p-6 font-bold text-sm text-muted-foreground">
                      Rating
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-6">
                        {product.rating ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating!)
                                      ? 'fill-primary text-primary'
                                      : 'text-muted'
                                  }`}
                                  strokeWidth={1.5}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold">{product.rating}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No rating</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Stock */}
                  <tr className="border-b border-border bg-muted/30">
                    <td className="p-6 font-bold text-sm text-muted-foreground">
                      Availability
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-6">
                        {(product.stock || 0) > 50 ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-bold">
                            <CheckCircle className="w-3 h-3" strokeWidth={2.5} />
                            In Stock ({product.stock})
                          </div>
                        ) : (product.stock || 0) > 0 ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                            <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
                            Low Stock ({product.stock})
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full text-xs font-bold">
                            Out of Stock
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr className="border-b border-border">
                    <td className="p-6 font-bold text-sm text-muted-foreground">
                      Category
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-6">
                        <div className="text-sm font-medium">{product.subcategory}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Badges */}
                  <tr className="border-b border-border bg-muted/30">
                    <td className="p-6 font-bold text-sm text-muted-foreground">
                      Highlights
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-6">
                        <div className="flex flex-wrap gap-2">
                          {product.featured && (
                            <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold">
                              Featured
                            </div>
                          )}
                          {product.badge && (
                            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                              {product.badge}
                            </div>
                          )}
                          {product.tradePrice && product.tradePrice < product.price && (
                            <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" strokeWidth={2} />
                              Trade Price
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Specifications */}
                  {specs.length > 0 && specs.map((spec, idx) => (
                    <tr key={idx} className={`border-b border-border ${idx % 2 === 0 ? 'bg-muted/30' : ''}`}>
                      <td className="p-6 font-bold text-sm text-muted-foreground">
                        {spec}
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="p-6">
                          {product.specs?.includes(spec) ? (
                            <CheckCircle className="w-5 h-5 text-secondary" strokeWidth={2.5} />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/30" strokeWidth={2.5} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Action Buttons */}
                  <tr>
                    <td className="p-6 font-bold text-sm text-muted-foreground">
                      Actions
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-6">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onAddToCart(product.id);
                            onClose();
                          }}
                          disabled={(product.stock || 0) <= 0}
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            (product.stock || 0) <= 0
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl cursor-pointer'
                          }`}
                        >
                          {(product.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </motion.button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                You can compare up to 4 products at a time
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
