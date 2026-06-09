'use client';

import { getApiUrl } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: string;
  order_number: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}

export default function AdminOrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editCustomer, setEditCustomer] = useState({ name: '', phone: '', address: '' });
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1] || '';
  };

  const fetchOrderAndProducts = async () => {
    if (!orderId) return;
    try {
      const [orderRes, productsRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/v1/admin/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        }),
        fetch(`${getApiUrl()}/api/v1/products`)
      ]);

      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrder(data);
        setEditCustomer({
          name: data.customer.name || '',
          phone: data.customer.phone || '',
          address: data.customer.address || ''
        });
        setEditTotalAmount(data.total_amount || 0);
        setEditStatus(data.status);
      } else {
        alert('Failed to fetch order. It may have been deleted.');
        router.push('/admin/orders');
      }

      if (productsRes.ok) {
        const pData = await productsRes.json();
        const map: Record<string, Product> = {};
        pData.forEach((p: Product) => {
          map[p.id] = p;
        });
        setProductsMap(map);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndProducts();
  }, [orderId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update customer details and total amount
      const updateDetailsRes = await fetch(`${getApiUrl()}/api/v1/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: editCustomer,
          total_amount: editTotalAmount
        })
      });

      // 2. Update order status
      const updateStatusRes = await fetch(`${getApiUrl()}/api/v1/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: editStatus })
      });

      if (updateDetailsRes.ok && updateStatusRes.ok) {
        setOrder(prev => prev ? { ...prev, customer: editCustomer, status: editStatus, total_amount: editTotalAmount } : prev);
        setIsEditing(false);
        alert('Order updated successfully!');
      } else {
        alert('Failed to update order completely.');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading order details...</div>;
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 -ml-2 text-gray-400 hover:text-charcoal transition-colors rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-3xl font-serif text-charcoal">Order {order.order_number}</h1>
          {!isEditing && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          )}
        </div>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-md hover:bg-black transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Order
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-100 text-charcoal border border-gray-200 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-charcoal text-white rounded-md hover:bg-black transition-colors text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Details Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-serif text-charcoal mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Customer Info
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editCustomer.name} 
                    onChange={e => setEditCustomer({...editCustomer, name: e.target.value})}
                    className="w-full border-gray-300 rounded shadow-sm focus:border-charcoal focus:ring focus:ring-charcoal/20 text-sm p-2 border outline-none"
                  />
                ) : (
                  <p className="font-medium text-charcoal">{order.customer.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editCustomer.phone} 
                    onChange={e => setEditCustomer({...editCustomer, phone: e.target.value})}
                    className="w-full border-gray-300 rounded shadow-sm focus:border-charcoal focus:ring focus:ring-charcoal/20 text-sm p-2 border outline-none"
                  />
                ) : (
                  <p className="text-gray-600">{order.customer.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shipping Address</label>
                {isEditing ? (
                  <textarea 
                    value={editCustomer.address} 
                    onChange={e => setEditCustomer({...editCustomer, address: e.target.value})}
                    rows={4}
                    className="w-full border-gray-300 rounded shadow-sm focus:border-charcoal focus:ring focus:ring-charcoal/20 text-sm p-2 border outline-none"
                  />
                ) : (
                  <p className="text-gray-600 whitespace-pre-wrap">{order.customer.address}</p>
                )}
              </div>

              {isEditing && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 mt-4">Order Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 outline-none focus:border-charcoal bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-serif text-charcoal mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Order Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Date Placed</span>
                <span className="font-medium text-charcoal">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-medium text-charcoal truncate ml-4" title={order.id}>{order.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-serif text-charcoal flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Products Ordered
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, idx) => {
                const product = productsMap[item.product_id];
                const image = product?.images?.[0] || '/cream.png';
                return (
                  <div key={idx} className="p-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-md border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-charcoal text-base">
                        {product?.name || <span className="text-gray-400 italic">Unknown Product (ID: {item.product_id})</span>}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.price_at_purchase.toLocaleString()} Tk × {item.quantity}
                      </div>
                    </div>
                    <div className="text-right font-medium text-charcoal shrink-0">
                      {(item.price_at_purchase * item.quantity).toLocaleString()} Tk
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
              <div className="flex justify-between items-center text-lg font-serif">
                <span className="text-charcoal">Total Amount</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editTotalAmount}
                      onChange={(e) => setEditTotalAmount(Number(e.target.value))}
                      className="w-32 border-gray-300 rounded shadow-sm focus:border-charcoal focus:ring focus:ring-charcoal/20 text-sm p-2 border outline-none text-right font-sans"
                    />
                    <span className="text-charcoal font-bold text-sm">Tk</span>
                  </div>
                ) : (
                  <span className="text-charcoal font-bold">{order.total_amount.toLocaleString()} Tk</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
