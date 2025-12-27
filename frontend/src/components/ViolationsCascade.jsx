import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { X, AlertTriangle, Scale, Shield, FileWarning, Users, Gavel } from 'lucide-react';

// VIOLATION TYPES with colors
const VIOLATION_TYPES = {
  '4th': { name: '4th Amendment', color: '#e74c3c', description: 'Illegal Search/Seizure, False Warrant' },
  '5th': { name: '5th Amendment', color: '#e67e22', description: 'Coerced Confession, Self-Incrimination' },
  '6th': { name: '6th Amendment', color: '#f1c40f', description: 'Ineffective Counsel, Confrontation' },
  '14th': { name: '14th Amendment', color: '#2ecc71', description: 'Due Process Violations' },
  'brady': { name: 'Brady Violation', color: '#3498db', description: 'Suppressed Exculpatory Evidence' },
  'strickland': { name: 'Strickland', color: '#9b59b6', description: 'Counsel Performance Failures' },
  'franks': { name: 'Franks Violation', color: '#e91e63', description: 'False Warrant Statements' },
  'cps': { name: 'CPS Protocol', color: '#00bcd4', description: 'N.C. Gen. Stat. § 7B-302' },
};

// ROOT CAUSE - The Grandparents
const ROOT_NODE = {
  id: 'grandparents',
  name: 'GABRIELE & KEITH',
  subtitle: 'BLANKENSHIP',
  role: 'Root Cause: Adoption Agenda',
  violations: [],
  isRoot: true,
};

// INNER RING - Key Actors who enabled the cascade
const INNER_RING = [
  {
    id: 'jennifer_owen',
    name: 'Jennifer Owen',
    role: 'CPS Intake Supervisor',
    agency: 'CPS',
    violations: ['4th', '14th', 'cps', 'brady'],
    actions: [
      'Former police officer - knew legal standards',
      'Falsified CPS records with impossible addresses',
      'Submitted CME referral SAME DAY as report',
      'No proper investigation before action',
      'Created "1866 Woodridge Lane" - doesn\'t exist',
    ],
  },
  {
    id: 'sw_reitzel',
    name: 'SW Reitzel',
    role: 'CPS Supervisor',
    agency: 'CPS',
    violations: ['cps', '14th'],
    actions: [
      'Gave "substantiated" directive Nov 30',
      'No evidence existed at time of directive',
      'Predetermined outcome before investigation',
    ],
  },
  {
    id: 'mccombs',
    name: 'Sr. Inv. McCombs',
    role: 'Catawba County Sheriff',
    agency: 'LAW',
    violations: ['4th', 'franks', '14th'],
    actions: [
      'Wrote warrant with FALSE dates (Dec 1-12)',
      'KNEW dates were impossible',
      'Same document: Synopsis says "November"',
      'Warrant says "December" - deliberate falsification',
    ],
  },
  {
    id: 'beth_oshbar',
    name: 'Beth Oshbar',
    role: 'Nurse Practitioner (CME)',
    agency: 'MEDICAL',
    violations: ['4th', '14th'],
    actions: [
      'Exam conducted WITHOUT parental consent',
      'Used unscientific term "floppy hymen"',
      'Yet found "Hymen INTACT, no scarring"',
      'Findings contradicted abuse allegation',
    ],
  },
  {
    id: 'adrienne_opdyke',
    name: 'Adrienne Opdyke',
    role: 'Forensic Interviewer - Dove House',
    agency: 'MEDICAL',
    violations: ['4th', '14th', '6th'],
    actions: [
      'Leading/suggestive interview techniques',
      'Failed to follow NICHD protocol',
      'Interview tainted by prior CPS contact',
    ],
  },
  {
    id: 'prosecution',
    name: 'District Attorney',
    role: 'Prosecution',
    agency: 'STATE',
    violations: ['brady', '14th', '6th'],
    actions: [
      'Suppressed Amy Walker\'s findings (NO evidence)',
      'Suppressed foster mother\'s documentation',
      'Misdated photo evidence',
      'Failed Brady disclosure obligations',
      'Child accused GRANDPARENTS - never disclosed',
    ],
  },
  {
    id: 'trial_counsel',
    name: 'Trial Counsel',
    role: 'Defense Attorney',
    agency: 'DEFENSE',
    violations: ['strickland', '6th'],
    actions: [
      'Failed to challenge CPS procedures',
      'No Franks hearing requested',
      'No taint hearing requested despite clear taint',
      'Failed to object to hearsay testimony',
      'Failed to investigate CPS records',
      'Did not call exculpatory witnesses',
    ],
  },
  {
    id: 'herbert_pearce',
    name: 'Herbert Pearce',
    role: 'Resentencing Counsel',
    agency: 'DEFENSE',
    violations: ['strickland', '6th'],
    actions: [
      'Stated: "I just met the defendant"',
      'Only "3-4 hours to prepare"',
      'No review of trial transcripts',
      'No investigation of new evidence',
      'Inadequate representation at critical stage',
    ],
  },
];

