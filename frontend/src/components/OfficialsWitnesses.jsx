import React, { useState } from 'react';
import { X, Users, Scale, Shield, Briefcase, Heart, Stethoscope, FileText, User, ChevronDown, ChevronUp } from 'lucide-react';

// Comprehensive list of officials and witnesses extracted from case files
const officialsData = {
  categories: [
    {
      id: 'judges',
      title: 'Judges & Court Officials',
      icon: Scale,
      color: '#d4af37',
      people: [
        { lastName: 'Hunter Jr.', firstName: 'Robert N.', role: 'Judge - NC Court of Appeals', title: 'Judge' },
        { lastName: 'Brady', firstName: 'Robert M.', role: 'District Court Judge', title: 'Hon.' },
        { lastName: 'Joe', firstName: 'Regina M.', role: 'District Court Judge', title: 'Judge' },
        { lastName: 'Poovey', firstName: 'Nathaniel', role: 'Judge', title: 'Judge' },
        { lastName: 'Bell', firstName: 'George', role: 'Judge', title: 'Judge' },
        { lastName: 'Bingham', firstName: 'Debra', role: 'Court Reporter', title: '' },
        { lastName: 'Rathbone', firstName: 'M. L.', role: 'Magistrate', title: '' },
      ]
    },
    {
      id: 'law_enforcement',
      title: 'Law Enforcement',
      icon: Shield,
      color: '#0d6efd',
      people: [
        { lastName: 'Reid', firstName: 'Coy', role: 'Sheriff - Catawba County', title: '' },
        { lastName: 'McCombs', firstName: 'Marcella', role: 'Senior Investigator - CCSO', title: 'Inv.' },
        { lastName: 'Scronce', firstName: 'Thad', role: 'Sergeant - CCSO', title: 'Sgt.' },
        { lastName: 'Fischer', firstName: '', role: 'Sergeant - Sheriff\'s Dept. Supervisor', title: 'Sgt.' },
        { lastName: 'Coffey', firstName: '', role: 'Sheriff\'s Deputy', title: 'Officer' },
        { lastName: 'Kisby', firstName: '', role: 'Law Enforcement Officer', title: 'Officer' },
        { lastName: 'Eckard', firstName: 'D.', role: 'Law Enforcement', title: '' },
        { lastName: 'Scerance', firstName: '', role: 'Catawba County Sheriff\'s Office', title: '' },
        { lastName: 'Scott', firstName: '', role: 'Law Enforcement Officer', title: '' },
        { lastName: 'Ishee', firstName: 'Todd', role: 'Prison Official - NC Dept. of Public Safety', title: '' },
      ]
    },
    {
      id: 'social_services',
      title: 'Social Services / CPS',
      icon: Users,
      color: '#e74c3c',
      people: [
        { lastName: 'Owen', firstName: 'Jennifer', role: 'CPS Supervisor', title: '' },
        { lastName: 'Mecimore', firstName: 'Amber', role: 'CPS Lead Case Worker', title: '' },
        { lastName: 'Stock', firstName: 'Sherri', role: 'CPS Social Worker', title: '' },
        { lastName: 'Frazier', firstName: 'Pam', role: 'SW Iredell County DSS', title: '' },
        { lastName: 'Ingram', firstName: 'Jennifer', role: 'Social Worker - NC DSS', title: '' },
        { lastName: 'Barber', firstName: 'Lena', role: 'CPS Social Worker', title: '' },
        { lastName: 'Reitzel', firstName: '', role: 'CPS Social Worker', title: '' },
        { lastName: 'Punch', firstName: 'Charity', role: 'Social Worker', title: '' },
        { lastName: 'Sigmon', firstName: '', role: 'Social Worker', title: '' },
        { lastName: 'Harper', firstName: 'Tania', role: 'Guardian ad Litem', title: '' },
        { lastName: 'Smith', firstName: 'Sydney', role: 'Guardian ad Litem', title: '' },
      ]
    },
    {
      id: 'attorneys',
      title: 'Attorneys & Legal',
      icon: Briefcase,
      color: '#8b5cf6',
      people: [
        { lastName: 'Gaither Jr.', firstName: 'James C.', role: 'District Attorney', title: '' },
        { lastName: 'Lerner', firstName: 'David', role: 'District Attorney', title: '' },
        { lastName: 'Stein', firstName: 'Joshua H.', role: 'NC Attorney General', title: '' },
        { lastName: 'Middleton', firstName: 'Anne M.', role: 'Special Deputy Attorney General (Prosecution)', title: '' },
        { lastName: 'Van Buren', firstName: '', role: 'Assistant District Attorney / Prosecutor', title: '' },
        { lastName: 'Conrad', firstName: 'Scott D.', role: 'Attorney at Law', title: '' },
        { lastName: 'Pearce', firstName: 'Herbert', role: 'Attorney for Defendant (Resentencing)', title: '' },
        { lastName: 'Rhoades Jr.', firstName: 'Jerry', role: 'Attorney at Law', title: '' },
        { lastName: 'Eldred', firstName: 'Ed', role: 'Appellate Counsel', title: '' },
        { lastName: 'Montgomery', firstName: 'Mark', role: 'Appellate Counsel', title: '' },
        { lastName: 'McKay', firstName: 'Mary', role: 'Attorney for the Mother', title: '' },
        { lastName: 'de Torres', firstName: 'E.X.', role: 'Attorney for the Father', title: '' },
        { lastName: 'Curry', firstName: '', role: 'Defense Attorney (TPR Proceedings)', title: 'Ms.' },
        { lastName: 'Reilly', firstName: 'Scott', role: 'Attorney', title: '' },
        { lastName: 'Adams', firstName: '', role: 'Attorney', title: '' },
        { lastName: 'Vaughan', firstName: 'Lauren', role: 'Attorney for DSS', title: '' },
        { lastName: 'Butler', firstName: 'Terra', role: 'Legal Assistant', title: '' },
      ]
    },
    {
      id: 'medical',
      title: 'Medical Personnel',
      icon: Stethoscope,
      color: '#20c997',
      people: [
        { lastName: 'Lucktong', firstName: 'Ekachai', role: 'ED Physician - Lake Norman Regional Medical Center', title: 'Dr.' },
        { lastName: 'Abbott', firstName: 'Kristi D.', role: 'Private MD / Primary Care Physician', title: 'Dr.' },
        { lastName: 'Walker (Mahaffey)', firstName: 'Amy', role: 'S.A.N.E. Nurse - Lake Norman ER', title: '' },
        { lastName: 'Oshbar', firstName: 'Beth', role: 'Nurse Practitioner - Child Advocacy Center', title: '' },
        { lastName: 'Opdike', firstName: 'Adrienne', role: 'Forensic Interviewer', title: '' },
        { lastName: 'Loudermelt (Wachsmuth)', firstName: 'Connie', role: 'Therapist', title: '' },
        { lastName: 'Pellegrino', firstName: '', role: 'Physician', title: 'Dr.' },
      ]
    },
    {
      id: 'family',
      title: 'Family Members',
      icon: Heart,
      color: '#ec4899',
      people: [
        { lastName: 'Blankenship', firstName: 'Zachary (Zack)', role: 'Defendant / Father', title: '' },
        { lastName: 'Blankenship', firstName: 'Tammy', role: 'Wife / Mother', title: '' },
        { lastName: 'Blankenship', firstName: 'Jacob', role: 'Son', title: '' },
        { lastName: 'Blankenship', firstName: 'Rylie', role: 'Child', title: '' },
        { lastName: 'Blankenship', firstName: 'Keith', role: 'Grandfather (Paternal)', title: '' },
        { lastName: 'Blankenship', firstName: 'Gabriele', role: 'Grandmother (Paternal)', title: '' },
        { lastName: 'Toppings', firstName: 'Vickie', role: 'Family Member', title: '' },
        { lastName: 'Christopher', firstName: 'Eddi', role: 'Family Member', title: '' },
        { lastName: 'Christopher', firstName: 'Lilly', role: 'Family Member', title: '' },
        { lastName: 'Ladder', firstName: 'Megan', role: 'Bobbi Jo Christopher\'s Daughter', title: '' },
        { lastName: 'Ladder', firstName: 'Christopher', role: 'Son-in-law', title: '' },
      ]
    },
    {
      id: 'witnesses',
      title: 'Witnesses & Others',
      icon: User,
      color: '#f59e0b',
      people: [
        { lastName: 'Christopher', firstName: 'Bobbi Jo', role: 'Foster Parent / Witness', title: '' },
        { lastName: 'Osborne', firstName: '', role: 'Pastor', title: 'Pastor' },
        { lastName: 'Brown', firstName: 'Donna', role: 'DSS Staff', title: '' },
      ]
    },
  ]
};

