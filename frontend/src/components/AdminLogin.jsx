import React, { useState } from 'react';
import { Lock, X, User } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminLogin = ({ onAdminLogin, onClose }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Pass admin info to parent
        onAdminLogin(data.admin);
      } else {
        setError('Invalid name or password');
        setPassword('');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md"
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
          border: '4px solid #d4af37',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
          borderRadius: '8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 flex items-center justify-between"
          style={{
            borderBottom: '3px solid #d4af37',
          }}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6" style={{ color: '#d4af37' }} />
            <h2 
              className="text-xl sm:text-2xl font-bold gold-embossed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              ADMIN ACCESS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-900/30 rounded transition-colors"
            style={{ color: '#d4af37' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p 
            className="text-yellow-600/80 text-sm mb-4"
            style={{ fontFamily: 'Garamond, serif' }}
          >
            Enter your credentials to access admin features
          </p>

          {/* Name Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8b6914' }} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full pl-11 pr-4 py-3 rounded text-lg font-semibold"
              style={{
                background: 'linear-gradient(145deg, #f4e8c1 0%, #e8dcc8 100%)',
                border: '2px solid #8b6914',
                color: '#3E2723',
                fontFamily: 'Georgia, serif',
              }}
              autoFocus
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8b6914' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3 rounded text-lg font-semibold"
              style={{
                background: 'linear-gradient(145deg, #f4e8c1 0%, #e8dcc8 100%)',
                border: '2px solid #8b6914',
                color: '#3E2723',
                fontFamily: 'Courier, monospace',
              }}
              required
            />
          </div>

          {error && (
            <p 
              className="text-red-500 text-sm font-semibold"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-6 py-3 rounded text-lg font-bold uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: 'linear-gradient(145deg, #d4af37 0%, #c5a028 50%, #9c7a1f 100%)',
              color: '#1a0f0a',
              border: '2px solid #8b6914',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              fontFamily: 'Georgia, serif',
            }}
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
