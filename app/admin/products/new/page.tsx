'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{id: string; name: string; slug: string}[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    offer_price: '',
    stock: '',
    category: 'serum',
    is_featured: false,
    is_free_delivery: false,
    images: [] as string[]
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1] || '';
  };

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/categories')
      .then(res => res.json())
      .then(data => setCategories(data || []))
      .catch(console.error)
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum file size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
    
    // Reset input so the same file can be selected again if removed
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      const data = new FormData();
      data.append('image', file);

      try {
        const res = await fetch('http://localhost:8080/api/v1/admin/products/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: data,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to upload image');
        uploadedUrls.push(result.url);
      } catch (err: any) {
        throw new Error('Image Upload Failed: ' + err.message);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrls = [...formData.images];
      
      // Upload images if selected
      if (imageFiles.length > 0) {
        const urls = await uploadImages();
        imageUrls = [...imageUrls, ...urls];
      }

      // Create product payload
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        offer_price: formData.offer_price ? parseFloat(formData.offer_price) : 0,
        stock: parseInt(formData.stock, 10),
        category: formData.category,
        is_featured: formData.is_featured,
        is_free_delivery: formData.is_free_delivery,
        images: imageUrls.filter(url => url && url.trim() !== ''),
        is_active: true
      };

      console.log("SENDING PAYLOAD TO BACKEND:", payload);

      const res = await fetch('http://localhost:8080/api/v1/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center">
        <Link href="/admin/products" className="text-gray-400 hover:text-charcoal mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-charcoal mb-1">Add New Product</h1>
          <p className="text-gray-500">Create a new item in your catalog</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-8 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-serif text-xl border-b border-gray-100 pb-4">Basic Details</h3>
              
              <div>
                <label className="input-label" htmlFor="name">Product Name</label>
                <input id="name" type="text" required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Luminous Vitamin C Serum" />
              </div>

              <div>
                <label className="input-label" htmlFor="slug">URL Slug (optional)</label>
                <input id="slug" type="text" className="input bg-gray-50" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="luminous-vitamin-c-serum" />
              </div>

              <div>
                <label className="input-label" htmlFor="description">Description</label>
                <textarea id="description" required className="input min-h-[120px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detailed product description..." />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-serif text-xl border-b border-gray-100 pb-4">Pricing & Inventory</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label" htmlFor="price">Regular Price (Tk)</label>
                  <input id="price" type="number" step="0.01" required min="0" className="input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="input-label" htmlFor="offer_price">Offer Price (Tk - Optional)</label>
                  <input id="offer_price" type="number" step="0.01" min="0" className="input bg-gray-50" value={formData.offer_price} onChange={e => setFormData({...formData, offer_price: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="input-label" htmlFor="stock">Stock Quantity</label>
                  <input id="stock" type="number" required min="0" className="input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="100" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-serif text-xl border-b border-gray-100 pb-4">Organization</h3>
              
              <div>
                <label className="input-label" htmlFor="category">Category</label>
                <select id="category" className="input bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categoriesLoading ? (
                    <option>Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="">No categories yet — add one first</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center pt-4">
                <input id="is_featured" type="checkbox" className="w-5 h-5 text-rose-gold rounded border-gray-300 focus:ring-rose-gold" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                <label htmlFor="is_featured" className="ml-3 text-sm font-medium text-charcoal">Featured Product</label>
              </div>
              <p className="text-xs text-gray-500 pl-8 mt-1">Featured products will automatically display on the homepage.</p>

              <div className="flex items-center pt-2">
                <input id="is_free_delivery" type="checkbox" className="w-5 h-5 text-rose-gold rounded border-gray-300 focus:ring-rose-gold" checked={formData.is_free_delivery} onChange={e => setFormData({...formData, is_free_delivery: e.target.checked})} />
                <label htmlFor="is_free_delivery" className="ml-3 text-sm font-medium text-charcoal">Free Delivery</label>
              </div>
              <p className="text-xs text-gray-500 pl-8 mt-1">If checked, shipping will be free for this product.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-serif text-xl border-b border-gray-100 pb-4">Product Images</h3>
              
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square w-full rounded-lg overflow-hidden group">
                        <img src={preview} alt={`Preview ${index}`} className="object-cover w-full h-full" />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-charcoal text-white text-[10px] px-2 py-0.5 rounded shadow">Cover</div>
                        )}
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square w-full rounded-lg bg-gray-50 flex flex-col items-center justify-center mb-4 text-gray-400">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm">No image selected</span>
                  </div>
                )}
                
                <input type="file" id="image" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                <label htmlFor="image" className="cursor-pointer text-sm font-medium text-rose-gold hover:text-charcoal transition-colors">
                  {imagePreviews.length > 0 ? 'Add More Images' : 'Select Images'}
                </label>
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Link href="/admin/products" className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-charcoal mr-4">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary min-w-[200px]">
            {loading ? 'Saving Product...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
