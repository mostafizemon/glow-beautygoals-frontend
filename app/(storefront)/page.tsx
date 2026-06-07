import { getApiUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '../components/ProductCard';
import FadeIn from '../components/FadeIn';
interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  offer_price?: number;
  description: string;
  images: string[];
  categories: string[];
  is_featured: boolean;
  is_free_delivery?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/products?is_featured=true`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  // Group featured products by their category slug/name
  // Build a map: categorySlug -> products[]
  const productsByCategory: Record<string, Product[]> = {};
  for (const p of products) {
    const cats = (p.categories && p.categories.length > 0) ? p.categories : ['uncategorized'];
    for (const catName of cats) {
      const key = catName.toLowerCase().trim();
      if (!productsByCategory[key]) productsByCategory[key] = [];
      productsByCategory[key].push(p);
    }
  }

  // Order sections by the category order from the API;
  // only include categories that actually have featured products.
  const categorySections = categories
    .map(cat => ({
      cat,
      items: productsByCategory[cat.slug?.toLowerCase().trim()] ||
             productsByCategory[cat.name?.toLowerCase().trim()] ||
             [],
    }))
    .filter(({ items }) => items.length > 0);

  // Products whose category doesn't match any known category go in a fallback group
  const knownKeys = new Set([
    ...categories.map(c => c.slug?.toLowerCase().trim()),
    ...categories.map(c => c.name?.toLowerCase().trim()),
  ]);
  const uncategorized = products.filter(p => {
    const cats = (p.categories && p.categories.length > 0) ? p.categories : ['uncategorized'];
    return !cats.some(cat => knownKeys.has(cat.toLowerCase().trim()));
  });
  if (uncategorized.length > 0) {
    categorySections.push({ cat: { id: '__other', name: 'Featured', slug: '' }, items: uncategorized });
  }

  return (
    <div className="w-full">

      {/* ═══════════════════════════════════════════
          HERO SECTION — Split layout with visual richness
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-88px)] flex items-center overflow-hidden bg-[#FDF6F0]">

        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-blush/35 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-rose-gold/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-cream-dark/80 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Text content */}
          <div>
            <FadeIn delay={0.1} direction="right">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-rose-gold/20 rounded-full px-4 py-1.5 mb-7 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-gold animate-pulse" />
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-rose-gold">Natural Beauty • Bangladesh</span>
              </div>
            </FadeIn>

            {/* Headline */}
            <FadeIn delay={0.2} direction="right">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-6 text-charcoal">
                Reveal Your
                <span className="block relative">
                  <span className="text-rose-gold italic">Natural Glow</span>
                </span>
                Every Day
              </h1>
            </FadeIn>

            {/* Sub-text */}
            <FadeIn delay={0.3} direction="up">
              <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-9 max-w-lg">
                Clean, skin-loving formulas crafted for your daily ritual.
                Nourish deeply, glow naturally — because your skin deserves the best.
              </p>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn delay={0.4} direction="up">
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/shop"
                  className="btn-primary px-8 py-4 text-base rounded-full shadow-lg shadow-rose-gold/30 hover:shadow-rose-gold/50 flex items-center justify-center gap-2 group"
                >
                  Shop Now
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base rounded-full border-2 border-charcoal/15 text-charcoal font-medium hover:border-rose-gold hover:text-rose-gold transition-all duration-300"
                >
                  View Collection
                </Link>
              </div>
            </FadeIn>

            {/* Mini trust stats */}
            <FadeIn delay={0.5} direction="up">
              <div className="flex items-center gap-8">
                {[
                  { value: '100%', label: 'Natural' },
                  { value: '5★', label: 'Rated' },
                  { value: 'Free', label: 'Delivery*' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-serif font-semibold text-charcoal">{value}</div>
                    <div className="text-xs text-gray-400 tracking-wide uppercase">{label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right — Visual showcase */}
          <FadeIn delay={0.3} direction="left" className="relative flex items-center justify-center">

            {/* Central image card */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white" style={{ animation: 'floatY 7s ease-in-out infinite' }}>
              <Image
                src="/logo.png"
                alt="Glow & Beauty Goals"
                fill
                className="object-contain bg-gradient-to-br from-cream-dark via-blush/20 to-cream p-6"
                priority
              />
            </div>

            {/* Floating card 1 — Free delivery */}
            <div className="absolute -top-4 -left-4 md:-top-6 md:-left-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100" style={{ animation: 'floatY 7s ease-in-out 1s infinite' }}>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">Free Delivery</p>
                <p className="text-[10px] text-gray-400">On selected items</p>
              </div>
            </div>

            {/* Floating card 2 — Rating */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100" style={{ animation: 'floatY 7s ease-in-out 2.5s infinite' }}>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">5.0 Rating</p>
                <p className="text-[10px] text-gray-400">Trusted by 1000+ customers</p>
              </div>
            </div>

            {/* Floating card 3 — Natural */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-6 md:-right-12 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100" style={{ animation: 'floatY 7s ease-in-out 1.7s infinite' }}>
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-rose-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">100% Natural</p>
                <p className="text-[10px] text-gray-400">No harmful chemicals</p>
              </div>
            </div>

            {/* Decorative ring */}
            <div className="absolute inset-0 m-auto w-80 h-80 md:w-[420px] md:h-[420px] rounded-full border-2 border-dashed border-rose-gold/20 pointer-events-none" style={{ animation: 'floatY 10s ease-in-out infinite reverse' }} />
          </FadeIn>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50">
          <span className="text-xs tracking-widest uppercase text-gray-400">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VALUE STRIP — Quick trust badges
      ═══════════════════════════════════════════ */}
      <section className="bg-charcoal text-white py-4 overflow-hidden flex whitespace-nowrap">
        {/* Marquee Container 1 */}
        <div className="flex items-center gap-12 animate-[marquee_25s_linear_infinite] pr-12 shrink-0">
          {[
            '✦ Free Delivery on Selected Products',
            '✦ 100% Natural Ingredients',
            '✦ Dermatologist Approved',
            '✦ Cruelty Free',
            '✦ Easy Returns',
            '✦ Cash on Delivery Available',
          ].map((text, i) => (
            <span key={i} className="text-xs font-medium tracking-widest uppercase text-white/80">
              {text}
            </span>
          ))}
        </div>
        {/* Marquee Container 2 (Duplicate for seamless loop) */}
        <div className="flex items-center gap-12 animate-[marquee_25s_linear_infinite] pr-12 shrink-0" aria-hidden="true">
          {[
            '✦ Free Delivery on Selected Products',
            '✦ 100% Natural Ingredients',
            '✦ Dermatologist Approved',
            '✦ Cruelty Free',
            '✦ Easy Returns',
            '✦ Cash on Delivery Available',
          ].map((text, i) => (
            <span key={i} className="text-xs font-medium tracking-widest uppercase text-white/80">
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRODUCTS BY CATEGORY
      ═══════════════════════════════════════════ */}
      {categorySections.length > 0 ? (
        <div className="bg-gradient-to-b from-white to-cream-dark/20">
          {categorySections.map(({ cat, items }, sectionIdx) => (
            <section
              key={cat.id}
              className={`py-12 md:py-16 px-6 md:px-12 ${
                sectionIdx % 2 === 1 ? 'bg-cream-dark/25' : 'bg-white'
              }`}
            >
              <div className="max-w-7xl mx-auto">

                {/* Category header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <div className="flex items-center gap-4">
                    {/* Vertical accent bar */}
                    <div className="w-1 h-10 bg-rose-gold rounded-full shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-rose-gold/80 mb-0.5">
                        Featured Collection
                      </p>
                      <h2 className="text-2xl md:text-3xl font-serif text-charcoal capitalize leading-tight">
                        {cat.name}
                      </h2>
                    </div>
                    <span className="ml-1 text-[11px] font-semibold bg-rose-gold/10 text-rose-gold px-2.5 py-1 rounded-full">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <Link
                    href={`/shop${cat.slug ? `?category=${cat.slug}` : ''}`}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-rose-gold transition-colors shrink-0"
                  >
                    View all {cat.name}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {items.map((product, i) => (
                    <div
                      key={product.id}
                      style={{
                        animation: 'revealUp 0.55s ease-out both',
                        animationDelay: `${i * 70}ms`,
                      }}
                    >
                      <ProductCard product={product as any} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Empty state — no featured products at all */
        <section className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center shadow-sm">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-rose-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-charcoal mb-2">New Treasures Coming Soon</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-8">We are curating our finest selection of featured products just for you.</p>
              <Link href="/shop" className="btn-primary rounded-full px-8">Browse All Products</Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          WHY CHOOSE US — 3-column feature grid
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-cream-dark/60 via-blush/10 to-cream px-6 md:px-12 border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-gold mb-3 block">Our Promise</span>
            <h2 className="text-3xl md:text-4xl font-serif">Why Glow &amp; Beauty Goals?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                bg: 'bg-rose-50',
                color: 'text-rose-gold',
                title: 'Clinically Proven',
                desc: 'Formulated with dermatologist-approved, bio-compatible ingredients you can trust on sensitive skin.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zm-4-2H6l-2-9h18l-2 9z" />
                  </svg>
                ),
                bg: 'bg-blue-50',
                color: 'text-blue-500',
                title: 'Fast & Easy Delivery',
                desc: 'Inside Dhaka in 1–2 days. Free shipping on select products. Cash on delivery available.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                bg: 'bg-emerald-50',
                color: 'text-emerald-600',
                title: 'Cruelty-Free',
                desc: 'Never tested on animals. 100% vegan formulas made from plant-based, ethical sources.',
              },
            ].map(({ icon, bg, color, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {icon}
                </div>
                <h4 className="font-serif text-xl mb-3 text-charcoal">{title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER — Bottom call to action
      ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 md:px-12 bg-charcoal text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-rose-gold/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-blush/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-gold mb-4 block">Limited Time</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Start Your Glow Journey Today</h2>
          <p className="text-white/60 mb-10 text-lg">Browse our full collection of skin-transforming products.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-rose-gold text-white px-10 py-4 rounded-full font-semibold text-base hover:bg-rose-gold-dark shadow-xl shadow-rose-gold/30 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Explore All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

    </div>
  );
}
