'use client';

import { useState, useEffect } from 'react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const validImages = images?.filter((img) => img && img.trim() !== '') || [];
  const defaultImage = "/cream.png";
  const displayImages = validImages.length > 0 ? validImages : [defaultImage];
  
  const [activeImage, setActiveImage] = useState(displayImages[0]);

  // Ensure active image updates if the product/images change during client-side navigation
  useEffect(() => {
    setActiveImage(displayImages[0]);
  }, [images.join(',')]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100/50 relative">
        <img
          src={activeImage}
          alt={productName}
          className="w-full h-full object-cover object-center transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                activeImage === img ? 'border-charcoal shadow-md scale-105' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
