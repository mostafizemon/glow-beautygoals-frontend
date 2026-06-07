import Link from 'next/link';
import ProductCard from '../../components/ProductCard';

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

async function getProducts(category?: string): Promise<Product[]> {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/products`;
    if (category && category !== 'all') {
      url += `?category=${category}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    // API may return null when no products match — always return an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams = await searchParams;
  const category = typeof resolvedSearchParams.category === 'string'
    ? resolvedSearchParams.category
    : 'all';

  const [products, dynamicCategories] = await Promise.all([
    getProducts(category),
    getCategories(),
  ]);

  // Active category label for display
  const activeCatLabel = category === 'all'
    ? 'All Products'
    : dynamicCategories.find(c => c.slug === category)?.name ?? category;

  return (
    <div className="w-full bg-background min-h-screen pb-24">

      {/* ── Page header ── */}
      <div className="bg-gradient-to-br from-cream-dark/60 via-blush/10 to-cream px-6 md:px-12 pt-10 pb-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-gold mb-2">Our Collection</p>
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-3">Shop All Products</h1>
          <p className="text-gray-500 text-base max-w-xl">
            Browse our full range — skincare, supplements, ornaments and more.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="sticky top-[108px]">
              <h3 className="font-serif text-lg text-charcoal mb-5 border-b border-gray-100 pb-3">
                Categories
              </h3>
              <ul className="space-y-1">
                {/* All */}
                <li>
                  <Link
                    href="/shop"
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      category === 'all'
                        ? 'bg-rose-gold text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
                    }`}
                  >
                    <span>All Products</span>
                  </Link>
                </li>

                {dynamicCategories.length > 0 ? (
                  dynamicCategories.map(cat => (
                    <li key={cat.id}>
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
                          category === cat.slug
                            ? 'bg-rose-gold text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {category === cat.slug && (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400 px-3 py-2">No categories yet</li>
                )}
              </ul>
            </div>
          </aside>

          {/* ── Product grid ── */}
          <div className="flex-grow min-w-0">

            {/* Results bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <span className="text-sm font-medium text-charcoal capitalize">{activeCatLabel}</span>
                <span className="ml-2 text-xs text-gray-400">
                  ({products.length} product{products.length !== 1 ? 's' : ''})
                </span>
              </div>
              {category !== 'all' && (
                <Link
                  href="/shop"
                  className="text-xs text-gray-400 hover:text-rose-gold transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filter
                </Link>
              )}
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    style={{ animation: 'revealUp 0.5s ease-out both', animationDelay: `${i * 60}ms` }}
                  >
                    <ProductCard product={product as any} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-28 bg-white rounded-3xl border border-gray-100 flex flex-col items-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-charcoal mb-2">No products found</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mb-7">
                  {category !== 'all'
                    ? `No products in "${activeCatLabel}" yet. Try another category.`
                    : 'Our catalog is currently empty. Check back soon!'}
                </p>
                {category !== 'all' && (
                  <Link href="/shop" className="btn-primary rounded-full px-7">
                    Show All Products
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
