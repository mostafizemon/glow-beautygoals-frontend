'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Helper to decode JWT payload safely
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Read the admin_token cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1];

    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.role) {
        setRole(decoded.role);
      }
    } else {
      setRole(null);
    }
  }, [pathname]);

  // Don't show sidebar on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col md:fixed md:h-screen md:top-0 md:left-0 z-40">
        <div className="p-6 border-b border-gray-100 hidden md:block">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Glow & Beauty Goals"
              width={140}
              height={56}
              style={{ width: 'auto', height: 'auto' }}
              className="h-14 object-contain"
              priority
            />
          </Link>
          {role && <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full uppercase tracking-wider">{role}</span>}
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link 
            href="/admin" 
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === '/admin' ? 'bg-rose-gold/10 text-rose-gold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Dashboard
          </Link>
          
          {role === 'admin' && (
            <Link 
              href="/admin/products" 
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname.includes('/admin/products') ? 'bg-rose-gold/10 text-rose-gold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Products
            </Link>
          )}

          {role === 'admin' && (
            <Link 
              href="/admin/categories" 
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname.includes('/admin/categories') ? 'bg-rose-gold/10 text-rose-gold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Categories
            </Link>
          )}

          <Link 
            href="/admin/orders" 
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname.includes('/admin/orders') ? 'bg-rose-gold/10 text-rose-gold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Orders
          </Link>

          {role === 'admin' && (
            <>
              <Link 
                href="/admin/users" 
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname.includes('/admin/users') ? 'bg-rose-gold/10 text-rose-gold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Users
              </Link>
              <Link 
                href="/admin/tracking" 
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname.includes('/admin/tracking') ? 'bg-rose-gold/10 text-rose-gold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Tracking
              </Link>
            </>
          )}

          <Link 
            href="/admin/settings" 
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname.includes('/admin/settings') ? 'bg-rose-gold/10 text-rose-gold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 pt-[100px] md:pt-10 md:ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
