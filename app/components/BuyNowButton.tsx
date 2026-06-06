'use client';

import { useCart } from '../context/CartContext';
import { trackEvent } from '@/lib/tracking';
import { useRouter } from 'next/navigation';

export default function BuyNowButton({ product, className }: { product: any, className?: string }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Fire dual-tracking event
    trackEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.category,
      value: product.price,
      currency: 'BDT'
    });

    // Add to cart
    addToCart({
      id: product.id,
      name: product.name,
      price: product.offer_price && product.offer_price > 0 ? product.offer_price : product.price,
      image: (product.images && product.images.length > 0) ? product.images[0] : '/cream.png',
      quantity: 1,
      is_free_delivery: product.is_free_delivery,
    });
    
    // Redirect to checkout
    router.push('/checkout');
  };

  return (
    <button onClick={handleBuyNow} className={className}>
      Buy Now
    </button>
  );
}
