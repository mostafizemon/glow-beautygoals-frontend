'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/tracking';

export default function ViewContentTracker({ product }: { product: any }) {
  useEffect(() => {
    trackEvent('ViewContent', {
      content_type: 'product',
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.categories && product.categories.length > 0 ? product.categories[0] : 'uncategorized',
      value: product.offer_price && product.offer_price > 0 ? product.offer_price : product.price,
      currency: 'BDT'
    });
  }, [product.id]);

  return null;
}
