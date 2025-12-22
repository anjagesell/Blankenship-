import React, { useState } from 'react';
import { X } from 'lucide-react';

// CENTER FAMILY - Gabi, Keith, Zachary, Tammy
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
// VERIFIED CONNECTIONS FROM EVIDENCE ONLY
// Format: [initiator, receiver, time, note]
// ========================================
const CONNECTIONS = [
  // Entry 1 & 2 (11:30-11:52am) - ER Visit
  ['keith', 'rylie', '11:30am', 'Brought to ER'],
  ['gabi', 'rylie', '11:30am', 'Brought to ER'],
  ['amy', 'rylie', '11:30am', 'Medical exam'],
  ['coffey', 'amy', '11:52am', 'Nurse reported findings'],
  ['coffey', 'keith', '11:52am', 'Keith spoke to officer'],
  ['coffey', 'rylie', '11:52am', 'Spoke with child alone'],
  
  // Entry 3 (12:15pm)
  ['sherri', 'coffey', '12:15pm', 'Phone call'],
  
  // Entry 4 (12:30pm)
  ['sherri', 'amber', '12:30pm', 'Phone call'],
  
  // Entry 5 (12:50pm) - CPS Intake
  ['amber', 'jennifer', '12:50pm', 'Intake report'],
  ['amber', 'gabi', '12:50pm', 'Intake call'],
  
  // Entry 6 (12:50pm)
  ['amber', 'amy', '12:50pm', 'Phone call about exam'],
  
  // Entry 7 (1:22pm)
  ['amber', 'pam', '1:22pm', 'Requested assistance'],
  
  // Entry 8 (3:30pm) - Pam's home visit to grandparents
  ['pam', 'amber', '3:30pm', 'Report on home visit'],
  ['pam', 'keith', '3:30pm', 'Home visit'],
  ['pam', 'gabi', '3:30pm', 'Home visit'],
  
  // Entry 9 (4:00pm)
  ['sherri', 'amber', '4:00pm', 'Arranged home visit'],
  
  // Entry 10 (6:33pm) - Sherri's interrogation
  ['sherri', 'tammy', '6:33pm', 'Interrogation'],
  ['sherri', 'rylie', '6:33pm', 'Interviewed child alone'],
  ['sherri', 'reitzel', '6:33pm', 'Got supervisor directives'],
  
  // Entry 11 (8:35pm)
  ['amber', 'keith', '8:35pm', 'Phone call - placement offer'],
  
  // Entry 12 (9:00pm)
  ['amber', 'amy', '9:00pm', 'Phone call - scope inquiry'],
  
  // Entry 13 (9:02pm) - Home/Work visit
  ['sherri', 'zachary', '9:02pm', 'Picked up from work'],
  ['sherri', 'tammy', '9:02pm', 'Present at home'],
  ['sherri', 'rylie', '9:02pm', 'Present at home'],
  ['sherri', 'reitzel', '9:02pm', 'Supervisor present'],
  ['sherri', 'vickie', '9:02pm', 'Present at visit'],
  ['sherri', 'pastor', '9:02pm', 'Present at visit'],
  ['sherri', 'lena', '9:02pm', 'CPS present'],
  
  // Entry 14 (10:30pm)
  ['sherri', 'zachary', '10:30pm', 'Drove home'],
  ['sherri', 'tammy', '10:30pm', 'No contact order'],
  
  // Family connections (implicit from living together)
  ['tammy', 'zachary', 'Family', 'Married'],
  ['tammy', 'rylie', 'Family', 'Mother-child'],
  ['keith', 'gabi', 'Family', 'Married'],
];

const CommunicationDiagram = ({ onClose }) => {
  const [selected, setSelected] = useState(null);

  const cx = 400;
  const cy = 400;

  // Position CENTER family in a diamond in middle - more spaced
  const centerPositions = [
    { x: cx - 100, y: cy - 60 },  // Keith - left
    { x: cx + 100, y: cy - 60 },  // Gabi - right
    { x: cx - 100, y: cy + 80 },  // Zachary - bottom left
    { x: cx + 100, y: cy + 80 },  // Tammy - bottom right
  ];

  const centerNodes = CENTER_PEOPLE.map((p, i) => ({
    ...p,
    x: centerPositions[i].x,
    y: centerPositions[i].y,
  }));

  // Position OUTER people in circle around center
  const outerRadius = 300;
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
            {CONNECTIONS.map(([fromId, toId, time, note], i) => {
              const from = getNode(fromId);
              const to = getNode(toId);
              if (!from || !to) return null;

              const isActive = selected && (fromId === selected || toId === selected);
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const offset = 42;

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
                  opacity={selected ? (isActive ? 1 : 0.15) : 0.7}
                  markerEnd={`url(#arrow-end-${fromId})`}
                  markerStart={`url(#arrow-start-${fromId})`}
                />
              );
            })}

            {/* FAMILY label - CENTERED between the 4 family members */}
            <text x={cx} y={cy + 10} textAnchor="middle" fill="#8b6914" fontSize="18" fontWeight="bold">
              FAMILY
            </text>

            {/* Nodes - LARGER with more space for text */}
            {allNodes.map(node => {
              const active = isConnected(node.id);
              const isSelected = selected === node.id;
              const isCenter = CENTER_PEOPLE.some(p => p.id === node.id);
              const nodeRadius = isCenter ? 40 : 36;

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
                  {/* Name - centered */}
                  <text
                    x={node.x}
                    y={node.y - 6}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={isCenter ? "13" : "11"}
                    fontWeight="bold"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                  {/* Duty - below name */}
                  <text
                    x={node.x}
                    y={node.y + 8}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="8"
                    opacity={0.95}
                  >
                    {node.duty.length > 18 ? node.duty.substring(0, 16) + '..' : node.duty}
                  </text>
                  {/* Second line if needed */}
                  {node.name.split(' ').length > 1 && (
                    <text
                      x={node.x}
                      y={node.y + 20}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="9"
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
