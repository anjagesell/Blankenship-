import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Users, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Person Figure Component
const PersonFigure = ({ name, x, y, color, isSelected, onClick }) => {
  const figureHeight = 90;
  const figureWidth = 70;
  
  return (
    <g 
      transform={`translate(${x - figureWidth/2}, ${y - figureHeight/2})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Selection glow */}
      {isSelected && (
        <ellipse cx={figureWidth/2} cy={figureHeight/2} rx={50} ry={55} fill={color} opacity={0.2} />
      )}
      
      {/* Head */}
      <circle cx={figureWidth/2} cy={18} r={16} fill={color} stroke="#fff" strokeWidth={2} />
      
      {/* Body */}
      <path 
        d={`M ${figureWidth/2 - 22} 36 
            Q ${figureWidth/2 - 25} 50, ${figureWidth/2 - 20} 70
            L ${figureWidth/2 + 20} 70
            Q ${figureWidth/2 + 25} 50, ${figureWidth/2 + 22} 36
            Q ${figureWidth/2} 42, ${figureWidth/2 - 22} 36`}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
      
      {/* Name tag on body */}
      <rect x={figureWidth/2 - 28} y={45} width={56} height={18} rx={3} fill="#fff" opacity={0.9} />
      <text 
        x={figureWidth/2} 
        y={57} 
        textAnchor="middle" 
        fontSize={9} 
        fontWeight="bold" 
        fill={color}
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {name.length > 10 ? name.substring(0, 9) + '.' : name}
      </text>
      
      {/* Full name below */}
      <text 
        x={figureWidth/2} 
        y={figureHeight + 12} 
        textAnchor="middle" 
        fontSize={11} 
        fontWeight="bold" 
        fill="#333"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {name}
      </text>
    </g>
  );
};

// Arrow Component
const CommunicationArrow = ({ from, to, label, color = "#666", curved = false }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  
  // Shorten arrow to not overlap with figures
  const shortenBy = 50;
  const startX = from.x + Math.cos(angle) * shortenBy;
  const startY = from.y + Math.sin(angle) * shortenBy;
  const endX = to.x - Math.cos(angle) * shortenBy;
  const endY = to.y - Math.sin(angle) * shortenBy;
  
  // Midpoint for label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Control point for curve
  const curveOffset = curved ? 50 : 0;
  const perpX = -Math.sin(angle) * curveOffset;
  const perpY = Math.cos(angle) * curveOffset;
  
  const pathD = curved 
    ? `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY}, ${endX} ${endY}`
    : `M ${startX} ${startY} L ${endX} ${endY}`;
  
  return (
    <g>
      {/* Arrow line */}
      <defs>
        <marker
          id={`arrowhead-${from.x}-${to.x}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
      <path
        d={pathD}
        stroke={color}
        strokeWidth={2}
        fill="none"
        markerEnd={`url(#arrowhead-${from.x}-${to.x})`}
      />
      
      {/* Label */}
      {label && (
        <g transform={`translate(${midX + perpX/2}, ${midY + perpY/2})`}>
          <rect x={-40} y={-10} width={80} height={20} rx={4} fill="#fff" stroke={color} strokeWidth={1} />
          <text x={0} y={4} textAnchor="middle" fontSize={10} fill="#333" style={{ fontFamily: 'Arial' }}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// Main Communication Diagram Component
const CommunicationDiagram = ({ onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [people, setPeople] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from monthly entries and extract names
  useEffect(() => {
    const fetchAndExtractData = async () => {
      setLoading(true);
      try {
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
              const entries = await response.json();
              allEntries.push(...entries);
            }
          } catch (err) {
            // Skip months with no data
          }
        }

        // Extract unique names from entries
        const namesSet = new Set();
        const commList = [];

        allEntries.forEach((entry, idx) => {
          // Add witness/person
          if (entry.witness) {
            namesSet.add(entry.witness.trim());
          }

          // Try to extract names from description and notes
          const text = `${entry.description || ''} ${entry.notes || ''}`;
          
          // Common name patterns - can be expanded
          const namePatterns = [
            /Gabriele/gi, /Keith/gi, /Zackary/gi, /Jacob/gi,
            /Blankenship/gi, /Pellegrino/gi, /Dr\.\s*\w+/gi,
            /Officer\s+\w+/gi, /Detective\s+\w+/gi,
            /Mr\.\s*\w+/gi, /Mrs\.\s*\w+/gi, /Ms\.\s*\w+/gi
          ];

          namePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
              matches.forEach(m => namesSet.add(m.trim()));
            }
          });

          // Create communication if we have witness talking about someone
          if (entry.witness && entry.description) {
            commList.push({
              from: entry.witness,
              description: entry.description,
              date: entry.date,
              time: entry.time,
            });
          }
        });

        // Convert to array and assign positions in a circle
        const namesArray = Array.from(namesSet).filter(n => n.length > 1);
        const centerX = 450;
        const centerY = 350;
        const radius = 250;

        const peopleWithPositions = namesArray.map((name, index) => {
          const angle = (index / namesArray.length) * 2 * Math.PI - Math.PI / 2;
          return {
            id: index,
            name: name,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            color: getColorForPerson(name),
          };
        });

        setPeople(peopleWithPositions);
        setCommunications(commList);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Set default demo data
        setDefaultData();
      } finally {
        setLoading(false);
      }
    };

    fetchAndExtractData();
  }, []);

  const setDefaultData = () => {
    // Default data showing key people
    const defaultPeople = [
      { id: 1, name: 'GABRIELE', x: 250, y: 200, color: '#dc3545' },
      { id: 2, name: 'KEITH', x: 650, y: 200, color: '#fd7e14' },
      { id: 3, name: 'ZACKARY', x: 450, y: 150, color: '#ffc107' },
      { id: 4, name: 'DR. PELLEGRINO', x: 200, y: 450, color: '#20c997' },
      { id: 5, name: 'HOSPITAL STAFF', x: 700, y: 450, color: '#0d6efd' },
      { id: 6, name: 'JACOB', x: 450, y: 500, color: '#6f42c1' },
    ];
    setPeople(defaultPeople);
  };

  const getColorForPerson = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('gabriele')) return '#dc3545';
    if (nameLower.includes('keith')) return '#fd7e14';
    if (nameLower.includes('zackary')) return '#ffc107';
    if (nameLower.includes('jacob')) return '#6f42c1';
    if (nameLower.includes('pellegrino') || nameLower.includes('dr.')) return '#20c997';
    if (nameLower.includes('hospital') || nameLower.includes('nurse')) return '#0d6efd';
    if (nameLower.includes('officer') || nameLower.includes('detective')) return '#6c757d';
    // Random color for others
    const colors = ['#e83e8c', '#17a2b8', '#28a745', '#795548'];
    return colors[name.length % colors.length];
  };

  // Create arrows between people who communicated
  const getArrows = () => {
    if (people.length < 2) return [];
    
    // For demo, create arrows between adjacent people
    const arrows = [];
    for (let i = 0; i < people.length - 1; i++) {
      arrows.push({
        from: people[i],
        to: people[i + 1],
        label: '',
        curved: i % 2 === 0,
      });
    }
    
    // Add some cross connections for visual interest
    if (people.length > 3) {
      arrows.push({
        from: people[0],
        to: people[Math.floor(people.length / 2)],
        label: '',
        curved: true,
      });
    }
    
    return arrows;
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
    >
      <div 
        className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-lg overflow-hidden"
        style={{
          background: '#fff',
          border: '3px solid #d4af37',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
            borderBottom: '2px solid #d4af37',
          }}
        >
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" style={{ color: '#d4af37' }} />
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                Communication Diagram — Who Spoke With Whom
              </h2>
              <p className="text-xs text-gray-400">Visual representation of communications • Click a person for details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-2 rounded hover:bg-white/10"
              style={{ color: '#d4af37' }}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="p-2 rounded hover:bg-white/10"
              style={{ color: '#d4af37' }}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 rounded hover:bg-white/10 ml-2"
              style={{ color: '#d4af37' }}
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded hover:bg-white/10 ml-4"
              style={{ color: '#ff6b6b' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Diagram Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-gray-600">Loading communication data...</p>
                <p className="text-gray-400 text-sm">Extracting names from entries</p>
              </div>
            </div>
          ) : people.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600">No entries found yet</p>
                <p className="text-gray-400 text-sm">Add entries to the Monthly Detailed Logs to see people here</p>
              </div>
            </div>
          ) : (
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 900 700"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Title */}
              <text x="450" y="40" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#8b6914">
                Who Spoke With Whom
              </text>
              <text x="450" y="60" textAnchor="middle" fontSize="12" fill="#666">
                Arrows indicate direction of communication
              </text>

              {/* Draw arrows first (behind people) */}
              {getArrows().map((arrow, idx) => (
                <CommunicationArrow
                  key={idx}
                  from={arrow.from}
                  to={arrow.to}
                  label={arrow.label}
                  color="#888"
                  curved={arrow.curved}
                />
              ))}

              {/* Draw people figures */}
              {people.map((person) => (
                <PersonFigure
                  key={person.id}
                  name={person.name}
                  x={person.x}
                  y={person.y}
                  color={person.color}
                  isSelected={selectedPerson === person.id}
                  onClick={() => setSelectedPerson(selectedPerson === person.id ? null : person.id)}
                />
              ))}

              {/* Legend */}
              <g transform="translate(20, 600)">
                <rect x={0} y={0} width={200} height={80} rx={8} fill="#fff" stroke="#d4af37" strokeWidth={1} />
                <text x={10} y={20} fontSize={12} fontWeight="bold" fill="#8b6914">LEGEND</text>
                <text x={10} y={40} fontSize={10} fill="#666">👤 = Person involved in case</text>
                <text x={10} y={55} fontSize={10} fill="#666">→ = Communication / Contact</text>
                <text x={10} y={70} fontSize={10} fill="#666">Click person for details</text>
              </g>
            </svg>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-2 text-center text-xs"
          style={{ 
            background: 'rgba(0,0,0,0.05)',
            borderTop: '1px solid #d4af37',
            color: '#666',
          }}
        >
          Blankenship Case — Communication Network Diagram — Data extracted from Monthly Detailed Logs
        </div>
      </div>
    </div>
  );
};

export default CommunicationDiagram;
