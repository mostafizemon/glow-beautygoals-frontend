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
}

export default function ProductCard({ product }: { product: Product }) {
  const validImages = product.images?.filter((img: string) => img && img.trim() !== '') || [];
  const imageUrl = validImages.length > 0 ? validImages[0] : "/cream.png";
  const productLink = `/product/${product.slug || product.id}`;
  const hasOffer = product.offer_price && product.offer_price > 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100/50">
      {/* Image Container */}
      <Link href={productLink} className="relative aspect-[4/5] overflow-hidden bg-gray-50/80 block">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlay Gradients & Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          {product.is_featured && (
            <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-charcoal shadow-sm backdrop-blur uppercase">
              Featured
            </span>
          )}
          {hasOffer && (
            <span className="inline-flex items-center rounded-full bg-rose-gold px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm backdrop-blur uppercase">
              Sale
            </span>
          )}
        </div>
        
        {product.category && (
          <div className="absolute top-3 right-3 flex flex-wrap gap-2 z-10">
            <span className="inline-flex items-center rounded-full bg-charcoal/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white shadow-sm backdrop-blur uppercase">
              {product.category}
            </span>
          </div>
        )}
        
        {/* Quick Add Button (Desktop) */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden md:block z-20">
          <AddToCartButton 
            product={product as any} 
            className="w-full bg-white/95 backdrop-blur-md text-charcoal py-3 text-sm font-medium rounded-full shadow-lg hover:bg-charcoal hover:text-white transition-colors flex items-center justify-center gap-2"
          />
        </div>
      </Link>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start gap-4 mb-2">
          <Link href={productLink} className="flex-1">
            <h3 className="text-lg font-serif text-charcoal line-clamp-1 group-hover:text-rose-gold transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex flex-col items-end">
            {hasOffer ? (
              <>
                <span className="text-base font-bold text-charcoal whitespace-nowrap">
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

        {/* Mobile Add to Cart */}
        <div className="mt-auto block md:hidden">
          <AddToCartButton 
            product={product} 
            className="w-full py-2.5 border border-gray-200 text-charcoal rounded-full text-sm font-medium hover:border-charcoal hover:bg-gray-50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
