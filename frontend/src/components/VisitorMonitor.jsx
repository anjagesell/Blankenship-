import React, { useState, useEffect } from 'react';
import { X, RefreshCw, MapPin, Globe, Clock, Monitor, Users, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const ADMIN_PASSWORD = '02071951';

const VisitorMonitor = ({ isOpen, onClose }) => {
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const limit = 20;

  useEffect(() => {
    if (isOpen) {
      fetchVisitors();
      fetchStats();
    }
  }, [isOpen, page]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (isOpen && autoRefresh) {
      const interval = setInterval(() => {
        fetchVisitors();
        fetchStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh, page]);

  const fetchVisitors = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/visitors?admin_password=${ADMIN_PASSWORD}&limit=${limit}&skip=${page * limit}`
      );
      if (response.ok) {
        const data = await response.json();
        setVisitors(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/visitors/stats?admin_password=${ADMIN_PASSWORD}`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear ALL visitor logs? This cannot be undone.')) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/admin/visitors/clear?admin_password=${ADMIN_PASSWORD}`,
          { method: 'DELETE' }
        );
        if (response.ok) {
          alert('Visitor logs cleared successfully!');
          fetchVisitors();
          fetchStats();
        }
      } catch (error) {
        alert('Failed to clear logs');
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode === 'XX' || countryCode === 'LO') return '🌐';
    try {
      // Convert country code to flag emoji
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '🌐';
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-lg shadow-2xl flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #0a0a12 0%, #1a1a2e 50%, #0a0a12 100%)',
          border: '3px solid #d4af37',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 sm:p-4 shrink-0"
          style={{
            background: 'linear-gradient(180deg, #1a0f0a 0%, rgba(26,15,10,0.95) 100%)',
            borderBottom: '2px solid #8b6914',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}>
                VISITOR MONITORING
              </h2>
              <p className="text-xs" style={{ color: '#8b6914' }}>
                Admin Access Only • Real-time Tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchVisitors(); fetchStats(); }}
              className="p-2 hover:bg-blue-900/30 rounded transition-colors"
              style={{ color: '#3498db' }}
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-900/30 rounded transition-colors"
              style={{ color: '#d4af37' }}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div 
            className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3"
            style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid #333' }}
          >
            <div className="text-center p-2 rounded" style={{ background: 'rgba(52,152,219,0.2)' }}>
              <div className="text-xl font-bold" style={{ color: '#3498db' }}>{stats.total_visitors}</div>
              <div className="text-xs" style={{ color: '#888' }}>Total Visits</div>
            </div>
            <div className="text-center p-2 rounded" style={{ background: 'rgba(46,204,113,0.2)' }}>
              <div className="text-xl font-bold" style={{ color: '#2ecc71' }}>{stats.access_granted}</div>
              <div className="text-xs" style={{ color: '#888' }}>Access Granted</div>
            </div>
            <div className="text-center p-2 rounded" style={{ background: 'rgba(155,89,182,0.2)' }}>
              <div className="text-xl font-bold" style={{ color: '#9b59b6' }}>{stats.unique_ips}</div>
              <div className="text-xs" style={{ color: '#888' }}>Unique IPs</div>
            </div>
            <div className="text-center p-2 rounded" style={{ background: 'rgba(241,196,15,0.2)' }}>
              <div className="text-xl font-bold" style={{ color: '#f1c40f' }}>{stats.visitors_last_24h}</div>
              <div className="text-xs" style={{ color: '#888' }}>Last 24h</div>
            </div>
            <div className="text-center p-2 rounded col-span-2 sm:col-span-1" style={{ background: 'rgba(231,76,60,0.2)' }}>
              <div className="text-sm font-bold" style={{ color: '#e74c3c' }}>
                {stats.top_countries?.[0]?.country || 'N/A'}
              </div>
              <div className="text-xs" style={{ color: '#888' }}>Top Country</div>
            </div>
          </div>
        )}

        {/* Auto-refresh toggle */}
        <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
              style={{ accentColor: '#2ecc71' }}
            />
            <span className="text-xs" style={{ color: '#888' }}>Auto-refresh (10s)</span>
          </label>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-red-900/30 transition-colors"
            style={{ color: '#e74c3c', border: '1px solid #e74c3c' }}
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </button>
        </div>

        {/* Visitor Table */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          {loading && visitors.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#d4af37' }} />
            </div>
          ) : visitors.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#555' }} />
                <p style={{ color: '#888' }}>No visitor logs yet</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid #d4af37' }}>
                    <th className="p-2 text-left" style={{ color: '#d4af37' }}>Time</th>
                    <th className="p-2 text-left" style={{ color: '#d4af37' }}>IP Address</th>
                    <th className="p-2 text-left" style={{ color: '#d4af37' }}>Location</th>
                    <th className="p-2 text-left hidden sm:table-cell" style={{ color: '#d4af37' }}>ISP</th>
                    <th className="p-2 text-center" style={{ color: '#d4af37' }}>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor, index) => (
                    <tr 
                      key={visitor.id || index}
                      className="hover:bg-white/5 transition-colors"
                      style={{ borderBottom: '1px solid #333' }}
                    >
                      <td className="p-2" style={{ color: '#ccc' }}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" style={{ color: '#888' }} />
                          <span className="whitespace-nowrap">{formatTimestamp(visitor.timestamp)}</span>
                        </div>
                      </td>
                      <td className="p-2" style={{ color: '#3498db' }}>
                        <div className="flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          <span className="font-mono">{visitor.ip_address}</span>
                        </div>
                      </td>
                      <td className="p-2" style={{ color: '#ccc' }}>
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getCountryFlag(visitor.country_code)}</span>
                          <div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" style={{ color: '#e74c3c' }} />
                              <span>{visitor.city || 'Unknown'}</span>
                            </div>
                            <div className="text-xs" style={{ color: '#888' }}>
                              {visitor.region}, {visitor.country}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 hidden sm:table-cell" style={{ color: '#888' }}>
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{visitor.isp || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {visitor.access_granted ? (
                          <span 
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{ background: 'rgba(46,204,113,0.3)', color: '#2ecc71' }}
                          >
                            ✓ GRANTED
                          </span>
                        ) : (
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{ background: 'rgba(241,196,15,0.2)', color: '#f1c40f' }}
                          >
                            PENDING
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > limit && (
          <div 
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderTop: '1px solid #333', background: 'rgba(0,0,0,0.3)' }}
          >
            <span className="text-xs" style={{ color: '#888' }}>
              Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded disabled:opacity-50 hover:bg-white/10 transition-colors"
                style={{ color: '#d4af37' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm" style={{ color: '#ccc' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded disabled:opacity-50 hover:bg-white/10 transition-colors"
                style={{ color: '#d4af37' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorMonitor;
