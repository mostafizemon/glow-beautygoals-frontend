'use client';

import { trackEvent } from '@/lib/tracking';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  product: any;
  className?: string;
  onAdded?: () => void;
  added?: boolean;
}

export default function AddToCartButton({ product, className, onAdded, added }: Props) {
  const { addToCart } = useCart();
  const [internalAdded, setInternalAdded] = useState(false);
  
  const isAdded = added || internalAdded;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    trackEvent('AddToCart', {
      content_type: 'product',
      content_id: product.id,
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.categories && product.categories.length > 0 ? product.categories[0] : 'uncategorized',
      value: product.offer_price && product.offer_price > 0 ? product.offer_price : product.price,
      currency: 'BDT',
    });

    addToCart({
      id: product.id,
      name: product.name,
      price: product.offer_price && product.offer_price > 0 ? product.offer_price : product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '/cream.png',
      quantity: 1,
      is_free_delivery: product.is_free_delivery,
    });

    setInternalAdded(true);
    setTimeout(() => setInternalAdded(false), 1800);
    onAdded?.();
  };

  return (
    <motion.button 
      onClick={handleAddToCart} 
      className={`relative overflow-hidden ${className || ''}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div 
        className="absolute inset-0 bg-black/5"
        initial={{ x: '-100%', skewX: -15 }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      {isAdded ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 relative z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Added!
        </motion.div>
      ) : (
        <div className="flex items-center justify-center gap-2 relative z-10">
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Add to Cart
        </div>
      )}
    </motion.button>
  );
}
