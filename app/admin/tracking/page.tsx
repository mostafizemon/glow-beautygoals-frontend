'use client';
import { getApiUrl } from '@/lib/api';

import { useEffect, useState } from 'react';

export default function AdminTrackingConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const getAuthToken = () => {
    if (typeof document !== 'undefined') {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1] || '';
    }
    return '';
  };
  
  const [formData, setFormData] = useState({
    meta: {
      pixel_id: '',
      access_token: '',
      test_event_code: '',
      is_active: false
    },
    tiktok: {
      pixel_id: '',
      access_token: '',
      test_event_code: '',
      is_active: false
    }
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/admin/config/tracking`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.meta) {
          setFormData({
            meta: data.meta,
            tiktok: data.tiktok
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch tracking config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${getApiUrl()}/api/v1/admin/config/tracking`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save configuration');
      
      setMessage({ text: 'Tracking configuration saved successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  const handleMetaChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      meta: { ...prev.meta, [field]: value }
    }));
  };

  const handleTikTokChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      tiktok: { ...prev.tiktok, [field]: value }
    }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-charcoal mb-2">Tracking & Analytics</h1>
        <p className="text-gray-500">Configure Meta (Facebook) and TikTok Server-Side Dual Tracking.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm mb-8 border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Meta Configuration */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-serif text-xl text-charcoal flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </span>
              Meta Pixel & Conversions API
            </h3>
            <div className="flex items-center">
              <input id="meta_active" type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-600" checked={formData.meta.is_active} onChange={e => handleMetaChange('is_active', e.target.checked)} />
              <label htmlFor="meta_active" className="ml-2 text-sm font-medium text-gray-700">Enable Meta Tracking</label>
            </div>
          </div>

          <div className={`space-y-6 ${!formData.meta.is_active && 'opacity-50 pointer-events-none transition-opacity'}`}>
            <div>
              <label className="input-label" htmlFor="meta_pixel">Pixel ID</label>
              <input id="meta_pixel" type="text" className="input" value={formData.meta.pixel_id} onChange={e => handleMetaChange('pixel_id', e.target.value)} placeholder="e.g. 123456789012345" />
            </div>
            
            <div>
              <label className="input-label" htmlFor="meta_token">Conversions API Access Token</label>
              <textarea id="meta_token" className="input min-h-[80px]" value={formData.meta.access_token} onChange={e => handleMetaChange('access_token', e.target.value)} placeholder="EAABw..." />
            </div>

            <div>
              <label className="input-label" htmlFor="meta_test">Test Event Code (Optional)</label>
              <input id="meta_test" type="text" className="input" value={formData.meta.test_event_code} onChange={e => handleMetaChange('test_event_code', e.target.value)} placeholder="TEST12345" />
              <p className="text-xs text-gray-500 mt-1">If provided, events will be sent to the Meta Event Manager Test Tab.</p>
            </div>
          </div>
        </div>

        {/* TikTok Configuration */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-serif text-xl text-charcoal flex items-center">
              <span className="bg-black text-white p-2 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-.84 4.39-2.22 6.09-1.39 1.71-3.26 2.87-5.37 3.25-2.12.38-4.32.2-6.28-.71-1.95-.91-3.55-2.45-4.47-4.41C-.71 19.12-.34 16.9.46 14.92c.81-1.98 2.21-3.64 4.01-4.73 1.81-1.09 3.94-1.54 5.96-1.19.01.01.01.01.01.02.01 1.34 0 2.68.01 4.02-.75-.12-1.51-.15-2.26-.06-.75.09-1.47.38-2.06.87-.59.49-1.02 1.13-1.22 1.86-.2.73-.18 1.51.05 2.23.23.72.68 1.37 1.25 1.84.57.47 1.27.76 2.01.81.74.05 1.49-.1 2.14-.42.65-.32 1.2-1.01 1.38-1.74.14-.54.14-1.11.12-1.67V.02z"/></svg>
              </span>
              TikTok Pixel & Events API
            </h3>
            <div className="flex items-center">
              <input id="tiktok_active" type="checkbox" className="w-5 h-5 text-black rounded border-gray-300 focus:ring-black" checked={formData.tiktok.is_active} onChange={e => handleTikTokChange('is_active', e.target.checked)} />
              <label htmlFor="tiktok_active" className="ml-2 text-sm font-medium text-gray-700">Enable TikTok Tracking</label>
            </div>
          </div>

          <div className={`space-y-6 ${!formData.tiktok.is_active && 'opacity-50 pointer-events-none transition-opacity'}`}>
            <div>
              <label className="input-label" htmlFor="tiktok_pixel">Pixel ID</label>
              <input id="tiktok_pixel" type="text" className="input" value={formData.tiktok.pixel_id} onChange={e => handleTikTokChange('pixel_id', e.target.value)} placeholder="e.g. C1234567890ABCDEF" />
            </div>
            
            <div>
              <label className="input-label" htmlFor="tiktok_token">Events API Access Token</label>
              <textarea id="tiktok_token" className="input min-h-[80px]" value={formData.tiktok.access_token} onChange={e => handleTikTokChange('access_token', e.target.value)} placeholder="0123456789abcdef..." />
            </div>

            <div>
              <label className="input-label" htmlFor="tiktok_test">Test Event Code (Optional)</label>
              <input id="tiktok_test" type="text" className="input" value={formData.tiktok.test_event_code} onChange={e => handleTikTokChange('test_event_code', e.target.value)} placeholder="TEST12345" />
              <p className="text-xs text-gray-500 mt-1">If provided, events will be sent to the TikTok Event Manager Test Tab.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="btn-primary min-w-[200px]">
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

      </form>
    </div>
  );
}
