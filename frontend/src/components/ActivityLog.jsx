import React, { useState, useEffect } from 'react';
import { X, History, RefreshCw, User, FileText, Trash2, Upload, Edit2, Plus, Users } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ActivityLog = ({ isOpen, onClose, adminInfo }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isOpen && adminInfo?.id) {
      fetchLogs();
    }
  }, [isOpen, adminInfo]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/activity?admin_id=${adminInfo.id}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'created': return <Plus className="w-4 h-4" style={{ color: '#2ecc71' }} />;
      case 'edited': return <Edit2 className="w-4 h-4" style={{ color: '#3498db' }} />;
      case 'deleted': return <Trash2 className="w-4 h-4" style={{ color: '#e74c3c' }} />;
      case 'uploaded': return <Upload className="w-4 h-4" style={{ color: '#9b59b6' }} />;
      case 'added': return <Users className="w-4 h-4" style={{ color: '#2ecc71' }} />;
      case 'removed': return <Users className="w-4 h-4" style={{ color: '#e74c3c' }} />;
      default: return <FileText className="w-4 h-4" style={{ color: '#888' }} />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'created': return '#2ecc71';
      case 'edited': return '#3498db';
      case 'deleted': return '#e74c3c';
      case 'uploaded': return '#9b59b6';
      case 'added': return '#2ecc71';
      case 'removed': return '#e74c3c';
      default: return '#888';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    // Less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    // Less than 24 hours
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
    // Otherwise show date
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-lg shadow-2xl"
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
            <History className="w-5 h-5" style={{ color: '#d4af37' }} />
            <h2 className="text-lg font-bold" style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}>
              ACTIVITY LOG
            </h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37' }}>
              {total} actions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLogs} className="p-2 hover:bg-white/10 rounded" style={{ color: '#d4af37' }}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded" style={{ color: '#d4af37' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#d4af37' }} />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#666' }}>
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded transition-colors hover:bg-white/5"
                  style={{ borderLeft: `3px solid ${getActionColor(log.action)}` }}
                >
                  <div className="mt-0.5">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" style={{ color: '#d4af37' }}>
                        Admin. {log.admin_name}
                      </span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: `${getActionColor(log.action)}20`, color: getActionColor(log.action) }}
                      >
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#ccc' }}>
                      {log.target_description}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#666' }}>
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
