'use client';

import Link from 'next/link';
import { useState } from 'react';
import AddToCartButton from './AddToCartButton';
import { motion } from 'framer-motion';

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
  const imageUrl  = validImages.length > 0 ? validImages[0] : '/cream.png';
  const image2Url = validImages.length > 1 ? validImages[1] : null;
  const productLink = `/product/${product.slug || product.id}`;
  const hasOffer = product.offer_price && product.offer_price > 0 && product.offer_price < product.price;
  const discountPct = hasOffer
    ? Math.round(((product.price - product.offer_price!) / product.price) * 100)
    : 0;
  const displayPrice = hasOffer ? product.offer_price! : product.price;

  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [added, setAdded]   = useState(false);

  const handleHoverIn  = () => { if (image2Url) setImgSrc(image2Url); };
  const handleHoverOut = () => setImgSrc(imageUrl);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100/50 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1"
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >

      {/* ── Image ── */}
      <Link href={productLink} className="relative aspect-[4/5] overflow-hidden bg-[#FDFBF9] block">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgSrc('/cream.png')}
        />

        {/* Subtle Gradient overlay on hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges — top left */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {hasOffer && (
            <span className="inline-flex items-center bg-charcoal px-3 py-1 text-[9px] font-bold tracking-[0.1em] text-white uppercase">
              {discountPct}% OFF
            </span>
          )}
          {product.is_free_delivery && (
            <span className="inline-flex items-center bg-white/90 backdrop-blur-sm px-3 py-1 text-[9px] font-bold tracking-[0.1em] text-charcoal shadow-sm uppercase border border-gray-100">
              FREE DELIVERY
            </span>
          )}
          {product.is_featured && !hasOffer && (
            <span className="inline-flex items-center bg-rose-gold px-3 py-1 text-[9px] font-bold tracking-[0.1em] text-white shadow-sm uppercase">
              FEATURED
            </span>
          )}
        </div>

        {/* Category pill — top right */}
        {product.category && (
          <div className="absolute top-4 right-4 z-10 hidden group-hover:block transition-all duration-300">
            <span className="inline-flex items-center bg-white/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-semibold tracking-wider text-gray-600 shadow-sm uppercase">
              {product.category}
            </span>
          </div>
        )}

        {/* Wishlist button placeholder */}
        <button
          aria-label="Save to wishlist"
          className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-md border border-gray-100"
          onClick={e => e.preventDefault()}
        >
          <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick Add — slides up from bottom on hover (desktop only) */}
        <div className="absolute bottom-4 left-4 right-16 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out hidden md:block z-20">
          <AddToCartButton
            product={product as any}
            className="w-full bg-charcoal text-white py-2.5 text-[10px] uppercase tracking-[0.15em] font-semibold shadow-xl hover:bg-rose-gold transition-colors duration-300 flex items-center justify-center gap-2"
            onAdded={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
            added={added}
          />
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 px-5 pt-5 pb-6 gap-3">
        {/* Name + Price row */}
        <div className="flex flex-col gap-1">
          <Link href={productLink} className="flex-1 min-w-0">
            <h3 className="font-serif text-lg md:text-xl text-charcoal leading-snug line-clamp-2 hover:text-rose-gold transition-colors duration-300">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-xs text-gray-500 font-light line-clamp-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            {hasOffer ? (
              <>
                <span className="text-sm text-gray-400 line-through decoration-rose-gold/50 font-light">
                  {product.price.toLocaleString()} Tk
                </span>
                <span className="text-lg font-serif font-medium text-charcoal">
                  {displayPrice.toLocaleString()} Tk
                </span>
              </>
            ) : (
              <span className="text-lg font-serif font-medium text-charcoal">
                {displayPrice.toLocaleString()} Tk
              </span>
            )}
          </div>

          {/* Delivery simple text */}
          {!product.is_free_delivery && (
             <span className="text-[10px] text-gray-400 uppercase tracking-wider font-light">
               + Shipping
             </span>
          )}
        </div>

        {/* Mobile — Always visible Add to Cart */}
        <div className="md:hidden mt-2">
          <AddToCartButton
            product={product as any}
            className="w-full py-3 border border-charcoal bg-transparent text-charcoal text-[10px] uppercase tracking-[0.15em] font-bold hover:bg-charcoal hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
            onAdded={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
            added={added}
          />
        </div>

      </div>
    </motion.article>
  );
}
