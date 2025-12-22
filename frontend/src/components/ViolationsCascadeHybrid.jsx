import React, { useState } from 'react';
import { 
  X, ChevronDown, ChevronRight, AlertTriangle, Scale, Shield, 
  FileWarning, Users, Gavel, FileX, UserX, Building2, 
  BadgeAlert, Clock, ArrowDown, CircleDot
} from 'lucide-react';

// ============================================
// VIOLATION DATA FROM MAR DOCUMENT
// ============================================

const VIOLATION_CATEGORIES = [
  {
    id: 'fourth',
    title: '4th Amendment Violations',
    subtitle: 'Illegal Search & Seizure',
    icon: Shield,
    color: '#e74c3c',
    bgColor: 'rgba(231, 76, 60, 0.1)',
    count: 6,
    violations: [
      {
        title: 'False Arrest Warrant',
        who: 'Sr. Investigator Marcella McCombs',
        agency: 'Catawba County Sheriff',
        detail: 'Knowingly included FALSE dates "December 1-12, 2013" in warrant affidavit. Zachary had ZERO access to child during this period (child in protective custody since Nov 30). Same day, her own Synopsis correctly states "November 2013" — deliberate falsification.',
        severity: 'critical',
      },
      {
        title: 'Illegal Child Interrogation',
        who: 'Jennifer Owen & Adrienne Opdyke',
        agency: 'CPS / Dove House',
        detail: 'Conducted forensic interview of 2-year-old child on December 12, 2013 WITHOUT father\'s knowledge, consent, or presence. No court order. No exigent circumstances. Violates Doe v. Heck.',
        severity: 'critical',
      },
      {
        title: 'Unauthorized Medical Exam #1',
        who: 'Jennifer Owen / Amy Walker',
        agency: 'CPS / Lake Norman ER',
        detail: 'November 30, 2013 - S.A.N.E. examination conducted without parental consent or court order. Result: "Hymen INTACT. No distress. Exam unremarkable." — EXCULPATORY evidence later suppressed.',
        severity: 'high',
      },
      {
        title: 'Unauthorized Medical Exam #2',
        who: 'Jennifer Owen / Beth Oshbar',
        agency: 'CPS / Child Advocacy Center',
        detail: 'December 4, 2013 - Second exam without father\'s knowledge or consent. Used unscientific term "floppy hymen" yet still found "Hymen intact, no scarring." Photos from this date later misdated as "evidence."',
        severity: 'high',
      },
      {
        title: 'Evidence from Illegal Arrest',
        who: 'Law Enforcement',
        agency: 'Catawba County Sheriff',
        detail: 'All evidence obtained pursuant to the fraudulent arrest warrant — including confession and DNA — is "fruit of the poisonous tree" and constitutionally inadmissible.',
        severity: 'critical',
      },
      {
        title: 'Document Tampering',
        who: 'Jennifer Owen',
        agency: 'CPS Supervisor',
        detail: 'Created multiple versions of official documents. Presented one version to judge for approval, filed DIFFERENT version in official record. Violated N.C. Gen. Stat. § 14-221.2 (altering records).',
        severity: 'high',
      },
    ],
  },
  {
    id: 'fifth',
    title: '5th Amendment Violations',
    subtitle: 'Due Process & Self-Incrimination',
    icon: Gavel,
    color: '#e74c3c',
    bgColor: 'rgba(231, 76, 60, 0.1)',
    count: 3,
    violations: [
      {
        title: 'Coerced Confession',
        who: 'Law Enforcement',
        agency: 'Catawba County Sheriff',
        detail: 'December 13, 2013 confession obtained under duress: Overwhelming arrest force, interrogation in private vehicle, no Miranda warnings documented, potential denial of food/medication, no counsel present. Confession relates to charges LATER OVERTURNED for insufficient evidence.',
        severity: 'critical',
      },
      {
        title: 'Prejudicial Confession Evidence',
        who: 'Prosecution / Trial Court',
        agency: 'State of North Carolina',
        detail: 'Jury heard uncorroborated confession relating to 7 charges later REVERSED by Court of Appeals for insufficient evidence. This prejudicial evidence infected verdict on remaining charge.',
        severity: 'critical',
      },
      {
        title: 'Pre-determined Outcome',
        who: 'SW Reitzel (CPS Supervisor)',
        agency: 'CPS',
        detail: 'November 30, 2013 — Gave "substantiated" directive the SAME DAY as report, before any investigation occurred. Outcome decided before evidence gathered.',
        severity: 'high',
      },
    ],
  },
  {
    id: 'sixth',
    title: '6th Amendment Violations',
    subtitle: 'Right to Counsel & Confrontation',
    icon: UserX,
    color: '#e74c3c',
    bgColor: 'rgba(231, 76, 60, 0.1)',
    count: 4,
    violations: [
      {
        title: 'Confrontation Clause Violation',
        who: 'Trial Court / Prosecution',
        agency: 'Superior Court',
        detail: 'Testimonial hearsay statements from 2-year-old child admitted WITHOUT defendant\'s opportunity to cross-examine. Violates Crawford v. Washington. Forensic interview should have been excluded.',
        severity: 'critical',
      },
      {
        title: 'Ineffective Trial Counsel',
        who: 'Defense Attorneys (Eldred, Adams, Reilly)',
        agency: 'Defense',
        detail: 'Failed to: file Brady motion, challenge hearsay, investigate CPS failures, request Franks hearing, call exculpatory witnesses (Amy Walker, Bobbi Jo Christopher), request limiting instructions, ensure complete trial record.',
        severity: 'critical',
      },
      {
        title: 'Ineffective Appellate Counsel',
        who: 'Mark Montgomery / Edward Eldred',
        agency: 'Defense',
        detail: 'Counsel Edward Eldred admitted: "I didn\'t raise any issues." Failed to present meritorious constitutional claims. Defective notice of appeal. Mark Montgomery acknowledged more could have been done.',
        severity: 'critical',
      },
      {
        title: 'Ineffective Resentencing Counsel',
        who: 'Herbert Pearce',
        agency: 'Defense',
        detail: 'Admitted to only "3-4 hours" of preparation. Stated "I just met the defendant." No review of trial transcripts. Failed to object to erroneous dismissal "without prejudice." Failed to challenge remaining conviction.',
        severity: 'critical',
      },
    ],
  },
  {
    id: 'fourteenth',
    title: '14th Amendment Violations',
    subtitle: 'Due Process & Equal Protection',
    icon: Scale,
    color: '#e74c3c',
    bgColor: 'rgba(231, 76, 60, 0.1)',
    count: 4,
    violations: [
      {
        title: 'Parental Rights Violated',
        who: 'Jennifer Owen / CPS / State',
        agency: 'Multiple Agencies',
        detail: 'Father has fundamental liberty interest in his child. Excluded from interrogation, medical examinations, and removal WITHOUT: notice, opportunity to be heard, or court order. Child removed based on predetermined "substantiated" finding.',
        severity: 'critical',
      },
      {
        title: 'Fair Trial Denied',
        who: 'Trial Court / Prosecution',
        agency: 'Superior Court',
        detail: 'Jury heard prejudicial evidence about acts defendant was ACQUITTED of. Conviction for remaining charge lacked independent credibility — relied on evidence from overturned counts.',
        severity: 'critical',
      },
      {
        title: 'Fabricated/Tampered Documents',
        who: 'Jennifer Owen',
        agency: 'CPS Supervisor',
        detail: 'Created CPS records with IMPOSSIBLE addresses (1866 Woodridge Lane doesn\'t exist). Submitted CME referral same day as report — before any investigation. False CPS history records.',
        severity: 'high',
      },
      {
        title: 'Termination of Parental Rights',
        who: 'Family Court / GAL',
        agency: 'Family Court System',
        detail: 'Guardian Ad Litem falsely wrote "multiple counts of rape" — NO SUCH CHARGES EXISTED. This false document used to terminate parental rights. Parents denied meaningful hearing.',
        severity: 'critical',
      },
    ],
  },
  {
    id: 'brady',
    title: 'Brady Violations',
    subtitle: 'Suppressed Exculpatory Evidence',
    icon: FileX,
    color: '#e74c3c',
    bgColor: 'rgba(231, 76, 60, 0.1)',
    count: 7,
    violations: [
      {
        title: 'Amy Walker\'s Findings SUPPRESSED',
        who: 'Prosecution',
        agency: 'State',
        detail: 'S.A.N.E. Nurse Amy Walker found: "Hymen INTACT. No distress. GU exam unremarkable. Sees NO signs of sexual assault." This exculpatory medical evidence was NEVER disclosed to defense.',
        severity: 'critical',
      },
      {
        title: 'Child Accused GRANDPARENTS',
        who: 'Prosecution / CPS',
        agency: 'State',
        detail: 'Child later told foster mother AND therapist that GRANDPARENTS (Gabriele & Keith) abused her. This explosive exculpatory evidence was suppressed from all proceedings.',
        severity: 'critical',
      },
      {
        title: 'Foster Mother\'s Documentation',
        who: 'Prosecution',
        agency: 'State',
        detail: 'Bobbi Jo Christopher documented: Allegations ONLY occurred during grandparent contact, ceased otherwise. Child said "they lied." Pattern evidence proving coaching — SUPPRESSED.',
        severity: 'critical',
      },
      {
        title: 'Therapist\'s Conclusions',
        who: 'Prosecution',
        agency: 'State',
        detail: 'Independent child psychologist treated child for 20+ MONTHS. Found NO evidence of parental abuse. Conclusions never disclosed to defense.',
        severity: 'high',
      },
      {
        title: 'Negative STD Results',
        who: 'Prosecution',
        agency: 'State',
        detail: 'LabCorp report dated December 6, 2013: Child tested NEGATIVE for all STDs. Contradicts rape allegation. Never disclosed.',
        severity: 'high',
      },
      {
        title: 'True Dates vs. False Warrant Dates',
        who: 'Prosecution / McCombs',
        agency: 'State / Sheriff',
        detail: 'True alleged offense dates: November 2013. Warrant falsely stated: December 1-12. The contradictory Synopsis proving fraud was suppressed.',
        severity: 'critical',
      },
      {
        title: 'Misdated Photo Evidence',
        who: 'Prosecution',
        agency: 'State',
        detail: 'Photos dated December 4, 2013 — taken while father had ZERO access to child — presented as evidence of his abuse. Dating fraud never disclosed.',
        severity: 'high',
      },
    ],
  },
  {
    id: 'cps',
    title: 'CPS Protocol Violations',
    subtitle: 'N.C. Gen. Stat. § 7B-302',
    icon: Building2,
    color: '#e74c3c',
    bgColor: 'rgba(231, 76, 60, 0.1)',
    count: 8,
    violations: [
      {
        title: 'No Independent Investigation',
        who: 'Multiple Social Workers',
        agency: 'CPS',
        detail: 'Amber Mecimore, Pam Frazier, Sherri Stock, and others relied on previous reports without independent verification. Created "cascade of confirmatory reports" based on original tainted narrative.',
        severity: 'high',
      },
      {
        title: 'Impossible Address Documentation',
        who: 'Jennifer Owen',
        agency: 'CPS Supervisor',
        detail: 'Documented residence as "1866 Woodridge Lane" — this address DOES NOT EXIST. Overlapping/impossible residential records in file.',
        severity: 'high',
      },
      {
        title: 'Timeline Manipulation',
        who: 'Jennifer Owen',
        agency: 'CPS Supervisor',
        detail: 'CME referral packet submitted SAME DAY as initial report — before any investigation or consent obtained. Impossible procedural timeline.',
        severity: 'high',
      },
      {
        title: 'False CPS History',
        who: 'CPS Workers',
        agency: 'CPS',
        detail: 'Records falsely stated "Tammy B has CPS history" — she had NONE. False information used to justify removal.',
        severity: 'medium',
      },
      {
        title: 'Acting Under Color of Law',
        who: 'CPS Workers',
        agency: 'CPS',
        detail: 'Directed parent to Sheriff\'s Office for interrogation. CPS acting as law enforcement arm without proper authority.',
        severity: 'high',
      },
      {
        title: 'Failed to Interview Father',
        who: 'CPS Workers',
        agency: 'CPS',
        detail: 'Required face-to-face contact with ALL parties not conducted. Father Zachary not properly interviewed before "substantiated" determination.',
        severity: 'high',
      },
      {
        title: 'Failed to Investigate Grandparents',
        who: 'CPS / Law Enforcement',
        agency: 'Multiple',
        detail: 'When child accused GRANDPARENTS of abuse, NO investigation conducted. Alternative perpetrators ignored despite direct disclosure.',
        severity: 'critical',
      },
      {
        title: 'Ignored Foster Parent Reports',
        who: 'CPS Workers',
        agency: 'CPS',
        detail: 'Bobbi Jo Christopher documented grandparent manipulation/coaching. CPS ignored her observations and documentation.',
        severity: 'high',
      },
    ],
  },
  {
    id: 'civil',
    title: 'Civil & Parental Rights',
    subtitle: 'Family Court Failures',
    icon: Users,
    color: '#9b59b6',
    bgColor: 'rgba(155, 89, 182, 0.1)',
    count: 4,
    violations: [
      {
        title: 'Parental Rights Terminated',
        who: 'Family Court / GAL',
        agency: 'Family Court',
        detail: 'Both parents\' rights terminated based on tainted evidence. GAL report contained FALSE statements ("multiple counts of rape" never existed). No meaningful hearing.',
        severity: 'critical',
      },
      {
        title: 'Grandparents\' Adoption Agenda',
        who: 'Gabriele & Keith Blankenship',
        agency: 'Private Citizens',
        detail: 'ROOT CAUSE: Grandparents sought permanent custody. On Nov 30, 2013, Keith Blankenship immediately offered CPS "permanent placement in their home." Adoption agenda drove false allegations.',
        severity: 'critical',
      },
      {
        title: 'No Notice to Father',
        who: 'CPS / State',
        agency: 'Multiple',
        detail: 'Father received NO notice of: investigation, child interrogation, medical exams, or removal proceedings. Constitutional right to notice and opportunity to be heard denied.',
        severity: 'critical',
      },
      {
        title: 'Child Used as Weapon',
        who: 'Grandparents / CPS',
        agency: 'Multiple',
        detail: '2-year-old child manipulated by grandparents. Word "coochie" (Gabriele\'s word from Alan Jackson song) suddenly appeared in child\'s vocabulary during coached disclosure.',
        severity: 'high',
      },
    ],
  },
];

