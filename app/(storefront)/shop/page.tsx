import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  is_featured: boolean;
}

async function getProducts(category?: string): Promise<Product[]> {
  try {
    let url = 'http://localhost:8080/api/v1/products';
    if (category && category !== 'all') {
      url += `?category=${category}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Wait for the async searchParams to resolve
  const resolvedSearchParams = await searchParams;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : 'all';
  const products = await getProducts(category);

  const categories = [
    { id: 'all', name: 'All Skincare' },
    { id: 'serum', name: 'Serums & Treatments' },
    { id: 'moisturizer', name: 'Moisturizers' },
    { id: 'cleanser', name: 'Cleansers' },
    { id: 'oil', name: 'Face Oils' },
  ];

  return (
    <div className="w-full bg-background min-h-screen pt-8 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Shop Skincare</h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Explore our full collection of clean, clinically-proven formulas designed to elevate your daily ritual.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-[120px]">
              <h3 className="font-serif text-xl mb-6 text-foreground border-b border-black/5 pb-4">Categories</h3>
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link 
                      href={`/shop${cat.id === 'all' ? '' : `?category=${cat.id}`}`}
                      className={`text-sm tracking-wide transition-colors ${category === cat.id ? 'text-rose-gold font-medium' : 'text-gray-600 hover:text-charcoal'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
                <svg className="w-16 h-16 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <h3 className="text-2xl font-serif text-charcoal mb-3">No products found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  {category !== 'all' 
                    ? `We currently don't have any products in the "${category}" category.` 
                    : "Our catalog is currently empty. Please check back later!"}
                </p>
                {category !== 'all' && (
                  <Link href="/shop" className="btn-secondary">Clear Filters</Link>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
