'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'salesperson' // default role
  });

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1] || '';
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/users', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    if (formData.password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      setMessage({ text: 'User created successfully!', type: 'success' });
      setFormData({ email: '', password: '', role: 'salesperson' });
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-charcoal mb-2">Staff Management</h1>
          <p className="text-gray-500">Manage administrator and salesperson accounts.</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm mb-8 border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create User Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-10">
            <h3 className="font-serif text-xl text-charcoal mb-6 border-b border-gray-100 pb-4">Add New Staff</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label" htmlFor="email">Email Address</label>
                <input 
                  id="email" 
                  type="email" 
                  className="input" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="staff@example.com" 
                  required 
                />
              </div>
              
              <div>
                <label className="input-label" htmlFor="password">Password</label>
                <input 
                  id="password" 
                  type="password" 
                  className="input" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder="Min. 6 characters" 
                  required 
                />
              </div>

              <div>
                <label className="input-label" htmlFor="role">Role</label>
                <select 
                  id="role" 
                  className="input" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="salesperson">Salesperson (Orders & Dashboard Only)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full mt-4">
                {saving ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">Loading staff...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">No staff found.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-medium text-charcoal">{user.email}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
