import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const ADMIN_PASSWORD = '02071951';

const Timeline = ({ isAdmin }) => {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch timeline entries from backend
  useEffect(() => {
    fetchEntries();
  }, []);

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
        // Create new entry
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
        // Update existing entry
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
      // If it's a new empty entry, remove it
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

  return (
    <div className="w-full mb-12">
      {/* Timeline Header */}
      <div 
        className="p-4 sm:p-6 mb-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
          border: '3px solid #d4af37',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex-1">
          <h2 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-center gold-embossed mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            EVIDENCE TIMELINE
          </h2>
          <p 
            className="text-yellow-600/80 text-xs sm:text-sm text-center uppercase tracking-wider"
            style={{ fontFamily: 'Garamond, serif' }}
          >
            Chronological Record of Events - Key Highlights
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="ml-4 px-4 py-2 rounded flex items-center gap-2 transition-all hover:scale-105"
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

      {/* Excel-Style Table */}
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
                  borderRight: isAdmin ? '1px solid #8b6914' : 'none',
                }}
              >
                Notes
              </th>
              {isAdmin && (
                <th 
                  className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                  style={{ 
                    color: '#d4af37',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? "7" : "6"} className="px-3 py-8 text-center">
                  <p className="text-yellow-700/80 text-sm mb-2" style={{ fontFamily: 'Garamond, serif' }}>
                    {isAdmin 
                      ? 'Timeline is empty. Click "Add Entry" to begin documenting key events.'
                      : 'No timeline entries have been added yet.'
                    }
                  </p>
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
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <input
                          type="text"
                          value={editForm.date}
                          onChange={(e) => handleChange('date', e.target.value)}
                          placeholder="MM/DD/YYYY"
                          className="w-full px-2 py-1 text-xs rounded"
                          style={{
                            background: '#fff',
                            border: '1px solid #8b6914',
                            color: '#3E2723',
                            fontFamily: 'Courier, monospace',
                          }}
                        />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <input
                          type="text"
                          value={editForm.time}
                          onChange={(e) => handleChange('time', e.target.value)}
                          placeholder="HH:MM"
                          className="w-full px-2 py-1 text-xs rounded"
                          style={{
                            background: '#fff',
                            border: '1px solid #8b6914',
                            color: '#3E2723',
                            fontFamily: 'Courier, monospace',
                          }}
                        />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <input
                          type="text"
                          value={editForm.witness}
                          onChange={(e) => handleChange('witness', e.target.value)}
                          placeholder="Name"
                          className="w-full px-2 py-1 text-xs rounded"
                          style={{
                            background: '#fff',
                            border: '1px solid #8b6914',
                            color: '#3E2723',
                          }}
                        />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          placeholder="Description"
                          rows="2"
                          className="w-full px-2 py-1 text-xs rounded"
                          style={{
                            background: '#fff',
                            border: '1px solid #8b6914',
                            color: '#3E2723',
                          }}
                        />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <input
                          type="text"
                          value={editForm.evidence}
                          onChange={(e) => handleChange('evidence', e.target.value)}
                          placeholder="Evidence ref"
                          className="w-full px-2 py-1 text-xs rounded"
                          style={{
                            background: '#fff',
                            border: '1px solid #8b6914',
                            color: '#8b0000',
                          }}
                        />
                      </td>
                      <td className="px-2 py-2" style={{ borderRight: '1px solid rgba(139,105,20,0.3)' }}>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          placeholder="Notes"
                          rows="2"
                          className="w-full px-2 py-1 text-xs rounded"
                          style={{
                            background: '#fff',
                            border: '1px solid #8b6914',
                            color: '#5D4037',
                          }}
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={handleSave}
                            className="p-1 rounded hover:scale-110 transition-all"
                            style={{
                              background: '#28a745',
                              color: '#fff',
                            }}
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 rounded hover:scale-110 transition-all"
                            style={{
                              background: '#dc3545',
                              color: '#fff',
                            }}
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
                        style={{ 
                          color: '#3E2723',
                          fontFamily: 'Courier, monospace',
                          borderRight: '1px solid rgba(139,105,20,0.3)',
                        }}
                      >
                        {entry.date}
                      </td>
                      <td 
                        className="px-3 py-3 text-xs sm:text-sm whitespace-nowrap"
                        style={{ 
                          color: '#3E2723',
                          fontFamily: 'Courier, monospace',
                          borderRight: '1px solid rgba(139,105,20,0.3)',
                        }}
                      >
                        {entry.time}
                      </td>
                      <td 
                        className="px-3 py-3 text-xs sm:text-sm font-semibold"
                        style={{ 
                          color: '#2c1810',
                          fontFamily: 'Arial, sans-serif',
                          borderRight: '1px solid rgba(139,105,20,0.3)',
                        }}
                      >
                        {entry.witness}
                      </td>
                      <td 
                        className="px-3 py-3 text-xs sm:text-sm"
                        style={{ 
                          color: '#3E2723',
                          fontFamily: 'Arial, sans-serif',
                          borderRight: '1px solid rgba(139,105,20,0.3)',
                        }}
                      >
                        {entry.description}
                      </td>
                      <td 
                        className="px-3 py-3 text-xs sm:text-sm font-medium"
                        style={{ 
                          color: '#8b0000',
                          fontFamily: 'Arial, sans-serif',
                          borderRight: '1px solid rgba(139,105,20,0.3)',
                        }}
                      >
                        {entry.evidence}
                      </td>
                      <td 
                        className="px-3 py-3 text-xs sm:text-sm italic"
                        style={{ 
                          color: '#5D4037',
                          fontFamily: 'Arial, sans-serif',
                          borderRight: isAdmin ? '1px solid rgba(139,105,20,0.3)' : 'none',
                        }}
                      >
                        {entry.notes}
                      </td>
                      {isAdmin && (
                        <td className="px-2 py-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-1 rounded hover:scale-110 transition-all"
                              style={{
                                background: '#ffc107',
                                color: '#000',
                              }}
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-1 rounded hover:scale-110 transition-all"
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                              }}
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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
      <div 
        className="mt-2 px-4 py-2 text-xs sm:text-sm italic text-center"
        style={{ 
          color: '#d4af37',
          fontFamily: 'Garamond, serif',
        }}
      >
        Timeline entries documented in chronological order
      </div>
    </div>
  );
};

export default Timeline;
