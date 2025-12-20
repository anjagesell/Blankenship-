import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, ArrowUpDown, Upload, FileText, Search, Printer, Eye, Download, ZoomIn, ZoomOut } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const ADMIN_PASSWORD = '02071951';

// Exhibit Viewer Modal Component
const ExhibitViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100);
  
  if (!file) return null;
  
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(file.file_type?.toLowerCase());
  const isPdf = file.file_type?.toLowerCase() === 'pdf';
  const fileUrl = `${BACKEND_URL}/api/file/${file.file_id}`;
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.95)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 rounded-t-lg"
          style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
            border: '2px solid #d4af37',
            borderBottom: 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" style={{ color: '#d4af37' }} />
            <span className="text-white font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
              {file.filename}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <button
                  onClick={() => setZoom(z => Math.max(25, z - 25))}
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: '#d4af37' }}
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-sm min-w-[50px] text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom(z => Math.min(200, z + 25))}
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: '#d4af37' }}
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </>
            )}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded hover:bg-white/10 transition-colors"
              style={{ color: '#d4af37' }}
              title="Open in New Tab"
            >
              <Eye className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-white/10 transition-colors"
              style={{ color: '#ff6b6b' }}
              title="Close"
            >
              <X className="w-6 h-6" />
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
            minHeight: '500px',
          }}
        >
          {isImage ? (
            <img 
              src={fileUrl} 
              alt={file.filename}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh',
                transform: `scale(${zoom / 100})`,
                transition: 'transform 0.2s ease',
              }}
            />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={file.filename}
              className="w-full h-full"
              style={{ minHeight: '70vh', background: '#fff' }}
            />
          ) : (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#d4af37' }} />
              <p className="text-white mb-4">Preview not available for this file type.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded"
                style={{
                  background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
                  color: '#1a0f0a',
                  fontWeight: 'bold',
                }}
              >
                <Download className="w-4 h-4" />
                Open File
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
            body { 
              font-family: Georgia, serif; 
              padding: 40px; 
              color: #1a1a1a;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #8b6914; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .header h1 { 
              font-size: 28px; 
              color: #8b6914; 
              margin-bottom: 5px; 
            }
            .header p { 
              color: #666; 
              font-style: italic; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            th { 
              background: #2c3e50; 
              color: #d4af37; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 12px;
              text-transform: uppercase;
            }
            td { 
              padding: 10px 8px; 
              border-bottom: 1px solid #ddd; 
              font-size: 11px;
              vertical-align: top;
            }
            tr:nth-child(even) { background: #f9f6f0; }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 2px solid #8b6914; 
              text-align: center; 
              font-size: 10px; 
              color: #666; 
            }
            .exhibit-badge {
              display: inline-block;
              background: #d4af37;
              color: #1a0f0a;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: bold;
              margin-right: 4px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
            borderBottom: '3px solid #d4af37',
          }}
        >
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5" style={{ color: '#d4af37' }} />
            <span className="text-white font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
              Print Evidence Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
                color: '#1a0f0a',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-white/10 transition-colors"
              style={{ color: '#ff6b6b' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Preview */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div ref={printRef} className="bg-white p-8 shadow-lg" style={{ minHeight: '600px' }}>
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
                  <th style={{ width: '15%' }}>Witness/Person</th>
                  <th style={{ width: '25%' }}>Description</th>
                  <th style={{ width: '15%' }}>Exhibit</th>
                  <th style={{ width: '25%' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const files = exhibitFiles[entry.id] || [];
                  return (
                    <tr key={entry.id}>
                      <td style={{ fontFamily: 'Courier, monospace', fontWeight: 'bold' }}>{entry.date}</td>
                      <td style={{ fontFamily: 'Courier, monospace' }}>{entry.time}</td>
                      <td style={{ fontWeight: 'bold' }}>{entry.witness}</td>
                      <td>{entry.description}</td>
                      <td>
                        {files.map((f, i) => (
                          <span key={f.file_id} className="exhibit-badge">Ex. {i + 1}</span>
                        ))}
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
              <p>This document contains legally protected evidence from the Blankenship Judicial Archives.</p>
              <p>Unauthorized distribution is prohibited.</p>
              <p style={{ marginTop: '10px' }}>Total Entries: {entries.length}</p>
            </div>
          </div>
        </div>
      </div>
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

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      entries.forEach(entry => {
        fetchExhibitFiles(entry.id);
      });
    }
  }, [entries.length]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/timeline`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
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

  // Filter entries by search query
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

  // Sort filtered entries by date
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date(0);
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parts[2], parts[0] - 1, parts[1]);
      } else if (parts.length === 2) {
        return new Date(parts[1], parts[0] - 1, 1);
      }
      return new Date(0);
    };
    
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleAdd = () => {
    const newEntry = {
      id: `temp-${Date.now()}`,
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

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isNew = editForm.isNew || editForm.id.startsWith('temp-');
      
      if (isNew) {
        const response = await fetch(`${BACKEND_URL}/api/timeline/create?admin_password=${ADMIN_PASSWORD}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: editForm.date,
            time: editForm.time,
            witness: editForm.witness,
            description: editForm.description,
            evidence: editForm.evidence,
            notes: editForm.notes
          })
        });
        
        if (response.ok) {
          const savedEntry = await response.json();
          setEntries(entries.map(e => 
            e.id === editingId ? savedEntry : e
          ));
        } else {
          throw new Error('Failed to save entry');
        }
      } else {
        const response = await fetch(`${BACKEND_URL}/api/timeline/${editForm.id}?admin_password=${ADMIN_PASSWORD}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: editForm.date,
            time: editForm.time,
            witness: editForm.witness,
            description: editForm.description,
            evidence: editForm.evidence,
            notes: editForm.notes
          })
        });
        
        if (response.ok) {
          const updatedEntry = await response.json();
          setEntries(entries.map(e => 
            e.id === editingId ? updatedEntry : e
          ));
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
        const response = await fetch(`${BACKEND_URL}/api/timeline/${id}?admin_password=${ADMIN_PASSWORD}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setEntries(entries.filter(e => e.id !== id));
        } else {
          throw new Error('Failed to delete entry');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const handleChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

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
          
          const response = await fetch(`${BACKEND_URL}/api/upload`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
          }
        }
        
        await fetchExhibitFiles(entryId);
        alert(`Successfully uploaded ${files.length} exhibit(s)!`);
      } catch (error) {
        alert(`Upload failed: ${error.message}`);
      } finally {
        setUploadingFor(null);
      }
    };
    
    fileInput.click();
  };

  const getExhibitDisplay = (entryId) => {
    const files = exhibitFiles[entryId] || [];
    if (files.length === 0) return null;
    
    return files.map((file, index) => (
      <button
        key={file.file_id}
        onClick={() => setViewingExhibit(file)}
        className="inline-flex items-center gap-1 mr-2 mb-1 px-2 py-1 rounded text-[10px] hover:opacity-80 transition-opacity cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
          color: '#1a0f0a',
          fontWeight: 'bold',
          border: 'none',
        }}
        title={`View ${file.filename}`}
      >
        <FileText className="w-3 h-3" />
        Ex. {index + 1}
      </button>
    ));
  };

  return (
    <div className="w-full mb-12">
      {/* Exhibit Viewer Modal */}
      {viewingExhibit && (
        <ExhibitViewer file={viewingExhibit} onClose={() => setViewingExhibit(null)} />
      )}
      
      {/* Print Report Modal */}
      {showPrintModal && (
        <PrintReport 
          entries={sortedEntries} 
          exhibitFiles={exhibitFiles} 
          onClose={() => setShowPrintModal(false)} 
        />
      )}

      {/* Timeline Header */}
      <div 
        className="p-4 sm:p-6 mb-4"
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
          border: '3px solid #d4af37',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top Row: Sort, Title, Add/Print */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={toggleSortOrder}
            className="px-3 py-2 rounded flex items-center gap-2 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(145deg, #4a5568 0%, #2d3748 100%)',
              color: '#d4af37',
              border: '2px solid #8b6914',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              fontSize: '11px',
            }}
            title={sortOrder === 'asc' ? 'Currently: Earliest First' : 'Currently: Latest First'}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'asc' ? 'Earliest →' : 'Latest →'}
          </button>

          <div className="flex-1 mx-4 text-center">
            <h2 
              className="text-xl sm:text-2xl md:text-3xl font-bold gold-embossed mb-1"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              EVIDENCE TIMELINE
            </h2>
            <p 
              className="text-yellow-600/80 text-xs sm:text-sm uppercase tracking-wider"
              style={{ fontFamily: 'Garamond, serif' }}
            >
              Chronological Record of Events - Key Highlights
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Report Button */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 rounded flex items-center gap-2 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(145deg, #4a5568 0%, #2d3748 100%)',
                color: '#d4af37',
                border: '2px solid #8b6914',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                fontSize: '11px',
              }}
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            
            {isAdmin && (
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded flex items-center gap-2 transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(145deg, #d4af37 0%, #c5a028 50%, #9c7a1f 100%)',
                  color: '#1a0f0a',
                  border: '2px solid #8b6914',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
            style={{ color: '#8b6914' }} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by date, witness, description, exhibit, or notes..."
            className="w-full pl-10 pr-4 py-3 rounded"
            style={{
              background: 'rgba(244, 232, 193, 0.95)',
              border: '2px solid #8b6914',
              color: '#3E2723',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-black/10"
              style={{ color: '#8b6914' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Search Results Count */}
        {searchQuery && (
          <div className="mt-2 text-sm" style={{ color: '#d4af37', fontFamily: 'Garamond, serif' }}>
            Found {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Excel-Style Table */}
      <div 
        className="overflow-x-auto"
        style={{
          background: 'linear-gradient(to bottom, #f4e8c1 0%, #e8dcc8 100%)',
          border: '3px solid #8b6914',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: isAdmin ? '26%' : '36%' }} />
            {isAdmin && <col style={{ width: '10%' }} />}
          </colgroup>
          <thead>
            <tr 
              style={{
                background: 'linear-gradient(to bottom, #3a2617 0%, #2b1810 100%)',
                borderBottom: '2px solid #8b6914',
              }}
            >
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: '#d4af37', fontFamily: 'Arial, sans-serif', borderRight: '1px solid #8b6914' }}>Date</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: '#d4af37', fontFamily: 'Arial, sans-serif', borderRight: '1px solid #8b6914' }}>Time</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: '#d4af37', fontFamily: 'Arial, sans-serif', borderRight: '1px solid #8b6914' }}>Witness/Person</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: '#d4af37', fontFamily: 'Arial, sans-serif', borderRight: '1px solid #8b6914' }}>Description</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: '#d4af37', fontFamily: 'Arial, sans-serif', borderRight: '1px solid #8b6914' }}>Exhibit</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: '#d4af37', fontFamily: 'Arial, sans-serif', borderRight: isAdmin ? '1px solid #8b6914' : 'none' }}>Notes</th>
              {isAdmin && (
                <th className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: '#d4af37', fontFamily: 'Arial, sans-serif' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? "7" : "6"} className="px-3 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d4af37' }} />
                    <p className="text-yellow-700/80 text-sm" style={{ fontFamily: 'Garamond, serif' }}>
                      Loading timeline entries...
                    </p>
                  </div>
                </td>
              </tr>
            ) : sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? "7" : "6"} className="px-3 py-8 text-center">
                  <p className="text-yellow-700/80 text-sm mb-2" style={{ fontFamily: 'Garamond, serif' }}>
                    {searchQuery 
                      ? `No entries found matching "${searchQuery}"`
                      : isAdmin 
                        ? 'Timeline is empty. Click "Add Entry" to begin documenting key events.'
                        : 'No timeline entries have been added yet.'
                    }
                  </p>
                </td>
              </tr>
            ) : (
              sortedEntries.map((entry, index) => (
                <tr 
                  key={entry.id}
                  style={{
                    background: index % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(244,232,193,0.4)',
                    borderBottom: '1px solid #8b6914',
                  }}
                  className="hover:bg-yellow-100/50 transition-colors"
                >
                  {editingId === entry.id ? (
                    <>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <input type="text" value={editForm.date} onChange={(e) => handleChange('date', e.target.value)} placeholder="MM/DD/YYYY" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723', fontFamily: 'Courier, monospace' }} />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <input type="text" value={editForm.time} onChange={(e) => handleChange('time', e.target.value)} placeholder="HH:MM" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723', fontFamily: 'Courier, monospace' }} />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <input type="text" value={editForm.witness} onChange={(e) => handleChange('witness', e.target.value)} placeholder="Name" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723' }} />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <textarea value={editForm.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Description" rows="2" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#3E2723' }} />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <input type="text" value={editForm.evidence} onChange={(e) => handleChange('evidence', e.target.value)} placeholder="Exhibit description" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#8b0000' }} />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <textarea value={editForm.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Notes - additional context..." rows="3" className="w-full px-2 py-1 text-xs rounded" style={{ background: '#fff', border: '1px solid #8b6914', color: '#5D4037', minWidth: '200px' }} />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={handleSave} disabled={saving} className="p-1 rounded hover:scale-110 transition-all disabled:opacity-50" style={{ background: '#28a745', color: '#fff' }} title="Save">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button onClick={handleCancel} disabled={saving} className="p-1 rounded hover:scale-110 transition-all disabled:opacity-50" style={{ background: '#dc3545', color: '#fff' }} title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap" style={{ color: '#3E2723', fontFamily: 'Courier, monospace', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{entry.date}</td>
                      <td className="px-3 py-3 text-xs sm:text-sm whitespace-nowrap" style={{ color: '#3E2723', fontFamily: 'Courier, monospace', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{entry.time}</td>
                      <td className="px-3 py-3 text-xs sm:text-sm font-semibold" style={{ color: '#2c1810', fontFamily: 'Arial, sans-serif', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{entry.witness}</td>
                      <td className="px-3 py-3 text-xs sm:text-sm" style={{ color: '#3E2723', fontFamily: 'Arial, sans-serif', borderRight: '1px solid rgba(139,105,20,0.3)' }}>{entry.description}</td>
                      <td className="px-3 py-3 text-xs sm:text-sm" style={{ color: '#8b0000', fontFamily: 'Arial, sans-serif', borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <div className="flex flex-wrap items-center gap-1">
                          {getExhibitDisplay(entry.id)}
                          {entry.evidence && <span className="text-xs font-medium block w-full mt-1">{entry.evidence}</span>}
                          {isAdmin && (
                            <button onClick={() => handleExhibitUpload(entry.id)} disabled={uploadingFor === entry.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all hover:scale-105 disabled:opacity-50 mt-1" style={{ background: uploadingFor === entry.id ? '#999' : 'linear-gradient(145deg, #28a745 0%, #1e7e34 100%)', color: '#fff', border: '1px solid #1e7e34', fontWeight: 'bold' }} title="Upload PDF, Word Doc, or Image">
                              <Upload className="w-3 h-3" />
                              {uploadingFor === entry.id ? '...' : 'Upload'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs sm:text-sm" style={{ color: '#5D4037', fontFamily: 'Arial, sans-serif', borderRight: isAdmin ? '1px solid rgba(139,105,20,0.3)' : 'none', lineHeight: '1.5' }}>
                        <div style={{ maxWidth: '100%', wordWrap: 'break-word' }}>{entry.notes}</div>
                      </td>
                      {isAdmin && (
                        <td className="px-2 py-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleEdit(entry)} className="p-1 rounded hover:scale-110 transition-all" style={{ background: '#ffc107', color: '#000' }} title="Edit"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(entry.id)} className="p-1 rounded hover:scale-110 transition-all" style={{ background: '#dc3545', color: '#fff' }} title="Delete"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table footer note */}
      <div className="mt-2 px-4 py-2 text-xs sm:text-sm italic text-center" style={{ color: '#d4af37', fontFamily: 'Garamond, serif' }}>
        Timeline entries documented in chronological order • Click sort button to toggle date order • Click exhibit badges to preview
      </div>
    </div>
  );
};

export default Timeline;
