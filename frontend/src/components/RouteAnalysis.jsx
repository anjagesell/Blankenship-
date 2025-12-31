import React, { useState } from 'react';
import { X, MapPin, Clock, Car, Navigation, AlertTriangle, Flag, ChevronDown, ChevronUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Route data for November 30, 2013 analysis
const routeData = {
  date: "November 30, 2013",
  dayOfWeek: "Saturday",
  weather: "Typical late November conditions",
  
  points: [
    {
      id: "A",
      name: "Starting Point",
      address: "174 Woodridge Lane, Mooresville, NC 28117",
      description: "G. & K. Blankenship Residence",
      type: "residence",
      color: "#dc3545",
    },
    {
      id: "B", 
      name: "Big Lots Store",
      address: "376 W. Plaza Drive, Mooresville, NC 28117",
      description: "Retail/Shopping Plaza",
      type: "commercial",
      color: "#fd7e14",
    },
    {
      id: "C",
      name: "Zackary Blankenship's Home",
      address: "6718 Catfish Drive, Sherrills Ford, NC 28673",
      description: "Alleged Victim's Residence - Catawba County",
      type: "residence",
      color: "#ffc107",
    },
    {
      id: "D",
      name: "Dr. Pellegrino's Office",
      address: "930 W. Wilson Avenue, Mooresville, NC 28117",
      description: "Trinity Health Care Medical Office",
      type: "medical",
      color: "#20c997",
    },
    {
      id: "E",
      name: "Lake Norman Hospital",
      address: "171 Fairview Road, Mooresville, NC 28117",
      description: "Lake Norman Regional Medical Center (now Duke Health)",
      type: "hospital",
      color: "#0d6efd",
    },
  ],
  
  segments: [
    {
      from: "A",
      to: "B",
      distance: "4.2 miles",
      estimatedTime: "8-12 minutes",
      speedLimit: "35 mph (residential/commercial)",
      route: "Woodridge Ln → Johnson Dairy Rd → W. Plaza Dr",
      trafficLights: "3-4 signalized intersections",
      stopSigns: "2-3 residential stop signs",
      roadConditions: "Paved, two-lane residential transitioning to commercial plaza",
      observations: [
        "Short local trip within Mooresville city limits",
        "Saturday traffic typically lighter than weekdays",
        "Plaza area has moderate parking lot congestion",
      ],
    },
    {
      from: "B",
      to: "C",
      distance: "9.8 miles",
      estimatedTime: "18-25 minutes",
      speedLimit: "35-55 mph (varies: commercial → highway → rural)",
      route: "W. Plaza Dr → NC-150 West → Sherrills Ford Rd → Catfish Dr",
      trafficLights: "5-7 signalized intersections on NC-150",
      stopSigns: "1-2 at rural intersections",
      roadConditions: "NC-150 was two-lane in 2013 (now being widened), rural roads",
      observations: [
        "Crosses county line: Iredell County → Catawba County",
        "NC-150 had ~17,500 vehicles/day traffic volume in 2013",
        "Catfish Drive is a rural/lakeside residential road",
        "This is the LONGEST segment of the journey",
      ],
    },
    {
      from: "C",
      to: "D",
      distance: "11.2 miles",
      estimatedTime: "20-28 minutes",
      speedLimit: "35-55 mph (rural → highway → commercial)",
      route: "Catfish Dr → Sherrills Ford Rd → NC-150 East → W. Wilson Ave",
      trafficLights: "5-7 signalized intersections",
      stopSigns: "1-2 rural stop signs",
      roadConditions: "Return route via NC-150, then commercial Mooresville streets",
      observations: [
        "Essentially reverse of B→C with different destination",
        "W. Wilson Avenue is a main commercial/medical corridor",
        "Trinity Health Care located in medical office complex",
      ],
    },
    {
      from: "D",
      to: "E",
      distance: "1.8 miles",
      estimatedTime: "4-7 minutes",
      speedLimit: "35 mph (commercial/medical district)",
      route: "W. Wilson Ave → Fairview Rd",
      trafficLights: "2-3 signalized intersections",
      stopSigns: "1 possible",
      roadConditions: "Paved commercial streets, hospital zone",
      observations: [
        "Very short distance - both in medical district",
        "Hospital has dedicated emergency access routes",
        "Minimal traffic impact on this short segment",
      ],
    },
  ],
  
  totalAnalysis: {
    totalDistance: "27.0 miles (approximate)",
    totalDrivingTime: "50-72 minutes (minimum under ideal conditions)",
    criticalNotes: [
      "Total route covers TWO counties (Iredell & Catawba)",
      "NC-150 was a congested two-lane highway in 2013",
      "Saturday Nov 30, 2013 was day after Thanksgiving (Black Friday weekend) - potential retail traffic",
      "Medical office and hospital visits add waiting time NOT included in driving estimates",
      "Any stops at each location add significant time to total journey",
    ],
  },
};

// Visual Route Map Component
const RouteMap = ({ points, segments }) => {
  const [expandedSegment, setExpandedSegment] = useState(null);
  
  return (
    <div className="relative">
      {/* Visual Route Display */}
      <div className="flex flex-col gap-0">
        {points.map((point, index) => (
          <React.Fragment key={point.id}>
            {/* Point Marker */}
            <div className="flex items-start gap-4">
              {/* Point Circle */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white"
                  style={{ background: point.color }}
                >
                  {point.id}
                </div>
                {index < points.length - 1 && (
                  <div className="w-1 h-24 bg-gradient-to-b from-gray-400 to-gray-600" />
                )}
              </div>
              
              {/* Point Details */}
              <div className="flex-1 pb-4">
                <div className="font-bold text-lg" style={{ color: point.color }}>{point.name}</div>
                <div className="text-sm text-gray-300">{point.address}</div>
                <div className="text-xs text-gray-400 italic mt-1">{point.description}</div>
              </div>
            </div>
            
            {/* Segment Details (between points) */}
            {index < segments.length && (
              <div 
                className="ml-16 mb-4 p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  border: '1px solid rgba(212,175,55,0.3)',
                }}
                onClick={() => setExpandedSegment(expandedSegment === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" style={{ color: '#d4af37' }} />
                      <span className="font-semibold text-white">{segments[index].from} → {segments[index].to}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-blue-400">
                        <Car className="w-4 h-4" /> {segments[index].distance}
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <Clock className="w-4 h-4" /> {segments[index].estimatedTime}
                      </span>
                    </div>
                  </div>
                  {expandedSegment === index ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
                
                {/* Expanded Details */}
                {expandedSegment === index && (
                  <div className="mt-4 pt-4 border-t border-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 uppercase text-xs mb-1">Route</div>
                      <div className="text-white">{segments[index].route}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 uppercase text-xs mb-1">Speed Limit</div>
                      <div className="text-white">{segments[index].speedLimit}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 uppercase text-xs mb-1">Traffic Signals</div>
                      <div className="text-yellow-400">{segments[index].trafficLights}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 uppercase text-xs mb-1">Stop Signs</div>
                      <div className="text-red-400">{segments[index].stopSigns}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-gray-400 uppercase text-xs mb-1">Road Conditions (2013)</div>
                      <div className="text-white">{segments[index].roadConditions}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-gray-400 uppercase text-xs mb-2">Key Observations</div>
                      <ul className="space-y-1">
                        {segments[index].observations.map((obs, i) => (
                          <li key={i} className="flex items-start gap-2 text-orange-300">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Main Route Analysis Component
const RouteAnalysis = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0, 0, 0, 0.95)' }}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '3px solid #d4af37',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
            borderBottom: '2px solid #d4af37',
          }}
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" style={{ color: '#d4af37' }} />
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                Geographic Route Analysis
              </h2>
              <p className="text-sm text-gray-400">
                {routeData.date} ({routeData.dayOfWeek}) — Evidence Timeline Mapping
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            style={{ color: '#ff6b6b' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Legend - Left Side */}
            <div 
              className="lg:w-72 flex-shrink-0 p-4 rounded-lg"
              style={{ 
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(212,175,55,0.3)',
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#d4af37' }}>
                <Flag className="w-5 h-5" /> Legend
              </h3>
              
              {/* Point Types */}
              <div className="space-y-3 mb-6">
                {routeData.points.map(point => (
                  <div key={point.id} className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: point.color }}
                    >
                      {point.id}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{point.name}</div>
                      <div className="text-gray-400 text-xs">{point.type}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary Stats */}
              <div 
                className="p-3 rounded-lg mt-4"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                <h4 className="font-bold text-sm mb-2" style={{ color: '#d4af37' }}>TOTAL JOURNEY</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Distance:</span>
                    <span className="text-white font-bold">{routeData.totalAnalysis.totalDistance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Driving Time:</span>
                    <span className="text-white font-bold">{routeData.totalAnalysis.totalDrivingTime}</span>
                  </div>
                </div>
              </div>
              
              {/* Critical Notes */}
              <div className="mt-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: '#dc3545' }}>
                  <AlertTriangle className="w-4 h-4" /> CRITICAL NOTES
                </h4>
                <ul className="space-y-2 text-xs">
                  {routeData.totalAnalysis.criticalNotes.map((note, i) => (
                    <li key={i} className="text-gray-300 leading-relaxed">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Disclaimer */}
              <div 
                className="mt-4 p-2 rounded text-xs italic"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}
              >
                Note: Traffic data estimated based on typical 2013 road conditions. NC-150 was a two-lane highway at that time. Actual conditions may have varied.
              </div>
            </div>
            
            {/* Route Map - Right Side */}
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#d4af37' }}>
                <Navigation className="w-5 h-5" /> Route Sequence
              </h3>
              <p className="text-sm text-gray-400 mb-4">Click each segment for detailed analysis</p>
              
              <RouteMap points={routeData.points} segments={routeData.segments} />
            </div>
          </div>
          
          {/* Analysis Purpose */}
          <div 
            className="mt-6 p-4 rounded-lg"
            style={{ 
              background: 'linear-gradient(135deg, rgba(139,0,0,0.3) 0%, rgba(139,0,0,0.1) 100%)',
              border: '2px solid rgba(139,0,0,0.5)',
            }}
          >
            <h4 className="font-bold mb-2" style={{ color: '#dc3545', fontFamily: 'Georgia, serif' }}>
              ANALYSIS PURPOSE
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              This geographic analysis documents the route allegedly traveled on {routeData.date}. 
              The total minimum driving time of <strong>50-72 minutes</strong> (excluding any stops, waiting times, 
              or activities at each location) raises significant questions about the timeline of events 
              as presented. Each stop at locations B, C, and D would add substantial time for parking, 
              entry, conducting business, and departure — none of which is reflected in pure driving calculations.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div 
          className="p-3 text-center text-xs"
          style={{ 
            background: 'rgba(0,0,0,0.5)',
            borderTop: '1px solid rgba(212,175,55,0.3)',
            color: '#888',
          }}
        >
          Blankenship Case — Geographic Evidence Analysis — {routeData.date}
        </div>
      </div>
    </div>
  );
};

export default RouteAnalysis;
