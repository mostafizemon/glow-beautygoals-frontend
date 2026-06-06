export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-charcoal mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back to your Glow & Beauty Goals admin portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border-l-4 border-rose-gold">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Sales</h3>
          <p className="text-3xl font-serif text-charcoal">0 Tk</p>
        </div>
        <div className="card p-6 border-l-4 border-blush">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
          <p className="text-3xl font-serif text-charcoal">0</p>
        </div>
        <div className="card p-6 border-l-4 border-charcoal-light">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Products</h3>
          <p className="text-3xl font-serif text-charcoal">0</p>
        </div>
      </div>

      <div className="card p-8 text-center bg-cream-dark/20">
        <svg className="w-16 h-16 text-rose-gold/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        <h3 className="text-xl font-serif text-charcoal mb-2">Getting Started</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">Your store is currently empty. Head over to the Products tab to add your first skincare item and start selling!</p>
        <a href="/admin/products" className="btn-primary">Manage Products</a>
      </div>
    </div>
  );
}
