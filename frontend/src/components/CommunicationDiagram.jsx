import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Users } from 'lucide-react';

// Each person has their own unique color
const PEOPLE_DATA = {
  // CENTER - The Accusers (Grandparents who started it all)
  'keith': { id: 'keith', name: 'Keith Blankenship', role: 'Grandfather (Accuser)', color: '#dc3545', ring: 0 },
  'gabriele': { id: 'gabriele', name: 'Gabriele Blankenship', role: 'Grandmother (Accuser)', color: '#c82333', ring: 0 },
  
  // RING 1 - Immediate family they spoke to first
  'tammy': { id: 'tammy', name: 'Tammy Blankenship', role: 'Mother', color: '#28a745', ring: 1 },
  'zachary': { id: 'zachary', name: 'Zachary Blankenship', role: 'Father (Accused)', color: '#20c997', ring: 1 },
  'rylie': { id: 'rylie', name: 'Rylie Blankenship', role: 'Child (2 yrs)', color: '#17a2b8', ring: 1 },
  
  // RING 2 - Medical (ER visit)
  'amy_walker': { id: 'amy_walker', name: 'Amy Walker', role: 'S.A.N.E. Nurse, Lake Norman ER', color: '#0d6efd', ring: 2 },
  
  // RING 3 - Law Enforcement
  'coffey': { id: 'coffey', name: 'Officer Coffey', role: "Sheriff's Dept.", color: '#6c757d', ring: 3 },
  
  // RING 4 - CPS Primary
  'sherri_stock': { id: 'sherri_stock', name: 'Sherri Stock', role: 'CPS Social Worker', color: '#e83e8c', ring: 4 },
  'amber_mecimore': { id: 'amber_mecimore', name: 'Amber Mecimore', role: 'CPS Social Worker', color: '#d63384', ring: 4 },
  
  // RING 5 - CPS Secondary
  'jennifer_owens': { id: 'jennifer_owens', name: 'Jennifer Owens', role: 'CPS', color: '#ab47bc', ring: 5 },
  'pam_frazier': { id: 'pam_frazier', name: 'Pam Frazier', role: 'CPS SW (Iredell Co.)', color: '#9c27b0', ring: 5 },
  'sw_reitzel': { id: 'sw_reitzel', name: 'SW Reitzel', role: 'CPS Supervisor', color: '#7b1fa2', ring: 5 },
  'lena_barber': { id: 'lena_barber', name: 'Lena Barber', role: 'CPS', color: '#8e24aa', ring: 5 },
  
  // RING 6 - Others present
  'vickie_toppings': { id: 'vickie_toppings', name: 'Vickie Toppings', role: 'Present at home visit', color: '#fd7e14', ring: 6 },
  'pastor_osborne': { id: 'pastor_osborne', name: 'Pastor Osborne', role: 'Present at home visit', color: '#ffc107', ring: 6 },
};

