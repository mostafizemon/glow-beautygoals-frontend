"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackingScripts from "../components/TrackingScripts";
import { CartProvider, useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import FloatingContact from "../components/FloatingContact";

function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="glass-nav py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300 fixed top-0 w-full z-50">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 -ml-2 text-text-main focus:outline-none"
        >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Logo */}
      <Link href="/" className="flex items-center group">
        <Image
          src="/logo.png"
          alt="Glow & Beauty Goals"
          width={180}
          height={72}
          className="h-14 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          priority
        />
      </Link>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center space-x-8">
        <Link
          href="/"
          className="text-sm font-medium tracking-wide hover:text-brand-gold transition-colors"
        >
          HOME
        </Link>
        <Link
          href="/shop"
          className="text-sm font-medium tracking-wide hover:text-brand-gold transition-colors"
        >
          SHOP ALL
        </Link>
      </div>

      {/* Cart Icon */}
      <div className="flex items-center">
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center space-x-2 text-sm font-medium hover:text-brand-gold transition-colors group"
        >
          <span className="hidden md:inline">CART</span>
          <div className="relative">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="absolute -top-1.5 -right-2 bg-brand-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </div>
        </button>
      </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[72px] left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 z-40 md:hidden flex flex-col"
          >
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="px-6 py-4 border-b border-gray-50 text-charcoal font-medium hover:bg-rose-gold/10 hover:text-rose-gold transition-colors"
            >
              HOME
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="px-6 py-4 text-charcoal font-medium hover:bg-rose-gold/10 hover:text-rose-gold transition-colors"
            >
              SHOP ALL
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <TrackingScripts />
      <Navbar />
      <CartDrawer />
      <FloatingContact />

      {/* Main Content */}
      <main className="flex-grow pt-[72px] md:pt-[88px]">{children}</main>
    </CartProvider>
  );
}
