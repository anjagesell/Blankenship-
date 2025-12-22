import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Edit2, Trash2, Save, Loader2, FileText, ZoomIn, ZoomOut, Eye, ArrowUp, ArrowDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const ADMIN_PASSWORD = '02071951';

// Track monthly folder view for analytics
const useMonthlyPageTracker = (monthDate) => {
  const hasLogged = useRef(false);
  
  useEffect(() => {
    if (hasLogged.current || !monthDate) return;
    hasLogged.current = true;
    
    const logPageVisit = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/visitor/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_accessed: monthDate,
            access_granted: true
          })
        });
      } catch (error) {
        console.error('Failed to log monthly page visit:', error);
      }
    };
    
    logPageVisit();
  }, [monthDate]);
};

// Exhibit Viewer Modal - View Only (no download for readers)
const ExhibitViewer = ({ file, onClose, isAdmin }) => {
  const [zoom, setZoom] = useState(100);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  if (!file) return null;
  
  const fileType = file.file_type?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(fileType);
  const isPdf = fileType === 'pdf';
  const fileUrl = `${BACKEND_URL}/api/file/${file.file_id}`;
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0, 0, 0, 0.95)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 sm:p-4 rounded-t-lg"
          style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
            border: '2px solid #d4af37',
            borderBottom: 'none',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
            <span className="text-white font-semibold text-sm sm:text-base truncate" style={{ fontFamily: 'Georgia, serif' }}>
              {file.filename || 'Exhibit'}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {isImage && !imageError && (
              <>
                <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1.5 sm:p-2 rounded hover:bg-white/10 transition-colors" style={{ color: '#d4af37' }} title="Zoom Out">
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="text-white text-xs sm:text-sm min-w-[40px] text-center hidden sm:inline">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-1.5 sm:p-2 rounded hover:bg-white/10 transition-colors" style={{ color: '#d4af37' }} title="Zoom In">
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}
            {/* Only show open in new tab for admin */}
            {isAdmin && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 rounded hover:bg-white/10 transition-colors" style={{ color: '#d4af37' }} title="Open in New Tab">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            )}
            <button onClick={onClose} className="p-1.5 sm:p-2 rounded hover:bg-white/10 transition-colors" style={{ color: '#ff6b6b' }} title="Close">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div 
          className="flex-1 overflow-auto rounded-b-lg flex items-center justify-center"
          style={{
            background: '#1a1a1a',
            border: '2px solid #d4af37',
            borderTop: 'none',
            minHeight: '300px',
          }}
        >
          {loading && isImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#d4af37' }} />
            </div>
          )}
          
          {isImage && !imageError ? (
            <img 
              src={fileUrl} 
              alt={file.filename || 'Exhibit'}
              onLoad={() => setLoading(false)}
              onError={() => { setImageError(true); setLoading(false); }}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh', 
                transform: `scale(${zoom / 100})`, 
                transition: 'transform 0.2s ease',
                display: loading ? 'none' : 'block',
                pointerEvents: 'none', // Prevent right-click save
              }} 
              onContextMenu={(e) => e.preventDefault()} // Disable right-click
              draggable={false}
            />
          ) : isPdf ? (
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0`} 
              title={file.filename} 
              className="w-full h-full" 
              style={{ minHeight: '70vh', background: '#fff' }} 
            />
          ) : (
            <div className="text-center p-6 sm:p-8">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#d4af37' }} />
              <p className="text-white mb-2 text-sm sm:text-base">
                {imageError ? 'Unable to load preview.' : 'Preview not available for this file type.'}
              </p>
              <p className="text-gray-400 text-xs">File: {file.filename}</p>
            </div>
          )}
        </div>
        
        {/* Watermark/Notice for readers */}
        {!isAdmin && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded text-xs" style={{ background: 'rgba(0,0,0,0.7)', color: '#d4af37' }}>
            View Only — Protected Evidence
          </div>
        )}
      </div>
    </div>
  );
};

const MonthlyDetail = ({ monthDate, isAdmin, adminInfo, onClose }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [month, year] = monthDate.split('/');
  
  // Track this monthly folder view for analytics
  useMonthlyPageTracker(monthDate);
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[parseInt(month)];
  const [uploading, setUploading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);
  const [exhibitFiles, setExhibitFiles] = useState({});
  const [viewingFile, setViewingFile] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Get admin name for tracking
  const adminName = adminInfo?.name || 'Admin';

  // Fetch entries from backend
  useEffect(() => {
    fetchEntries();
  }, [monthDate, lastUpdate]);

  // Real-time polling for updates every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchEntriesSilent();
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [monthDate]);

  // Fetch exhibit files when entries change
  useEffect(() => {
    if (entries.length > 0) {
      entries.forEach(entry => {
        if (entry.id && !entry.id.startsWith('temp-')) {
          fetchExhibitFiles(entry.id);
        }
      });
    }
  }, [entries]);

  const fetchExhibitFiles = async (entryId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/files/${entryId}`);
      if (response.ok) {
        const files = await response.json();
        setExhibitFiles(prev => ({ ...prev, [entryId]: files }));
      }
    } catch (error) {
      console.error('Failed to fetch exhibit files:', error);
    }
  };

  const handleDeleteFile = async (fileId, entryId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/file/${fileId}?admin_password=${ADMIN_PASSWORD}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Immediate refresh
        await fetchExhibitFiles(entryId);
        triggerRefresh();
      }
    } catch (error) {
      alert('Failed to delete file');
    }
  };

  // Silent fetch (no loading spinner) for polling
  const fetchEntriesSilent = async () => {
    try {
      const monthKey = monthDate.replace('/', '-');
      const response = await fetch(`${BACKEND_URL}/api/monthly/${monthKey}`);
      if (response.ok) {
        const data = await response.json();
        // Only update if data has changed
        if (JSON.stringify(data) !== JSON.stringify(entries)) {
          setEntries(data);
        }
      }
    } catch (error) {
      console.error('Silent fetch failed:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      // Replace / with - for URL
      const monthKey = monthDate.replace('/', '-');
      const response = await fetch(`${BACKEND_URL}/api/monthly/${monthKey}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Failed to fetch monthly entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger an immediate refresh
  const triggerRefresh = () => {
    setLastUpdate(Date.now());
  };

  const handleAdd = () => {
    const newEntry = {
      id: `temp-${Date.now()}`,
      month_key: monthDate,
      date: '',
      time: '',
      witness: '',
      description: '',
      evidence: '',
      notes: '',
      isNew: true
    };
    setEditingId(newEntry.id);
    setEditForm(newEntry);
    setEntries([...entries, newEntry]);
  };

  // Insert entry above or below a specific line
  const handleInsert = (index, position) => {
    const newEntry = {
      id: `temp-${Date.now()}`,
      month_key: monthDate,
      date: '',
      time: '',
      witness: '',
      description: '',
      evidence: '',
      notes: '',
      isNew: true,
      insertAt: position === 'above' ? index : index + 1
    };
    
    // Insert at the correct position
    const insertIndex = position === 'above' ? index : index + 1;
    const newEntries = [...entries];
    newEntries.splice(insertIndex, 0, newEntry);
    
    setEntries(newEntries);
    setEditingId(newEntry.id);
    setEditForm(newEntry);
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isNew = editForm.isNew || editForm.id?.startsWith('temp-');
      
      if (isNew) {
        const response = await fetch(`${BACKEND_URL}/api/monthly/create?admin_password=${ADMIN_PASSWORD}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            month_key: monthDate,
            date: editForm.date,
            time: editForm.time,
            witness: editForm.witness,
            description: editForm.description,
            evidence: editForm.evidence,
            notes: editForm.notes,
            admin_name: adminName
          })
        });
        
        if (response.ok) {
          const savedEntry = await response.json();
          setEntries(entries.map(e => 
            e.id === editingId ? savedEntry : e
          ));
          triggerRefresh(); // Immediate refresh
        } else {
          throw new Error('Failed to save entry');
        }
      } else {
        const response = await fetch(`${BACKEND_URL}/api/monthly/${editForm.id}?admin_password=${ADMIN_PASSWORD}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: editForm.date,
            time: editForm.time,
            witness: editForm.witness,
            description: editForm.description,
            evidence: editForm.evidence,
            notes: editForm.notes,
            admin_name: adminName
          })
        });
        
        if (response.ok) {
          const updatedEntry = await response.json();
          setEntries(entries.map(e => 
            e.id === editingId ? updatedEntry : e
          ));
          triggerRefresh(); // Immediate refresh
        } else {
          throw new Error('Failed to update entry');
        }
      }
      
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (editForm.isNew || editForm.id?.startsWith('temp-')) {
      setEntries(entries.filter(e => e.id !== editingId));
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/monthly/${id}?admin_password=${ADMIN_PASSWORD}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setEntries(entries.filter(e => e.id !== id));
          triggerRefresh(); // Immediate refresh
        } else {
          throw new Error('Failed to delete entry');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const handleReassignLineNumbers = async () => {
    if (window.confirm('This will reorder all entries by TIME (earliest first). Continue?')) {
      try {
        const monthKey = monthDate.replace('/', '-');
        const response = await fetch(`${BACKEND_URL}/api/monthly/${monthKey}/reassign?admin_password=${ADMIN_PASSWORD}`, {
          method: 'POST'
        });
        
        if (response.ok) {
          alert('Line numbers reassigned by time order! Refreshing...');
          triggerRefresh(); // Immediate refresh
        } else {
          throw new Error('Failed to reassign');
        }
      } catch (error) {
        console.error('Reassign error:', error);
        alert('Failed to reassign line numbers. Please try again.');
      }
    }
  };

  const handleChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpload = async (entryId) => {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif,.mp4,.mov,.avi,.wmv,.mpeg,.mpg,.flv,.mp3,.wav,.aac,.ogg,.flac,.aiff';
    
    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      setUploadingFor(entryId);
      setUploading(true);
      
      try {
        const adminPassword = '02071951'; // Admin password
        
        // Upload each file
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('entry_id', entryId);
          formData.append('admin_password', adminPassword);
          
          const response = await fetch(`${BACKEND_URL}/api/upload`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
          }
        }
        
        alert(`Successfully uploaded ${files.length} file(s)!`);
        // Refresh the exhibit files for this entry
        await fetchExhibitFiles(entryId);
        triggerRefresh(); // Immediate refresh
      } catch (error) {
        alert(`Upload failed: ${error.message}`);
      } finally {
        setUploading(false);
        setUploadingFor(null);
      }
    };
    
    fileInput.click();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
          border: '4px solid #d4af37',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
          borderRadius: '4px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-4 sm:p-6 flex items-center justify-between"
          style={{
            borderBottom: '3px solid #d4af37',
          }}
        >
          <div>
            <h2 
              className="text-xl sm:text-2xl md:text-3xl font-bold gold-embossed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {monthName} {year} - DETAILED LOG
            </h2>
            <p 
              className="text-yellow-600/80 text-xs sm:text-sm mt-1"
              style={{ fontFamily: 'Garamond, serif' }}
            >
              Complete day-by-day record for cross-reference investigation
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={handleReassignLineNumbers}
                  className="px-3 py-2 rounded flex items-center gap-2 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(145deg, #17a2b8 0%, #138496 100%)',
                    color: '#fff',
                    border: '2px solid #117a8b',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '11px',
                  }}
                  title="Reorder entries by time (earliest first)"
                >
                  🔄 Reassign #s
                </button>
                <button
                  onClick={handleAdd}
                  className="px-3 py-2 rounded flex items-center gap-2 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(145deg, #d4af37 0%, #c5a028 50%, #9c7a1f 100%)',
                    color: '#1a0f0a',
                    border: '2px solid #8b6914',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Entry
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-yellow-900/30 rounded transition-colors"
              style={{ color: '#d4af37' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div 
          className="overflow-auto p-4 sm:p-6"
          style={{
            maxHeight: 'calc(90vh - 120px)',
          }}
        >
          <div 
            className="overflow-x-auto"
            style={{
              background: 'linear-gradient(to bottom, #f4e8c1 0%, #e8dcc8 100%)',
              border: '3px solid #8b6914',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr 
                  style={{
                    background: 'linear-gradient(to bottom, #3a2617 0%, #2b1810 100%)',
                    borderBottom: '2px solid #8b6914',
                  }}
                >
                  <th 
                    className="px-2 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Arial, sans-serif',
                      borderRight: '1px solid #8b6914',
                      width: '40px',
                    }}
                  >
                    #
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Arial, sans-serif',
                      borderRight: '1px solid #8b6914',
                    }}
                  >
                    Date
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Arial, sans-serif',
                      borderRight: '1px solid #8b6914',
                    }}
                  >
                    Time
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Arial, sans-serif',
                      borderRight: '1px solid #8b6914',
                    }}
                  >
                    Witness/Person
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Arial, sans-serif',
                      borderRight: '1px solid #8b6914',
                    }}
                  >
                    Description
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Arial, sans-serif',
                      borderRight: '1px solid #8b6914',
                      width: '100px',
                    }}
                  >
                    Evidence
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Arial, sans-serif',
                      borderRight: '1px solid #8b6914',
                      minWidth: '300px',
                    }}
                  >
                    Notes
                  </th>
                  {/* Exhibits column - visible to ALL users */}
                  <th 
                    className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: 'Arial, sans-serif',
                      borderRight: isAdmin ? '1px solid #8b6914' : 'none',
                    }}
                  >
                    Exhibits
                  </th>
                  {isAdmin && (
                    <>
                      <th 
                        className="px-2 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                        style={{ 
                          color: '#2ecc71',
                          fontFamily: 'Arial, sans-serif',
                          borderRight: '1px solid #8b6914',
                          background: 'rgba(46, 204, 113, 0.15)',
                        }}
                      >
                        Insert
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                        style={{ 
                          color: '#d4af37',
                          fontFamily: 'Arial, sans-serif',
                          borderRight: '1px solid #8b6914',
                        }}
                      >
                        Edit
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                        style={{ 
                          color: '#ff6b6b',
                          fontFamily: 'Arial, sans-serif',
                          background: 'rgba(220, 53, 69, 0.3)',
                        }}
                      >
                        🗑️
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? "11" : "8"} className="px-3 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d4af37' }} />
                        <span className="text-sm italic" style={{ color: '#5D4037' }}>Loading entries...</span>
                      </div>
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? "11" : "8"} className="px-3 py-6 text-center text-sm italic" style={{ color: '#5D4037' }}>
                      {isAdmin 
                        ? 'No entries yet. Click "Add Entry" to begin documenting this month.'
                        : 'No detailed entries for this month yet.'
                      }
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => (
                    <tr 
                      key={entry.id}
                      style={{
                        background: index % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(244,232,193,0.4)',
                        borderBottom: '1px solid #8b6914',
                      }}
                      className="hover:bg-yellow-100/50 transition-colors"
                    >
                      {editingId === entry.id ? (
                        // Edit Mode
                        <>
                          <td className="px-2 py-2 text-center text-xs font-bold" style={{ color: '#8b6914', borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                            {index + 1}
                          </td>
                          <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                            <input
                              type="text"
                              value={editForm.date}
                              onChange={(e) => handleChange('date', e.target.value)}
                              placeholder="MM/DD/YYYY"
                              className="w-full px-2 py-1 text-xs rounded"
                              style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723', fontFamily: 'Courier, monospace' }}
                            />
                          </td>
                          <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                            <input
                              type="text"
                              value={editForm.time}
                              onChange={(e) => handleChange('time', e.target.value)}
                              placeholder="HH:MM"
                              className="w-full px-2 py-1 text-xs rounded"
                              style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723', fontFamily: 'Courier, monospace' }}
                            />
                          </td>
                          <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                            <input
                              type="text"
                              value={editForm.witness}
                              onChange={(e) => handleChange('witness', e.target.value)}
                              placeholder="Name"
                              className="w-full px-2 py-1 text-xs rounded"
                              style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723' }}
                            />
                          </td>
                          <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => handleChange('description', e.target.value)}
                              placeholder="Description"
                              rows="2"
                              className="w-full px-2 py-1 text-xs rounded"
                              style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723' }}
                            />
                          </td>
                          <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                            <input
                              type="text"
                              value={editForm.evidence}
                              onChange={(e) => handleChange('evidence', e.target.value)}
                              placeholder="Evidence ref"
                              className="w-full px-2 py-1 text-xs rounded"
                              style={{ background: '#fff', border: '1px solid #8b6914', color: '#8b0000' }}
                            />
                          </td>
                          <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                            <textarea
                              value={editForm.notes}
                              onChange={(e) => handleChange('notes', e.target.value)}
                              placeholder="Notes"
                              rows="2"
                              className="w-full px-2 py-1 text-xs rounded"
                              style={{ background: '#fff', border: '1px solid #8b6914', color: '#5D4037' }}
                            />
                          </td>
                          <td className="px-2 py-2 text-center" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="p-1 rounded hover:scale-110 transition-all disabled:opacity-50"
                                style={{ background: '#28a745', color: '#fff' }}
                                title="Save"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="p-1 rounded hover:scale-110 transition-all disabled:opacity-50"
                                style={{ background: '#dc3545', color: '#fff' }}
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center" style={{ background: 'rgba(220, 53, 69, 0.1)' }}>
                            <span className="text-[10px] italic" style={{ color: '#999' }}>Save first</span>
                          </td>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <td 
                            className="px-2 py-3 text-center text-xs sm:text-sm font-bold"
                            style={{ color: '#8b6914', fontFamily: 'Courier, monospace', borderRight: '1px solid rgba(139,105,20,0.3)' }}
                          >
                            {index + 1}
                          </td>
                          <td 
                            className="px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap"
                            style={{ color: '#3E2723', fontFamily: 'Courier, monospace', borderRight: '1px solid rgba(139,105,20,0.3)' }}
                          >
                            {entry.date}
                          </td>
                          <td 
                            className="px-3 py-3 text-xs sm:text-sm whitespace-nowrap"
                            style={{ color: '#3E2723', fontFamily: 'Courier, monospace', borderRight: '1px solid rgba(139,105,20,0.3)' }}
                          >
                            {entry.time}
                          </td>
                          <td 
                            className="px-3 py-3 text-xs sm:text-sm font-semibold"
                            style={{ color: '#2c1810', fontFamily: 'Arial, sans-serif', borderRight: '1px solid rgba(139,105,20,0.3)' }}
                          >
                            {entry.witness}
                          </td>
                          <td 
                            className="px-3 py-3 text-xs sm:text-sm"
                            style={{ color: '#3E2723', fontFamily: 'Arial, sans-serif', borderRight: '1px solid rgba(139,105,20,0.3)' }}
                          >
                            {entry.description}
                          </td>
                          <td 
                            className="px-3 py-3 text-xs sm:text-sm font-medium"
                            style={{ color: '#8b0000', fontFamily: 'Arial, sans-serif', borderRight: '1px solid rgba(139,105,20,0.3)' }}
                          >
                            {entry.evidence}
                          </td>
                          <td 
                            className="px-3 py-3 text-xs sm:text-sm italic"
                            style={{ color: '#5D4037', fontFamily: 'Arial, sans-serif', borderRight: '1px solid rgba(139,105,20,0.3)', minWidth: '300px', maxWidth: '400px', lineHeight: '1.6' }}
                          >
                            {entry.notes}
                            {/* Show last edited by - visible to everyone */}
                            {entry.last_edited_by && (
                              <div className="mt-2 pt-2 border-t border-yellow-900/20">
                                <span className="text-[10px] not-italic" style={{ color: '#8b6914' }}>
                                  Last edited by Admin. {entry.last_edited_by}
                                </span>
                              </div>
                            )}
                          </td>
                          {/* Exhibits column - visible to ALL users */}
                          <td className="px-2 py-2">
                            <div className="flex flex-wrap items-center gap-1">
                              {/* Show uploaded files to everyone - opens in popup viewer */}
                              {(exhibitFiles[entry.id] || []).map((file, fileIndex) => (
                                <div key={file.file_id} className="inline-flex items-center">
                                  <button
                                    onClick={() => setViewingFile(file)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] hover:opacity-80 cursor-pointer"
                                    style={{ 
                                      background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)', 
                                      color: '#1a0f0a', 
                                      fontWeight: 'bold',
                                      borderRadius: isAdmin ? '4px 0 0 4px' : '4px',
                                      border: 'none'
                                    }}
                                    title={`View ${file.filename}`}
                                  >
                                    <FileText className="w-3 h-3" />
                                    Ex.{fileIndex + 1}
                                  </button>
                                  {/* Delete button - admin only */}
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDeleteFile(file.file_id, entry.id)}
                                      className="px-1 py-1 text-[10px] hover:bg-red-700"
                                      style={{ background: '#dc3545', color: '#fff', borderRadius: '0 4px 4px 0' }}
                                      title="Delete file"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {/* Upload button - admin only */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleUpload(entry.id)}
                                  disabled={uploading && uploadingFor === entry.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded transition-all hover:scale-105 disabled:opacity-50"
                                  style={{
                                    background: uploading && uploadingFor === entry.id 
                                      ? '#999' 
                                      : 'linear-gradient(145deg, #28a745 0%, #1e7e34 100%)',
                                    color: '#fff',
                                    border: '1px solid #1e7e34',
                                  }}
                                >
                                  <Upload className="w-3 h-3" />
                                  {uploading && uploadingFor === entry.id ? '...' : '+'}
                                </button>
                              )}
                              {/* Show message if no files and not admin */}
                              {!isAdmin && (exhibitFiles[entry.id] || []).length === 0 && (
                                <span className="text-[10px] italic" style={{ color: '#999' }}>—</span>
                              )}
                            </div>
                          </td>
                          {isAdmin && (
                            <>
                              {/* Insert Above/Below buttons */}
                              <td className="px-1 py-2 text-center" style={{ borderRight: '1px solid rgba(139,105,20,0.3)', background: 'rgba(46, 204, 113, 0.05)' }}>
                                <div className="flex flex-col items-center gap-1">
                                  <button
                                    onClick={() => handleInsert(index, 'above')}
                                    className="p-1 rounded hover:scale-110 transition-all"
                                    style={{ background: 'linear-gradient(145deg, #2ecc71 0%, #27ae60 100%)', color: '#fff' }}
                                    title="Insert line above"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleInsert(index, 'below')}
                                    className="p-1 rounded hover:scale-110 transition-all"
                                    style={{ background: 'linear-gradient(145deg, #2ecc71 0%, #27ae60 100%)', color: '#fff' }}
                                    title="Insert line below"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              {/* Edit button */}
                              <td className="px-2 py-2 text-center" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="p-1.5 rounded hover:scale-110 transition-all"
                                  style={{ background: '#ffc107', color: '#000' }}
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </td>
                              {/* Delete button */}
                              <td className="px-2 py-2 text-center" style={{ background: 'rgba(220, 53, 69, 0.1)' }}>
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="p-2 rounded hover:scale-110 transition-all"
                                  style={{ background: '#dc3545', color: '#fff' }}
                                  title="Delete this line"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </>
                          )}
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          <div 
            className="mt-4 p-3 text-xs sm:text-sm italic text-center"
            style={{ 
              color: '#d4af37',
              fontFamily: 'Garamond, serif',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
            }}
          >
            {isAdmin 
              ? 'Each row represents a specific event. Click "Upload" to attach documents, photos, videos, or audio files.'
              : 'Each row represents a specific event documented in the investigation. Admin access required for uploads.'
            }
          </div>
        </div>
      </div>
      
      {/* Exhibit Viewer Modal */}
      {viewingFile && (
        <ExhibitViewer 
          file={viewingFile} 
          onClose={() => setViewingFile(null)} 
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default MonthlyDetail;
