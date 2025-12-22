import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indexEntries } from '../mock';
import { Card } from '../components/ui/card';
import { Calendar, PlayCircle, Boxes, Scale, AlertTriangle, HeartCrack, FileText, History, ChevronDown, ChevronUp } from 'lucide-react';

// Icon mapping
const iconMap = {
  'History': History,
  'PlayCircle': PlayCircle,
  'Boxes': Boxes,
  'Scale': Scale,
  'AlertTriangle': AlertTriangle,
  'HeartCrack': HeartCrack,
  'FileText': FileText, // Default icon
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
      // Pre-history goes to 2013
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
    <div className="min-h-screen bg-white">
      {/* Header with Justicia statue */}
      <div className="bg-white border-b border-gray-200 py-4 sm:py-6">
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

      {/* Premium 3D Wooden Crates by Year */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes crateOpen {
          0% { transform: perspective(1500px) rotateX(0deg) translateZ(0); }
          100% { transform: perspective(1500px) rotateX(-115deg) translateZ(80px) translateY(-40px); }
        }
        @keyframes crateClosed {
          0% { transform: perspective(1500px) rotateX(-115deg) translateZ(80px) translateY(-40px); }
          100% { transform: perspective(1500px) rotateX(0deg) translateZ(0); }
        }
        .crate-lid-open {
          animation: crateOpen 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .crate-lid-closed {
          animation: crateClosed 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
      `}} />
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 space-y-16">
        {years.map((year) => {
          const isOpen = openYears[year];
          const yearEntries = entriesByYear[year];
          
          return (
            <div key={year} className="relative mb-20" style={{ perspective: '1500px', perspectiveOrigin: 'center top' }}>
              {/* 3D Wooden Crate Container */}
              <div className="relative mx-auto max-w-4xl" style={{ transformStyle: 'preserve-3d' }}>
                {/* Crate Body (Bottom Box) */}
                <div 
                  className="relative rounded-lg overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #5C3317 0%, #4A2511 50%, #3E1F0F 100%)',
                    boxShadow: `
                      0 20px 60px rgba(0,0,0,0.5),
                      inset 0 -5px 20px rgba(0,0,0,0.6),
                      inset 0 5px 10px rgba(139,69,19,0.3)
                    `,
                    border: '6px solid #2C1810',
                    minHeight: '120px',
                  }}
                >
                  {/* Wood planks effect */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          0deg,
                          transparent,
                          transparent 40px,
                          rgba(0,0,0,0.3) 40px,
                          rgba(0,0,0,0.3) 42px
                        ),
                        repeating-linear-gradient(
                          90deg,
                          rgba(139,69,19,0.1) 0px,
                          rgba(101,67,33,0.1) 2px,
                          transparent 2px,
                          transparent 4px
                        )
                      `,
                    }}
                  />
                  
                  {/* Metal straps */}
                  <div className="absolute top-1/2 left-0 right-0 h-3 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 opacity-70 -translate-y-1/2" 
                       style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)' }} />
                  <div className="absolute top-1/4 left-0 right-0 h-2 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 opacity-60" 
                       style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.6)' }} />
                  <div className="absolute top-3/4 left-0 right-0 h-2 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 opacity-60" 
                       style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.6)' }} />
                  
                  {/* Corner bolts */}
                  {[
                    'top-4 left-4', 'top-4 right-4', 
                    'bottom-4 left-4', 'bottom-4 right-4',
                    'top-1/2 left-4', 'top-1/2 right-4'
                  ].map((pos, i) => (
                    <div 
                      key={i}
                      className={`absolute ${pos} w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-600`}
                      style={{ 
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.8)',
                        transform: 'translateZ(10px)'
                      }}
                    />
                  ))}
                  
                  {/* Crate Lid - 3D Opening Animation */}
                  <button
                    onClick={() => toggleYear(year)}
                    className="absolute inset-0 z-10 cursor-pointer"
                  >
                    <div 
                      className="absolute inset-0 rounded-lg transition-all duration-700 ease-out"
                      style={{
                        background: 'linear-gradient(160deg, #6B4423 0%, #5C3317 40%, #4A2511 100%)',
                        transformOrigin: 'top center',
                        transform: isOpen ? 'rotateX(-120deg) translateY(-10px)' : 'rotateX(0deg)',
                        transformStyle: 'preserve-3d',
                        boxShadow: isOpen 
                          ? '0 -10px 40px rgba(0,0,0,0.7), inset 0 5px 15px rgba(139,69,19,0.4)'
                          : '0 5px 30px rgba(0,0,0,0.6), inset 0 -3px 10px rgba(0,0,0,0.5)',
                        border: '5px solid #2C1810',
                        zIndex: isOpen ? 20 : 10,
                      }}
                    >
                      {/* Lid wood texture */}
                      <div 
                        className="absolute inset-0 opacity-40 rounded-lg"
                        style={{
                          backgroundImage: `
                            repeating-linear-gradient(
                              90deg,
                              transparent,
                              transparent 60px,
                              rgba(0,0,0,0.2) 60px,
                              rgba(0,0,0,0.2) 62px
                            )
                          `,
                        }}
                      />
                      
                      {/* Lid metal hinges */}
                      <div className="absolute top-2 left-1/4 w-12 h-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded"
                           style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.3)' }} />
                      <div className="absolute top-2 right-1/4 w-12 h-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded"
                           style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.3)' }} />
                      
                      {/* Year Label on Lid */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <Boxes className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 drop-shadow-lg" />
                            <h2 
                              className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400"
                              style={{ 
                                fontFamily: 'Georgia, serif',
                                textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(255,215,0,0.3)',
                                letterSpacing: '0.05em'
                              }}
                            >
                              {year}
                            </h2>
                          </div>
                          <div 
                            className="text-yellow-200 text-sm sm:text-base font-semibold"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                          >
                            {isOpen ? 'Click to Close' : 'Click to Open'}
                          </div>
                          <div className="text-yellow-300/80 text-xs sm:text-sm mt-1">
                            ({yearEntries.length} {yearEntries.length === 1 ? 'item' : 'items'})
                          </div>
                        </div>
                      </div>
                      
                      {/* Lid lock/latch */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <div 
                          className="w-8 h-10 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-sm"
                          style={{ 
                            boxShadow: '0 3px 6px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,215,0,0.4)',
                            clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)'
                          }}
                        />
                      </div>
                    </div>
                  </button>
                  
                  {/* Inside of Crate - Visible when open */}
                  <div 
                    className={`relative transition-all duration-700 ease-out ${
                      isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
                    }`}
                    style={{
                      paddingTop: '80px',
                      paddingBottom: '30px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                    }}
                  >
                    <div className="relative">
                      {/* Glowing light effect from inside */}
                      {isOpen && (
                        <div 
                          className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full"
                          style={{
                            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
                            filter: 'blur(20px)',
                          }}
                        />
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {yearEntries.map((entry, index) => {
                          const IconComponent = entry.icon ? iconMap[entry.icon] || FileText : FileText;
                          
                          return (
                            <Card
                              key={entry.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/entry/${entry.id}`);
                              }}
                              className={`p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-500 border-2 border-gray-200 hover:border-yellow-500 bg-white/95 backdrop-blur group ${
                                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                              }`}
                              style={{
                                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              }}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-semibold">{entry.date || 'N/A'}</span>
                                  </div>
                                  <IconComponent className="w-6 h-6 text-amber-600 group-hover:text-amber-700" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                                  {entry.header}
                                </h3>
                                {entry.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IndexPage;