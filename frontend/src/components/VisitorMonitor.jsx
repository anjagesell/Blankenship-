import React, { useState, useEffect } from 'react';
import { X, RefreshCw, MapPin, Globe, Clock, Monitor, Users, Eye, Trash2, ChevronLeft, ChevronRight, BarChart3, FileText, TrendingUp, Calendar } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const ADMIN_PASSWORD = '02071951';

const VisitorMonitor = ({ isOpen, onClose }) => {
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('visitors'); // 'visitors' or 'analytics'
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
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '🌐';
    }
  };

  // Map country names to ISO codes for flags
  const getCountryCode = (countryName) => {
    if (!countryName) return null;
    const countryMap = {
      'united states': 'US',
      'usa': 'US',
      'germany': 'DE',
      'deutschland': 'DE',
      'united kingdom': 'GB',
      'uk': 'GB',
      'great britain': 'GB',
      'canada': 'CA',
      'australia': 'AU',
      'france': 'FR',
      'italy': 'IT',
      'spain': 'ES',
      'netherlands': 'NL',
      'belgium': 'BE',
      'switzerland': 'CH',
      'austria': 'AT',
      'sweden': 'SE',
      'norway': 'NO',
      'denmark': 'DK',
      'finland': 'FI',
      'poland': 'PL',
      'ireland': 'IE',
      'portugal': 'PT',
      'greece': 'GR',
      'russia': 'RU',
      'china': 'CN',
      'japan': 'JP',
      'south korea': 'KR',
      'india': 'IN',
      'brazil': 'BR',
      'mexico': 'MX',
      'argentina': 'AR',
      'south africa': 'ZA',
      'new zealand': 'NZ',
      'singapore': 'SG',
      'hong kong': 'HK',
      'taiwan': 'TW',
      'philippines': 'PH',
      'indonesia': 'ID',
      'malaysia': 'MY',
      'thailand': 'TH',
      'vietnam': 'VN',
      'israel': 'IL',
      'turkey': 'TR',
      'egypt': 'EG',
      'ukraine': 'UA',
      'czech republic': 'CZ',
      'czechia': 'CZ',
      'hungary': 'HU',
      'romania': 'RO',
    };
    return countryMap[countryName.toLowerCase()] || countryName.substring(0, 2).toUpperCase();
  };

  const getPageDisplayName = (pageName) => {
    if (!pageName) return 'Unknown';
    
    // Check if it's a monthly folder (e.g., "11/2013")
    if (/^\d{2}\/\d{4}$/.test(pageName)) {
      const [month, year] = pageName.split('/');
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month)]} ${year}`;
    }
    
    // Capitalize first letter
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  const getPageIcon = (pageName) => {
    if (!pageName) return '📄';
    if (pageName === 'entry') return '🚪';
    if (pageName === 'synopsis') return '📜';
    if (pageName === 'index') return '📁';
    if (pageName === 'violations') return '⚖️';
    if (pageName === 'communication') return '🔗';
    if (/^\d{2}\/\d{4}$/.test(pageName)) return '📂';
    return '📄';
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

        {/* Tab Navigation */}
        <div 
          className="flex border-b"
          style={{ borderColor: '#333', background: 'rgba(0,0,0,0.3)' }}
        >
          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'visitors' ? 'border-b-2' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ 
              borderColor: activeTab === 'visitors' ? '#d4af37' : 'transparent',
              color: activeTab === 'visitors' ? '#d4af37' : '#888'
            }}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-bold">Visitor Log</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'analytics' ? 'border-b-2' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ 
              borderColor: activeTab === 'analytics' ? '#d4af37' : 'transparent',
              color: activeTab === 'analytics' ? '#d4af37' : '#888'
            }}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-bold">Page Analytics</span>
          </button>
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

        {/* Auto-refresh toggle & Clear button */}
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

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          {activeTab === 'visitors' ? (
            /* ========== VISITOR LOG TAB ========== */
            loading && visitors.length === 0 ? (
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
                      <th className="p-2 text-left" style={{ color: '#d4af37' }}>Page</th>
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
                            <span className="whitespace-nowrap text-xs">{formatTimestamp(visitor.timestamp)}</span>
                          </div>
                        </td>
                        <td className="p-2" style={{ color: '#3498db' }}>
                          <div className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            <span className="font-mono text-xs">{visitor.ip_address}</span>
                          </div>
                        </td>
                        <td className="p-2" style={{ color: '#ccc' }}>
                          <div className="flex items-center gap-1">
                            <span className="text-base">{getCountryFlag(visitor.country_code)}</span>
                            <div>
                              <div className="text-xs">{visitor.city || 'Unknown'}</div>
                              <div className="text-xs" style={{ color: '#666' }}>{visitor.country}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2" style={{ color: '#ccc' }}>
                          <div className="flex items-center gap-1">
                            <span>{getPageIcon(visitor.page_accessed)}</span>
                            <span className="text-xs">{getPageDisplayName(visitor.page_accessed)}</span>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          {visitor.access_granted ? (
                            <span 
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{ background: 'rgba(46,204,113,0.3)', color: '#2ecc71' }}
                            >
                              ✓
                            </span>
                          ) : (
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{ background: 'rgba(241,196,15,0.2)', color: '#f1c40f' }}
                            >
                              •
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* ========== PAGE ANALYTICS TAB ========== */
            <div className="space-y-6">
              {/* Page Visits Breakdown */}
              <div>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#d4af37' }}>
                  <FileText className="w-4 h-4" />
                  PAGE VISITS BREAKDOWN
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stats?.page_visits?.map((page, index) => {
                    const maxCount = stats.page_visits[0]?.count || 1;
                    const percentage = (page.count / maxCount) * 100;
                    
                    return (
                      <div 
                        key={index}
                        className="p-3 rounded relative overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333' }}
                      >
                        {/* Progress bar background */}
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{ 
                            background: `linear-gradient(to right, #3498db ${percentage}%, transparent ${percentage}%)` 
                          }}
                        />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getPageIcon(page.page)}</span>
                            <span className="text-sm font-medium" style={{ color: '#ccc' }}>
                              {getPageDisplayName(page.page)}
                            </span>
                          </div>
                          <span 
                            className="text-lg font-bold"
                            style={{ color: '#3498db' }}
                          >
                            {page.count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {(!stats?.page_visits || stats.page_visits.length === 0) && (
                    <div className="col-span-2 text-center py-8" style={{ color: '#666' }}>
                      No page visit data yet
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Folder Interest */}
              {stats?.monthly_folder_visits?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#d4af37' }}>
                    <Calendar className="w-4 h-4" />
                    MOST VIEWED MONTHLY FOLDERS
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {stats.monthly_folder_visits.slice(0, 8).map((month, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded text-center"
                        style={{ 
                          background: index === 0 
                            ? 'rgba(231,76,60,0.2)' 
                            : index === 1 
                              ? 'rgba(241,196,15,0.2)' 
                              : 'rgba(0,0,0,0.3)',
                          border: `1px solid ${index === 0 ? '#e74c3c' : index === 1 ? '#f1c40f' : '#333'}`
                        }}
                      >
                        <div className="text-lg">📂</div>
                        <div className="text-sm font-bold" style={{ color: '#ccc' }}>
                          {getPageDisplayName(month.month)}
                        </div>
                        <div 
                          className="text-xl font-bold"
                          style={{ color: index === 0 ? '#e74c3c' : index === 1 ? '#f1c40f' : '#3498db' }}
                        >
                          {month.count}
                        </div>
                        <div className="text-xs" style={{ color: '#666' }}>views</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Countries */}
              {stats?.top_countries?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#d4af37' }}>
                    <Globe className="w-4 h-4" />
                    VISITORS BY COUNTRY
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {stats.top_countries.slice(0, 10).map((country, index) => (
                      <div 
                        key={index}
                        className="p-2 rounded text-center"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333' }}
                      >
                        <div className="text-2xl mb-1">
                          {getCountryFlag(country.country?.substring(0, 2).toUpperCase())}
                        </div>
                        <div className="text-xs truncate" style={{ color: '#ccc' }}>
                          {country.country || 'Unknown'}
                        </div>
                        <div className="text-sm font-bold" style={{ color: '#9b59b6' }}>
                          {country.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interest Insights */}
              <div 
                className="p-4 rounded"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(139,105,20,0.1) 100%)',
                  border: '1px solid #8b6914'
                }}
              >
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#d4af37' }}>
                  <TrendingUp className="w-4 h-4" />
                  INSIGHTS
                </h3>
                <div className="text-xs space-y-1" style={{ color: '#ccc' }}>
                  {stats?.page_visits?.[0] && (
                    <p>• Most visited page: <strong>{getPageDisplayName(stats.page_visits[0].page)}</strong> ({stats.page_visits[0].count} views)</p>
                  )}
                  {stats?.monthly_folder_visits?.[0] && (
                    <p>• Most viewed evidence: <strong>{getPageDisplayName(stats.monthly_folder_visits[0].month)}</strong> ({stats.monthly_folder_visits[0].count} views)</p>
                  )}
                  {stats?.top_countries?.[0] && (
                    <p>• Top visitor country: <strong>{stats.top_countries[0].country}</strong></p>
                  )}
                  {stats?.access_granted > 0 && stats?.total_visitors > 0 && (
                    <p>• Access grant rate: <strong>{Math.round((stats.access_granted / stats.total_visitors) * 100)}%</strong></p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination (only for visitors tab) */}
        {activeTab === 'visitors' && total > limit && (
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
