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
    // Force scroll to top when page loads (especially important on mobile)
    window.scrollTo(0, 0);
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
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.98) 100%),
          radial-gradient(ellipse at 30% 20%, rgba(139,69,19,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(42,82,152,0.08) 0%, transparent 50%)
        `,
      }}
    >
      {/* Courthouse columns effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/30 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/30 to-transparent" />
      </div>

      {/* Header with Justicia statue */}
      <div className="relative z-10 border-b border-yellow-900/30 py-4 sm:py-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative">
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />
              <Scale className="w-16 h-16 sm:w-20 sm:h-20 relative z-10" style={{ color: '#d4af37', filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.6))' }} />
            </div>
          </div>
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center tracking-wider gold-embossed"
            style={{ fontFamily: 'Garamond, Georgia, serif', letterSpacing: '0.1em' }}
          >
            BLANKENSHIP
          </h1>
          <div className="text-yellow-600/80 text-center text-xs sm:text-sm uppercase tracking-widest mt-2" style={{ fontFamily: 'Garamond, serif' }}>
            Judicial Archives — Index
          </div>
        </div>
      </div>

      {/* Premium Archive Boxes */}
      <div className="container mx-auto px-4 py-12 sm:py-16 space-y-20 relative z-10">
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
                            className={`p-5 cursor-pointer transition-all duration-700 group ${
                              isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
                            }`}
                            style={{
                              transitionDelay: isOpen ? `${index * 80}ms` : '0ms',
                              background: 'linear-gradient(145deg, #f4e8c1 0%, #e8dcc8 50%, #d4c5a9 100%)',
                              border: '2px solid #8b6914',
                              boxShadow: `
                                0 8px 20px rgba(0, 0, 0, 0.4),
                                inset 0 2px 4px rgba(255,255,255,0.3),
                                inset 0 -2px 4px rgba(0,0,0,0.2)
                              `,
                            }}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm" style={{ color: '#3E2723' }}>
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-semibold">{entry.date || 'Pre-history'}</span>
                                </div>
                                <IconComponent className="w-6 h-6 transition-colors" style={{ color: '#8b6914' }} />
                              </div>
                              <h3 className="text-base font-bold leading-tight group-hover:opacity-80 transition-opacity" style={{ color: '#3E2723', fontFamily: 'Georgia, serif' }}>
                                {entry.header}
                              </h3>
                              {entry.description && (
                                <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: '#5D4037' }}>
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