// ============================================
// CASCADE TIMELINE DATA
// ============================================

const CASCADE_TIMELINE = [
  {
    date: 'Nov 30, 2013',
    time: '8:30 AM',
    title: 'THE TRIGGER',
    description: 'Tammy oversleeps. Doesn\'t bring Rylie to grandparents. Grandparents arrive uninvited.',
    color: '#e74c3c',
    violations: 0,
  },
  {
    date: 'Nov 30, 2013',
    time: '11:30 AM',
    title: 'MEDICAL EXAM #1',
    description: 'S.A.N.E. Nurse Amy Walker: "Hymen INTACT. No signs of abuse."',
    color: '#2ecc71',
    violations: 0,
    exculpatory: true,
  },
  {
    date: 'Nov 30, 2013',
    time: '12:50 PM',
    title: 'CPS SUBSTANTIATES',
    description: 'SW Reitzel orders "substantiated" finding — SAME DAY, before investigation.',
    color: '#e67e22',
    violations: 3,
  },
  {
    date: 'Nov 30, 2013',
    time: '6:33 PM',
    title: 'COLOR OF LAW',
    description: 'CPS interrogates 2-year-old ALONE. "Coochie" word appears (Gabriele\'s word).',
    color: '#e74c3c',
    violations: 4,
  },
  {
    date: 'Nov 30, 2013',
    time: '11:00 PM',
    title: 'FAMILY SEPARATED',
    description: 'No-contact order issued. Tammy and child forced to leave home.',
    color: '#c0392b',
    violations: 2,
  },
  {
    date: 'Dec 4, 2013',
    title: 'MEDICAL EXAM #2',
    description: 'Beth Oshbar: "Hymen intact, no scarring." Photos later MISDATED as evidence.',
    color: '#e67e22',
    violations: 2,
  },
  {
    date: 'Dec 12, 2013',
    title: 'FORENSIC INTERVIEW',
    description: 'Child interviewed WITHOUT father\'s knowledge. Leading questions used.',
    color: '#e74c3c',
    violations: 3,
  },
  {
    date: 'Dec 13, 2013',
    title: 'FRAUDULENT ARREST',
    description: 'Warrant with FALSE dates (Dec 1-12). Coerced confession obtained.',
    color: '#c0392b',
    violations: 5,
  },
  {
    date: '2017',
    title: 'WRONGFUL CONVICTION',
    description: 'Convicted despite NO physical evidence. Ineffective counsel throughout.',
    color: '#8e44ad',
    violations: 8,
  },
  {
    date: '2021',
    title: '7 COUNTS REVERSED',
    description: 'Court of Appeals reverses 7 convictions for INSUFFICIENT EVIDENCE.',
    color: '#27ae60',
    violations: 0,
    victory: true,
  },
  {
    date: 'Present',
    title: 'FIGHTING FOR JUSTICE',
    description: 'MAR filed. 56+ violations exposed. Evidence suppressed now revealed.',
    color: '#3498db',
    violations: 0,
    current: true,
  },
];

