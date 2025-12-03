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

      {/* Wooden Crates by Year */}
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 space-y-6">
        {years.map((year) => {
          const isOpen = openYears[year];
          const yearEntries = entriesByYear[year];
          
          return (
            <div key={year} className="overflow-hidden">
              {/* Wooden Crate Header */}
              <button
                onClick={() => toggleYear(year)}
                className="w-full relative group"
              >
                <div 
                  className="relative p-6 sm:p-8 rounded-lg transition-all duration-300 hover:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #4A2511 100%)',
                    border: '4px solid #3E1F0F',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Wood grain texture overlay */}
                  <div 
                    className="absolute inset-0 opacity-20 rounded-lg"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 2px,
                        rgba(0,0,0,0.1) 2px,
                        rgba(0,0,0,0.1) 4px
                      )`,
                    }}
                  />
                  
                  {/* Crate metal corners */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gray-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gray-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gray-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gray-400" />
                  
                  {/* Content */}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Boxes className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200" />
                      <h2 
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-100"
                        style={{ 
                          fontFamily: 'Georgia, serif',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                        }}
                      >
                        {year}
                      </h2>
                      <span className="text-amber-200 text-sm sm:text-base">
                        ({yearEntries.length} {yearEntries.length === 1 ? 'entry' : 'entries'})
                      </span>
                    </div>
                    
                    {isOpen ? (
                      <ChevronUp className="w-6 h-6 sm:w-8 sm:h-8 text-amber-200 transition-transform" />
                    ) : (
                      <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-amber-200 transition-transform" />
                    )}
                  </div>
                </div>
              </button>
              
              {/* Expanded Content - Months inside the crate */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
              >
                <div 
                  className="p-4 sm:p-6 rounded-lg"
                  style={{
                    background: 'linear-gradient(to bottom, #D2691E 0%, #A0522D 100%)',
                    border: '3px solid #654321',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {yearEntries.map((entry) => {
                      const IconComponent = entry.icon ? iconMap[entry.icon] || FileText : FileText;
                      
                      return (
                        <Card
                          key={entry.id}
                          onClick={() => navigate(`/entry/${entry.id}`)}
                          className="p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 bg-white group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span className="font-semibold">{entry.date || 'N/A'}</span>
                              </div>
                              <IconComponent className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
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
          );
        })}
      </div>
    </div>
  );
};

export default IndexPage;