// OUTER RING - Agencies and officials who failed
const OUTER_RING = [
  // CPS Workers - November/December
  { id: 'amber_mecimore', name: 'Amber Mecimore', role: 'CPS Lead Worker', agency: 'CPS', violations: ['cps', '14th'], actions: ['Led investigation with predetermined outcome', 'Failed to document exculpatory evidence'] },
  { id: 'sherri_stock', name: 'Sherri Stock', role: 'CPS Worker', agency: 'CPS', violations: ['cps', '14th'], actions: ['Participated in flawed investigation', 'Interrogated parents without counsel'] },
  { id: 'pam_frazier', name: 'Pam Frazier', role: 'Iredell County CPS', agency: 'CPS', violations: ['cps'], actions: ['Cross-county coordination', 'Home visit found NO disclosure'] },
  { id: 'sw_charity', name: 'SW Charity', role: 'CPS Worker', agency: 'CPS', violations: ['cps'], actions: ['Participated in removal proceedings'] },
  { id: 'lena_barber', name: 'Lena Barber', role: 'CPS Worker', agency: 'CPS', violations: ['cps'], actions: ['Present during family separation'] },
  
  // Law Enforcement
  { id: 'coffey', name: 'Officer Coffey', role: "Sheriff's Deputy", agency: 'LAW', violations: ['4th'], actions: ['First responder', 'Relied on tainted CPS info'] },
  { id: 'kisby', name: 'Officer Kisby', role: "Sheriff's Deputy", agency: 'LAW', violations: ['4th'], actions: ['Participated in arrest'] },
  { id: 'fischer', name: 'Sgt Fischer', role: "Sheriff's Supervisor", agency: 'LAW', violations: ['4th'], actions: ['Supervised flawed investigation'] },
  
  // Medical - KEY EXCULPATORY
  { id: 'amy_walker', name: 'Amy Walker', role: 'S.A.N.E. Nurse', agency: 'MEDICAL', violations: [], note: '✓ Found NO PHYSICAL EVIDENCE of abuse - SUPPRESSED', actions: ['Professional exam found nothing', 'Evidence suppressed by prosecution'] },
  
  // Courts
  { id: 'magistrate', name: 'Magistrate', role: 'Signed Warrant', agency: 'COURT', violations: ['4th', 'franks'], actions: ['Signed warrant with false dates', 'Failed to verify probable cause'] },
  { id: 'trial_judge', name: 'Trial Judge', role: 'Superior Court', agency: 'COURT', violations: ['6th', '14th'], actions: ['Allowed hearsay testimony', 'Failed to ensure fair trial'] },
  { id: 'judge_bell', name: 'Judge Bell', role: 'Resentencing Judge', agency: 'COURT', violations: ['6th'], actions: ['Proceeded with unprepared counsel', 'Denied adequate preparation time'] },
  
  // Foster Care - KEY EXCULPATORY
  { id: 'bobbi_jo', name: 'Bobbi Jo Christopher', role: 'Foster Parent', agency: 'FOSTER', violations: [], note: '✓ Documented child\'s TRUTH - SUPPRESSED', actions: ['Child told her grandparents lied', 'Documentation never disclosed to defense'] },
  
  // Family Court System
  { id: 'gal', name: 'Guardian Ad Litem', role: 'GAL Report Author', agency: 'FAMILY', violations: ['14th', 'brady'], actions: ['Falsely wrote "multiple counts of rape"', 'No such charges ever existed', 'Used to terminate parental rights'] },
  { id: 'tpr_court', name: 'TPR Proceedings', role: 'Termination Court', agency: 'FAMILY', violations: ['brady', '14th'], actions: ['Terminated rights based on tainted evidence', 'Parents denied meaningful hearing'] },
  
  // The Child - Ultimate Victim
  { id: 'rylie', name: 'Rylie aka Rose', role: 'Alleged Victim', agency: 'VICTIM', violations: [], note: '✓ Later accused GRANDPARENTS of abuse', actions: ['Told foster mother grandparents lied', 'Accused Keith & Gabriele of abuse', 'Truth suppressed from all proceedings'] },
];

