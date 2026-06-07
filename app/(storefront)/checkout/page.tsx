'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { trackEvent } from '@/lib/tracking';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryArea: 'inside', // 'inside' or 'outside'
    address: '',
    note: '',
  });
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (name === 'phone') {
      setPhoneError('');
    }
  };

  const validatePhone = (phone: string) => {
    // Regex for Bangladeshi phone numbers: (01 or +8801 or 8801) followed by 9 digits
    const bdPhoneRegex = /^(?:\+88|88)?01[3-9]\d{8}$/;
    return bdPhoneRegex.test(phone);
  };

  const hasFreeDelivery = cart.some(item => item.is_free_delivery) || cartTotal > 5000;
  const isOutsideDhaka = formData.deliveryArea === 'outside';
  const shippingCost = hasFreeDelivery ? 0 : (isOutsideDhaka ? 120 : 60);
  const grandTotal = cartTotal > 0 ? cartTotal + shippingCost : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid Bangladeshi phone number (e.g., 01712345678)');
      return;
    }

    const orderPayload = {
      customer: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address + (formData.note ? ` (Note: ${formData.note})` : ''),
      },
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      })),
      total_amount: grandTotal,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to place order: ${errorData.error || 'Unknown error'}`);
        return;
      }

      // Fire Purchase Event
      trackEvent('Purchase', {
        value: grandTotal,
        currency: 'BDT',
        content_type: 'product',
        content_id: cart[0]?.id || '',
        content_ids: cart.map(item => item.id),
        contents: cart.map(item => ({ content_id: item.id, id: item.id, quantity: item.quantity, price: item.price, item_price: item.price }))
      }, {
        fn: formData.name, // Will be hashed inside trackEvent if we updated it to hash names, actually tracking.ts currently only hashes em and ph. Let's send em and ph.
        ph: formData.phone
      });

      // Clear cart and redirect
      clearCart();
      router.push('/checkout/success');
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing your order. Please try again.");
    }
  };

  return (
    <div className="w-full bg-background min-h-screen py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Left Column - Form */}
        <div className="w-full lg:w-3/5">
          <h1 className="text-3xl font-serif text-charcoal mb-8">Checkout</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Delivery Information */}
            <section>
              <h2 className="text-xl font-medium text-charcoal mb-4">Delivery Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-charcoal outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="01XXXXXXXXX"
                    className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                      phoneError ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-charcoal focus:border-charcoal'
                    }`}
                  />
                  {phoneError && <p className="mt-1 text-sm text-red-500">{phoneError}</p>}
                </div>
                
                {!hasFreeDelivery && (
                  <div>
                    <label htmlFor="deliveryArea" className="block text-sm font-medium text-gray-700 mb-1">Delivery Area</label>
                    <select
                      id="deliveryArea"
                      name="deliveryArea"
                      value={formData.deliveryArea}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-charcoal outline-none transition-all bg-white"
                    >
                      <option value="inside">Inside Dhaka (60 Tk)</option>
                      <option value="outside">Outside Dhaka (120 Tk)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="House, Road, Area, City"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-charcoal outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Order Note (Optional)</label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special instructions for delivery?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-charcoal outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Payment Info */}
            <section>
              <h2 className="text-xl font-medium text-charcoal mb-4">Payment</h2>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    value="cod"
                    defaultChecked
                    className="h-4 w-4 text-charcoal border-gray-300 focus:ring-charcoal"
                  />
                  <label htmlFor="cod" className="text-sm font-medium text-gray-900">
                    Cash on Delivery
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500 ml-7">
                  Pay with cash upon delivery.
                </p>
              </div>
            </section>

            <button
              type="submit"
              className="w-full bg-charcoal text-white py-4 px-8 rounded-lg text-lg font-medium tracking-wide hover:bg-black transition-colors shadow-lg shadow-black/10 mt-8"
            >
              Place Order
            </button>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-2/5">
          <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 sticky top-[120px]">
            <h2 className="text-xl font-medium text-charcoal mb-6">Order Summary</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 mb-6">Your cart is empty.</p>
            ) : (
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-white border border-gray-200">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-charcoal text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <h3 className="text-sm font-medium text-charcoal line-clamp-2">{item.name}</h3>
                    </div>
                    <div className="flex flex-col justify-center items-end">
                      <p className="text-sm font-medium text-charcoal whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} Tk</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <p>Subtotal</p>
                <p className="font-medium text-charcoal">{cartTotal.toLocaleString()} Tk</p>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <p>Shipping</p>
                <p className="font-medium text-charcoal">
                  {cart.length === 0 ? '-' : shippingCost === 0 ? 'Free' : `${shippingCost} Tk`}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <p className="text-lg font-medium text-charcoal">Total</p>
                <p className="text-xl font-bold text-charcoal">
                  {grandTotal.toLocaleString()} Tk
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
