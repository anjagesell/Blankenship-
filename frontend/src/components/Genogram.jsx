import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Move, Home, Calendar, User, FileText, AlertTriangle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Node component for each entry
const TreeNode = ({ entry, x, y, onClick, isRoot, isSelected }) => {
  const nodeWidth = 180;
  const nodeHeight = isRoot ? 80 : 70;
  
  return (
    <g 
      transform={`translate(${x - nodeWidth/2}, ${y})`}
      onClick={() => onClick(entry)}
      style={{ cursor: 'pointer' }}
      className="tree-node"
    >
      {/* Node background */}
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx={isRoot ? 12 : 8}
        fill={isRoot ? 'url(#rootGradient)' : isSelected ? 'url(#selectedGradient)' : 'url(#nodeGradient)'}
        stroke={isRoot ? '#8b0000' : isSelected ? '#d4af37' : '#8b6914'}
        strokeWidth={isRoot ? 3 : isSelected ? 3 : 2}
        filter="url(#shadow)"
      />
      
      {/* Icon */}
      <g transform={`translate(10, ${nodeHeight/2 - 8})`}>
        {isRoot ? (
          <AlertTriangle width={16} height={16} fill="#ff6b6b" stroke="#8b0000" />
        ) : (
          <Calendar width={14} height={14} fill="#d4af37" stroke="#8b6914" />
        )}
      </g>
      
      {/* Date */}
      <text
        x={32}
        y={isRoot ? 25 : 20}
        fill={isRoot ? '#fff' : '#3E2723'}
        fontSize={isRoot ? 13 : 11}
        fontWeight="bold"
        fontFamily="Courier, monospace"
      >
        {entry.date || 'Unknown Date'}
      </text>
      
      {/* Witness/Person */}
      {entry.witness && (
        <text
          x={32}
          y={isRoot ? 45 : 36}
          fill={isRoot ? '#f5e6c8' : '#5D4037'}
          fontSize={10}
          fontFamily="Arial, sans-serif"
        >
          {entry.witness.length > 18 ? entry.witness.substring(0, 18) + '...' : entry.witness}
        </text>
      )}
      
      {/* Description preview */}
      <text
        x={10}
        y={isRoot ? 65 : 54}
        fill={isRoot ? '#d4af37' : '#8b6914'}
        fontSize={9}
        fontFamily="Arial, sans-serif"
        fontStyle="italic"
      >
        {entry.description 
          ? (entry.description.length > 22 ? entry.description.substring(0, 22) + '...' : entry.description)
          : 'Click for details'
        }
      </text>
      
      {/* Exhibit indicator */}
      {entry.hasExhibits && (
        <g transform={`translate(${nodeWidth - 25}, 8)`}>
          <circle r={8} fill="#28a745" />
          <FileText x={-5} y={-5} width={10} height={10} stroke="#fff" strokeWidth={1.5} fill="none" />
        </g>
      )}
    </g>
  );
};

// Connection line between nodes
const Connection = ({ x1, y1, x2, y2 }) => {
  const midY = (y1 + y2) / 2;
  
  return (
    <path
      d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
      fill="none"
      stroke="#8b6914"
      strokeWidth={2}
      strokeDasharray="5,3"
      opacity={0.7}
    />
  );
};

