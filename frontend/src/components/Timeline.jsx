import React from 'react';
import { timelineEntries } from '../mockTimeline';

const Timeline = () => {
  return (
    <div className="w-full mb-12">
      {/* Timeline Header */}
      <div 
        className="p-4 sm:p-6 mb-4"
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
          border: '3px solid #d4af37',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}
      >
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
          Chronological Record of Events
        </p>
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
                }}
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {timelineEntries.map((entry, index) => (
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
                </td>
                <td 
                  className="px-3 py-3 text-xs sm:text-sm italic"
                  style={{ 
                    color: '#5D4037',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  {entry.notes}
                </td>
              </tr>
            ))}
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
