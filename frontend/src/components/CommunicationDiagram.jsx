import React, { useState } from 'react';
import { X } from 'lucide-react';

// People with unique colors - arranged in octagonal order
const PEOPLE = [
  { id: 'keith', name: 'Keith', duty: 'Grandfather (Accuser)', color: '#e74c3c' },
  { id: 'gabriele', name: 'Gabriele', duty: 'Grandmother (Accuser)', color: '#c0392b' },
  { id: 'amy', name: 'Amy Walker', duty: 'S.A.N.E. Nurse', color: '#3498db' },
  { id: 'coffey', name: 'Officer Coffey', duty: "Sheriff's Dept", color: '#7f8c8d' },
  { id: 'sherri', name: 'Sherri Stock', duty: 'CPS Social Worker', color: '#e91e63' },
  { id: 'amber', name: 'Amber Mecimore', duty: 'CPS Social Worker', color: '#9c27b0' },
  { id: 'tammy', name: 'Tammy', duty: 'Mother', color: '#27ae60' },
  { id: 'zachary', name: 'Zachary', duty: 'Father (Accused)', color: '#2ecc71' },
  { id: 'rylie', name: 'Rylie', duty: 'Child (2 yrs)', color: '#1abc9c' },
  { id: 'jennifer', name: 'Jennifer Owens', duty: 'CPS Intake', color: '#8e44ad' },
  { id: 'pam', name: 'Pam Frazier', duty: 'CPS (Iredell Co.)', color: '#673ab7' },
  { id: 'reitzel', name: 'SW Reitzel', duty: 'CPS Supervisor', color: '#5c6bc0' },
];

// Who spoke to whom - lines connect these pairs
const CONNECTIONS = [
  ['keith', 'gabriele'],
  ['keith', 'amy'],
  ['gabriele', 'amy'],
  ['keith', 'coffey'],
  ['keith', 'rylie'],
  ['gabriele', 'rylie'],
  ['gabriele', 'amber'],
  ['keith', 'amber'],
  ['amy', 'rylie'],
  ['amy', 'coffey'],
  ['amy', 'amber'],
  ['coffey', 'sherri'],
  ['sherri', 'amber'],
  ['amber', 'jennifer'],
  ['amber', 'pam'],
  ['sherri', 'tammy'],
  ['sherri', 'rylie'],
  ['sherri', 'reitzel'],
  ['sherri', 'zachary'],
  ['pam', 'tammy'],
  ['pam', 'rylie'],
  ['tammy', 'zachary'],
  ['tammy', 'rylie'],
];

const CommunicationDiagram = ({ onClose }) => {
  const [selected, setSelected] = useState(null);

  const cx = 400;
  const cy = 400;
  const radius = 300;

  // Position nodes in octagon
  const nodes = PEOPLE.map((p, i) => {
    const angle = (i / PEOPLE.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...p,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });

  const getNode = (id) => nodes.find(n => n.id === id);

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
          <svg viewBox="0 0 800 850" className="w-full h-full">
            {/* Arrow markers */}
            <defs>
              {nodes.map(node => (
                <marker
                  key={`arrow-${node.id}`}
                  id={`arrow-${node.id}`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill={node.color} />
                </marker>
              ))}
              <marker id="arrow-black" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#333" />
              </marker>
              <marker id="arrow-black-start" markerWidth="8" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                <polygon points="8 0, 0 3, 8 6" fill="#333" />
              </marker>
            </defs>

            {/* Connection lines with arrows at both ends */}
            {CONNECTIONS.map(([fromId, toId], i) => {
              const from = getNode(fromId);
              const to = getNode(toId);
              if (!from || !to) return null;

              const isActive = selected && (fromId === selected || toId === selected);
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const offset = 35;

              const x1 = from.x + (dx / len) * offset;
              const y1 = from.y + (dy / len) * offset;
              const x2 = to.x - (dx / len) * offset;
              const y2 = to.y - (dy / len) * offset;

              return (
                <line
                  key={i}
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke={isActive ? from.color : '#333'}
                  strokeWidth={isActive ? 3 : 1.5}
                  opacity={selected ? (isActive ? 1 : 0.15) : 0.7}
                  markerEnd="url(#arrow-black)"
                  markerStart="url(#arrow-black-start)"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const active = isConnected(node.id);
              const isSelected = selected === node.id;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelected(isSelected ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={active ? 1 : 0.2}
                >
                  {isSelected && (
                    <circle cx={node.x} cy={node.y} r={38} fill={node.color} opacity={0.3} />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={28}
                    fill={node.color}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {node.name.length > 12 ? node.name.split(' ')[0] : node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 8}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="7"
                    opacity={0.9}
                  >
                    {node.duty.length > 16 ? node.duty.substring(0, 14) + '..' : node.duty}
                  </text>
                </g>
              );
            })}

            {/* Footer */}
            <text x="400" y="820" textAnchor="middle" fill="#666" fontSize="11">
              Click any node to highlight connections • Double arrows = two-way conversation
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CommunicationDiagram;