// ============================================
// COMPONENT
// ============================================

const ViolationsCascadeHybrid = ({ isOpen, onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedViolations, setExpandedViolations] = useState({});

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleViolation = (violationKey) => {
    setExpandedViolations(prev => ({
      ...prev,
      [violationKey]: !prev[violationKey],
    }));
  };

  const totalViolations = VIOLATION_CATEGORIES.reduce((sum, cat) => sum + cat.count, 0);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-lg shadow-2xl flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #0a0a12 0%, #1a1a2e 50%, #0a0a12 100%)',
          border: '3px solid #d4af37',
        }}
      >
        {/* ============ HEADER ============ */}
        <div 
          className="flex items-center justify-between p-3 sm:p-4 shrink-0"
          style={{
            background: 'linear-gradient(180deg, #1a0f0a 0%, rgba(26,15,10,0.95) 100%)',
            borderBottom: '2px solid #8b6914',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}>
                CASCADE OF CONSTITUTIONAL VIOLATIONS
              </h2>
              <p className="text-xs" style={{ color: '#8b6914' }}>
                {totalViolations}+ Documented Violations — 56+ Officials Failed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-900/30 rounded transition-colors"
            style={{ color: '#d4af37' }}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* ============ SCROLLABLE CONTENT ============ */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          
          {/* ============ PART 1: VISUAL CASCADE/WATERFALL ============ */}
          <div className="mb-6">
            <h3 
              className="text-center text-base sm:text-lg font-bold mb-4 pb-2"
              style={{ 
                color: '#d4af37', 
                fontFamily: 'Georgia, serif',
                borderBottom: '1px solid rgba(212,175,55,0.3)',
              }}
            >
              ⚖️ THE WATERFALL OF INJUSTICE ⚖️
            </h3>
            
            {/* Timeline Flow */}
            <div className="relative">
              {/* Central Line */}
              <div 
                className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden sm:block"
                style={{ background: 'linear-gradient(to bottom, #e74c3c, #8e44ad, #3498db)' }}
              />
              
              {/* Timeline Events */}
              <div className="space-y-3 sm:space-y-4">
                {CASCADE_TIMELINE.map((event, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 sm:gap-4 ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                  >
                    {/* Event Card */}
                    <div 
                      className={`flex-1 p-2 sm:p-3 rounded-lg ${index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}
                      style={{
                        background: event.exculpatory 
                          ? 'rgba(46, 204, 113, 0.15)' 
                          : event.victory 
                            ? 'rgba(39, 174, 96, 0.2)'
                            : event.current
                              ? 'rgba(52, 152, 219, 0.2)'
                              : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${event.color}`,
                      }}
                    >
                      <div className="flex items-center gap-2 justify-between sm:justify-start" style={{ flexDirection: index % 2 === 0 ? 'row-reverse' : 'row' }}>
                        <span 
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{ background: event.color, color: '#fff' }}
                        >
                          {event.date}
                        </span>
                        {event.time && (
                          <span className="text-xs" style={{ color: '#888' }}>{event.time}</span>
                        )}
                      </div>
                      <h4 
                        className="font-bold text-sm sm:text-base mt-1"
                        style={{ color: event.exculpatory || event.victory ? '#2ecc71' : '#fff' }}
                      >
                        {event.exculpatory && '✓ '}
                        {event.victory && '🏆 '}
                        {event.current && '📋 '}
                        {event.title}
                      </h4>
                      <p className="text-xs sm:text-sm" style={{ color: '#ccc' }}>
                        {event.description}
                      </p>
                      {event.violations > 0 && (
                        <span 
                          className="inline-block mt-1 text-xs px-2 py-0.5 rounded"
                          style={{ background: 'rgba(231,76,60,0.3)', color: '#e74c3c' }}
                        >
                          +{event.violations} violations
                        </span>
                      )}
                    </div>
                    
                    {/* Center Node */}
                    <div 
                      className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center shrink-0 z-10"
                      style={{ 
                        background: event.color,
                        border: '3px solid #1a1a2e',
                        boxShadow: `0 0 10px ${event.color}`,
                      }}
                    >
                      {event.exculpatory ? (
                        <span className="text-white text-xs">✓</span>
                      ) : event.victory ? (
                        <span className="text-white text-xs">🏆</span>
                      ) : (
                        <ArrowDown className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Empty space for alternating layout */}
                    <div className="hidden sm:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ DIVIDER ============ */}
          <div 
            className="flex items-center gap-4 my-6"
          >
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #d4af37, transparent)' }} />
            <span className="text-sm font-bold px-4" style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}>
              DETAILED VIOLATION EVIDENCE
            </span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #d4af37, transparent)' }} />
          </div>

          {/* ============ PART 2: EXPANDABLE ACCORDION ============ */}
          <div className="space-y-3">
            {VIOLATION_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories[category.id];
              
              return (
                <div 
                  key={category.id}
                  className="rounded-lg overflow-hidden"
                  style={{ 
                    background: category.bgColor,
                    border: `2px solid ${category.color}`,
                  }}
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: category.color }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-sm sm:text-base" style={{ color: '#fff' }}>
                          {category.title}
                        </h3>
                        <p className="text-xs" style={{ color: category.color }}>
                          {category.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{ background: category.color, color: '#fff' }}
                      >
                        {category.count}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" style={{ color: category.color }} />
                      ) : (
                        <ChevronRight className="w-5 h-5" style={{ color: category.color }} />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                      {category.violations.map((violation, vIndex) => {
                        const violationKey = `${category.id}-${vIndex}`;
                        const isViolationExpanded = expandedViolations[violationKey];
                        
                        return (
                          <div 
                            key={vIndex}
                            className="rounded-lg overflow-hidden"
                            style={{ 
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            <button
                              onClick={() => toggleViolation(violationKey)}
                              className="w-full p-3 flex items-start gap-3 hover:bg-white/5 transition-colors text-left"
                            >
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                style={{ 
                                  background: violation.severity === 'critical' 
                                    ? '#c0392b' 
                                    : violation.severity === 'high'
                                      ? '#e67e22'
                                      : '#f1c40f',
                                }}
                              >
                                <span className="text-white text-xs font-bold">{vIndex + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm" style={{ color: '#fff' }}>
                                  {violation.title}
                                </h4>
                                <p className="text-xs truncate" style={{ color: '#888' }}>
                                  {violation.who} — {violation.agency}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span 
                                  className="text-xs px-2 py-0.5 rounded uppercase"
                                  style={{ 
                                    background: violation.severity === 'critical' 
                                      ? 'rgba(192,57,43,0.3)' 
                                      : violation.severity === 'high'
                                        ? 'rgba(230,126,34,0.3)'
                                        : 'rgba(241,196,15,0.3)',
                                    color: violation.severity === 'critical' 
                                      ? '#e74c3c' 
                                      : violation.severity === 'high'
                                        ? '#e67e22'
                                        : '#f1c40f',
                                  }}
                                >
                                  {violation.severity}
                                </span>
                                {isViolationExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </button>
                            
                            {/* Violation Detail */}
                            {isViolationExpanded && (
                              <div 
                                className="px-3 pb-3 pt-0"
                              >
                                <div 
                                  className="p-3 rounded-lg text-sm"
                                  style={{ 
                                    background: 'rgba(212,175,55,0.1)',
                                    borderLeft: `3px solid ${category.color}`,
                                  }}
                                >
                                  <p className="mb-2" style={{ color: '#ccc' }}>
                                    {violation.detail}
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span style={{ color: '#d4af37' }}>
                                      <strong>WHO:</strong> {violation.who}
                                    </span>
                                    <span style={{ color: '#888' }}>|</span>
                                    <span style={{ color: '#d4af37' }}>
                                      <strong>AGENCY:</strong> {violation.agency}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ============ FOOTER SUMMARY ============ */}
          <div 
            className="mt-6 p-4 rounded-lg text-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(192,57,43,0.2) 0%, rgba(142,68,173,0.2) 100%)',
              border: '2px solid #c0392b',
            }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: '#e74c3c', fontFamily: 'Georgia, serif' }}>
              THE TRUTH DEMANDS JUSTICE
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div className="p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="text-2xl font-bold" style={{ color: '#e74c3c' }}>56+</div>
                <div className="text-xs" style={{ color: '#888' }}>Officials Failed</div>
              </div>
              <div className="p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="text-2xl font-bold" style={{ color: '#e67e22' }}>7</div>
                <div className="text-xs" style={{ color: '#888' }}>Counts Reversed</div>
              </div>
              <div className="p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="text-2xl font-bold" style={{ color: '#2ecc71' }}>0</div>
                <div className="text-xs" style={{ color: '#888' }}>Physical Evidence</div>
              </div>
              <div className="p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="text-2xl font-bold" style={{ color: '#3498db' }}>∞</div>
                <div className="text-xs" style={{ color: '#888' }}>Suppressed Truth</div>
              </div>
            </div>
            <p className="text-sm" style={{ color: '#d4af37' }}>
              <em>For Jacob, for Zachary, for Justice.</em> 💙⚖️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationsCascadeHybrid;
