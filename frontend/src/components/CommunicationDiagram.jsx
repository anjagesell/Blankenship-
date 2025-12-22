import React, { useState } from 'react';
import { X } from 'lucide-react';

// CENTER FAMILY - Gabi, Keith, Zachary, Tammy - CLOSE TOGETHER
const CENTER_PEOPLE = [
  { id: 'keith', name: 'Keith', duty: 'Grandfather (Accuser)', color: '#e74c3c' },
  { id: 'gabi', name: 'Gabi', duty: 'Grandmother (Accuser)', color: '#c0392b' },
  { id: 'zachary', name: 'Zachary', duty: 'Father (Accused)', color: '#2ecc71' },
  { id: 'tammy', name: 'Tammy', duty: 'Mother', color: '#27ae60' },
];

// OUTER RING - Everyone else
const OUTER_PEOPLE = [
  { id: 'rylie', name: 'Rylie', duty: 'Child (2 yrs)', color: '#1abc9c' },
  { id: 'amy', name: 'Amy Walker', duty: 'S.A.N.E. Nurse', color: '#3498db' },
  { id: 'coffey', name: 'Officer Coffey', duty: "Sheriff's Dept", color: '#7f8c8d' },
  { id: 'sherri', name: 'Sherri Stock', duty: 'CPS Social Worker', color: '#e91e63' },
  { id: 'amber', name: 'Amber Mecimore', duty: 'CPS Social Worker', color: '#9c27b0' },
  { id: 'jennifer', name: 'Jennifer Owens', duty: 'CPS Intake', color: '#8e44ad' },
  { id: 'pam', name: 'Pam Frazier', duty: 'CPS (Iredell Co.)', color: '#673ab7' },
  { id: 'reitzel', name: 'SW Reitzel', duty: 'CPS Supervisor', color: '#5c6bc0' },
  { id: 'vickie', name: 'Vickie Toppings', duty: 'Present at visit', color: '#ff9800' },
  { id: 'pastor', name: 'Pastor Osborne', duty: 'Present at visit', color: '#ffc107' },
  { id: 'lena', name: 'Lena Barber', duty: 'CPS', color: '#795548' },
];

// ========================================
// VERIFIED CONNECTIONS FROM EVIDENCE
// Format: [initiator, receiver]
// ========================================
const CONNECTIONS = [
  // FAMILY CONVERSATIONS (they lived/communicated together)
  ['keith', 'gabi'],      // Married couple
  ['keith', 'tammy'],     // Father-in-law to daughter-in-law
  ['keith', 'zachary'],   // Father to son
  ['gabi', 'tammy'],      // Mother-in-law to daughter-in-law
  ['gabi', 'zachary'],    // Mother to son
  ['tammy', 'zachary'],   // Married couple
  ['tammy', 'rylie'],     // Mother to child
  ['zachary', 'rylie'],   // Father to child
  ['keith', 'rylie'],     // Grandfather to grandchild
  ['gabi', 'rylie'],      // Grandmother to grandchild
  
  // Entry 1 & 2 (11:30-11:52am) - ER Visit
  ['amy', 'rylie'],       // Medical exam
  ['coffey', 'amy'],      // Nurse reported findings
  ['coffey', 'keith'],    // Keith spoke to officer at ER
  ['coffey', 'rylie'],    // Spoke with child alone
  
  // Entry 3 (12:15pm) - Sherri Stock spoke to Amy Walker BEFORE calling Coffey
  ['sherri', 'amy'],      // Sherri spoke with Amy Walker (per Entry 3 - she told Coffey)
  ['sherri', 'coffey'],   // Phone call to report
  
  // Entry 4 (12:30pm)
  ['sherri', 'amber'],    // Phone call
  
  // Entry 5 (12:50pm) - CPS Intake
  ['amber', 'jennifer'],  // Intake report
  ['amber', 'gabi'],      // Intake call to grandmother
  
  // Entry 6 (12:50pm)
  ['amber', 'amy'],       // Phone call about exam
  
  // Entry 7 (1:22pm)
  ['amber', 'pam'],       // Requested assistance
  
  // Entry 8 (3:30pm) - Pam's home visit
  ['pam', 'amber'],       // Report on home visit
  ['pam', 'keith'],       // Home visit
  ['pam', 'gabi'],        // Home visit
  
  // Entry 9 (4:00pm)
  ['sherri', 'amber'],    // Arranged home visit (duplicate but important)
  
  // Entry 10 (6:33pm) - Sherri's interrogation
  ['sherri', 'tammy'],    // Interrogation
  ['sherri', 'rylie'],    // Interviewed child alone
  ['sherri', 'reitzel'],  // Got supervisor directives
  
  // Entry 11 (8:35pm)
  ['amber', 'keith'],     // Phone call - placement offer
  
  // Entry 12 (9:00pm)
  ['amber', 'amy'],       // Phone call - scope inquiry (duplicate)
  
  // Entry 13 (9:02pm) - Home/Work visit
  ['sherri', 'zachary'],  // Picked up from work
  ['sherri', 'vickie'],   // Present at visit
  ['sherri', 'pastor'],   // Present at visit
  ['sherri', 'lena'],     // CPS present
  
  // Entry 14 (10:30pm)
  // sherri -> zachary already added
  // sherri -> tammy already added
];

