import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCartStore } from '../../../stores/cart-store';

interface CartButtonProps {
  onClick: () => void;
}

export function CartButton({ onClick }: CartButtonProps) {
  const itemCount = useCartStore(state => state.getItemCount());
  const totalItems = useCartStore(state => state.getTotalItems());

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
    >
      <ShoppingCart className="w-6 h-6 text-primary" strokeWidth={2} />

      {totalItems > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </motion.div>
      )}
    </motion.button>
  );
}