const OfficialsWitnesses = ({ onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState(
    officialsData.categories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const totalPeople = officialsData.categories.reduce((sum, cat) => sum + cat.people.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
          border: '2px solid #d4af37',
          boxShadow: '0 0 60px rgba(212,175,55,0.3)',
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 px-6 py-4 border-b"
          style={{ 
            background: 'linear-gradient(145deg, #2c2c4a 0%, #1a1a2e 100%)',
            borderColor: 'rgba(212,175,55,0.3)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" style={{ color: '#d4af37' }} />
              <div>
                <h2 
                  className="text-2xl font-bold"
                  style={{ 
                    color: '#d4af37',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  Officials / Witnesses
                </h2>
                <p className="text-sm text-gray-400">
                  {totalPeople} individuals identified across all case documents
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(212,175,55,0.2)' }}
            >
              <X className="w-6 h-6" style={{ color: '#d4af37' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <div className="space-y-4">
            {officialsData.categories.map((category) => {
              const IconComponent = category.icon;
              const isExpanded = expandedCategories[category.id];
              
              return (
                <div 
                  key={category.id}
                  className="rounded-lg overflow-hidden"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${category.color}40`,
                  }}
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-4 py-3 flex items-center justify-between transition-all hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: `${category.color}20` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <span 
                        className="font-bold text-lg"
                        style={{ color: category.color, fontFamily: 'Georgia, serif' }}
                      >
                        {category.title}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ 
                          background: `${category.color}30`,
                          color: category.color,
                        }}
                      >
                        {category.people.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* People List */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.people.map((person, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-white/5"
                            style={{ 
                              background: 'rgba(255,255,255,0.03)',
                              borderLeft: `3px solid ${category.color}`,
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white truncate">
                                {person.title && <span className="text-gray-400">{person.title} </span>}
                                <span style={{ color: category.color }}>{person.lastName}</span>
                                {person.firstName && <span className="text-gray-300">, {person.firstName}</span>}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {person.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div 
            className="mt-6 p-4 rounded-lg text-center"
            style={{ 
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <p className="text-sm text-gray-400">
              <span style={{ color: '#d4af37' }}>⚖️</span> This list is compiled from official case documents, court records, and investigation files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialsWitnesses;
