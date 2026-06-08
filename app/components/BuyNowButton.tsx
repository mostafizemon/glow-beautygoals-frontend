'use client';

import { useCart } from '../context/CartContext';
import { trackEvent } from '@/lib/tracking';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BuyNowButton({ product, className }: { product: any, className?: string }) {
  const { setBuyNowItem } = useCart();
  const router = useRouter();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Fire dual-tracking event
    trackEvent('AddToCart', {
      content_type: 'product',
      content_id: product.id,
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.categories && product.categories.length > 0 ? product.categories[0] : 'uncategorized',
      value: product.offer_price && product.offer_price > 0 ? product.offer_price : product.price,
      currency: 'BDT'
    });

    // Set Buy Now item in context (bypasses the main cart)
    setBuyNowItem({
      id: product.id,
      name: product.name,
      price: product.offer_price && product.offer_price > 0 ? product.offer_price : product.price,
      image: (product.images && product.images.length > 0) ? product.images[0] : '/cream.png',
      quantity: 1,
      is_free_delivery: product.is_free_delivery,
    });
    
    // Redirect to checkout
    router.push('/checkout?buy_now=true');
  };

  return (
    <motion.button 
      onClick={handleBuyNow} 
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div 
        className="absolute inset-0 bg-white/20"
        initial={{ x: '-100%', skewX: -15 }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <div className="flex items-center justify-center gap-2 relative z-10">
        <svg className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        Buy Now
      </div>
    </motion.button>
  );
}
