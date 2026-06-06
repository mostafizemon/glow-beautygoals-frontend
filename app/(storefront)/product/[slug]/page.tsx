import Link from 'next/link';
import AddToCartButton from '../../../components/AddToCartButton';
import BuyNowButton from '../../../components/BuyNowButton';
import ProductGallery from '../../../components/ProductGallery';
import { notFound } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  offer_price?: number;
  description: string;
  images: string[];
  category: string;
  stock: number;
  is_free_delivery?: boolean;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:8080/api/v1/products/slug/${slug}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) {
      // If it fails by slug, maybe the slug IS the id (for older products)
      const fallbackRes = await fetch(`http://localhost:8080/api/v1/products/${slug}`, {
        cache: 'no-store'
      });
      if (!fallbackRes.ok) return null;
      return await fallbackRes.json();
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params Promise
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const validImages = product.images?.filter((img: string) => img && img.trim() !== '') || [];
  const imageUrl = validImages.length > 0 ? validImages[0] : "/cream.png";

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
        <nav className="flex text-xs font-medium tracking-wider text-gray-500 uppercase" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
            </li>
            <li>
              <span className="mx-2 text-gray-300">/</span>
            </li>
            <li>
              <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
            </li>
            <li>
              <span className="mx-2 text-gray-300">/</span>
            </li>
            <li aria-current="page" className="text-charcoal truncate max-w-[150px] md:max-w-none">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
          
          {/* Image Gallery */}
          <div className="w-full md:w-1/2">
            <div className="sticky top-[120px]">
              <ProductGallery images={product.images || []} productName={product.name} />
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 pt-6 md:pt-12">
            {product.category && (
              <span className="text-xs font-bold tracking-[0.2em] text-rose-gold uppercase mb-4 block">
                {product.category}
              </span>
            )}
            
            <h1 className="text-3xl md:text-5xl font-serif text-charcoal mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-baseline gap-4 mb-8">
              {product.offer_price && product.offer_price > 0 ? (
                <>
                  <div className="text-2xl text-charcoal font-medium">{product.offer_price.toLocaleString()} Tk</div>
                  <div className="text-lg text-gray-400 line-through">{product.price.toLocaleString()} Tk</div>
                </>
              ) : (
                <div className="text-2xl text-charcoal font-medium">{product.price.toLocaleString()} Tk</div>
              )}
            </div>

            <div className="prose prose-sm text-gray-600 mb-10 leading-relaxed whitespace-pre-wrap">
              <p>{product.description}</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:flex-1">
                  <AddToCartButton 
                    product={product} 
                    className="w-full bg-white text-charcoal border-2 border-charcoal py-4 px-8 rounded-full text-sm font-bold tracking-wider hover:bg-gray-50 transition-colors shadow-sm flex justify-center items-center gap-2"
                  />
                </div>
                <div className="w-full sm:flex-1">
                  <BuyNowButton 
                    product={product} 
                    className="w-full bg-charcoal text-white py-4 px-8 rounded-full text-sm font-bold tracking-wider hover:bg-black transition-colors shadow-lg shadow-black/10 flex justify-center items-center gap-2"
                  />
                </div>
              </div>
              
              {/* Stock Status & Delivery Info */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-center sm:justify-start text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600 font-medium">
                    {product.stock > 10 ? 'In Stock — Ready to ship' : product.stock > 0 ? `Low Stock — Only ${product.stock} left` : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="flex items-center justify-center sm:justify-start text-sm mt-1">
                  <svg className="w-4 h-4 mr-2 text-rose-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  <span className="text-gray-600 font-medium">
                    {product.is_free_delivery 
                      ? 'Free Delivery Inside & Outside Dhaka' 
                      : 'Delivery: 60 Tk Inside Dhaka, 120 Tk Outside Dhaka'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
