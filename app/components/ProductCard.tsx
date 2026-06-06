import Link from 'next/link';
import AddToCartButton from './AddToCartButton';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  offer_price?: number;
  description: string;
  images: string[];
  category: string;
  is_featured: boolean;
  is_free_delivery?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const validImages = product.images?.filter((img: string) => img && img.trim() !== '') || [];
  const imageUrl = validImages.length > 0 ? validImages[0] : "/cream.png";
  const productLink = `/product/${product.slug || product.id}`;
  const hasOffer = product.offer_price && product.offer_price > 0 && product.offer_price < product.price;
  
  // Calculate discount percentage
  const discountPct = hasOffer
    ? Math.round(((product.price - product.offer_price!) / product.price) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100/50">
      {/* Image Container */}
      <Link href={productLink} className="relative aspect-[4/5] overflow-hidden bg-gray-50/80 block">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_featured && (
            <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-charcoal shadow-sm uppercase">
              Featured
            </span>
          )}
          {hasOffer && (
            <span className="inline-flex items-center rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm uppercase">
              {discountPct}% OFF
            </span>
          )}
          {product.is_free_delivery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm uppercase">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Free Delivery
            </span>
          )}
        </div>
        
        {/* Category badge (top-right) */}
        {product.category && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center rounded-full bg-charcoal/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white shadow-sm uppercase">
              {product.category}
            </span>
          </div>
        )}
        
        {/* Quick Add Button (Desktop hover) */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden md:block z-20">
          <AddToCartButton 
            product={product as any} 
            className="w-full bg-white/95 backdrop-blur-md text-charcoal py-3 text-sm font-medium rounded-full shadow-lg hover:bg-charcoal hover:text-white transition-colors flex items-center justify-center gap-2"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start gap-4 mb-2">
          <Link href={productLink} className="flex-1">
            <h3 className="text-lg font-serif text-charcoal line-clamp-1 group-hover:text-rose-gold transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex flex-col items-end shrink-0">
            {hasOffer ? (
              <>
                <span className="text-base font-bold text-rose-600 whitespace-nowrap">
                  {product.offer_price?.toLocaleString()} Tk
                </span>
                <span className="text-xs text-gray-400 line-through whitespace-nowrap">
                  {product.price.toLocaleString()} Tk
                </span>
              </>
            ) : (
              <span className="text-base font-semibold text-charcoal whitespace-nowrap">
                {product.price.toLocaleString()} Tk
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        {/* Delivery info row */}
        {product.is_free_delivery ? (
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Free Delivery
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zm-4-2H6l-2-9h18l-1 5" />
            </svg>
            Inside Dhaka 60 Tk · Outside 120 Tk
          </div>
        )}

        {/* Mobile Add to Cart */}
        <div className="mt-auto block md:hidden">
          <AddToCartButton 
            product={product as any} 
            className="w-full py-2.5 border border-gray-200 text-charcoal rounded-full text-sm font-medium hover:border-charcoal hover:bg-gray-50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
