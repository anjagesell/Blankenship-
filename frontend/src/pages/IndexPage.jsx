import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indexEntries } from '../mock';
import { Card } from '../components/ui/card';
import { Calendar, PlayCircle, Boxes, Scale, AlertTriangle, HeartCrack, FileText, History, Lock, LockOpen, Shield, Mail, ChevronDown, ChevronUp, GitBranch, MapPin } from 'lucide-react';
import MonthlyDetail from '../components/MonthlyDetail';
import AdminLogin from '../components/AdminLogin';
import Genogram from '../components/Genogram';
import RouteAnalysis from '../components/RouteAnalysis';

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
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('blankenship_admin') === 'true');
  const [showGenogram, setShowGenogram] = useState(false);
  const [showRouteAnalysis, setShowRouteAnalysis] = useState(false);

  useEffect(() => {
    document.title = 'Blankenship';
    // Force scroll to top when page loads (especially important on mobile)
    window.scrollTo(0, 0);
    
    // Detect mobile screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('blankenship_admin', 'true');
    setShowAdminLogin(false);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('blankenship_admin');
  };

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

      {/* Analysis Buttons */}
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex flex-wrap justify-center gap-4">
          {/* Genogram Button */}
          <button
            onClick={() => setShowGenogram(true)}
            className="px-6 py-3 rounded-lg flex items-center gap-3 transition-all hover:scale-105 shadow-lg"
            style={{
              background: 'linear-gradient(145deg, #2c3e50 0%, #1a252f 100%)',
              color: '#d4af37',
              border: '3px solid #d4af37',
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
            }}
          >
            <span className="text-2xl">🌳</span>
            <div className="text-left">
              <div className="text-base">View Case Genogram</div>
              <div className="text-xs text-yellow-600/70 font-normal">Visual Timeline of All Events</div>
            </div>
            <GitBranch className="w-5 h-5 ml-2" />
          </button>
          
          {/* Route Analysis Button */}
          <button
            onClick={() => setShowRouteAnalysis(true)}
            className="px-6 py-3 rounded-lg flex items-center gap-3 transition-all hover:scale-105 shadow-lg"
            style={{
              background: 'linear-gradient(145deg, #1a3a52 0%, #0d1f2d 100%)',
              color: '#0d6efd',
              border: '3px solid #0d6efd',
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(13,110,253,0.3)',
            }}
          >
            <span className="text-2xl">🗺️</span>
            <div className="text-left">
              <div className="text-base">Route Analysis</div>
              <div className="text-xs text-blue-400/70 font-normal">Nov 30, 2013 — Geographic Evidence</div>
            </div>
            <MapPin className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Year Envelope Icons */}
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Year Envelopes Row */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-8">
          {years.map((year) => {
            const isOpen = openYears[year];
            
            return (
              <button
                key={`envelope-${year}`}
                onClick={() => toggleYear(year)}
                className={`group flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isOpen ? 'scale-105' : ''
                }`}
                style={{
                  background: isOpen 
                    ? 'linear-gradient(145deg, rgba(212,175,55,0.2) 0%, rgba(139,105,20,0.15) 100%)'
                    : 'transparent',
                  border: isOpen ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
                  borderRadius: '12px',
                  position: 'relative',
                }}
              >
                {/* CONFIDENTIAL Stamp - Top */}
                <div 
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] sm:text-[9px] font-bold tracking-wider"
                  style={{
                    background: 'linear-gradient(145deg, #8b0000 0%, #5c0000 100%)',
                    color: '#fff',
                    border: '1px solid #ff0000',
                    borderRadius: '2px',
                    fontFamily: 'Impact, sans-serif',
                    transform: 'translateX(-50%) rotate(-3deg)',
                    boxShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                    textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                    zIndex: 10,
                  }}
                >
                  CONFIDENTIAL
                </div>

                {/* Evidence Tag - Right side */}
                <div 
                  className="absolute -right-3 top-6 sm:top-8"
                  style={{
                    width: '28px',
                    height: '18px',
                    background: '#fff8dc',
                    border: '1px solid #8b6914',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                    transform: 'rotate(12deg)',
                    zIndex: 10,
                  }}
                >
                  <div 
                    className="text-[5px] font-bold text-center pt-[2px]"
                    style={{ color: '#8b0000', fontFamily: 'Arial, sans-serif' }}
                  >
                    EVIDENCE
                  </div>
                  <div 
                    className="text-[6px] font-bold text-center"
                    style={{ color: '#3E2723', fontFamily: 'Courier, monospace' }}
                  >
                    {year}
                  </div>
                  {/* String hole */}
                  <div 
                    className="absolute -left-0.5 top-1"
                    style={{
                      width: '3px',
                      height: '3px',
                      background: '#333',
                      borderRadius: '50%',
                    }}
                  />
                </div>

                {/* Envelope Icon */}
                <div 
                  className="relative mt-2"
                  style={{
                    filter: isOpen ? 'drop-shadow(0 4px 12px rgba(212,175,55,0.6))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                  }}
                >
                  <Mail 
                    className={`w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ${
                      isOpen ? 'text-yellow-400' : 'text-yellow-600/80 group-hover:text-yellow-500'
                    }`}
                    style={{
                      stroke: isOpen ? '#d4af37' : '#b8860b',
                      strokeWidth: 1.5,
                    }}
                  />
                  {/* Open/Closed indicator */}
                  {isOpen ? (
                    <ChevronUp className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-400" />
                  ) : (
                    <ChevronDown className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-600/60 group-hover:text-yellow-500" />
                  )}
                </div>
                {/* Year Label */}
                <span 
                  className={`text-lg sm:text-xl font-bold tracking-wide transition-colors ${
                    isOpen ? 'text-yellow-400' : 'text-yellow-600/80 group-hover:text-yellow-500'
                  }`}
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    textShadow: isOpen ? '0 2px 8px rgba(212,175,55,0.5)' : 'none',
                  }}
                >
                  {year}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expanded Year Contents */}
        {years.map((year) => {
          const isOpen = openYears[year];
          const yearEntries = entriesByYear[year];
          
          if (!isOpen) return null;
          
          return (
            <div key={year} className="relative mx-auto max-w-5xl mb-8">

              {/* Year Header */}
              <div 
                className="text-center mb-6 pb-4 border-b"
                style={{ borderColor: 'rgba(212,175,55,0.3)' }}
              >
                <h2 
                  className="text-2xl sm:text-3xl font-bold tracking-wider"
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    background: 'linear-gradient(to bottom, #D4AF37 0%, #AA8A2A 50%, #8B6914 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {year} Archives
                </h2>
              </div>

              {/* Contents */}
              <div className="px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearEntries.map((entry, index) => {
                    const IconComponent = entry.icon ? iconMap[entry.icon] || FileText : FileText;
                      
                      return (
                        <div
                          key={entry.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open monthly detail view instead of navigating
                            if (entry.date) {
                              setSelectedMonth(entry.date);
                            }
                          }}
                          className={`relative cursor-pointer transition-all duration-700 group ${
                            isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
                          }`}
                          style={{
                            transitionDelay: isOpen ? `${index * 80}ms` : '0ms',
                          }}
                        >
                          {/* Manila Folder Tab */}
                          <div 
                            className="absolute -top-3 left-8 h-6 px-4 flex items-center"
                            style={{
                              background: 'linear-gradient(to bottom, #d4a574 0%, #c49563 100%)',
                              clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              zIndex: 10,
                            }}
                          >
                            <span 
                              className="text-[10px] font-bold uppercase"
                              style={{ 
                                color: '#3E2723',
                                fontFamily: 'Courier, monospace',
                              }}
                            >
                              {entry.date || 'PRE'}
                            </span>
                          </div>

                          {/* Manila Folder Body */}
                          <div
                            className="relative p-4"
                            style={{
                              background: 'linear-gradient(135deg, #d9b991 0%, #c8a882 50%, #b89773 100%)',
                              border: '1px solid #8b6914',
                              boxShadow: `
                                0 6px 16px rgba(0, 0, 0, 0.4),
                                inset 0 1px 2px rgba(255,255,255,0.3),
                                inset 0 -1px 2px rgba(0,0,0,0.2)
                              `,
                              minHeight: '120px',
                            }}
                          >
                            {/* Coffee stain on folder */}
                            <div 
                              className="absolute top-2 right-3"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(101,67,33,0.4) 0%, rgba(101,67,33,0.2) 50%, transparent 70%)',
                              }}
                            />

                            {/* Paperclip */}
                            <div 
                              className="absolute -top-1 right-6"
                              style={{
                                width: '8px',
                                height: '24px',
                                border: '2px solid #silver',
                                borderRadius: '6px 6px 0 0',
                                borderBottom: 'none',
                                boxShadow: '1px 2px 3px rgba(0,0,0,0.4)',
                                background: 'linear-gradient(to right, #c0c0c0 0%, #d0d0d0 50%, #b0b0b0 100%)',
                              }}
                            />

                            {/* Evidence tag hanging off side */}
                            <div 
                              className="absolute -right-2 top-8"
                              style={{
                                width: '35px',
                                height: '20px',
                                background: '#fff8dc',
                                border: '1px solid #000',
                                boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                transform: 'rotate(8deg)',
                              }}
                            >
                              <div 
                                className="text-[6px] font-bold text-center pt-[2px]"
                                style={{ 
                                  color: '#000',
                                  fontFamily: 'Arial, sans-serif',
                                }}
                              >
                                CASE
                              </div>
                              <div 
                                className="text-[5px] text-center"
                                style={{ 
                                  color: '#666',
                                  fontFamily: 'Courier, monospace',
                                }}
                              >
                                {entry.id}
                              </div>
                              {/* String hole */}
                              <div 
                                className="absolute -left-1 top-1"
                                style={{
                                  width: '3px',
                                  height: '3px',
                                  background: '#000',
                                  borderRadius: '50%',
                                }}
                              />
                            </div>

                            {/* Folder content */}
                            <div className="space-y-2 relative z-10">
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" style={{ color: '#5D4037' }} />
                                <span 
                                  className="text-xs font-bold uppercase"
                                  style={{ 
                                    color: '#3E2723',
                                    fontFamily: 'Courier, monospace',
                                  }}
                                >
                                  {entry.date || 'Pre-history'}
                                </span>
                              </div>
                              <h3 
                                className="text-sm font-bold leading-tight group-hover:opacity-80 transition-opacity"
                                style={{ 
                                  color: '#2c1810',
                                  fontFamily: 'Arial, sans-serif',
                                }}
                              >
                                {entry.header}
                              </h3>
                              {entry.description && (
                                <p 
                                  className="text-xs line-clamp-2 leading-relaxed"
                                  style={{ color: '#3E2723' }}
                                >
                                  {entry.description}
                                </p>
                              )}
                            </div>

                            {/* Handwritten "CONFIDENTIAL" stamp */}
                            <div 
                              className="absolute bottom-2 left-2 text-[10px] font-bold opacity-40"
                              style={{ 
                                color: '#cc0000',
                                fontFamily: 'Impact, sans-serif',
                                transform: 'rotate(-5deg)',
                                border: '2px solid #cc0000',
                                padding: '2px 6px',
                              }}
                            >
                              EVIDENCE
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      {/* Admin Login Button - Bottom Right */}
      {!isAdmin ? (
        <button
          onClick={() => setShowAdminLogin(true)}
          className="fixed bottom-6 right-6 p-3 rounded-full transition-all hover:scale-110 z-40"
          style={{
            background: 'linear-gradient(145deg, #d4af37 0%, #c5a028 50%, #9c7a1f 100%)',
            border: '2px solid #8b6914',
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.6)',
          }}
          title="Admin Login"
        >
          <Shield className="w-5 h-5" style={{ color: '#1a0f0a' }} />
        </button>
      ) : (
        <button
          onClick={handleAdminLogout}
          className="fixed bottom-6 right-6 px-4 py-2 rounded transition-all hover:scale-105 z-40 flex items-center gap-2"
          style={{
            background: 'linear-gradient(145deg, #8b0000 0%, #660000 100%)',
            border: '2px solid #440000',
            boxShadow: '0 4px 16px rgba(139, 0, 0, 0.6)',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          title="Logout Admin"
        >
          <Shield className="w-4 h-4" />
          ADMIN
        </button>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin 
          onAdminLogin={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {/* Monthly Detail Modal */}
      {selectedMonth && (
        <MonthlyDetail 
          monthDate={selectedMonth}
          isAdmin={isAdmin}
          onClose={() => setSelectedMonth(null)}
        />
      )}

      {/* Genogram Modal */}
      {showGenogram && (
        <Genogram onClose={() => setShowGenogram(false)} />
      )}

      {/* Route Analysis Modal */}
      {showRouteAnalysis && (
        <RouteAnalysis onClose={() => setShowRouteAnalysis(false)} />
      )}
    </div>
  );
};

export default IndexPage;
