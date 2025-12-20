import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, ArrowUpDown, Upload, FileText, Search, Printer, Eye, Download, ZoomIn, ZoomOut, GitBranch } from 'lucide-react';
import Genogram from './Genogram';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const ADMIN_PASSWORD = '02071951';

// Exhibit Viewer Modal Component
const ExhibitViewer = ({ file, onClose }) => {
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
              {file.filename || 'Unknown File'}
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
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 rounded hover:bg-white/10 transition-colors" style={{ color: '#d4af37' }} title="Open in New Tab">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
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
                maxHeight: '60vh', 
                transform: `scale(${zoom / 100})`, 
                transition: 'transform 0.2s ease',
                display: loading ? 'none' : 'block'
              }} 
            />
          ) : isPdf ? (
            <iframe src={fileUrl} title={file.filename} className="w-full h-full" style={{ minHeight: '60vh', background: '#fff' }} />
          ) : (
            <div className="text-center p-6 sm:p-8">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#d4af37' }} />
              <p className="text-white mb-2 text-sm sm:text-base">
                {imageError ? 'Unable to load image preview.' : 'Preview not available for this file type.'}
              </p>
              <p className="text-gray-400 mb-4 text-xs">File type: {fileType || 'unknown'}</p>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm sm:text-base" 
                style={{ background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)', color: '#1a0f0a', fontWeight: 'bold' }}
              >
                <Download className="w-4 h-4" /> Open File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Print Report Component
const PrintReport = ({ entries, exhibitFiles, onClose }) => {
  const printRef = useRef();
  
  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Blankenship Evidence Timeline Report</title>
          <style>
            body { font-family: Georgia, serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #8b6914; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 28px; color: #8b6914; margin-bottom: 5px; }
            .header p { color: #666; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #2c3e50; color: #d4af37; padding: 12px 8px; text-align: left; font-size: 12px; text-transform: uppercase; }
            td { padding: 10px 8px; border-bottom: 1px solid #ddd; font-size: 11px; vertical-align: top; }
            tr:nth-child(even) { background: #f9f6f0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #8b6914; text-align: center; font-size: 10px; color: #666; }
            .exhibit-badge { display: inline-block; background: #d4af37; color: #1a0f0a; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; margin-right: 4px; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(0, 0, 0, 0.9)' }} onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4" style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', borderBottom: '3px solid #d4af37' }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#d4af37' }} />
            <span className="text-white font-semibold text-sm sm:text-base" style={{ fontFamily: 'Georgia, serif' }}>Print Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-all hover:scale-105 text-xs sm:text-sm" style={{ background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)', color: '#1a0f0a', fontWeight: 'bold' }}>
              <Printer className="w-3 h-3 sm:w-4 sm:h-4" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 sm:p-2 rounded hover:bg-white/10 transition-colors" style={{ color: '#ff6b6b' }}>
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
        
        {/* Preview */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-100">
          <div ref={printRef} className="bg-white p-4 sm:p-8 shadow-lg" style={{ minHeight: '400px' }}>
            <div className="header">
              <h1>⚖️ BLANKENSHIP JUDICIAL ARCHIVES</h1>
              <p>Evidence Timeline Report</p>
              <p style={{ fontSize: '12px' }}>Generated: {currentDate}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Date</th>
                  <th style={{ width: '8%' }}>Time</th>
                  <th style={{ width: '15%' }}>Witness</th>
                  <th style={{ width: '25%' }}>Description</th>
                  <th style={{ width: '15%' }}>Exhibit</th>
                  <th style={{ width: '25%' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const files = exhibitFiles[entry.id] || [];
                  return (
                    <tr key={entry.id}>
                      <td style={{ fontFamily: 'Courier, monospace', fontWeight: 'bold' }}>{entry.date}</td>
                      <td style={{ fontFamily: 'Courier, monospace' }}>{entry.time}</td>
                      <td style={{ fontWeight: 'bold' }}>{entry.witness}</td>
                      <td>{entry.description}</td>
                      <td>
                        {files.map((f, i) => (<span key={f.file_id} className="exhibit-badge">Ex. {i + 1}</span>))}
                        {entry.evidence && <div style={{ marginTop: '4px', color: '#8b0000' }}>{entry.evidence}</div>}
                      </td>
                      <td style={{ fontStyle: 'italic', color: '#5D4037' }}>{entry.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="footer">
              <p><strong>CONFIDENTIAL - PROTECTED EVIDENCE</strong></p>
              <p>Unauthorized distribution is prohibited.</p>
              <p style={{ marginTop: '10px' }}>Total Entries: {entries.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Card Component for entries
const MobileEntryCard = ({ entry, index, isAdmin, exhibitFiles, onEdit, onDelete, onUpload, uploadingFor, onViewExhibit, onDeleteExhibit }) => {
  const files = exhibitFiles[entry.id] || [];
  
  return (
    <div 
      className="p-4 rounded-lg mb-3"
      style={{
        background: index % 2 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(244,232,193,0.9)',
        border: '2px solid #8b6914',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Date & Time Header */}
      <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: '1px solid #8b6914' }}>
        <div>
          <span className="font-bold text-sm" style={{ color: '#3E2723', fontFamily: 'Courier, monospace' }}>{entry.date}</span>
          {entry.time && <span className="ml-2 text-xs" style={{ color: '#666' }}>@ {entry.time}</span>}
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(entry)} className="p-1.5 rounded" style={{ background: '#ffc107', color: '#000' }}><Edit2 className="w-3 h-3" /></button>
            <button onClick={() => onDelete(entry.id)} className="p-1.5 rounded" style={{ background: '#dc3545', color: '#fff' }}><Trash2 className="w-3 h-3" /></button>
          </div>
        )}
      </div>
      
      {/* Witness */}
      {entry.witness && (
        <div className="mb-2">
          <span className="text-xs uppercase font-bold" style={{ color: '#8b6914' }}>Witness/Person:</span>
          <p className="font-semibold text-sm" style={{ color: '#2c1810' }}>{entry.witness}</p>
        </div>
      )}
      
      {/* Description */}
      {entry.description && (
        <div className="mb-2">
          <span className="text-xs uppercase font-bold" style={{ color: '#8b6914' }}>Description:</span>
          <p className="text-sm" style={{ color: '#3E2723' }}>{entry.description}</p>
        </div>
      )}
      
      {/* Exhibit */}
      <div className="mb-2">
        <span className="text-xs uppercase font-bold" style={{ color: '#8b6914' }}>Exhibit:</span>
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {files.map((file, i) => (
            <div key={file.file_id} className="inline-flex items-center">
              <button onClick={() => onViewExhibit(file)} className="inline-flex items-center gap-1 px-2 py-1 text-xs" style={{ background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)', color: '#1a0f0a', fontWeight: 'bold', borderRadius: isAdmin ? '4px 0 0 4px' : '4px' }}>
                <FileText className="w-3 h-3" /> Ex. {i + 1}
              </button>
              {isAdmin && (
                <button onClick={() => onDeleteExhibit(file.file_id, entry.id)} className="px-1.5 py-1 text-xs" style={{ background: '#dc3545', color: '#fff', borderRadius: '0 4px 4px 0' }}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {entry.evidence && <span className="text-xs font-medium" style={{ color: '#8b0000' }}>{entry.evidence}</span>}
          {isAdmin && (
            <button onClick={() => onUpload(entry.id)} disabled={uploadingFor === entry.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ background: uploadingFor === entry.id ? '#999' : 'linear-gradient(145deg, #28a745 0%, #1e7e34 100%)', color: '#fff', fontWeight: 'bold' }}>
              <Upload className="w-3 h-3" /> {uploadingFor === entry.id ? '...' : 'Upload'}
            </button>
          )}
        </div>
      </div>
      
      {/* Notes */}
      {entry.notes && (
        <div>
          <span className="text-xs uppercase font-bold" style={{ color: '#8b6914' }}>Notes:</span>
          <p className="text-sm italic" style={{ color: '#5D4037', lineHeight: '1.5' }}>{entry.notes}</p>
        </div>
      )}
    </div>
  );
};

const Timeline = ({ isAdmin }) => {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [uploadingFor, setUploadingFor] = useState(null);
  const [exhibitFiles, setExhibitFiles] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingExhibit, setViewingExhibit] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [clearingFiles, setClearingFiles] = useState(false);
  const [showGenogram, setShowGenogram] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { fetchEntries(); }, []);

  useEffect(() => {
    if (entries.length > 0) {
      entries.forEach(entry => fetchExhibitFiles(entry.id));
    }
  }, [entries.length]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/timeline`);
      if (response.ok) setEntries(await response.json());
    } catch (error) {
      console.error('Failed to fetch timeline entries:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.date?.toLowerCase().includes(query) ||
      entry.time?.toLowerCase().includes(query) ||
      entry.witness?.toLowerCase().includes(query) ||
      entry.description?.toLowerCase().includes(query) ||
      entry.evidence?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query)
    );
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date(0);
      const parts = dateStr.split('/');
      if (parts.length === 3) return new Date(parts[2], parts[0] - 1, parts[1]);
      if (parts.length === 2) return new Date(parts[1], parts[0] - 1, 1);
      return new Date(0);
    };
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  const handleAdd = () => {
    const newEntry = { id: `temp-${Date.now()}`, date: '', time: '', witness: '', description: '', evidence: '', notes: '', isNew: true };
    setEditingId(newEntry.id);
    setEditForm(newEntry);
    setEntries([...entries, newEntry]);
  };

  const handleEdit = (entry) => { setEditingId(entry.id); setEditForm({ ...entry }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isNew = editForm.isNew || editForm.id.startsWith('temp-');
      const url = isNew ? `${BACKEND_URL}/api/timeline/create?admin_password=${ADMIN_PASSWORD}` : `${BACKEND_URL}/api/timeline/${editForm.id}?admin_password=${ADMIN_PASSWORD}`;
      const method = isNew ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: editForm.date, time: editForm.time, witness: editForm.witness, description: editForm.description, evidence: editForm.evidence, notes: editForm.notes })
      });
      if (response.ok) {
        const savedEntry = await response.json();
        setEntries(entries.map(e => e.id === editingId ? savedEntry : e));
      } else throw new Error('Failed to save');
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
    if (editForm.isNew || editForm.id?.startsWith('temp-')) setEntries(entries.filter(e => e.id !== editingId));
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/timeline/${id}?admin_password=${ADMIN_PASSWORD}`, { method: 'DELETE' });
        if (response.ok) setEntries(entries.filter(e => e.id !== id));
        else throw new Error('Failed to delete');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete entry.');
      }
    }
  };

  const handleChange = (field, value) => setEditForm({ ...editForm, [field]: value });

  const handleExhibitUpload = async (entryId) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif';
    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      setUploadingFor(entryId);
      try {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('entry_id', entryId);
          formData.append('admin_password', ADMIN_PASSWORD);
          const response = await fetch(`${BACKEND_URL}/api/upload`, { method: 'POST', body: formData });
          if (!response.ok) throw new Error('Upload failed');
        }
        await fetchExhibitFiles(entryId);
        alert(`Uploaded ${files.length} exhibit(s)!`);
      } catch (error) {
        alert(`Upload failed: ${error.message}`);
      } finally {
        setUploadingFor(null);
      }
    };
    fileInput.click();
  };

  // Clear all old broken files (one-time cleanup)
  const handleClearOldFiles = async () => {
    if (!window.confirm('This will remove all old exhibit records so you can re-upload them fresh. Continue?')) {
      return;
    }
    
    setClearingFiles(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/files/clear-all?admin_password=${ADMIN_PASSWORD}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Done! ${result.message}`);
        // Clear local exhibit files state
        setExhibitFiles({});
      } else {
        throw new Error('Failed to clear files');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setClearingFiles(false);
    }
  };

  // Delete individual exhibit file
  const handleDeleteExhibit = async (fileId, entryId) => {
    if (!window.confirm('Delete this exhibit file?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/file/${fileId}?admin_password=${ADMIN_PASSWORD}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh exhibit files for this entry
        await fetchExhibitFiles(entryId);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  const getExhibitDisplay = (entryId, showDeleteBtn = false) => {
    const files = exhibitFiles[entryId] || [];
    if (files.length === 0) return null;
    return files.map((file, index) => (
      <div key={file.file_id} className="inline-flex items-center mr-1 mb-1">
        <button 
          onClick={() => setViewingExhibit(file)} 
          className="inline-flex items-center gap-1 px-2 py-1 rounded-l text-[10px] hover:opacity-80 cursor-pointer" 
          style={{ background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)', color: '#1a0f0a', fontWeight: 'bold', border: 'none', borderRadius: showDeleteBtn ? '4px 0 0 4px' : '4px' }} 
          title={`View ${file.filename}`}
        >
          <FileText className="w-3 h-3" /> Ex. {index + 1}
        </button>
        {showDeleteBtn && (
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteExhibit(file.file_id, entryId); }}
            className="px-1.5 py-1 text-[10px] hover:bg-red-700 transition-colors"
            style={{ background: '#dc3545', color: '#fff', borderRadius: '0 4px 4px 0' }}
            title="Delete this exhibit"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="w-full mb-8 sm:mb-12">
      {viewingExhibit && <ExhibitViewer file={viewingExhibit} onClose={() => setViewingExhibit(null)} />}
      {showPrintModal && <PrintReport entries={sortedEntries} exhibitFiles={exhibitFiles} onClose={() => setShowPrintModal(false)} />}
      {showGenogram && <Genogram entries={sortedEntries} exhibitFiles={exhibitFiles} onClose={() => setShowGenogram(false)} />}

      {/* Genogram Button - Above Timeline */}
      <div className="mb-3 sm:mb-4 flex justify-center">
        <button
          onClick={() => setShowGenogram(true)}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 transition-all hover:scale-105 shadow-lg"
          style={{
            background: 'linear-gradient(145deg, #2c3e50 0%, #1a252f 100%)',
            color: '#d4af37',
            border: '3px solid #d4af37',
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
          }}
        >
          <span className="text-xl sm:text-2xl">🌳</span>
          <div className="text-left">
            <div className="text-sm sm:text-base">View Genogram</div>
            <div className="text-[10px] sm:text-xs text-yellow-600/70 font-normal">Visual Case Map</div>
          </div>
          <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
        </button>
      </div>

      {/* Timeline Header */}
      <div className="p-3 sm:p-4 md:p-6 mb-3 sm:mb-4" style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', border: '3px solid #d4af37', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
        {/* Title - Mobile Centered */}
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold gold-embossed mb-1" style={{ fontFamily: 'Georgia, serif' }}>EVIDENCE TIMELINE</h2>
          <p className="text-yellow-600/80 text-xs sm:text-sm uppercase tracking-wider hidden sm:block" style={{ fontFamily: 'Garamond, serif' }}>Chronological Record of Events</p>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-3 sm:mb-4">
          <button onClick={toggleSortOrder} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded flex items-center gap-1 sm:gap-2 transition-all hover:scale-105 text-xs sm:text-sm" style={{ background: 'linear-gradient(145deg, #4a5568 0%, #2d3748 100%)', color: '#d4af37', border: '2px solid #8b6914', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }} title={sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}>
            <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{sortOrder === 'asc' ? 'Earliest' : 'Latest'}</span> →
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowPrintModal(true)} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded flex items-center gap-1 sm:gap-2 transition-all hover:scale-105 text-xs sm:text-sm" style={{ background: 'linear-gradient(145deg, #4a5568 0%, #2d3748 100%)', color: '#d4af37', border: '2px solid #8b6914', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
              <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            {isAdmin && (
              <>
                <button 
                  onClick={handleClearOldFiles}
                  disabled={clearingFiles}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded flex items-center gap-1 sm:gap-2 transition-all hover:scale-105 text-xs sm:text-sm disabled:opacity-50" 
                  style={{ background: 'linear-gradient(145deg, #dc3545 0%, #a71d2a 100%)', color: '#fff', border: '2px solid #a71d2a', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}
                  title="Clear old broken exhibit files"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{clearingFiles ? '...' : 'Clear Files'}</span>
                </button>
                <button onClick={handleAdd} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded flex items-center gap-1 sm:gap-2 transition-all hover:scale-105 text-xs sm:text-sm" style={{ background: 'linear-gradient(145deg, #d4af37 0%, #c5a028 50%, #9c7a1f 100%)', color: '#1a0f0a', border: '2px solid #8b6914', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#8b6914' }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search entries..." className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 rounded text-sm sm:text-base" style={{ background: 'rgba(244, 232, 193, 0.95)', border: '2px solid #8b6914', color: '#3E2723', fontFamily: 'Arial, sans-serif' }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-black/10" style={{ color: '#8b6914' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-xs sm:text-sm" style={{ color: '#d4af37', fontFamily: 'Garamond, serif' }}>
            Found {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </div>
        )}
      </div>

      {/* Content - Mobile Cards or Desktop Table */}
      {isMobile ? (
        /* Mobile Card View */
        <div className="px-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#d4af37' }} />
              <span className="ml-2 text-sm" style={{ color: '#d4af37' }}>Loading...</span>
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="text-center py-8 px-4" style={{ background: 'rgba(244,232,193,0.9)', border: '2px solid #8b6914', borderRadius: '8px' }}>
              <p className="text-sm" style={{ color: '#5D4037' }}>
                {searchQuery ? `No entries matching "${searchQuery}"` : isAdmin ? 'Tap "Add" to create an entry.' : 'No entries yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Edit Form */}
              {editingId && (
                <div className="p-4 rounded-lg mb-3" style={{ background: '#fff', border: '3px solid #d4af37', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}>
                  <h3 className="font-bold mb-3" style={{ color: '#8b6914' }}>{editForm.isNew ? 'New Entry' : 'Edit Entry'}</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={editForm.date} onChange={(e) => handleChange('date', e.target.value)} placeholder="MM/DD/YYYY" className="px-3 py-2 rounded text-sm" style={{ border: '1px solid #8b6914' }} />
                      <input type="text" value={editForm.time} onChange={(e) => handleChange('time', e.target.value)} placeholder="HH:MM" className="px-3 py-2 rounded text-sm" style={{ border: '1px solid #8b6914' }} />
                    </div>
                    <input type="text" value={editForm.witness} onChange={(e) => handleChange('witness', e.target.value)} placeholder="Witness/Person" className="w-full px-3 py-2 rounded text-sm" style={{ border: '1px solid #8b6914' }} />
                    <textarea value={editForm.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Description" rows="2" className="w-full px-3 py-2 rounded text-sm" style={{ border: '1px solid #8b6914' }} />
                    <input type="text" value={editForm.evidence} onChange={(e) => handleChange('evidence', e.target.value)} placeholder="Exhibit description" className="w-full px-3 py-2 rounded text-sm" style={{ border: '1px solid #8b6914', color: '#8b0000' }} />
                    <textarea value={editForm.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Notes..." rows="3" className="w-full px-3 py-2 rounded text-sm" style={{ border: '1px solid #8b6914' }} />
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded font-bold text-sm flex items-center justify-center gap-2" style={{ background: '#28a745', color: '#fff' }}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                      <button onClick={handleCancel} disabled={saving} className="flex-1 py-2 rounded font-bold text-sm flex items-center justify-center gap-2" style={{ background: '#dc3545', color: '#fff' }}>
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Entry Cards */}
              {sortedEntries.filter(e => e.id !== editingId).map((entry, index) => (
                <MobileEntryCard key={entry.id} entry={entry} index={index} isAdmin={isAdmin} exhibitFiles={exhibitFiles} onEdit={handleEdit} onDelete={handleDelete} onUpload={handleExhibitUpload} uploadingFor={uploadingFor} onViewExhibit={setViewingExhibit} onDeleteExhibit={handleDeleteExhibit} />
              ))}
            </>
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto" style={{ background: 'linear-gradient(to bottom, #f4e8c1 0%, #e8dcc8 100%)', border: '3px solid #8b6914', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '4%' }} /> {/* Line # */}
              <col style={{ width: '9%' }} /> {/* Date */}
              <col style={{ width: '6%' }} /> {/* Time */}
              <col style={{ width: '11%' }} /> {/* Witness */}
              <col style={{ width: '19%' }} /> {/* Description */}
              <col style={{ width: '15%' }} /> {/* Exhibit */}
              <col style={{ width: isAdmin ? '26%' : '36%' }} /> {/* Notes */}
              {isAdmin && <col style={{ width: '10%' }} />} {/* Actions */}
            </colgroup>
            <thead>
              <tr style={{ background: 'linear-gradient(to bottom, #3a2617 0%, #2b1810 100%)', borderBottom: '2px solid #8b6914' }}>
                <th className="px-2 py-3 text-center text-xs sm:text-sm font-bold uppercase" style={{ color: '#d4af37', fontFamily: 'Arial', borderRight: '1px solid #8b6914' }}>#</th>
                <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase" style={{ color: '#d4af37', fontFamily: 'Arial', borderRight: '1px solid #8b6914' }}>Date</th>
                <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase" style={{ color: '#d4af37', fontFamily: 'Arial', borderRight: '1px solid #8b6914' }}>Time</th>
                <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase" style={{ color: '#d4af37', fontFamily: 'Arial', borderRight: '1px solid #8b6914' }}>Witness</th>
                <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase" style={{ color: '#d4af37', fontFamily: 'Arial', borderRight: '1px solid #8b6914' }}>Description</th>
                <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase" style={{ color: '#d4af37', fontFamily: 'Arial', borderRight: '1px solid #8b6914' }}>Exhibit</th>
                <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase" style={{ color: '#d4af37', fontFamily: 'Arial', borderRight: isAdmin ? '1px solid #8b6914' : 'none' }}>Notes</th>
                {isAdmin && <th className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase" style={{ color: '#d4af37', fontFamily: 'Arial' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-3 py-8 text-center"><div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d4af37' }} /><span style={{ color: '#5D4037' }}>Loading...</span></div></td></tr>
              ) : sortedEntries.length === 0 ? (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-3 py-8 text-center" style={{ color: '#5D4037' }}>{searchQuery ? `No entries matching "${searchQuery}"` : isAdmin ? 'Click "Add" to create an entry.' : 'No entries yet.'}</td></tr>
              ) : (
                sortedEntries.map((entry, index) => (
                  <tr key={entry.id} style={{ background: index % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(244,232,193,0.4)', borderBottom: '1px solid #8b6914' }} className="hover:bg-yellow-100/50 transition-colors">
                    {editingId === entry.id ? (
                      <>
                        <td className="px-2 py-2 text-center text-sm font-bold" style={{ color: '#8b6914', fontFamily: 'Courier', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{index + 1}</td>
                        <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}><input type="text" value={editForm.date} onChange={(e) => handleChange('date', e.target.value)} placeholder="MM/DD/YYYY" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723', fontFamily: 'Courier' }} /></td>
                        <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}><input type="text" value={editForm.time} onChange={(e) => handleChange('time', e.target.value)} placeholder="HH:MM" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723', fontFamily: 'Courier' }} /></td>
                        <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}><input type="text" value={editForm.witness} onChange={(e) => handleChange('witness', e.target.value)} placeholder="Name" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723' }} /></td>
                        <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}><textarea value={editForm.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Description" rows="2" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723' }} /></td>
                        <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}><input type="text" value={editForm.evidence} onChange={(e) => handleChange('evidence', e.target.value)} placeholder="Exhibit" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#8b0000' }} /></td>
                        <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}><textarea value={editForm.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Notes..." rows="3" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#5D4037', minWidth: '200px' }} /></td>
                        <td className="px-2 py-2 text-center"><div className="flex gap-1 justify-center"><button onClick={handleSave} disabled={saving} className="p-1 rounded hover:scale-110" style={{ background: '#28a745', color: '#fff' }}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}</button><button onClick={handleCancel} disabled={saving} className="p-1 rounded hover:scale-110" style={{ background: '#dc3545', color: '#fff' }}><X className="w-4 h-4" /></button></div></td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-3 text-center text-sm font-bold" style={{ color: '#8b6914', fontFamily: 'Courier', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{index + 1}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap" style={{ color: '#3E2723', fontFamily: 'Courier', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{entry.date}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm whitespace-nowrap" style={{ color: '#3E2723', fontFamily: 'Courier', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{entry.time}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm font-semibold" style={{ color: '#2c1810', fontFamily: 'Arial', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{entry.witness}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm" style={{ color: '#3E2723', fontFamily: 'Arial', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{entry.description}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm" style={{ color: '#8b0000', fontFamily: 'Arial', borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                          <div className="flex flex-wrap items-center gap-1">
                            {getExhibitDisplay(entry.id, isAdmin)}
                            {entry.evidence && <span className="text-xs font-medium block w-full mt-1">{entry.evidence}</span>}
                            {isAdmin && <button onClick={() => handleExhibitUpload(entry.id)} disabled={uploadingFor === entry.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] mt-1" style={{ background: uploadingFor === entry.id ? '#999' : 'linear-gradient(145deg, #28a745 0%, #1e7e34 100%)', color: '#fff', border: '1px solid #1e7e34', fontWeight: 'bold' }}><Upload className="w-3 h-3" />{uploadingFor === entry.id ? '...' : 'Upload'}</button>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs sm:text-sm" style={{ color: '#5D4037', fontFamily: 'Arial', borderRight: isAdmin ? '1px solid rgba(139,105,20,0.3)' : 'none', lineHeight: '1.5' }}><div style={{ maxWidth: '100%', wordWrap: 'break-word' }}>{entry.notes}</div></td>
                        {isAdmin && <td className="px-2 py-2 text-center"><div className="flex gap-1 justify-center"><button onClick={() => handleEdit(entry)} className="p-1 rounded hover:scale-110" style={{ background: '#ffc107', color: '#000' }}><Edit2 className="w-3 h-3" /></button><button onClick={() => handleDelete(entry.id)} className="p-1 rounded hover:scale-110" style={{ background: '#dc3545', color: '#fff' }}><Trash2 className="w-3 h-3" /></button></div></td>}
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 px-2 sm:px-4 py-2 text-xs sm:text-sm italic text-center" style={{ color: '#d4af37', fontFamily: 'Garamond, serif' }}>
        {isMobile ? 'Tap exhibit badges to preview' : 'Click exhibit badges to preview • Click sort to toggle date order'}
      </div>
    </div>
  );
};

export default Timeline;
