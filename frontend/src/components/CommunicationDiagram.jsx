import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Users } from 'lucide-react';

// All people with unique colors - arranged for octagonal layout
const PEOPLE_DATA = [
  // These will form the octagon - order matters for positioning
  { id: 'keith', name: 'Keith Blankenship', role: 'Grandfather (Accuser)', color: '#dc3545' },
  { id: 'gabriele', name: 'Gabriele Blankenship', role: 'Grandmother (Accuser)', color: '#c82333' },
  { id: 'amy_walker', name: 'Amy Walker', role: 'S.A.N.E. Nurse', color: '#0d6efd' },
  { id: 'coffey', name: 'Officer Coffey', role: "Sheriff's Dept.", color: '#6c757d' },
  { id: 'sherri_stock', name: 'Sherri Stock', role: 'CPS Social Worker', color: '#e83e8c' },
  { id: 'amber_mecimore', name: 'Amber Mecimore', role: 'CPS Social Worker', color: '#d63384' },
  { id: 'tammy', name: 'Tammy Blankenship', role: 'Mother', color: '#28a745' },
  { id: 'zachary', name: 'Zachary Blankenship', role: 'Father (Accused)', color: '#20c997' },
  { id: 'rylie', name: 'Rylie Blankenship', role: 'Child (2 yrs)', color: '#17a2b8' },
  { id: 'jennifer_owens', name: 'Jennifer Owens', role: 'CPS', color: '#ab47bc' },
  { id: 'pam_frazier', name: 'Pam Frazier', role: 'CPS SW (Iredell)', color: '#9c27b0' },
  { id: 'sw_reitzel', name: 'SW Reitzel', role: 'CPS Supervisor', color: '#7b1fa2' },
  { id: 'lena_barber', name: 'Lena Barber', role: 'CPS', color: '#8e24aa' },
  { id: 'vickie_toppings', name: 'Vickie Toppings', role: 'Present', color: '#fd7e14' },
  { id: 'pastor_osborne', name: 'Pastor Osborne', role: 'Present', color: '#ffc107' },
];

// Documented communications - WHO SPOKE TO WHOM
const COMMUNICATIONS = [
  // Keith & Gabriele (accusers) connections
  { from: 'keith', to: 'gabriele' },
  { from: 'keith', to: 'amy_walker' },
  { from: 'gabriele', to: 'amy_walker' },
  { from: 'keith', to: 'coffey' },
  { from: 'gabriele', to: 'rylie' },
  { from: 'keith', to: 'rylie' },
  { from: 'gabriele', to: 'amber_mecimore' },
  { from: 'keith', to: 'amber_mecimore' },
  
  // Amy Walker connections
  { from: 'amy_walker', to: 'rylie' },
  { from: 'amy_walker', to: 'coffey' },
  { from: 'amy_walker', to: 'amber_mecimore' },
  
  // Officer Coffey
  { from: 'coffey', to: 'sherri_stock' },
  
  // CPS Chain
  { from: 'sherri_stock', to: 'amber_mecimore' },
  { from: 'amber_mecimore', to: 'jennifer_owens' },
  { from: 'amber_mecimore', to: 'pam_frazier' },
  
  // Sherri Stock interrogations
  { from: 'sherri_stock', to: 'tammy' },
  { from: 'sherri_stock', to: 'rylie' },
  { from: 'sherri_stock', to: 'sw_reitzel' },
  { from: 'sherri_stock', to: 'zachary' },
  { from: 'sherri_stock', to: 'vickie_toppings' },
  { from: 'sherri_stock', to: 'pastor_osborne' },
  { from: 'sherri_stock', to: 'lena_barber' },
  
  // Pam Frazier
  { from: 'pam_frazier', to: 'tammy' },
  { from: 'pam_frazier', to: 'rylie' },
  
  // Family
  { from: 'tammy', to: 'zachary' },
  { from: 'tammy', to: 'rylie' },
];

