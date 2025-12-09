import React from 'react';
import { X, Upload } from 'lucide-react';
import { monthlyDetails } from '../monthlyDetails';

const MonthlyDetail = ({ monthDate, isAdmin, onClose }) => {
  const entries = monthlyDetails[monthDate] || [];
  const [month, year] = monthDate.split('/');
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[parseInt(month)];

  const handleUpload = (entryId) => {
    // Placeholder for upload functionality
    alert(`Upload files for entry ${entryId}\n\nUpload system will be built in next phase.`);
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-900/30 rounded transition-colors"
            style={{ color: '#d4af37' }}
          >
            <X className="w-6 h-6" />
          </button>
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
                    <th 
                      className="px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider"
                      style={{ 
                        color: '#d4af37',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      Upload
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? "7" : "6"} className="px-3 py-6 text-center text-sm italic" style={{ color: '#5D4037' }}>
                      No detailed entries for this month yet. Data will be added.
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
                        {entry.files && entry.files.length > 0 && (
                          <span className="ml-2 text-[10px] bg-green-600 text-white px-2 py-1 rounded">
                            {entry.files.length} file{entry.files.length !== 1 ? 's' : ''}
                          </span>
                        )}
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
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleUpload(entry.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded transition-all hover:scale-105"
                            style={{
                              background: 'linear-gradient(145deg, #d4af37 0%, #c5a028 50%, #9c7a1f 100%)',
                              color: '#1a0f0a',
                              border: '1px solid #8b6914',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                            }}
                          >
                            <Upload className="w-3 h-3" />
                            Upload
                          </button>
                        </td>
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