// Agency colors
const AGENCY_COLORS = {
  'CPS': '#00bcd4',
  'LAW': '#607d8b',
  'MEDICAL': '#4caf50',
  'COURT': '#9c27b0',
  'DEFENSE': '#ff9800',
  'STATE': '#f44336',
  'FOSTER': '#8bc34a',
  'FAMILY': '#673ab7',
  'VICTIM': '#e91e63',
};

const ViolationsCascade = ({ isOpen, onClose }) => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 40, 1000);
      const height = Math.min(window.innerHeight - 200, 750);
      setDimensions({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Root gradient (dark red)
    const rootGradient = defs.append('radialGradient')
      .attr('id', 'rootGradient');
    rootGradient.append('stop').attr('offset', '0%').attr('stop-color', '#c0392b');
    rootGradient.append('stop').attr('offset', '100%').attr('stop-color', '#7b241c');

    // Draw connection lines first (so they're behind nodes)
    const connectionsGroup = svg.append('g').attr('class', 'connections');
    
    // Calculate positions
    const innerRadius = Math.min(width, height) * 0.22;
    const outerRadius = Math.min(width, height) * 0.38;

    // Position inner ring nodes
    const innerPositions = INNER_RING.map((node, i) => {
      const angle = (i / INNER_RING.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...node,
        x: centerX + Math.cos(angle) * innerRadius,
        y: centerY + Math.sin(angle) * innerRadius,
      };
    });

    // Position outer ring nodes
    const outerPositions = OUTER_RING.map((node, i) => {
      const angle = (i / OUTER_RING.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...node,
        x: centerX + Math.cos(angle) * outerRadius,
        y: centerY + Math.sin(angle) * outerRadius,
      };
    });

    // Draw lines from root to inner ring
    innerPositions.forEach((node) => {
      // Main connection line
      connectionsGroup.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', node.x)
        .attr('y2', node.y)
        .attr('stroke', '#c0392b')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.6);
    });

    // Draw lines from inner to outer (based on agency)
    outerPositions.forEach((outerNode) => {
      const relatedInner = innerPositions.find(inner => {
        if (outerNode.agency === 'CPS' && (inner.id === 'jennifer_owen' || inner.id === 'sw_reitzel')) return true;
        if (outerNode.agency === 'LAW' && inner.id === 'mccombs') return true;
        if (outerNode.agency === 'MEDICAL' && (inner.id === 'beth_oshbar' || inner.id === 'adrienne_opdyke')) return true;
        if (outerNode.agency === 'COURT' && inner.id === 'prosecution') return true;
        if (outerNode.agency === 'DEFENSE' && (inner.id === 'trial_counsel' || inner.id === 'herbert_pearce')) return true;
        if (outerNode.agency === 'STATE' && inner.id === 'prosecution') return true;
        if (outerNode.agency === 'FOSTER' && inner.id === 'jennifer_owen') return true;
        if (outerNode.agency === 'FAMILY' && inner.id === 'prosecution') return true;
        if (outerNode.agency === 'VICTIM' && inner.id === 'jennifer_owen') return true;
        return false;
      });

      if (relatedInner) {
        connectionsGroup.append('line')
          .attr('x1', relatedInner.x)
          .attr('y1', relatedInner.y)
          .attr('x2', outerNode.x)
          .attr('y2', outerNode.y)
          .attr('stroke', AGENCY_COLORS[outerNode.agency])
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.4)
          .attr('stroke-dasharray', outerNode.violations.length === 0 ? '4,4' : 'none');
      }
    });

    // Draw ROOT NODE (Grandparents) - Hexagon shape
    const rootGroup = svg.append('g')
      .attr('class', 'root-node')
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .style('cursor', 'pointer')
      .on('click', () => setSelectedNode(ROOT_NODE));

    // Hexagon path
    const hexagonRadius = 55;
    const hexagonPoints = d3.range(6).map(i => {
      const angle = (i / 6) * 2 * Math.PI - Math.PI / 2;
      return [Math.cos(angle) * hexagonRadius, Math.sin(angle) * hexagonRadius];
    });

    rootGroup.append('polygon')
      .attr('points', hexagonPoints.map(p => p.join(',')).join(' '))
      .attr('fill', 'url(#rootGradient)')
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 4);

    rootGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .attr('font-size', '11px')
      .text('GABRIELE & KEITH');

    rootGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.7em')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .attr('font-size', '11px')
      .text('BLANKENSHIP');

    rootGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '2.2em')
      .attr('fill', '#f5b7b1')
      .attr('font-size', '8px')
      .text('ROOT CAUSE');

    // Draw INNER RING nodes
    innerPositions.forEach((node) => {
      const nodeGroup = svg.append('g')
        .attr('class', 'inner-node')
        .attr('transform', `translate(${node.x}, ${node.y})`)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedNode(node));

      // Rectangle for inner nodes
      nodeGroup.append('rect')
        .attr('x', -45)
        .attr('y', -28)
        .attr('width', 90)
        .attr('height', 56)
        .attr('rx', 6)
        .attr('fill', AGENCY_COLORS[node.agency])
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.9);

      // Name
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.3em')
        .attr('fill', '#fff')
        .attr('font-weight', 'bold')
        .attr('font-size', '9px')
        .text(node.name.length > 14 ? node.name.substring(0, 14) + '...' : node.name);

      // Role
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1em')
        .attr('fill', 'rgba(255,255,255,0.8)')
        .attr('font-size', '7px')
        .text(node.role.length > 18 ? node.role.substring(0, 18) + '...' : node.role);

      // Violation badges
      const badgeStartX = -((node.violations.length - 1) * 8);
      node.violations.slice(0, 4).forEach((viol, i) => {
        nodeGroup.append('circle')
          .attr('cx', badgeStartX + i * 16)
          .attr('cy', 20)
          .attr('r', 6)
          .attr('fill', VIOLATION_TYPES[viol]?.color || '#999')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1);
      });
    });

    // Draw OUTER RING nodes
    outerPositions.forEach((node) => {
      const nodeGroup = svg.append('g')
        .attr('class', 'outer-node')
        .attr('transform', `translate(${node.x}, ${node.y})`)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedNode(node));

      // Circle for outer nodes
      const hasViolations = node.violations.length > 0;
      nodeGroup.append('circle')
        .attr('r', 22)
        .attr('fill', hasViolations ? AGENCY_COLORS[node.agency] : '#2c3e50')
        .attr('stroke', hasViolations ? '#fff' : '#7f8c8d')
        .attr('stroke-width', hasViolations ? 2 : 1)
        .attr('stroke-dasharray', hasViolations ? 'none' : '3,3')
        .attr('opacity', hasViolations ? 0.85 : 0.6);

      // Name (abbreviated)
      const shortName = node.name.split(' ').map(n => n[0]).join('');
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#fff')
        .attr('font-weight', 'bold')
        .attr('font-size', '9px')
        .text(shortName.substring(0, 3));

      // Label below
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '38px')
        .attr('fill', '#d4af37')
        .attr('font-size', '7px')
        .text(node.name.length > 12 ? node.name.substring(0, 12) + '...' : node.name);
    });

    // Title
    svg.append('text')
      .attr('x', centerX)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#d4af37')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Georgia, serif')
      .text('CASCADE OF CONSTITUTIONAL VIOLATIONS');

    svg.append('text')
      .attr('x', centerX)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#8b6914')
      .attr('font-size', '11px')
      .attr('font-family', 'Georgia, serif')
      .text('56+ Officials Failed — November 30, 2013 to Present');

  }, [isOpen, dimensions]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[95vh] overflow-auto rounded-lg shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #1a0f0a 0%, #2c1810 50%, #1a0f0a 100%)',
          border: '3px solid #d4af37',
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 flex items-center justify-between p-4"
          style={{
            background: 'linear-gradient(180deg, #1a0f0a 0%, rgba(26,15,10,0.95) 100%)',
            borderBottom: '2px solid #8b6914',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}>
                Family Court, CPS, State & Federal Violations
              </h2>
              <p className="text-xs" style={{ color: '#8b6914' }}>
                Click any node to see violation details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-900/30 rounded transition-colors"
            style={{ color: '#d4af37' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row">
          {/* SVG Diagram */}
          <div className="flex-1 p-4">
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="mx-auto"
              style={{ maxWidth: '100%' }}
            />
          </div>

          {/* Side Panel - Details */}
          <div 
            className="lg:w-80 p-4 border-t lg:border-t-0 lg:border-l"
            style={{ borderColor: '#8b6914', background: 'rgba(0,0,0,0.3)' }}
          >
            {/* Legend */}
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2" style={{ color: '#d4af37' }}>
                <Scale className="w-4 h-4 inline mr-2" />
                Violation Types
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(VIOLATION_TYPES).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ background: val.color }}
                    />
                    <span className="text-xs" style={{ color: '#ccc' }}>{val.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agency Legend */}
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2" style={{ color: '#d4af37' }}>
                <Users className="w-4 h-4 inline mr-2" />
                Agencies
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(AGENCY_COLORS).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ background: color }}
                    />
                    <span className="text-xs" style={{ color: '#ccc' }}>{key}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div 
                className="p-3 rounded-lg"
                style={{ 
                  background: 'rgba(212,175,55,0.1)', 
                  border: '1px solid #8b6914' 
                }}
              >
                <h3 className="font-bold mb-1" style={{ color: '#d4af37' }}>
                  {selectedNode.name} {selectedNode.subtitle || ''}
                </h3>
                <p className="text-xs mb-2" style={{ color: '#8b6914' }}>
                  {selectedNode.role}
                </p>
                
                {selectedNode.violations && selectedNode.violations.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-bold mb-1" style={{ color: '#e74c3c' }}>
                      Violations:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.violations.map((v) => (
                        <span 
                          key={v}
                          className="px-2 py-0.5 rounded text-xs text-white"
                          style={{ background: VIOLATION_TYPES[v]?.color || '#999' }}
                        >
                          {VIOLATION_TYPES[v]?.name || v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.actions && (
                  <div className="mb-2">
                    <p className="text-xs font-bold mb-1" style={{ color: '#f39c12' }}>
                      Actions:
                    </p>
                    <ul className="text-xs space-y-0.5" style={{ color: '#ccc' }}>
                      {selectedNode.actions.map((action, i) => (
                        <li key={i}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedNode.note && (
                  <p className="text-xs italic" style={{ color: '#2ecc71' }}>
                    Note: {selectedNode.note}
                  </p>
                )}

                {selectedNode.isRoot && (
                  <p className="text-xs mt-2" style={{ color: '#e74c3c' }}>
                    <strong>Adoption Agenda:</strong> Sought permanent custody through false allegations. Child later accused THEM of abuse.
                  </p>
                )}
              </div>
            )}

            {!selectedNode && (
              <div 
                className="p-3 rounded-lg text-center"
                style={{ 
                  background: 'rgba(212,175,55,0.05)', 
                  border: '1px dashed #8b6914' 
                }}
              >
                <Gavel className="w-8 h-8 mx-auto mb-2" style={{ color: '#8b6914' }} />
                <p className="text-xs" style={{ color: '#8b6914' }}>
                  Click any node to see detailed violation information
                </p>
              </div>
            )}

            {/* Summary Stats */}
            <div 
              className="mt-4 p-3 rounded-lg"
              style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #c0392b' }}
            >
              <h4 className="text-xs font-bold mb-2" style={{ color: '#e74c3c' }}>
                <FileWarning className="w-3 h-3 inline mr-1" />
                THE CASCADE OF INJUSTICE
              </h4>
              <ul className="text-xs space-y-1" style={{ color: '#ccc' }}>
                <li>🔴 1 False allegation by grandparents</li>
                <li>🟠 8+ agencies involved in failure</li>
                <li>🟡 25+ officials who violated rights</li>
                <li>🟢 Amy Walker: Found NO evidence</li>
                <li>🔵 Foster Mom: Child said "they lied"</li>
                <li>🟣 Child accused GRANDPARENTS</li>
                <li>⚪ All exculpatory evidence SUPPRESSED</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationsCascade;