const CommunicationDiagram = ({ onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const centerX = 400;
  const centerY = 380;
  const radius = 280; // Octagon radius

  // Position people in octagonal arrangement
  const peopleWithPositions = PEOPLE_DATA.map((person, index) => {
    const angle = (index / PEOPLE_DATA.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...person,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });

  // Get person by ID
  const getPerson = (id) => peopleWithPositions.find(p => p.id === id);

  // Check if person is connected to selected
  const isConnectedToSelected = (personId) => {
    if (!selectedPerson) return true;
    if (personId === selectedPerson) return true;
    return COMMUNICATIONS.some(c => 
      (c.from === selectedPerson && c.to === personId) || 
      (c.to === selectedPerson && c.from === personId)
    );
  };

  // Get connections for a person
  const getPersonConnections = (personId) => {
    return COMMUNICATIONS.filter(c => c.from === personId || c.to === personId);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.95)' }}
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

        {/* Diagram */}
        <div className="flex-1 overflow-auto" style={{ background: '#fafafa' }}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 800"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {/* Title */}
            <text x="400" y="35" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#8b6914">
              Communication Web — Nov 30, 2013
            </text>
            <text x="400" y="55" textAnchor="middle" fontSize="11" fill="#666">
              Click a node to highlight connections
            </text>

            {/* Draw ALL connection lines */}
            {COMMUNICATIONS.map((comm, idx) => {
              const fromPerson = getPerson(comm.from);
              const toPerson = getPerson(comm.to);
              if (!fromPerson || !toPerson) return null;
              
              const isHighlighted = selectedPerson && 
                (comm.from === selectedPerson || comm.to === selectedPerson);
              
              return (
                <line
                  key={`line-${idx}`}
                  x1={fromPerson.x}
                  y1={fromPerson.y}
                  x2={toPerson.x}
                  y2={toPerson.y}
                  stroke={isHighlighted ? fromPerson.color : '#333'}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  opacity={selectedPerson ? (isHighlighted ? 1 : 0.1) : 0.6}
                />
              );
            })}

            {/* Draw nodes - each person with their unique color */}
            {peopleWithPositions.map((person) => {
              const isSelected = selectedPerson === person.id;
              const isConnected = isConnectedToSelected(person.id);
              
              return (
                <g 
                  key={person.id} 
                  onClick={() => setSelectedPerson(isSelected ? null : person.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={isConnected ? 1 : 0.2}
                >
                  {/* Glow when selected */}
                  {isSelected && (
                    <circle cx={person.x} cy={person.y} r={28} fill={person.color} opacity={0.3} />
                  )}
                  
                  {/* Main node circle with unique color */}
                  <circle 
                    cx={person.x} 
                    cy={person.y} 
                    r={18} 
                    fill={person.color}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                  
                  {/* Name label below node */}
                  <text 
                    x={person.x} 
                    y={person.y + 32} 
                    textAnchor="middle" 
                    fontSize="9" 
                    fontWeight="bold" 
                    fill="#333"
                  >
                    {person.name.split(' ')[0]}
                  </text>
                  <text 
                    x={person.x} 
                    y={person.y + 43} 
                    textAnchor="middle" 
                    fontSize="8" 
                    fill="#666"
                  >
                    {person.name.split(' ').slice(1).join(' ')}
                  </text>
                </g>
              );
            })}

            {/* Info box when person selected */}
            {selectedPerson && (() => {
              const person = getPerson(selectedPerson);
              const comms = getPersonConnections(selectedPerson);
              if (!person) return null;
              
              const spokeWith = [...new Set(comms.map(c => c.from === selectedPerson ? c.to : c.from))]
                .map(id => getPerson(id)?.name?.split(' ')[0])
                .filter(Boolean);
              
              return (
                <g transform="translate(580, 70)">
                  <rect x={0} y={0} width={200} height={120} rx={6} fill="#fff" stroke={person.color} strokeWidth={2} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" />
                  <rect x={0} y={0} width={200} height={28} rx={6} fill={person.color} />
                  <text x={100} y={19} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#fff">
                    {person.name}
                  </text>
                  <text x={10} y={48} fontSize={9} fill="#666">{person.role}</text>
                  <line x1={10} y1={58} x2={190} y2={58} stroke="#eee" />
                  <text x={10} y={75} fontSize={9} fill="#333" fontWeight="bold">
                    Spoke with ({comms.length}):
                  </text>
                  <text x={10} y={90} fontSize={8} fill="#666">
                    {spokeWith.slice(0, 5).join(', ')}
                  </text>
                  <text x={10} y={105} fontSize={8} fill="#666">
                    {spokeWith.slice(5, 10).join(', ')}{spokeWith.length > 10 ? '...' : ''}
                  </text>
                </g>
              );
            })()}

            {/* Legend */}
            <g transform="translate(20, 700)">
              <rect x={0} y={0} width={760} height={80} rx={6} fill="#fff" stroke="#d4af37" strokeWidth={1} />
              <text x={15} y={18} fontSize={11} fontWeight="bold" fill="#8b6914">LEGEND</text>
              
              {/* First row of legend items */}
              {peopleWithPositions.slice(0, 8).map((person, idx) => (
                <g key={`leg1-${idx}`} transform={`translate(${15 + idx * 95}, 30)`}>
                  <circle cx={8} cy={8} r={8} fill={person.color} stroke="#fff" strokeWidth={1} />
                  <text x={22} y={12} fontSize={8} fill="#333">{person.name.split(' ')[0]}</text>
                </g>
              ))}
              
              {/* Second row of legend items */}
              {peopleWithPositions.slice(8, 15).map((person, idx) => (
                <g key={`leg2-${idx}`} transform={`translate(${15 + idx * 105}, 55)`}>
                  <circle cx={8} cy={8} r={8} fill={person.color} stroke="#fff" strokeWidth={1} />
                  <text x={22} y={12} fontSize={8} fill="#333">{person.name.split(' ')[0]}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Footer */}
        <div className="p-2 text-center text-xs" style={{ background: '#f5f5f5', borderTop: '1px solid #d4af37', color: '#666' }}>
          Blankenship Case — Communication Web — Click any node to see connections
        </div>
      </div>
    </div>
  );
};

export default CommunicationDiagram;
