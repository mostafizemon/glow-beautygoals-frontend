'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCategories: number;
  recentOrders: {
    id: string;
    order_number: string;
    customer: { name: string; phone: string };
    total_amount: number;
    status: string;
    created_at: string;
  }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthToken = () => {
  if (typeof document === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('admin_token='))
    ?.split('=')[1] || '';
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/api/v1/admin/orders`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/api/v1/products`).then(r => r.json()),
      fetch(`${API_URL}/api/v1/categories`).then(r => r.json()),
    ])
      .then(([orders, products, categories]) => {
        const orderList = Array.isArray(orders) ? orders : [];
        const productList = Array.isArray(products) ? products : [];
        const categoryList = Array.isArray(categories) ? categories : [];

        const totalRevenue = orderList
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

        const pendingOrders = orderList.filter((o: any) => o.status === 'pending').length;

        // Sort by newest first, take 5
        const recentOrders = [...orderList]
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        setStats({
          totalRevenue,
          totalOrders: orderList.length,
          pendingOrders,
          totalProducts: productList.length,
          totalCategories: categoryList.length,
          recentOrders,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({
    title,
    value,
    sub,
    accent,
    icon,
  }: {
    title: string;
    value: string | number;
    sub?: string;
    accent: string;
    icon: React.ReactNode;
  }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-serif text-charcoal">{loading ? '—' : value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="text-gray-300 mt-1">{icon}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-charcoal mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back to your Glow &amp; Beauty Goals admin portal.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Revenue"
          value={`${stats.totalRevenue.toLocaleString()} Tk`}
          sub="Excluding cancelled orders"
          accent="border-rose-gold"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          sub={`${stats.pendingOrders} pending`}
          accent="border-blue-400"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Active Products"
          value={stats.totalProducts}
          sub={`${stats.totalCategories} categories`}
          accent="border-green-400"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-serif text-xl text-charcoal">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-rose-gold hover:underline font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading data...</div>
        ) : stats.recentOrders.length === 0 ? (
          <div className="p-16 text-center">
            <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 mb-6">No orders yet. Share your store to start selling!</p>
            <a href="/admin/products" className="btn-primary">Manage Products</a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Order #</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders`} className="font-mono text-xs text-rose-gold hover:underline">
                        #{order.order_number || order.id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-charcoal">{order.customer?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{order.customer?.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal">
                      {order.total_amount?.toLocaleString()} Tk
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
