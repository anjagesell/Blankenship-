import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Users } from 'lucide-react';

// Real names extracted from November 2013 entries
const PEOPLE_DATA = [
  // CPS / Social Workers
  { id: 1, name: 'Sherri Stock', role: 'CPS Social Worker', category: 'cps' },
  { id: 2, name: 'Amber Mecimore', role: 'CPS Social Worker', category: 'cps' },
  { id: 3, name: 'Pam Frazier', role: 'CPS SW (Iredell Co.)', category: 'cps' },
  { id: 4, name: 'SW Reitzel', role: 'CPS Supervisor', category: 'cps' },
  { id: 5, name: 'Lena Barber', role: 'CPS', category: 'cps' },
  { id: 6, name: 'Jennifer Owens', role: 'CPS', category: 'cps' },
  // Medical
  { id: 7, name: 'Amy Walker', role: 'S.A.N.E. Nurse, Lake Norman ER', category: 'medical' },
  // Law Enforcement
  { id: 8, name: 'Officer Coffey', role: "Sheriff's Dept.", category: 'police' },
  // Blankenship Family
  { id: 9, name: 'Zachary Blankenship', role: 'Father (Accused)', category: 'family' },
  { id: 10, name: 'Tammy Blankenship', role: 'Mother', category: 'family' },
  { id: 11, name: 'Rylie Blankenship', role: 'Child (2 yrs)', category: 'family' },
  { id: 12, name: 'Keith Blankenship', role: 'Grandfather', category: 'family' },
  { id: 13, name: 'Gabriele Blankenship', role: 'Grandmother', category: 'family' },
  // Others
  { id: 14, name: 'Vickie Toppings', role: 'Mentioned in case', category: 'other' },
  { id: 15, name: 'Pastor Osborne', role: 'Mentioned in case', category: 'other' },
];

// Documented communications from November 30, 2013
const COMMUNICATIONS = [
  { from: 1, to: 8, time: '12:15pm', desc: 'Phone call about child' },
  { from: 1, to: 2, time: '12:30pm', desc: 'CPS coordination call' },
  { from: 2, to: 6, time: '12:50pm', desc: 'CPS intake discussion' },
  { from: 2, to: 13, time: '12:50pm', desc: 'CPS intake with grandmother' },
  { from: 2, to: 7, time: '12:50pm', desc: 'SW spoke with SANE Nurse' },
  { from: 2, to: 3, time: '1:22pm', desc: 'Requested Iredell Co. assist' },
  { from: 1, to: 2, time: '4:00pm', desc: 'Arranged home visit' },
  { from: 3, to: 10, time: '4:00pm', desc: 'Home visit arranged' },
  { from: 1, to: 10, time: '6:33pm', desc: 'Interrogation of mother' },
  { from: 1, to: 4, time: '6:33pm', desc: 'Supervisor directives' },
  { from: 2, to: 12, time: '8:35pm', desc: 'Phone call with grandfather' },
  { from: 2, to: 7, time: '9:00pm', desc: 'Follow-up with nurse' },
  { from: 1, to: 9, time: '9:02pm', desc: 'Interrogation of Zachary' },
  { from: 1, to: 10, time: '9:02pm', desc: 'Present during interrogation' },
  { from: 1, to: 11, time: '9:02pm', desc: 'Child present' },
  { from: 1, to: 14, time: '9:02pm', desc: 'Present at home visit' },
  { from: 1, to: 4, time: '9:02pm', desc: 'Supervisor involvement' },
  { from: 1, to: 15, time: '9:02pm', desc: 'Pastor present' },
  { from: 1, to: 5, time: '9:02pm', desc: 'CPS Lena Barber present' },
  { from: 1, to: 9, time: '10:30pm', desc: 'Drive from Burger King' },
  { from: 1, to: 10, time: '10:30pm', desc: 'No contact order issued' },
];

