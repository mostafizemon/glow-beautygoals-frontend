'use client';

import { useState, useEffect } from 'react';

import { getApiUrl } from '@/lib/api';
const API_URL = getApiUrl();

const getAuthToken = () =>
  document.cookie
    .split('; ')
    .find(row => row.startsWith('admin_token='))
    ?.split('=')[1] || '';

export default function AdminSettings() {
  // --- Password ---
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

  // --- Contact ---
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMsg, setContactMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch(`${API_URL}/api/v1/config/contact`)
      .then(r => r.json())
      .then(data => {
        setWhatsapp(data.whatsapp || '');
        setPhone(data.phone || '');
        setIsActive(data.is_active ?? true);
      })
      .catch(console.error);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg({ text: '', type: '' });
    if (password.length < 6) {
      setPwMsg({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setPwMsg({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setPwMsg({ text: 'Password updated successfully!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMsg({ text: err.message, type: 'error' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactMsg({ text: '', type: '' });
    setContactLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/config/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ whatsapp, phone, is_active: isActive }),
      });
      if (!res.ok) throw new Error('Failed to save contact info');
      setContactMsg({ text: 'Contact info saved successfully!', type: 'success' });
    } catch (err: any) {
      setContactMsg({ text: err.message, type: 'error' });
    } finally {
      setContactLoading(false);
    }
  };

  const Alert = ({ msg }: { msg: { text: string; type: string } }) =>
    msg.text ? (
      <div
        className={`p-4 rounded-lg text-sm mb-6 border ${
          msg.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-100'
            : 'bg-red-50 text-red-600 border-red-100'
        }`}
      >
        {msg.text}
      </div>
    ) : null;

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-charcoal mb-2">Settings</h1>
        <p className="text-gray-500">Manage your store configuration and account security.</p>
      </div>

      {/* Contact Floating Buttons */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-serif text-xl text-charcoal">Contact Floating Buttons</h3>
            <p className="text-xs text-gray-400 mt-0.5">Numbers shown on the storefront as WhatsApp &amp; Call buttons</p>
          </div>
        </div>

        <Alert msg={contactMsg} />

        <form onSubmit={handleContactSubmit} className="space-y-5">
          <div>
            <label className="input-label" htmlFor="whatsapp_number">
              WhatsApp Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
              <input
                id="whatsapp_number"
                type="tel"
                className="input pl-7"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="8801XXXXXXXXX (with country code)"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Include country code, e.g. 8801711234567 for Bangladesh</p>
          </div>

          <div>
            <label className="input-label" htmlFor="call_number">
              Phone / Call Number
            </label>
            <input
              id="call_number"
              type="tel"
              className="input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              id="contact_active"
              type="checkbox"
              className="w-5 h-5 text-rose-gold rounded border-gray-300 focus:ring-rose-gold"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            <label htmlFor="contact_active" className="text-sm font-medium text-charcoal">
              Show floating contact buttons on storefront
            </label>
          </div>

          <button type="submit" disabled={contactLoading} className="btn-primary w-full sm:w-auto min-w-[200px]">
            {contactLoading ? 'Saving...' : 'Save Contact Info'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-serif text-xl text-charcoal mb-6 border-b border-gray-100 pb-4">Change Password</h3>

        <Alert msg={pwMsg} />

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="input-label" htmlFor="new_password">New Password</label>
            <input
              id="new_password"
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              required
            />
          </div>
          <div>
            <label className="input-label" htmlFor="confirm_password">Confirm New Password</label>
            <input
              id="confirm_password"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary w-full sm:w-auto min-w-[200px]">
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
