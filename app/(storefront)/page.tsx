import Link from 'next/link';
import ProductCard from '../components/ProductCard';
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  is_featured: boolean;
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch('http://localhost:8080/api/v1/products?is_featured=true', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="w-full">
      
      {/* Hero Section */}
      <section className="relative min-h-[75vh] md:min-h-[80vh] flex items-center justify-center bg-blush/20 px-6 md:px-12 py-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blush/40 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-rose-gold/10 rounded-full blur-[100px] opacity-60"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center animate-fade-in-up">
          <span className="mb-4 text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-gray-600">A New Standard of Beauty</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] md:leading-[1.15] mb-6 text-foreground">
            Discover Your Natural Radiance
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Elevate your daily ritual with our clean, clinically-proven formulas designed to nourish, protect, and illuminate your unique complexion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link href="/shop" className="btn-primary w-full sm:w-auto">Shop the Collection</Link>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-black/5 pb-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">Curated Essentials</h2>
              <p className="text-gray-600 text-lg">Our community's most loved formulas for a flawless, hydrated glow.</p>
            </div>
            <Link href="/shop" className="hidden md:inline-flex items-center text-sm font-medium tracking-wide uppercase group text-charcoal">
              Shop All Products
              <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-cream-dark/20 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
               <svg className="w-12 h-12 text-rose-gold mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
               <h3 className="text-xl font-serif text-charcoal mb-2">New Treasures Coming Soon</h3>
               <p className="text-gray-600 max-w-sm mx-auto mb-6">We are currently curating our finest selection of featured products for you.</p>
               <Link href="/shop" className="btn-secondary">Browse All Categories</Link>
             </div>
          )}
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center text-sm font-medium tracking-wide uppercase border-b border-foreground pb-1 text-charcoal">
              View All Skincare
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges / Value Proposition */}
      <section className="py-20 bg-cream-dark/50 px-6 md:px-12 border-y border-black/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm text-rose-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h4 className="font-serif text-xl mb-2">Clinically Proven</h4>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">Formulated by dermatologists with highly active, bio-compatible ingredients.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm text-rose-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h4 className="font-serif text-xl mb-2">Consciously Packaged</h4>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">100% recyclable glass bottles and FSC-certified paper packaging.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm text-rose-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>
            <h4 className="font-serif text-xl mb-2">Cruelty-Free</h4>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">Never tested on animals. 100% vegan formulations you can trust.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