const CommunicationDiagram = ({ onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);

  // Color scheme by category
  const getCategoryColor = (category) => {
    switch (category) {
      case 'cps': return '#e83e8c'; // Pink for CPS
      case 'medical': return '#0d6efd'; // Blue for Medical
      case 'police': return '#6c757d'; // Gray for Police
      case 'family': return '#28a745'; // Green for Family
      case 'other': return '#fd7e14'; // Orange for Others
      default: return '#17a2b8';
    }
  };

  // Position people in octagonal/circular arrangement
  const centerX = 400;
  const centerY = 380;
  const radius = 280;

  const peopleWithPositions = PEOPLE_DATA.map((person, index) => {
    const angle = (index / PEOPLE_DATA.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...person,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      color: getCategoryColor(person.category),
    };
  });

  // Get communications for a person
  const getPersonCommunications = (personId) => {
    return COMMUNICATIONS.filter(c => c.from === personId || c.to === personId);
  };

  // Check if two people communicated
  const didCommunicate = (id1, id2) => {
    return COMMUNICATIONS.some(c => 
      (c.from === id1 && c.to === id2) || (c.from === id2 && c.to === id1)
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.92)' }}
    >
      <div 
        className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-lg overflow-hidden"
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
              <p className="text-xs text-gray-400">November 30, 2013 — Documented Communications Network</p>
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
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 800"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {/* Title */}
            <text x="400" y="35" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#8b6914">
              Communication Network — Nov 30, 2013
            </text>
            <text x="400" y="55" textAnchor="middle" fontSize="11" fill="#666">
              Lines connect individuals who communicated • Click a person for details
            </text>

            {/* Draw ALL connection lines (documented communications) */}
            {COMMUNICATIONS.map((comm, idx) => {
              const fromPerson = peopleWithPositions.find(p => p.id === comm.from);
              const toPerson = peopleWithPositions.find(p => p.id === comm.to);
              if (!fromPerson || !toPerson) return null;
              
              const isHighlighted = selectedPerson && (comm.from === selectedPerson || comm.to === selectedPerson);
              const isHovered = hoveredLine === idx;
              
              return (
                <g key={`comm-${idx}`}>
                  <line
                    x1={fromPerson.x}
                    y1={fromPerson.y}
                    x2={toPerson.x}
                    y2={toPerson.y}
                    stroke={isHighlighted ? '#d4af37' : isHovered ? '#ff6b6b' : '#333'}
                    strokeWidth={isHighlighted ? 3 : isHovered ? 2.5 : 1.5}
                    opacity={selectedPerson ? (isHighlighted ? 1 : 0.15) : 0.6}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredLine(idx)}
                    onMouseLeave={() => setHoveredLine(null)}
                  />
                </g>
              );
            })}

            {/* Draw people nodes */}
            {peopleWithPositions.map((person) => {
              const isSelected = selectedPerson === person.id;
              const hasConnection = selectedPerson ? 
                COMMUNICATIONS.some(c => 
                  (c.from === selectedPerson && c.to === person.id) || 
                  (c.to === selectedPerson && c.from === person.id) ||
                  person.id === selectedPerson
                ) : true;
              
              return (
                <g 
                  key={person.id} 
                  onClick={() => setSelectedPerson(isSelected ? null : person.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={selectedPerson && !hasConnection ? 0.3 : 1}
                >
                  {/* Glow effect when selected */}
                  {isSelected && (
                    <circle cx={person.x} cy={person.y} r={32} fill={person.color} opacity={0.3} />
                  )}
                  
                  {/* Main node - RED circle like in the reference image */}
                  <circle 
                    cx={person.x} 
                    cy={person.y} 
                    r={20} 
                    fill="#dc3545"
                    stroke="#fff"
                    strokeWidth={3}
                  />
                  
                  {/* Name label with background */}
                  <rect
                    x={person.x - 55}
                    y={person.y + 25}
                    width={110}
                    height={32}
                    rx={4}
                    fill="rgba(255,255,255,0.95)"
                    stroke={person.color}
                    strokeWidth={1}
                  />
                  <text 
                    x={person.x} 
                    y={person.y + 40} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fontWeight="bold" 
                    fill="#333"
                  >
                    {person.name}
                  </text>
                  <text 
                    x={person.x} 
                    y={person.y + 52} 
                    textAnchor="middle" 
                    fontSize="8" 
                    fill={person.color}
                  >
                    {person.role.length > 20 ? person.role.substring(0, 18) + '...' : person.role}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(20, 680)">
              <rect x={0} y={0} width={760} height={95} rx={6} fill="#fff" stroke="#d4af37" strokeWidth={1} />
              <text x={15} y={20} fontSize={12} fontWeight="bold" fill="#8b6914">LEGEND — Categories</text>
              
              {/* Row 1 */}
              <circle cx={30} cy={45} r={10} fill="#e83e8c" />
              <text x={48} y={49} fontSize={10} fill="#333">CPS/Social Workers</text>
              
              <circle cx={180} cy={45} r={10} fill="#0d6efd" />
              <text x={198} y={49} fontSize={10} fill="#333">Medical</text>
              
              <circle cx={280} cy={45} r={10} fill="#6c757d" />
              <text x={298} y={49} fontSize={10} fill="#333">Law Enforcement</text>
              
              <circle cx={430} cy={45} r={10} fill="#28a745" />
              <text x={448} y={49} fontSize={10} fill="#333">Blankenship Family</text>
              
              <circle cx={600} cy={45} r={10} fill="#fd7e14" />
              <text x={618} y={49} fontSize={10} fill="#333">Others</text>
              
              {/* Row 2 */}
              <line x1={20} y1={75} x2={60} y2={75} stroke="#333" strokeWidth={2} />
              <text x={70} y={79} fontSize={10} fill="#333">= Documented communication on Nov 30, 2013</text>
              
              <circle cx={400} cy={75} r={10} fill="#dc3545" stroke="#fff" strokeWidth={2} />
              <text x={418} y={79} fontSize={10} fill="#333">= Individual involved</text>
            </g>

            {/* Info panel when person selected */}
            {selectedPerson && (() => {
              const person = peopleWithPositions.find(p => p.id === selectedPerson);
              const comms = getPersonCommunications(selectedPerson);
              if (!person) return null;
              
              return (
                <g transform="translate(550, 70)">
                  <rect x={0} y={0} width={230} height={140} rx={8} fill="#fff" stroke={person.color} strokeWidth={2} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" />
                  <rect x={0} y={0} width={230} height={30} rx={8} fill={person.color} />
                  <text x={115} y={20} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#fff">
                    {person.name}
                  </text>
                  <text x={15} y={50} fontSize={10} fill="#666">
                    Role: {person.role}
                  </text>
                  <text x={15} y={70} fontSize={10} fill="#666">
                    Communications: {comms.length}
                  </text>
                  <line x1={15} y1={80} x2={215} y2={80} stroke="#eee" />
                  <text x={15} y={95} fontSize={9} fill="#333" fontWeight="bold">
                    Spoke with:
                  </text>
                  <text x={15} y={110} fontSize={8} fill="#666">
                    {[...new Set(comms.map(c => c.from === selectedPerson ? c.to : c.from))]
                      .map(id => peopleWithPositions.find(p => p.id === id)?.name)
                      .filter(Boolean)
                      .slice(0, 4)
                      .join(', ')}
                    {comms.length > 4 ? '...' : ''}
                  </text>
                  <text x={15} y={130} fontSize={8} fill="#999" fontStyle="italic">
                    Click elsewhere to deselect
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Footer */}
        <div className="p-2 text-center text-xs" style={{ background: '#f5f5f5', borderTop: '1px solid #d4af37', color: '#666' }}>
          Blankenship Case — Communication Network — Data extracted from November 2013 Detailed Logs
        </div>
      </div>
    </div>
  );
};

export default CommunicationDiagram;
