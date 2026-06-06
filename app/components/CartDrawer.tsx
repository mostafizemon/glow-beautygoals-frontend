'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
          <h2 className="text-xl font-serif text-charcoal">Your Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-charcoal transition-colors rounded-full hover:bg-gray-50"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
              <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>Your cart is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-sm font-medium text-rose-gold hover:text-charcoal transition-colors border-b border-rose-gold hover:border-charcoal pb-1"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4 group">
                  {/* Item Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-charcoal">
                        <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                        <p className="ml-4 whitespace-nowrap">{item.price.toLocaleString()} Tk</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-500 hover:bg-gray-50 hover:text-charcoal transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-medium text-charcoal min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-500 hover:bg-gray-50 hover:text-charcoal transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        <span className="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50/50">
            <div className="flex justify-between text-lg font-medium text-charcoal mb-4">
              <p>Subtotal</p>
              <p>{cartTotal.toLocaleString()} Tk</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-6 space-y-3">
              <button
                className="w-full flex items-center justify-center rounded-full border border-transparent bg-charcoal px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-black transition-all"
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/checkout');
                }}
              >
                Checkout
              </button>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                or{' '}
                <button
                  type="button"
                  className="font-medium text-rose-gold hover:text-charcoal transition-colors"
                  onClick={() => setIsCartOpen(false)}
                >
                  Continue Shopping
                  <span aria-hidden="true"> &rarr;</span>
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
