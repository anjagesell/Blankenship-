import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const ADMIN_PASSWORD = '02071951';

const MonthlyDetail = ({ monthDate, isAdmin, onClose }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [month, year] = monthDate.split('/');
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[parseInt(month)];
  const [uploading, setUploading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);

  // Fetch entries from backend
  useEffect(() => {
    fetchEntries();
  }, [monthDate]);

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
        const response = await fetch(`${BACKEND_URL}/api/monthly/${editForm.id}?admin_password=${ADMIN_PASSWORD}`, {
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
        const response = await fetch(`${BACKEND_URL}/api/monthly/${id}?admin_password=${ADMIN_PASSWORD}`, {
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
                    }}
                  >
                    Notes
                  </th>
                  {isAdmin && (
                    <>
                      <th 
                        className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                        style={{ 
                          color: '#d4af37',
                          fontFamily: 'Arial, sans-serif',
                          borderRight: '1px solid #8b6914',
                        }}
                      >
                        Actions
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                        style={{ 
                          color: '#d4af37',
                          fontFamily: 'Arial, sans-serif',
                        }}
                      >
                        Upload
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? "9" : "7"} className="px-3 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d4af37' }} />
                        <span className="text-sm italic" style={{ color: '#5D4037' }}>Loading entries...</span>
                      </div>
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? "9" : "7"} className="px-3 py-6 text-center text-sm italic" style={{ color: '#5D4037' }}>
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
                          <td className="px-2 py-2 text-center" colSpan="2">
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
                        </>
                      ) : (
                        // View Mode
                        <>
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
                            style={{ color: '#5D4037', fontFamily: 'Arial, sans-serif', borderRight: isAdmin ? '1px solid rgba(139,105,20,0.3)' : 'none' }}
                          >
                            {entry.notes}
                          </td>
                          {isAdmin && (
                            <>
                              <td className="px-2 py-2 text-center" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => handleEdit(entry)}
                                    className="p-1 rounded hover:scale-110 transition-all"
                                    style={{ background: '#ffc107', color: '#000' }}
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="p-1 rounded hover:scale-110 transition-all"
                                    style={{ background: '#dc3545', color: '#fff' }}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => handleUpload(entry.id)}
                                  disabled={uploading && uploadingFor === entry.id}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    background: uploading && uploadingFor === entry.id 
                                      ? '#999' 
                                      : 'linear-gradient(145deg, #d4af37 0%, #c5a028 50%, #9c7a1f 100%)',
                                    color: '#1a0f0a',
                                    border: '1px solid #8b6914',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                  }}
                                >
                                  <Upload className="w-3 h-3" />
                                  {uploading && uploadingFor === entry.id ? '...' : 'Upload'}
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
    </div>
  );
};

export default MonthlyDetail;
