import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Users, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Simple Network Web Diagram
const CommunicationDiagram = ({ onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [people, setPeople] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

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
          } catch (err) {}
        }

        // Extract unique names
        const namesSet = new Set();
        allEntries.forEach((entry) => {
          if (entry.witness) namesSet.add(entry.witness.trim().toUpperCase());
          
          const text = `${entry.description || ''} ${entry.notes || ''}`.toUpperCase();
          const namePatterns = [
            /GABRIELE/g, /KEITH/g, /ZACKARY/g, /JACOB/g,
            /BLANKENSHIP/g, /PELLEGRINO/g,
          ];
          namePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) matches.forEach(m => namesSet.add(m.trim()));
          });
        });

        const namesArray = Array.from(namesSet).filter(n => n.length > 2);
        
        if (namesArray.length === 0) {
          setDefaultData();
        } else {
          // Position people in a circle
          const centerX = 400;
          const centerY = 350;
          const radius = 200;

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
          
          // Create connections between people
          const conns = [];
          for (let i = 0; i < peopleWithPositions.length; i++) {
            for (let j = i + 1; j < peopleWithPositions.length; j++) {
              conns.push({ from: i, to: j });
            }
          }
          setConnections(conns);
        }
      } catch (error) {
        setDefaultData();
      } finally {
        setLoading(false);
      }
    };

    fetchAndExtractData();
  }, []);

  const setDefaultData = () => {
    const centerX = 400;
    const centerY = 350;
    const radius = 200;
    
    const defaultNames = ['GABRIELE', 'KEITH', 'ZACKARY', 'JACOB', 'DR. PELLEGRINO', 'HOSPITAL', 'DSS', 'POLICE'];
    
    const defaultPeople = defaultNames.map((name, index) => {
      const angle = (index / defaultNames.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: index,
        name: name,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        color: getColorForPerson(name),
      };
    });
    
    setPeople(defaultPeople);
    
    // Create web connections
    const conns = [];
    for (let i = 0; i < defaultPeople.length; i++) {
      for (let j = i + 1; j < defaultPeople.length; j++) {
        conns.push({ from: i, to: j });
      }
    }
    setConnections(conns);
  };

  const getColorForPerson = (name) => {
    const n = name.toUpperCase();
    if (n.includes('GABRIELE')) return '#dc3545';
    if (n.includes('KEITH')) return '#fd7e14';
    if (n.includes('ZACKARY')) return '#ffc107';
    if (n.includes('JACOB')) return '#6f42c1';
    if (n.includes('PELLEGRINO') || n.includes('DR')) return '#20c997';
    if (n.includes('HOSPITAL') || n.includes('NURSE') || n.includes('ER')) return '#0d6efd';
    if (n.includes('DSS') || n.includes('SOCIAL')) return '#e83e8c';
    if (n.includes('POLICE') || n.includes('OFFICER') || n.includes('DETECTIVE')) return '#6c757d';
    const colors = ['#17a2b8', '#28a745', '#795548', '#607d8b'];
    return colors[name.length % colors.length];
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
    >
      <div 
        className="relative w-full max-w-4xl h-[85vh] flex flex-col rounded-lg overflow-hidden"
        style={{ background: '#fff', border: '3px solid #d4af37' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3"
          style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', borderBottom: '2px solid #d4af37' }}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" style={{ color: '#d4af37' }} />
            <div>
              <h2 className="text-lg font-bold text-white">Who Spoke With Whom</h2>
              <p className="text-xs text-gray-400">Communication Network • Click a person for details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 rounded hover:bg-white/10" style={{ color: '#d4af37' }}>
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-white text-xs">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 rounded hover:bg-white/10" style={{ color: '#d4af37' }}>
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded hover:bg-white/10 ml-2" style={{ color: '#ff6b6b' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagram */}
        <div className="flex-1 overflow-auto" style={{ background: '#fafafa' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">🕸️</div>
                <p className="text-gray-600">Building network...</p>
              </div>
            </div>
          ) : (
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 800 700"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              {/* Title */}
              <text x="400" y="35" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#8b6914">
                Communication Network
              </text>
              <text x="400" y="55" textAnchor="middle" fontSize="11" fill="#666">
                Lines show who communicated with whom
              </text>

              {/* Draw ALL connection lines first */}
              {connections.map((conn, idx) => {
                const fromPerson = people[conn.from];
                const toPerson = people[conn.to];
                if (!fromPerson || !toPerson) return null;
                
                return (
                  <line
                    key={idx}
                    x1={fromPerson.x}
                    y1={fromPerson.y}
                    x2={toPerson.x}
                    y2={toPerson.y}
                    stroke="#333"
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                );
              })}

              {/* Draw people dots ON TOP of lines */}
              {people.map((person) => (
                <g 
                  key={person.id} 
                  onClick={() => setSelectedPerson(selectedPerson === person.id ? null : person.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glow effect when selected */}
                  {selectedPerson === person.id && (
                    <circle cx={person.x} cy={person.y} r={28} fill={person.color} opacity={0.3} />
                  )}
                  
                  {/* Main dot */}
                  <circle 
                    cx={person.x} 
                    cy={person.y} 
                    r={18} 
                    fill={person.color}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                  
                  {/* Name label */}
                  <text 
                    x={person.x} 
                    y={person.y + 35} 
                    textAnchor="middle" 
                    fontSize="11" 
                    fontWeight="bold" 
                    fill="#333"
                  >
                    {person.name}
                  </text>
                </g>
              ))}

              {/* Legend */}
              <g transform="translate(20, 600)">
                <rect x={0} y={0} width={180} height={70} rx={6} fill="#fff" stroke="#d4af37" strokeWidth={1} />
                <text x={10} y={18} fontSize={11} fontWeight="bold" fill="#8b6914">LEGEND</text>
                <circle cx={20} cy={38} r={8} fill="#dc3545" />
                <text x={35} y={42} fontSize={10} fill="#333">= Person in case</text>
                <line x1={10} y1={58} x2={40} y2={58} stroke="#333" strokeWidth={1.5} />
                <text x={50} y={62} fontSize={10} fill="#333">= Communication</text>
              </g>

              {/* Info box if person selected */}
              {selectedPerson !== null && people[selectedPerson] && (
                <g transform="translate(580, 580)">
                  <rect x={0} y={0} width={200} height={60} rx={6} fill="#fff" stroke={people[selectedPerson].color} strokeWidth={2} />
                  <text x={10} y={20} fontSize={12} fontWeight="bold" fill={people[selectedPerson].color}>
                    {people[selectedPerson].name}
                  </text>
                  <text x={10} y={38} fontSize={10} fill="#666">
                    Connected to {connections.filter(c => c.from === selectedPerson || c.to === selectedPerson).length} people
                  </text>
                  <text x={10} y={52} fontSize={9} fill="#999">Click elsewhere to deselect</text>
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 text-center text-xs" style={{ background: '#f5f5f5', borderTop: '1px solid #d4af37', color: '#666' }}>
          Blankenship Case — Communication Network — Data from Monthly Detailed Logs
        </div>
      </div>
    </div>
  );
};

export default CommunicationDiagram;
