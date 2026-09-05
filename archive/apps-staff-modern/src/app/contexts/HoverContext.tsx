import { createContext, useContext, useState, ReactNode } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  description?: string;
  specs?: string[];
}

interface HoverContextType {
  hoveredProduct: Product | null;
  setHoveredProduct: (product: Product | null) => void;
  lastViewedProducts: Product[];
  addToViewedProducts: (product: Product) => void;
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

export function HoverProvider({ children }: { children: ReactNode }) {
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [lastViewedProducts, setLastViewedProducts] = useState<Product[]>([]);

  const addToViewedProducts = (product: Product) => {
    setLastViewedProducts((prev) => {
      // Keep only last 5 viewed products, no duplicates
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 5);
    });
  };

  return (
    <HoverContext.Provider
      value={{
        hoveredProduct,
        setHoveredProduct,
        lastViewedProducts,
        addToViewedProducts,
      }}
    >
      {children}
    </HoverContext.Provider>
  );
}

export function useHover() {
  const context = useContext(HoverContext);
  if (context === undefined) {
    throw new Error('useHover must be used within a HoverProvider');
  }
  return context;
}
