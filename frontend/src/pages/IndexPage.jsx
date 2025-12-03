import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indexEntries } from '../mock';
import { Card } from '../components/ui/card';
import { Calendar, PlayCircle, Boxes, Scale, AlertTriangle, HeartCrack, FileText, History, Lock, LockOpen } from 'lucide-react';

// Icon mapping
const iconMap = {
  'History': History,
  'PlayCircle': PlayCircle,
  'Boxes': Boxes,
  'Scale': Scale,
  'AlertTriangle': AlertTriangle,
  'HeartCrack': HeartCrack,
  'FileText': FileText,
};

const IndexPage = () => {
  const navigate = useNavigate();
  const [openYears, setOpenYears] = useState({});

  useEffect(() => {
    document.title = 'Blankenship';
  }, []);

  // Group entries by year
  const entriesByYear = indexEntries.reduce((acc, entry) => {
    if (entry.id === 0) {
      if (!acc['2013']) acc['2013'] = [];
      acc['2013'].push(entry);
    } else if (entry.date) {
      const year = entry.date.split('/')[1];
      if (!acc[year]) acc[year] = [];
      acc[year].push(entry);
    }
    return acc;
  }, {});

  const years = Object.keys(entriesByYear).sort();

  const toggleYear = (year) => {
    setOpenYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with Justicia statue */}
      <div className="bg-white border-b border-gray-200 py-4 sm:py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxMYWR5JTIwSnVzdGljZSUyMHN0YXR1ZXxlbnwwfHx8fDE3NjQ0MzcxNzZ8MA&ixlib=rb-4.1.0&q=85"
              alt="Justicia Bronze Statue"
              className="h-20 sm:h-28 md:h-32 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            Blankenship
          </h1>
        </div>
      </div>

      {/* Premium Archive Boxes */}
      <div className="container mx-auto px-4 py-12 sm:py-16 space-y-20">
        {years.map((year) => {
          const isOpen = openYears[year];
          const yearEntries = entriesByYear[year];
          
          return (
            <div 
              key={year} 
              className="relative mx-auto max-w-5xl"
              style={{ 
                perspective: '2000px',
                perspectiveOrigin: 'center 200px'
              }}
            >
              {/* Archive Box Container */}
              <div 
                className="relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Box Base - Dark Walnut Finish */}
                <div 
                  className="relative overflow-visible rounded-sm"
                  style={{
                    background: `
                      linear-gradient(145deg, 
                        #3A2617 0%,
                        #2B1810 25%,
                        #1F120C 50%,
                        #2B1810 75%,
                        #3A2617 100%
                      )
                    `,
                    boxShadow: `
                      0 30px 80px -20px rgba(0, 0, 0, 0.7),
                      0 15px 40px -15px rgba(0, 0, 0, 0.5),
                      inset 0 -8px 25px rgba(0, 0, 0, 0.6),
                      inset 0 2px 4px rgba(90, 60, 40, 0.15),
                      inset 0 0 60px rgba(0, 0, 0, 0.4)
                    `,
                    border: '1px solid #1A0F0A',
                    minHeight: '180px',
                    transform: 'translateZ(0)',
                  }}
                >
                  {/* Leather texture overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        radial-gradient(ellipse at 30% 40%, rgba(70, 50, 35, 0.1) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 60%, rgba(50, 35, 25, 0.1) 0%, transparent 50%),
                        repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 1px,
                          rgba(0, 0, 0, 0.03) 1px,
                          rgba(0, 0, 0, 0.03) 2px
                        )
                      `,
                      opacity: 0.6,
                    }}
                  />

                  {/* Brass corner protectors */}
                  {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-6 h-6`}>
                      <div 
                        className="w-full h-full"
                        style={{
                          background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 50%, #6B5310 100%)',
                          clipPath: i < 2 
                            ? 'polygon(0 0, 100% 0, 100% 30%, 30% 30%, 30% 100%, 0 100%)'
                            : 'polygon(0 0, 30% 0, 30% 70%, 100% 70%, 100% 100%, 0 100%)',
                          boxShadow: `
                            inset 0 1px 0 rgba(255, 215, 0, 0.3),
                            0 2px 6px rgba(0, 0, 0, 0.5)
                          `,
                        }}
                      />
                    </div>
                  ))}

                  {/* Brass center clasp */}
                  <div className="absolute top-1/2 right-8 -translate-y-1/2">
                    <div 
                      className="relative"
                      style={{
                        width: '32px',
                        height: '48px',
                        background: 'linear-gradient(to right, #8B6914 0%, #B8860B 50%, #8B6914 100%)',
                        borderRadius: '4px',
                        boxShadow: `
                          inset 0 1px 0 rgba(255, 215, 0, 0.4),
                          0 3px 8px rgba(0, 0, 0, 0.6)
                        `,
                      }}
                    >
                      {isOpen ? (
                        <LockOpen className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-900" />
                      ) : (
                        <Lock className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-900" />
                      )}
                    </div>
                  </div>

                  {/* Box Lid with 3D opening */}
                  <button
                    onClick={() => toggleYear(year)}
                    className="absolute inset-0 cursor-pointer focus:outline-none group"
                  >
                    <div 
                      className="absolute inset-0 transition-all duration-1000 ease-out"
                      style={{
                        background: `
                          linear-gradient(160deg,
                            #4A3225 0%,
                            #382416 30%,
                            #2B1810 60%,
                            #1F120C 100%
                          )
                        `,
                        transformOrigin: 'top center',
                        transform: isOpen 
                          ? 'rotateX(-125deg) translateY(-20px) translateZ(100px) scale(1.02)'
                          : 'rotateX(0deg) translateY(0) translateZ(20px)',
                        transformStyle: 'preserve-3d',
                        boxShadow: isOpen
                          ? `
                              0 -15px 60px rgba(0, 0, 0, 0.8),
                              0 -5px 25px rgba(0, 0, 0, 0.6),
                              inset 0 8px 20px rgba(60, 40, 25, 0.2),
                              inset 0 -2px 10px rgba(0, 0, 0, 0.5)
                            `
                          : `
                              0 15px 50px rgba(0, 0, 0, 0.6),
                              0 8px 25px rgba(0, 0, 0, 0.4),
                              inset 0 -6px 20px rgba(0, 0, 0, 0.5),
                              inset 0 2px 6px rgba(70, 50, 35, 0.15)
                            `,
                        border: '1px solid #1A0F0A',
                        borderRadius: '2px',
                        zIndex: isOpen ? 30 : 10,
                      }}
                    >
                      {/* Lid texture */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `
                            linear-gradient(90deg, transparent 48%, rgba(0, 0, 0, 0.1) 49%, rgba(0, 0, 0, 0.1) 51%, transparent 52%),
                            radial-gradient(ellipse at 40% 30%, rgba(80, 55, 35, 0.08) 0%, transparent 60%)
                          `,
                          opacity: 0.7,
                        }}
                      />

                      {/* Brass hinge detail on lid */}
                      <div 
                        className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-3 rounded-sm"
                        style={{
                          background: 'linear-gradient(to bottom, #B8860B 0%, #8B6914 100%)',
                          boxShadow: `
                            inset 0 1px 0 rgba(255, 215, 0, 0.4),
                            0 2px 6px rgba(0, 0, 0, 0.6)
                          `,
                        }}
                      />

                      {/* Embossed year label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <h2 
                          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 tracking-wider"
                          style={{ 
                            fontFamily: 'Georgia, serif',
                            background: 'linear-gradient(to bottom, #D4AF37 0%, #AA8A2A 50%, #8B6914 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6))',
                          }}
                        >
                          {year}
                        </h2>
                        <div 
                          className="text-yellow-700/80 text-sm font-medium uppercase tracking-widest"
                          style={{ 
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                            fontFamily: 'Georgia, serif'
                          }}
                        >
                          {isOpen ? 'Archive Open' : 'Click to Open'}
                        </div>
                        <div className="text-yellow-800/60 text-xs mt-1">
                          {yearEntries.length} Document{yearEntries.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Contents Inside Box */}
                  <div 
                    className={`relative transition-all duration-1000 ${
                      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    style={{
                      paddingTop: '100px',
                      paddingBottom: '40px',
                      paddingLeft: '30px',
                      paddingRight: '30px',
                    }}
                  >
                    {/* Subtle glow from inside */}
                    {isOpen && (
                      <div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                        style={{
                          background: 'radial-gradient(ellipse, rgba(212, 175, 55, 0.08) 0%, transparent 60%)',
                          filter: 'blur(40px)',
                        }}
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {yearEntries.map((entry, index) => {
                        const IconComponent = entry.icon ? iconMap[entry.icon] || FileText : FileText;
                        
                        return (
                          <Card
                            key={entry.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/entry/${entry.id}`);
                            }}
                            className={`p-5 cursor-pointer transition-all duration-700 border border-gray-300 hover:border-yellow-700 bg-white hover:shadow-2xl group ${
                              isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
                            }`}
                            style={{
                              transitionDelay: isOpen ? `${index * 80}ms` : '0ms',
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            }}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-semibold">{entry.date || 'Pre-history'}</span>
                                </div>
                                <IconComponent className="w-6 h-6 text-yellow-700 group-hover:text-yellow-800 transition-colors" />
                              </div>
                              <h3 className="text-base font-bold text-gray-900 group-hover:text-yellow-800 transition-colors leading-tight">
                                {entry.header}
                              </h3>
                              {entry.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                  {entry.description}
                                </p>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IndexPage;