// Documented communications based on November 30, 2013 evidence
// Each line represents WHO ACTUALLY SPOKE TO WHOM
const COMMUNICATIONS = [
  // Keith & Gabriele took Rylie to ER, spoke to nurse and officer
  { from: 'keith', to: 'gabriele', time: 'All day', note: 'Accusers together' },
  { from: 'keith', to: 'amy_walker', time: '11:30am', note: 'ER visit with Rylie' },
  { from: 'gabriele', to: 'amy_walker', time: '11:30am', note: 'ER visit with Rylie' },
  { from: 'keith', to: 'coffey', time: '11:52am', note: 'Keith spoke to Officer Coffey at ER' },
  { from: 'gabriele', to: 'rylie', time: '11:30am', note: 'Brought Rylie to ER' },
  { from: 'keith', to: 'rylie', time: '11:30am', note: 'Brought Rylie to ER' },
  
  // Amy Walker (Nurse) communications
  { from: 'amy_walker', to: 'rylie', time: '11:30am', note: 'Medical exam - no signs of abuse' },
  { from: 'amy_walker', to: 'coffey', time: '11:52am', note: 'Nurse told Coffey no signs of abuse' },
  { from: 'amy_walker', to: 'amber_mecimore', time: '12:50pm & 9:00pm', note: 'CPS called nurse twice' },
  
  // Officer Coffey
  { from: 'coffey', to: 'sherri_stock', time: '12:15pm', note: 'Sherri Stock called Coffey' },
  
  // CPS Chain starts
  { from: 'sherri_stock', to: 'amber_mecimore', time: '12:30pm & 4:00pm', note: 'CPS coordination' },
  { from: 'amber_mecimore', to: 'jennifer_owens', time: '12:50pm', note: 'CPS intake' },
  { from: 'amber_mecimore', to: 'gabriele', time: '12:50pm', note: 'CPS intake call' },
  { from: 'amber_mecimore', to: 'pam_frazier', time: '1:22pm & 3:30pm', note: 'Requested Iredell Co. assist' },
  { from: 'amber_mecimore', to: 'keith', time: '8:35pm', note: 'Keith offered placement' },
  
  // Sherri Stock's interrogations
  { from: 'sherri_stock', to: 'tammy', time: '6:33pm', note: 'Interrogated mother' },
  { from: 'sherri_stock', to: 'rylie', time: '6:33pm', note: 'Interviewed child alone' },
  { from: 'sherri_stock', to: 'sw_reitzel', time: '6:33pm', note: 'Got supervisor directives' },
  { from: 'sherri_stock', to: 'zachary', time: '9:02pm & 10:30pm', note: 'Picked up from work, interrogated' },
  { from: 'sherri_stock', to: 'vickie_toppings', time: '9:02pm', note: 'Present at home visit' },
  { from: 'sherri_stock', to: 'pastor_osborne', time: '9:02pm', note: 'Present at home visit' },
  { from: 'sherri_stock', to: 'lena_barber', time: '9:02pm', note: 'Present at home visit' },
  
  // Family connections
  { from: 'tammy', to: 'zachary', time: '10:30pm', note: 'No contact order issued' },
  { from: 'tammy', to: 'rylie', time: '10:30pm', note: 'Mother and child left home' },
  
  // Pam Frazier home visit
  { from: 'pam_frazier', to: 'tammy', time: '3:30pm', note: 'Home visit - no concerns' },
  { from: 'pam_frazier', to: 'rylie', time: '3:30pm', note: 'Child made no disclosure' },
];

