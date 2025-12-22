import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

const AdminLogin = ({ onAdminLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Admin password verification
    if (password === '02071951') {
      onAdminLogin();
      setError('');
    } else {
      setError('Incorrect admin password');
      setPassword('');
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
        <form onSubmit={handleSubmit} className="p-6">
          <p 
            className="text-yellow-600/80 text-sm mb-4"
            style={{ fontFamily: 'Garamond, serif' }}
          >
            Enter admin password to enable upload functionality
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full px-4 py-3 rounded text-lg font-semibold"
            style={{
              background: 'linear-gradient(145deg, #f4e8c1 0%, #e8dcc8 100%)',
              border: '2px solid #8b6914',
              color: '#3E2723',
              fontFamily: 'Courier, monospace',
            }}
            autoFocus
          />

          {error && (
            <p 
              className="text-red-500 text-sm mt-2 font-semibold"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-6 px-6 py-3 rounded text-lg font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(145deg, #d4af37 0%, #c5a028 50%, #9c7a1f 100%)',
              color: '#1a0f0a',
              border: '2px solid #8b6914',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              fontFamily: 'Georgia, serif',
            }}
          >
            Login as Admin
          </button>

          <p 
            className="text-yellow-600/60 text-xs mt-4 text-center italic"
            style={{ fontFamily: 'Garamond, serif' }}
          >
            Admin access grants file upload privileges
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