const CommunicationDiagram = ({ onClose }) => {
  const [selected, setSelected] = useState(null);

  const cx = 400;
  const cy = 400;

  // Position CENTER family CLOSE TOGETHER in a tight square
  const centerPositions = [
    { x: cx - 55, y: cy - 55 },  // Keith - top left
    { x: cx + 55, y: cy - 55 },  // Gabi - top right
    { x: cx - 55, y: cy + 55 },  // Zachary - bottom left
    { x: cx + 55, y: cy + 55 },  // Tammy - bottom right
  ];

  const centerNodes = CENTER_PEOPLE.map((p, i) => ({
    ...p,
    x: centerPositions[i].x,
    y: centerPositions[i].y,
  }));

  // Position OUTER people in circle around center
  const outerRadius = 290;
  const outerNodes = OUTER_PEOPLE.map((p, i) => {
    const angle = (i / OUTER_PEOPLE.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...p,
      x: cx + Math.cos(angle) * outerRadius,
      y: cy + Math.sin(angle) * outerRadius,
    };
  });

  const allNodes = [...centerNodes, ...outerNodes];

  const getNode = (id) => allNodes.find(n => n.id === id);

  const isConnected = (id) => {
    if (!selected) return true;
    if (id === selected) return true;
    return CONNECTIONS.some(([a, b]) => 
      (a === selected && b === id) || (b === selected && a === id)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-amber-600 bg-slate-800">
          <h2 className="text-xl font-bold text-amber-500">Who Spoke With Whom — Nov 30, 2013</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300">
            <X size={24} />
          </button>
        </div>

        {/* Diagram */}
        <div className="flex-1 overflow-auto bg-white p-4">
          <svg viewBox="0 0 800 900" className="w-full h-full">
            {/* Arrow markers for each person's color */}
            <defs>
              {allNodes.map(node => (
                <React.Fragment key={`markers-${node.id}`}>
                  <marker
                    id={`arrow-end-${node.id}`}
                    markerWidth="10"
                    markerHeight="8"
                    refX="8"
                    refY="4"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 4, 0 8" fill={node.color} />
                  </marker>
                  <marker
                    id={`arrow-start-${node.id}`}
                    markerWidth="10"
                    markerHeight="8"
                    refX="2"
                    refY="4"
                    orient="auto-start-reverse"
                  >
                    <polygon points="10 0, 0 4, 10 8" fill={node.color} />
                  </marker>
                </React.Fragment>
              ))}
            </defs>

            {/* Connection lines - COLOR MATCHES INITIATOR */}
            {CONNECTIONS.map(([fromId, toId], i) => {
              const from = getNode(fromId);
              const to = getNode(toId);
              if (!from || !to) return null;

              const isActive = selected && (fromId === selected || toId === selected);
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const offset = 38;

              const x1 = from.x + (dx / len) * offset;
              const y1 = from.y + (dy / len) * offset;
              const x2 = to.x - (dx / len) * offset;
              const y2 = to.y - (dy / len) * offset;

              // LINE COLOR = INITIATOR'S COLOR
              const lineColor = from.color;

              return (
                <line
                  key={i}
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke={lineColor}
                  strokeWidth={isActive ? 5 : 3}
                  opacity={selected ? (isActive ? 1 : 0.15) : 0.65}
                  markerEnd={`url(#arrow-end-${fromId})`}
                  markerStart={`url(#arrow-start-${fromId})`}
                />
              );
            })}

            {/* FAMILY label - BOLD and CENTERED */}
            <text x={cx} y={cy + 5} textAnchor="middle" fill="#8b6914" fontSize="16" fontWeight="bold">
              FAMILY
            </text>

            {/* Nodes */}
            {allNodes.map(node => {
              const active = isConnected(node.id);
              const isSelected = selected === node.id;
              const isCenter = CENTER_PEOPLE.some(p => p.id === node.id);
              const nodeRadius = isCenter ? 38 : 34;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelected(isSelected ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={active ? 1 : 0.2}
                >
                  {isSelected && (
                    <circle cx={node.x} cy={node.y} r={nodeRadius + 10} fill={node.color} opacity={0.3} />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    fill={node.color}
                    stroke={isCenter ? '#d4af37' : '#fff'}
                    strokeWidth={isCenter ? 4 : 3}
                  />
                  {/* Name */}
                  <text
                    x={node.x}
                    y={node.y - 5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={isCenter ? "12" : "10"}
                    fontWeight="bold"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                  {/* Duty */}
                  <text
                    x={node.x}
                    y={node.y + 8}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="7"
                    opacity={0.95}
                  >
                    {node.duty.length > 16 ? node.duty.substring(0, 14) + '..' : node.duty}
                  </text>
                  {/* Last name if exists */}
                  {node.name.split(' ').length > 1 && (
                    <text
                      x={node.x}
                      y={node.y + 19}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="8"
                      opacity={0.85}
                    >
                      {node.name.split(' ').slice(1).join(' ')}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Legend */}
            <text x="400" y="830" textAnchor="middle" fill="#333" fontSize="11" fontWeight="bold">
              Line color = Initiating person • VERIFIED from Nov 30, 2013 evidence
            </text>
            <text x="400" y="850" textAnchor="middle" fill="#666" fontSize="10">
              Click any node to highlight their connections
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CommunicationDiagram;
