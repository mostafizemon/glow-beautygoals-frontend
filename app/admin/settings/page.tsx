'use client';

import { useState } from 'react';

export default function AdminSettings() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/users/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ new_password: password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-charcoal mb-2">Account Settings</h1>
        <p className="text-gray-500">Manage your account security and preferences.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-serif text-xl text-charcoal mb-6 border-b border-gray-100 pb-4">Change Password</h3>
        
        {message.text && (
          <div className={`p-4 rounded-lg text-sm mb-6 border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto min-w-[200px]">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
