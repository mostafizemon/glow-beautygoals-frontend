import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="w-full bg-background min-h-[80vh] flex flex-col items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {/* Checkmark Icon */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h1 className="text-3xl font-serif text-charcoal mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Thank you for shopping with Glow & Beauty. We've received your order and will process it right away. We will contact you soon regarding your delivery.
        </p>

        <Link 
          href="/shop"
          className="inline-block w-full bg-charcoal text-white py-4 px-8 rounded-full text-sm font-bold tracking-wider hover:bg-black transition-colors shadow-lg shadow-black/10"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