// Entry Detail Panel
const EntryDetailPanel = ({ entry, onClose, exhibitFiles }) => {
  if (!entry) return null;
  
  const files = exhibitFiles[entry.id] || [];
  
  return (
    <div 
      className="absolute top-4 right-4 w-80 max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #f4e8c1 0%, #e8dcc8 100%)',
        border: '3px solid #d4af37',
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div 
        className="p-3 flex items-center justify-between sticky top-0"
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
          borderBottom: '2px solid #d4af37',
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: '#d4af37' }} />
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Courier, monospace' }}>
            {entry.date}
          </span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded" style={{ color: '#ff6b6b' }}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {entry.time && (
          <div>
            <span className="text-xs font-bold uppercase" style={{ color: '#8b6914' }}>Time:</span>
            <p className="text-sm" style={{ color: '#3E2723', fontFamily: 'Courier, monospace' }}>{entry.time}</p>
          </div>
        )}
        
        {entry.witness && (
          <div>
            <span className="text-xs font-bold uppercase" style={{ color: '#8b6914' }}>Witness/Person:</span>
            <p className="text-sm font-semibold" style={{ color: '#2c1810' }}>{entry.witness}</p>
          </div>
        )}
        
        {entry.description && (
          <div>
            <span className="text-xs font-bold uppercase" style={{ color: '#8b6914' }}>Description:</span>
            <p className="text-sm" style={{ color: '#3E2723', lineHeight: 1.5 }}>{entry.description}</p>
          </div>
        )}
        
        {entry.evidence && (
          <div>
            <span className="text-xs font-bold uppercase" style={{ color: '#8b6914' }}>Exhibit:</span>
            <p className="text-sm font-medium" style={{ color: '#8b0000' }}>{entry.evidence}</p>
          </div>
        )}
        
        {files.length > 0 && (
          <div>
            <span className="text-xs font-bold uppercase" style={{ color: '#8b6914' }}>Attached Files:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {files.map((file, i) => (
                <a
                  key={file.file_id}
                  href={`${BACKEND_URL}/api/file/${file.file_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
                    color: '#1a0f0a',
                    fontWeight: 'bold',
                  }}
                >
                  <FileText className="w-3 h-3" />
                  Ex. {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {entry.notes && (
          <div>
            <span className="text-xs font-bold uppercase" style={{ color: '#8b6914' }}>Notes:</span>
            <p className="text-sm italic" style={{ color: '#5D4037', lineHeight: 1.5 }}>{entry.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Genogram = ({ onClose }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [exhibitFiles, setExhibitFiles] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch ALL entries from Monthly Detailed Logs
  useEffect(() => {
    const fetchAllMonthlyEntries = async () => {
      setLoading(true);
      try {
        // Fetch entries from all months (2013-2015)
        const months = [
          '10-2013', '11-2013', '12-2013',
          '01-2014', '02-2014', '03-2014', '04-2014', '05-2014', '06-2014', 
          '07-2014', '08-2014', '09-2014', '10-2014', '11-2014', '12-2014',
          '01-2015', '02-2015', '03-2015', '04-2015', '05-2015', '06-2015',
          '07-2015', '08-2015', '09-2015', '10-2015', '11-2015', '12-2015'
        ];
        
        const allEntries = [];
        
        for (const monthKey of months) {
          try {
            const response = await fetch(`${BACKEND_URL}/api/monthly/${monthKey}`);
            if (response.ok) {
              const monthEntries = await response.json();
              allEntries.push(...monthEntries);
            }
          } catch (err) {
            // Skip months with no data
          }
        }
        
        setEntries(allEntries);
        
        // Fetch exhibit files for each entry
        for (const entry of allEntries) {
          if (entry.id) {
            try {
              const filesResponse = await fetch(`${BACKEND_URL}/api/files/${entry.id}`);
              if (filesResponse.ok) {
                const files = await filesResponse.json();
                setExhibitFiles(prev => ({ ...prev, [entry.id]: files }));
              }
            } catch (err) {
              // Skip if no files
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllMonthlyEntries();
  }, []);
  
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => {
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date(0);
      const parts = dateStr.split('/');
      if (parts.length === 3) return new Date(parts[2], parts[0] - 1, parts[1]);
      if (parts.length === 2) return new Date(parts[1], parts[0] - 1, 1);
      return new Date(0);
    };
    return parseDate(a.date) - parseDate(b.date);
  });
  
  // Get the first entry as root (if exists)
  const rootEntry = sortedEntries.length > 0 
    ? { ...sortedEntries[0], isRoot: true }
    : { id: 'empty', date: 'No Data', witness: '', description: 'No entries yet. Add entries in the Monthly Detailed Logs.', isRoot: true };
  
  // Remaining entries (excluding the first/root)
  const remainingEntries = sortedEntries.slice(1);
  
  // Add exhibit info to entries
  const entriesWithExhibits = remainingEntries.map(entry => ({
    ...entry,
    hasExhibits: (exhibitFiles[entry.id] || []).length > 0,
  }));
  
  // Calculate tree layout
  const nodeWidth = 200;
  const nodeHeight = 100;
  const levelGap = 120;
  const siblingGap = 30;
  
  // Group entries by year for branching
  const entriesByYear = {};
  entriesWithExhibits.forEach(entry => {
    const year = entry.date ? entry.date.split('/').pop() : 'Unknown';
    if (!entriesByYear[year]) entriesByYear[year] = [];
    entriesByYear[year].push(entry);
  });
  
  const years = Object.keys(entriesByYear).sort();
  
  // Calculate positions
  const treeWidth = Math.max(800, years.length * (nodeWidth + siblingGap) + 200);
  const treeHeight = Math.max(600, (Math.max(...years.map(y => entriesByYear[y]?.length || 1), 1) + 2) * levelGap);
  
  // Root position
  const rootX = treeWidth / 2;
  const rootY = 50;
  
  // Year branch positions (horizontal spread from root)
  const yearPositions = {};
  const yearSpread = Math.min(250, (treeWidth - 200) / Math.max(years.length, 1));
  years.forEach((year, index) => {
    const offset = (index - (years.length - 1) / 2) * yearSpread;
    yearPositions[year] = {
      x: rootX + offset,
      y: rootY + levelGap,
    };
  });
  
  // Handle mouse events for panning
  const handleMouseDown = (e) => {
    if (e.target.closest('.tree-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleZoomIn = () => setZoom(z => Math.min(2, z + 0.2));
  const handleZoomOut = () => setZoom(z => Math.max(0.3, z - 0.2));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  
  const handleNodeClick = (entry) => {
    if (entry.isRoot) {
      setSelectedEntry(rootEntry);
    } else {
      setSelectedEntry(entry);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-[9998] flex flex-col"
      style={{ background: 'rgba(0, 0, 0, 0.95)' }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 sm:p-4"
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
          borderBottom: '3px solid #d4af37',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌳</div>
          <div>
            <h2 className="text-white font-bold text-lg sm:text-xl" style={{ fontFamily: 'Georgia, serif' }}>
              Case Genogram
            </h2>
            <p className="text-yellow-600/80 text-xs hidden sm:block">
              Visual Timeline — Click nodes to investigate
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-2 rounded hover:bg-white/10" style={{ color: '#d4af37' }} title="Zoom Out">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 rounded hover:bg-white/10" style={{ color: '#d4af37' }} title="Zoom In">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={handleReset} className="p-2 rounded hover:bg-white/10" style={{ color: '#d4af37' }} title="Reset View">
            <Home className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-yellow-700/50 mx-2" />
          <button onClick={onClose} className="p-2 rounded hover:bg-white/10" style={{ color: '#ff6b6b' }} title="Close">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Tree Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Loading State */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🌳</div>
              <p className="text-yellow-600 text-lg" style={{ fontFamily: 'Georgia, serif' }}>Loading Case Data...</p>
              <p className="text-yellow-600/60 text-sm mt-2">Fetching entries from Monthly Detailed Logs</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-yellow-600 text-lg" style={{ fontFamily: 'Georgia, serif' }}>No Entries Yet</p>
              <p className="text-yellow-600/60 text-sm mt-2">Add entries in the Monthly Detailed Logs to see them here</p>
            </div>
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div className="absolute top-4 left-4 text-xs text-yellow-600/60 flex items-center gap-2 z-10">
              <Move className="w-4 h-4" /> Drag to pan • Scroll to zoom • {entries.length} entries loaded
            </div>
            
            {/* SVG Tree */}
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            >
          <defs>
            {/* Gradients */}
            <linearGradient id="rootGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b0000" />
              <stop offset="100%" stopColor="#5c0000" />
            </linearGradient>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f4e8c1" />
              <stop offset="100%" stopColor="#e8dcc8" />
            </linearGradient>
            <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff8dc" />
              <stop offset="100%" stopColor="#f4e8c1" />
            </linearGradient>
            <linearGradient id="yearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c3e50" />
              <stop offset="100%" stopColor="#1a252f" />
            </linearGradient>
            
            {/* Shadow filter */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>
          
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Connections from root to year branches */}
            {years.map(year => (
              <Connection
                key={`root-${year}`}
                x1={rootX}
                y1={rootY + 80}
                x2={yearPositions[year].x}
                y2={yearPositions[year].y}
              />
            ))}
            
            {/* Connections from year to entries */}
            {years.map(year => {
              const yearEntries = entriesByYear[year];
              const yearX = yearPositions[year].x;
              const yearY = yearPositions[year].y;
              
              return yearEntries.map((entry, index) => {
                const entryY = yearY + 70 + (index * (nodeHeight + 20));
                return (
                  <Connection
                    key={`${year}-${entry.id}`}
                    x1={yearX}
                    y1={yearY + 50}
                    x2={yearX}
                    y2={entryY}
                  />
                );
              });
            })}
            
            {/* Root Node */}
            <TreeNode
              entry={rootEntry}
              x={rootX}
              y={rootY}
              onClick={handleNodeClick}
              isRoot={true}
              isSelected={selectedEntry?.id === 'root'}
            />
            
            {/* Year Labels */}
            {years.map(year => (
              <g key={`year-${year}`} transform={`translate(${yearPositions[year].x - 40}, ${yearPositions[year].y})`}>
                <rect
                  width={80}
                  height={50}
                  rx={6}
                  fill="url(#yearGradient)"
                  stroke="#d4af37"
                  strokeWidth={2}
                  filter="url(#shadow)"
                />
                <text
                  x={40}
                  y={32}
                  fill="#d4af37"
                  fontSize={16}
                  fontWeight="bold"
                  fontFamily="Georgia, serif"
                  textAnchor="middle"
                >
                  {year}
                </text>
              </g>
            ))}
            
            {/* Entry Nodes */}
            {years.map(year => {
              const yearEntries = entriesByYear[year];
              const yearX = yearPositions[year].x;
              const yearY = yearPositions[year].y;
              
              return yearEntries.map((entry, index) => {
                const entryY = yearY + 70 + (index * (nodeHeight + 20));
                return (
                  <TreeNode
                    key={entry.id}
                    entry={entry}
                    x={yearX}
                    y={entryY}
                    onClick={handleNodeClick}
                    isRoot={false}
                    isSelected={selectedEntry?.id === entry.id}
                  />
                );
              });
            })}
          </g>
        </svg>
        
        {/* Entry Detail Panel */}
        <EntryDetailPanel
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          exhibitFiles={exhibitFiles}
        />
        
        {/* Legend */}
        <div 
          className="absolute bottom-4 left-4 p-3 rounded-lg text-xs"
          style={{
            background: 'rgba(44, 62, 80, 0.9)',
            border: '2px solid #8b6914',
          }}
        >
          <div className="text-yellow-600/80 font-bold mb-2">Legend</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-3 rounded" style={{ background: 'linear-gradient(#8b0000, #5c0000)' }} />
            <span className="text-gray-300">Origin Event</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-3 rounded" style={{ background: 'linear-gradient(#f4e8c1, #e8dcc8)', border: '1px solid #8b6914' }} />
            <span className="text-gray-300">Timeline Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#28a745' }} />
            <span className="text-gray-300">Has Exhibits</span>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Genogram;