const CommunicationDiagram = ({ onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);

  const centerX = 450;
  const centerY = 400;
  
  // Position people in concentric rings based on communication distance from accusers
  const getPosition = (person, index, totalInRing) => {
    if (person.ring === 0) {
      // Center - accusers side by side
      const offset = person.id === 'keith' ? -40 : 40;
      return { x: centerX + offset, y: centerY };
    }
    
    const ringRadius = 80 + (person.ring * 70);
    const ringPeople = Object.values(PEOPLE_DATA).filter(p => p.ring === person.ring);
    const idx = ringPeople.findIndex(p => p.id === person.id);
    const angle = (idx / ringPeople.length) * 2 * Math.PI - Math.PI / 2;
    
    return {
      x: centerX + Math.cos(angle) * ringRadius,
      y: centerY + Math.sin(angle) * ringRadius
    };
  };

  // Calculate positions for all people
  const peopleWithPositions = Object.values(PEOPLE_DATA).map((person, idx) => ({
    ...person,
    ...getPosition(person, idx, Object.keys(PEOPLE_DATA).length)
  }));

  // Get person by ID
  const getPerson = (id) => peopleWithPositions.find(p => p.id === id);

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
        className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-lg overflow-hidden"
        style={{ background: '#0a0a0a', border: '3px solid #d4af37' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)', borderBottom: '2px solid #d4af37' }}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" style={{ color: '#d4af37' }} />
            <div>
              <h2 className="text-lg font-bold text-white">Who Spoke With Whom</h2>
              <p className="text-xs text-gray-400">November 30, 2013 — Communication Web • Click any node for details</p>
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
        <div className="flex-1 overflow-auto" style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)' }}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 900 850"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {/* Title */}
            <text x="450" y="30" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#d4af37">
              Communication Web — November 30, 2013
            </text>
            <text x="450" y="50" textAnchor="middle" fontSize="11" fill="#888">
              Lines show documented communications • Colors unique to each person
            </text>

            {/* Draw connection lines - each line matches the color of the "from" person */}
            {COMMUNICATIONS.map((comm, idx) => {
              const fromPerson = getPerson(comm.from);
              const toPerson = getPerson(comm.to);
              if (!fromPerson || !toPerson) return null;
              
              const isHighlighted = selectedPerson && (comm.from === selectedPerson || comm.to === selectedPerson);
              const isHovered = hoveredConnection === idx;
              const lineColor = fromPerson.color;
              
              return (
                <g key={`comm-${idx}`}>
                  <line
                    x1={fromPerson.x}
                    y1={fromPerson.y}
                    x2={toPerson.x}
                    y2={toPerson.y}
                    stroke={isHighlighted || isHovered ? lineColor : lineColor}
                    strokeWidth={isHighlighted ? 3 : isHovered ? 2.5 : 1.5}
                    opacity={selectedPerson ? (isHighlighted ? 0.9 : 0.1) : 0.5}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredConnection(idx)}
                    onMouseLeave={() => setHoveredConnection(null)}
                  />
                  {/* Show note on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={(fromPerson.x + toPerson.x) / 2 - 80}
                        y={(fromPerson.y + toPerson.y) / 2 - 25}
                        width="160"
                        height="40"
                        rx="4"
                        fill="#1a1a2e"
                        stroke={lineColor}
                        strokeWidth="1"
                      />
                      <text
                        x={(fromPerson.x + toPerson.x) / 2}
                        y={(fromPerson.y + toPerson.y) / 2 - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#d4af37"
                        fontWeight="bold"
                      >
                        {comm.time}
                      </text>
                      <text
                        x={(fromPerson.x + toPerson.x) / 2}
                        y={(fromPerson.y + toPerson.y) / 2 + 8}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#ccc"
                      >
                        {comm.note.length > 25 ? comm.note.substring(0, 25) + '...' : comm.note}
                      </text>
                    </g>
                  )}
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
              
              const nodeSize = person.ring === 0 ? 24 : 18; // Accusers are bigger
              
              return (
                <g 
                  key={person.id} 
                  onClick={() => setSelectedPerson(isSelected ? null : person.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={selectedPerson && !hasConnection ? 0.2 : 1}
                >
                  {/* Glow effect when selected */}
                  {isSelected && (
                    <>
                      <circle cx={person.x} cy={person.y} r={nodeSize + 15} fill={person.color} opacity={0.2} />
                      <circle cx={person.x} cy={person.y} r={nodeSize + 8} fill={person.color} opacity={0.3} />
                    </>
                  )}
                  
                  {/* Main node with unique color */}
                  <circle 
                    cx={person.x} 
                    cy={person.y} 
                    r={nodeSize} 
                    fill={person.color}
                    stroke="#fff"
                    strokeWidth={isSelected ? 4 : 2}
                  />
                  
                  {/* Name label */}
                  <text 
                    x={person.x} 
                    y={person.y + nodeSize + 14} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fontWeight="bold" 
                    fill="#fff"
                  >
                    {person.name.split(' ')[0]}
                  </text>
                  <text 
                    x={person.x} 
                    y={person.y + nodeSize + 26} 
                    textAnchor="middle" 
                    fontSize="9" 
                    fill="#aaa"
                  >
                    {person.name.split(' ').slice(1).join(' ')}
                  </text>
                </g>
              );
            })}

            {/* Center label for accusers */}
            <text x={centerX} y={centerY - 50} textAnchor="middle" fontSize="10" fill="#d4af37" fontWeight="bold">
              ACCUSERS
            </text>

            {/* Legend */}
            <g transform="translate(20, 720)">
              <rect x={0} y={0} width={860} height={110} rx={8} fill="#1a1a2e" stroke="#d4af37" strokeWidth={1} />
              <text x={20} y={22} fontSize={12} fontWeight="bold" fill="#d4af37">LEGEND — Each Person Has Unique Color</text>
              
              {/* Row 1 - Accusers & Family */}
              <circle cx={30} cy={50} r={10} fill="#dc3545" stroke="#fff" strokeWidth={2} />
              <text x={48} y={54} fontSize={9} fill="#fff">Keith B.</text>
              
              <circle cx={120} cy={50} r={10} fill="#c82333" stroke="#fff" strokeWidth={2} />
              <text x={138} y={54} fontSize={9} fill="#fff">Gabriele B.</text>
              
              <circle cx={220} cy={50} r={10} fill="#28a745" stroke="#fff" strokeWidth={2} />
              <text x={238} y={54} fontSize={9} fill="#fff">Tammy B.</text>
              
              <circle cx={310} cy={50} r={10} fill="#20c997" stroke="#fff" strokeWidth={2} />
              <text x={328} y={54} fontSize={9} fill="#fff">Zachary B.</text>
              
              <circle cx={410} cy={50} r={10} fill="#17a2b8" stroke="#fff" strokeWidth={2} />
              <text x={428} y={54} fontSize={9} fill="#fff">Rylie B.</text>
              
              <circle cx={500} cy={50} r={10} fill="#0d6efd" stroke="#fff" strokeWidth={2} />
              <text x={518} y={54} fontSize={9} fill="#fff">Amy Walker</text>
              
              <circle cx={600} cy={50} r={10} fill="#6c757d" stroke="#fff" strokeWidth={2} />
              <text x={618} y={54} fontSize={9} fill="#fff">Officer Coffey</text>
              
              {/* Row 2 - CPS */}
              <circle cx={30} cy={85} r={10} fill="#e83e8c" stroke="#fff" strokeWidth={2} />
              <text x={48} y={89} fontSize={9} fill="#fff">Sherri Stock</text>
              
              <circle cx={140} cy={85} r={10} fill="#d63384" stroke="#fff" strokeWidth={2} />
              <text x={158} y={89} fontSize={9} fill="#fff">Amber M.</text>
              
              <circle cx={240} cy={85} r={10} fill="#ab47bc" stroke="#fff" strokeWidth={2} />
              <text x={258} y={89} fontSize={9} fill="#fff">Jennifer O.</text>
              
              <circle cx={340} cy={85} r={10} fill="#9c27b0" stroke="#fff" strokeWidth={2} />
              <text x={358} y={89} fontSize={9} fill="#fff">Pam Frazier</text>
              
              <circle cx={450} cy={85} r={10} fill="#7b1fa2" stroke="#fff" strokeWidth={2} />
              <text x={468} y={89} fontSize={9} fill="#fff">SW Reitzel</text>
              
              <circle cx={550} cy={85} r={10} fill="#8e24aa" stroke="#fff" strokeWidth={2} />
              <text x={568} y={89} fontSize={9} fill="#fff">Lena Barber</text>
              
              <circle cx={660} cy={85} r={10} fill="#fd7e14" stroke="#fff" strokeWidth={2} />
              <text x={678} y={89} fontSize={9} fill="#fff">Vickie T.</text>
              
              <circle cx={760} cy={85} r={10} fill="#ffc107" stroke="#fff" strokeWidth={2} />
              <text x={778} y={89} fontSize={9} fill="#fff">Pastor O.</text>
            </g>

            {/* Info panel when person selected */}
            {selectedPerson && (() => {
              const person = getPerson(selectedPerson);
              const comms = getPersonConnections(selectedPerson);
              if (!person) return null;
              
              const spokeWith = [...new Set(comms.map(c => c.from === selectedPerson ? c.to : c.from))]
                .map(id => getPerson(id)?.name)
                .filter(Boolean);
              
              return (
                <g transform="translate(650, 60)">
                  <rect x={0} y={0} width={230} height={160} rx={8} fill="#1a1a2e" stroke={person.color} strokeWidth={2} filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
                  <rect x={0} y={0} width={230} height={35} rx={8} fill={person.color} />
                  <text x={115} y={23} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#fff">
                    {person.name}
                  </text>
                  <text x={15} y={55} fontSize={10} fill="#888">
                    Role:
                  </text>
                  <text x={50} y={55} fontSize={10} fill="#fff">
                    {person.role}
                  </text>
                  <text x={15} y={75} fontSize={10} fill="#888">
                    Communications:
                  </text>
                  <text x={110} y={75} fontSize={10} fill="#d4af37" fontWeight="bold">
                    {comms.length}
                  </text>
                  <line x1={15} y1={85} x2={215} y2={85} stroke="#333" />
                  <text x={15} y={100} fontSize={9} fill="#d4af37" fontWeight="bold">
                    Spoke with:
                  </text>
                  <text x={15} y={115} fontSize={8} fill="#ccc">
                    {spokeWith.slice(0, 3).join(', ')}
                  </text>
                  {spokeWith.length > 3 && (
                    <text x={15} y={130} fontSize={8} fill="#ccc">
                      {spokeWith.slice(3, 6).join(', ')}
                      {spokeWith.length > 6 ? '...' : ''}
                    </text>
                  )}
                  <text x={15} y={150} fontSize={8} fill="#666" fontStyle="italic">
                    Click elsewhere to deselect
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Footer */}
        <div className="p-2 text-center text-xs" style={{ background: '#0f0f1a', borderTop: '1px solid #d4af37', color: '#888' }}>
          Blankenship Case — Communication Web — Data from November 2013 Detailed Logs • Hover over lines for details
        </div>
      </div>
    </div>
  );
};

export default CommunicationDiagram;
