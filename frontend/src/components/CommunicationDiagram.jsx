import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Users } from 'lucide-react';

// All people involved - November 30, 2013
const PEOPLE = [
  { id: 'keith', name: 'Keith', duty: 'Grandfather (Accuser)' },
  { id: 'gabriele', name: 'Gabriele', duty: 'Grandmother (Accuser)' },
  { id: 'amy_walker', name: 'Amy Walker', duty: 'S.A.N.E. Nurse' },
  { id: 'coffey', name: 'Officer Coffey', duty: "Sheriff's Dept." },
  { id: 'sherri_stock', name: 'Sherri Stock', duty: 'CPS Social Worker' },
  { id: 'amber_mecimore', name: 'Amber Mecimore', duty: 'CPS Social Worker' },
  { id: 'tammy', name: 'Tammy', duty: 'Mother' },
  { id: 'zachary', name: 'Zachary', duty: 'Father (Accused)' },
  { id: 'rylie', name: 'Rylie', duty: 'Child (2 yrs)' },
  { id: 'jennifer_owens', name: 'Jennifer Owens', duty: 'CPS Intake' },
  { id: 'pam_frazier', name: 'Pam Frazier', duty: 'CPS (Iredell Co.)' },
  { id: 'sw_reitzel', name: 'SW Reitzel', duty: 'CPS Supervisor' },
];

// WHO SPOKE TO WHOM - documented communications
const CONNECTIONS = [
  // Keith & Gabriele (accusers)
  ['keith', 'gabriele'],
  ['keith', 'amy_walker'],
  ['gabriele', 'amy_walker'],
  ['keith', 'coffey'],
  ['gabriele', 'rylie'],
  ['keith', 'rylie'],
  ['gabriele', 'amber_mecimore'],
  ['keith', 'amber_mecimore'],
  
  // Amy Walker (Nurse)
  ['amy_walker', 'rylie'],
  ['amy_walker', 'coffey'],
  ['amy_walker', 'amber_mecimore'],
  
  // Officer Coffey
  ['coffey', 'sherri_stock'],
  
  // CPS Chain
  ['sherri_stock', 'amber_mecimore'],
  ['amber_mecimore', 'jennifer_owens'],
  ['amber_mecimore', 'pam_frazier'],
  
  // Sherri Stock interrogations
  ['sherri_stock', 'tammy'],
  ['sherri_stock', 'rylie'],
  ['sherri_stock', 'sw_reitzel'],
  ['sherri_stock', 'zachary'],
  
  // Pam Frazier
  ['pam_frazier', 'tammy'],
  ['pam_frazier', 'rylie'],
  
  // Family
  ['tammy', 'zachary'],
  ['tammy', 'rylie'],
];

const CommunicationDiagram = ({ onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const centerX = 400;
  const centerY = 400;
  const radius = 300;

  // Position people in octagonal/circular arrangement
  const peoplePositions = PEOPLE.map((person, index) => {
    const angle = (index / PEOPLE.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...person,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });

  const getPerson = (id) => peoplePositions.find(p => p.id === id);

  const isConnected = (id1, id2) => {
    return CONNECTIONS.some(([a, b]) => 
      (a === id1 && b === id2) || (a === id2 && b === id1)
    );
  };

  const getConnections = (id) => {
    return CONNECTIONS.filter(([a, b]) => a === id || b === id);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
    >
      <div 
        className="relative w-full max-w-5xl h-[92vh] flex flex-col rounded-lg overflow-hidden"
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
              <p className="text-xs text-gray-400">November 30, 2013 — Communication Web</p>
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

        {/* Diagram - White background like reference */}
        <div className="flex-1 overflow-auto" style={{ background: '#ffffff' }}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 850"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {/* Title */}
            <text x="400" y="35" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#333">
              Communication Web — Nov 30, 2013
            </text>

            {/* Draw ALL connection lines - BLACK like reference */}
            {CONNECTIONS.map(([fromId, toId], idx) => {
              const from = getPerson(fromId);
              const to = getPerson(toId);
              if (!from || !to) return null;
              
              const isHighlighted = selectedPerson && 
                (fromId === selectedPerson || toId === selectedPerson);
              
              return (
                <line
                  key={`line-${idx}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#000"
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  opacity={selectedPerson ? (isHighlighted ? 1 : 0.15) : 0.7}
                />
              );
            })}

            {/* Draw nodes - RED circles like reference */}
            {peoplePositions.map((person) => {
              const isSelected = selectedPerson === person.id;
              const hasConnection = !selectedPerson || selectedPerson === person.id || 
                isConnected(selectedPerson, person.id);
              
              return (
                <g 
                  key={person.id} 
                  onClick={() => setSelectedPerson(isSelected ? null : person.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={hasConnection ? 1 : 0.25}
                >
                  {/* Glow when selected */}
                  {isSelected && (
                    <circle cx={person.x} cy={person.y} r={38} fill="#dc3545" opacity={0.2} />
                  )}
                  
                  {/* RED node circle */}
                  <circle 
                    cx={person.x} 
                    cy={person.y} 
                    r={28} 
                    fill="#dc3545"
                    stroke={isSelected ? "#000" : "#fff"}
                    strokeWidth={3}
                  />
                  
                  {/* Name inside node */}
                  <text 
                    x={person.x} 
                    y={person.y - 2} 
                    textAnchor="middle" 
                    fontSize="9" 
                    fontWeight="bold" 
                    fill="#fff"
                  >
                    {person.name.length > 10 ? person.name.split(' ')[0] : person.name}
                  </text>
                  
                  {/* Duty below name */}
                  <text 
                    x={person.x} 
                    y={person.y + 10} 
                    textAnchor="middle" 
                    fontSize="7" 
                    fill="#fff"
                    opacity={0.9}
                  >
                    {person.duty.length > 14 ? person.duty.substring(0, 12) + '..' : person.duty}
                  </text>
                </g>
              );
            })}

            {/* Info box when selected */}
            {selectedPerson && (() => {
              const person = getPerson(selectedPerson);
              const conns = getConnections(selectedPerson);
              if (!person) return null;
              
              const spokeWith = conns.map(([a, b]) => {
                const otherId = a === selectedPerson ? b : a;
                return getPerson(otherId)?.name;
              }).filter(Boolean);
              
              return (
                <g transform="translate(560, 60)">
                  <rect x={0} y={0} width={220} height={130} rx={8} fill="#fff" stroke="#dc3545" strokeWidth={2} filter="drop-shadow(0 2px 6px rgba(0,0,0,0.2))" />
                  <rect x={0} y={0} width={220} height={32} rx={8} fill="#dc3545" />
                  <text x={110} y={22} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#fff">
                    {person.name}
                  </text>
                  <text x={15} y={52} fontSize={10} fill="#666">{person.duty}</text>
                  <line x1={15} y1={62} x2={205} y2={62} stroke="#eee" />
                  <text x={15} y={80} fontSize={10} fill="#333" fontWeight="bold">
                    Spoke with ({conns.length}):
                  </text>
                  <text x={15} y={98} fontSize={9} fill="#666">
                    {spokeWith.slice(0, 4).join(', ')}
                  </text>
                  <text x={15} y={115} fontSize={9} fill="#666">
                    {spokeWith.slice(4).join(', ')}
                  </text>
                </g>
              );
            })()}

            {/* Footer text */}
            <text x="400" y="820" textAnchor="middle" fontSize="10" fill="#999">
              Click any node to highlight connections • Blankenship Case Evidence
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CommunicationDiagram;
