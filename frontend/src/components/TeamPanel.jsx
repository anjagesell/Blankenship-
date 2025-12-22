import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const TeamPanel = ({ isOpen, onClose, adminInfo }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnerView, setIsOwnerView] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && adminInfo?.id) {
      fetchTeam();
    }
  }, [isOpen, adminInfo]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/team?admin_id=${adminInfo.id}`);
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
        setIsOwnerView(data.is_owner_view);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/team/create?admin_id=${adminInfo.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, password: newPassword })
      });
      
      if (response.ok) {
        setNewName('');
        setNewPassword('');
        setShowAddForm(false);
        fetchTeam();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to add team member');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleRemoveAdmin = async (targetId, targetName) => {
    if (!window.confirm(`Remove Admin. ${targetName} from the team?`)) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/team/${targetId}?admin_id=${adminInfo.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchTeam();
      } else {
        alert('Failed to remove team member');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[80vh] overflow-hidden rounded-lg shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #0a0a12 0%, #1a1a2e 50%, #0a0a12 100%)',
          border: '3px solid #d4af37',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{
            background: 'linear-gradient(180deg, #1a0f0a 0%, rgba(26,15,10,0.95) 100%)',
            borderBottom: '2px solid #8b6914',
          }}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: '#d4af37' }} />
            <h2 className="text-lg font-bold" style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}>
              TEAM
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchTeam} className="p-2 hover:bg-white/10 rounded" style={{ color: '#d4af37' }}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded" style={{ color: '#d4af37' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
          {/* Show/Hide Passwords Toggle (owner only) */}
          {isOwnerView && (
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="mb-4 flex items-center gap-2 text-sm px-3 py-2 rounded"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid #8b6914' }}
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
            </button>
          )}

          {/* Admin List */}
          <div className="space-y-2">
            {admins.map((admin) => (
              <div 
                key={admin.id}
                className="flex items-center justify-between p-3 rounded"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333' }}
              >
                <div>
                  <div className="font-semibold" style={{ color: '#d4af37' }}>
                    Admin. {admin.name}
                    {admin.is_owner && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(46,204,113,0.2)', color: '#2ecc71' }}>
                        Owner
                      </span>
                    )}
                  </div>
                  {isOwnerView && showPasswords && (
                    <div className="text-xs mt-1 font-mono" style={{ color: '#888' }}>
                      Password: {admin.password}
                    </div>
                  )}
                  <div className="text-xs mt-1" style={{ color: '#666' }}>
                    Added: {new Date(admin.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Remove button (owner only, can't remove self) */}
                {isOwnerView && !admin.is_owner && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.id, admin.name)}
                    className="p-2 hover:bg-red-900/30 rounded"
                    style={{ color: '#e74c3c' }}
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Admin (owner only) */}
          {isOwnerView && (
            <div className="mt-4">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 rounded flex items-center justify-center gap-2 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
                    color: '#1a0f0a',
                    fontWeight: 'bold',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Team Member
                </button>
              ) : (
                <form onSubmit={handleAddAdmin} className="space-y-3 p-4 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333' }}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name (e.g., Smith)"
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{ background: '#1a1a2e', border: '1px solid #8b6914', color: '#fff' }}
                    required
                  />
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-3 py-2 rounded text-sm font-mono"
                    style={{ background: '#1a1a2e', border: '1px solid #8b6914', color: '#fff' }}
                    required
                  />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded text-sm font-bold"
                      style={{ background: '#2ecc71', color: '#fff' }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddForm(false); setError(''); }}
                      className="flex-1 py-2 rounded text-sm"
                      style={{ background: '#333', color: '#fff' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPanel;
