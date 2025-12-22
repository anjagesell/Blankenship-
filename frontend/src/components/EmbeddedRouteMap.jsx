import React, { useState } from 'react';
import { MapPin, Clock, Car, Navigation, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

// Embedded Route Map Component for Main Page
const EmbeddedRouteMap = () => {
  const [expanded, setExpanded] = useState(false);
  
  const points = [
    { id: "A", name: "G. & K. Blankenship Residence", address: "174 Woodridge Lane, Mooresville", color: "#dc3545" },
    { id: "B", name: "Big Lots Store", address: "376 W. Plaza Drive, Mooresville", color: "#fd7e14" },
    { id: "C", name: "Zackary Blankenship's Home", address: "6718 Catfish Drive, Sherrills Ford", color: "#ffc107" },
    { id: "D", name: "Dr. Pellegrino's Office", address: "930 W. Wilson Avenue, Mooresville", color: "#20c997" },
    { id: "E", name: "Lake Norman Hospital", address: "171 Fairview Road, Mooresville", color: "#0d6efd" },
  ];
  
  const segments = [
    { from: "A", to: "B", distance: "4.2 mi", time: "8-12 min" },
    { from: "B", to: "C", distance: "9.8 mi", time: "18-25 min" },
    { from: "C", to: "D", distance: "11.2 mi", time: "20-28 min" },
    { from: "D", to: "E", distance: "1.8 mi", time: "4-7 min" },
  ];

  return (
    <div 
      className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        border: '3px solid #d4af37',
      }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
          borderBottom: '2px solid #d4af37',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6" style={{ color: '#d4af37' }} />
          <div>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
              Geographic Route Analysis — November 30, 2013
            </h3>
            <p className="text-xs text-gray-400">Saturday (Day after Thanksgiving) — Evidence Timeline Mapping</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(13,110,253,0.2)', color: '#60a5fa' }}>
              <Car className="w-4 h-4" /> 27.0 miles
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>
              <Clock className="w-4 h-4" /> 50-72 min
            </span>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>
      
      {/* Route Visualization - Always Visible */}
      <div className="p-4">
        {/* Horizontal Route Display */}
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {points.map((point, index) => (
            <React.Fragment key={point.id}>
              {/* Point */}
              <div className="flex flex-col items-center min-w-[80px]">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white"
                  style={{ background: point.color }}
                >
                  {point.id}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-semibold text-white truncate max-w-[100px]">{point.name.split(' ').slice(0, 2).join(' ')}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[100px]">{point.address.split(',')[0]}</div>
                </div>
              </div>
              
              {/* Connector */}
              {index < segments.length && (
                <div className="flex-1 flex flex-col items-center mx-1 min-w-[60px]">
                  <div className="w-full h-1 bg-gradient-to-r from-gray-500 to-gray-400 relative">
                    <Navigation className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="flex gap-2 mt-1 text-[10px]">
                    <span className="text-blue-400">{segments[index].distance}</span>
                    <span className="text-green-400">{segments[index].time}</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Mobile Stats */}
        <div className="flex sm:hidden items-center justify-center gap-4 mt-4 text-sm">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(13,110,253,0.2)', color: '#60a5fa' }}>
            <Car className="w-4 h-4" /> 27.0 miles
          </span>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <Clock className="w-4 h-4" /> 50-72 min
          </span>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* Detailed Route Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Left Column - Points */}
            <div 
              className="p-4 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <h4 className="text-sm font-bold mb-3" style={{ color: '#d4af37' }}>LOCATION DETAILS</h4>
              <div className="space-y-3">
                {points.map(point => (
                  <div key={point.id} className="flex items-start gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: point.color }}
                    >
                      {point.id}
                    </div>
                    <div>
                      <div className="text-sm text-white font-semibold">{point.name}</div>
                      <div className="text-xs text-gray-400">{point.address}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column - Critical Notes */}
            <div 
              className="p-4 rounded-lg"
              style={{ background: 'rgba(139,0,0,0.2)', border: '1px solid rgba(139,0,0,0.3)' }}
            >
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#dc3545' }}>
                <AlertTriangle className="w-4 h-4" /> CRITICAL ANALYSIS
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li>• Route crosses TWO counties (Iredell & Catawba)</li>
                <li>• NC-150 was congested two-lane highway in 2013</li>
                <li>• Nov 30, 2013 = Black Friday weekend traffic</li>
                <li>• <strong className="text-white">50-72 min is DRIVING ONLY</strong> — excludes stops, parking, waiting at each location</li>
                <li>• Medical visits & store stops add significant time</li>
              </ul>
            </div>
          </div>
          
          {/* Analysis Statement */}
          <div 
            className="p-3 rounded-lg text-center"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <p className="text-sm text-gray-300" style={{ fontFamily: 'Georgia, serif' }}>
              The total minimum driving time of <strong className="text-white">50-72 minutes</strong> raises 
              significant questions about the timeline of events as presented under oath.
            </p>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div 
        className="px-4 py-2 text-center text-xs"
        style={{ background: 'rgba(0,0,0,0.4)', color: '#666' }}
      >
        Click to {expanded ? 'collapse' : 'expand'} detailed analysis • Blankenship Case Evidence
      </div>
    </div>
  );
};

export default EmbeddedRouteMap;
