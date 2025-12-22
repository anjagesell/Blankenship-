import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTRY_CODE } from '../mock';
import { toast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Scale, Shield, Gavel, Info } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EntryPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [showAccessReminder, setShowAccessReminder] = useState(false);
  const [visitorLogged, setVisitorLogged] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Blankenship';
    
    // Log visitor on page load (only once)
    if (!visitorLogged) {
      logVisitor(false);
      setVisitorLogged(true);
    }
  }, []);

  // Log visitor to backend
  const logVisitor = async (accessGranted) => {
    try {
      await fetch(`${BACKEND_URL}/api/visitor/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_accessed: 'entry',
          access_granted: accessGranted
        })
      });
    } catch (error) {
      console.error('Failed to log visitor:', error);
    }
  };

  // Focus first input only after terms are accepted
  useEffect(() => {
    if (termsAccepted) {
      inputRefs.current[0]?.focus();
    }
  }, [termsAccepted]);

  const handleInputFocus = (index) => {
    if (!termsAccepted) {
      setShowAccessReminder(true);
      // Auto-hide after 4 seconds
      setTimeout(() => setShowAccessReminder(false), 4000);
    }
  };

  const handleChange = (index, value) => {
    if (!termsAccepted) {
      setShowAccessReminder(true);
      setTimeout(() => setShowAccessReminder(false), 4000);
      return;
    }
    
    if (value && !/^[0-9]$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 7 && value) {
      const enteredCode = newCode.join('');
      if (enteredCode === ENTRY_CODE) {
        // Log successful access
        logVisitor(true);
        toast({
          title: 'Access Granted',
          description: 'Welcome to Blankenship Archives',
        });
        setTimeout(() => navigate('/synopsis'), 500);
      } else {
        toast({
          title: 'Access Denied',
          description: 'Invalid entry code',
          variant: 'destructive',
        });
        setCode(['', '', '', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (!termsAccepted) {
      setShowAccessReminder(true);
      setTimeout(() => setShowAccessReminder(false), 4000);
      return;
    }
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setShowAccessReminder(true);
      setTimeout(() => setShowAccessReminder(false), 4000);
      return;
    }
    
    const pastedData = e.clipboardData.getData('text').slice(0, 8);
    if (/^[0-9]+$/.test(pastedData)) {
      const newCode = pastedData.split('').concat(Array(8 - pastedData.length).fill(''));
      setCode(newCode.slice(0, 8));
      const lastFilledIndex = Math.min(pastedData.length, 7);
      inputRefs.current[lastFilledIndex]?.focus();
      
      if (pastedData.length === 8) {
        if (pastedData === ENTRY_CODE) {
          toast({
            title: 'Access Granted',
            description: 'Welcome to Blankenship Archives',
          });
          setTimeout(() => navigate('/synopsis'), 500);
        } else {
          toast({
            title: 'Access Denied',
            description: 'Invalid entry code',
            variant: 'destructive',
          });
          setCode(['', '', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start relative px-3 py-4 overflow-x-hidden overflow-y-auto"
      style={{
        background: `
          linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.98) 100%),
          radial-gradient(ellipse at 30% 20%, rgba(139,69,19,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(42,82,152,0.1) 0%, transparent 50%)
        `,
      }}
    >
      {/* Friendly Access Reminder Popup */}
      {showAccessReminder && (
        <div 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-fadeIn"
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div
            className="p-6 sm:p-8 rounded-lg shadow-2xl max-w-sm mx-4 text-center"
            style={{
              background: 'linear-gradient(145deg, #f4e8c1 0%, #e8dcc8 100%)',
              border: '3px solid #d4af37',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.2)',
            }}
          >
            <div className="mb-4">
              <Info className="w-12 h-12 mx-auto" style={{ color: '#8b6914' }} />
            </div>
            <h3 
              className="text-lg sm:text-xl font-bold mb-3"
              style={{ 
                color: '#3E2723',
                fontFamily: 'Georgia, serif',
              }}
            >
              Just a Friendly Reminder
            </h3>
            <p 
              className="text-sm sm:text-base mb-2"
              style={{ 
                color: '#5D4037',
                fontFamily: 'Garamond, serif',
                lineHeight: 1.6,
              }}
            >
              If you do not acknowledge reading the notice, the Site entry is off limits for you.
            </p>
            <p 
              className="text-xs sm:text-sm italic"
              style={{ 
                color: '#8b6914',
                fontFamily: 'Garamond, serif',
              }}
            >
              Please scroll through and check the box above. ☝️
            </p>
            <button
              onClick={() => setShowAccessReminder(false)}
              className="mt-4 px-4 py-2 rounded text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
                color: '#1a0f0a',
                border: '2px solid #8b6914',
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
      
      {/* Overlay when reminder is shown */}
      {showAccessReminder && (
        <div 
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowAccessReminder(false)}
        />
      )}

      {/* Courthouse columns effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/20 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/20 to-transparent" />
      </div>

      {/* Main content */}
      <div className="text-center w-full max-w-md sm:max-w-2xl md:max-w-4xl relative z-10 flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-8">
        {/* Justicia symbol with dramatic lighting */}
        <div className="mb-4 relative">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <Scale className="w-14 h-14 sm:w-16 sm:h-16 mx-auto relative z-10" style={{ color: '#d4af37', filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.6))' }} />
        </div>

        {/* Title with gold embossing */}
        <h1 
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider px-2 gold-embossed"
          style={{ 
            fontFamily: 'Garamond, Georgia, serif',
            letterSpacing: '0.1em',
          }}
        >
          BLANKENSHIP
        </h1>
        
        <div className="text-yellow-600/80 text-sm sm:text-base uppercase tracking-widest" style={{ fontFamily: 'Garamond, serif' }}>
          Judicial Archives
        </div>

        {/* Terms of Use Requirement - NOW ABOVE PASSWORD BOXES */}
        <div 
          className="p-3 sm:p-4 rounded mx-1 sm:mx-4"
          style={{
            background: 'linear-gradient(145deg, rgba(212,175,55,0.1) 0%, rgba(139,105,20,0.1) 100%)',
            border: termsAccepted ? '2px solid #28a745' : '2px solid #8b6914',
            boxShadow: termsAccepted 
              ? '0 4px 16px rgba(40,167,69,0.3)' 
              : '0 4px 16px rgba(0,0,0,0.4)',
            transition: 'all 0.3s ease',
          }}
        >
          <h3 
            className="text-xs sm:text-sm font-bold mb-2 text-center"
            style={{ 
              color: termsAccepted ? '#28a745' : '#d4af37',
              fontFamily: 'Georgia, serif',
            }}
          >
            {termsAccepted ? '✓ TERMS ACKNOWLEDGED' : 'ACKNOWLEDGEMENT NOTICE'}
          </h3>
          
          {/* Scrollable Terms Container */}
          <div 
            data-testid="notice-content"
            onScroll={(e) => {
              const element = e.target;
              const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
              if (isAtBottom && !termsScrolled) {
                setTermsScrolled(true);
              }
            }}
            className="overflow-y-auto mb-2"
            style={{
              maxHeight: '100px',
              minHeight: '80px',
              border: '1px solid #8b6914',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            <div 
              className="text-[9px] sm:text-xs leading-relaxed text-left"
              style={{ 
                color: '#f5e6c8',
                fontFamily: 'Garamond, serif',
              }}
            >
              <p className="mb-2">
                <strong>Access Restrictions:</strong> This website contains legally protected evidence and documentation. Access is restricted to authorized individuals only. By entering this site, you acknowledge that:
              </p>
              <ul className="list-disc pl-4 space-y-1 mb-2">
                <li>You are accessing private, password-protected judicial archives</li>
                <li>All content is protected by copyright and constitutes legal evidence</li>
                <li>Unauthorized copying, downloading, distribution, or reproduction of any content is strictly prohibited</li>
                <li>You will not share access credentials with unauthorized parties</li>
                <li>You understand that misuse of this evidence may result in legal consequences</li>
                <li>This site is for investigative and judicial documentation purposes only</li>
              </ul>
              <p>
                <strong>Disclaimer:</strong> The information contained within this archive is provided for documentary and investigative purposes. This website is maintained by private individuals exercising their constitutional rights under the First Amendment.
              </p>
            </div>
          </div>
          
          {/* Scroll instruction */}
          {!termsScrolled && (
            <p 
              className="text-[9px] sm:text-xs text-center mb-2 italic"
              style={{ color: '#d4a574' }}
            >
              Please scroll to the bottom to continue ↓
            </p>
          )}
          
          {/* Checkbox for acknowledgement */}
          <label 
            className={`flex items-start gap-2 ${termsScrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} group`}
            style={{
              color: '#f5e6c8',
              fontFamily: 'Georgia, serif',
            }}
          >
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={!termsScrolled}
              className="mt-0.5 w-4 h-4 flex-shrink-0"
              style={{
                accentColor: '#d4af37',
                cursor: termsScrolled ? 'pointer' : 'not-allowed',
              }}
            />
            <span className={`text-[9px] sm:text-xs font-semibold ${termsScrolled ? 'group-hover:text-yellow-400' : ''} transition-colors leading-tight`}>
              I have read and agree to the Terms of Use Requirement, and I acknowledge that all content is legally protected evidence.
            </span>
          </label>
        </div>

        {/* Code entry boxes - NOW BELOW ACKNOWLEDGEMENT */}
        <div>
          <div 
            className={`flex gap-1 sm:gap-2 justify-center transition-all ${!termsAccepted ? 'opacity-50' : ''}`}
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => handleInputFocus(index)}
                onPaste={handlePaste}
                className="w-8 h-10 sm:w-11 sm:h-13 md:w-14 md:h-16 text-center text-base sm:text-xl md:text-2xl font-bold transition-all"
                style={{
                  background: termsAccepted 
                    ? 'linear-gradient(145deg, #f4e8c1 0%, #e8dcc8 50%, #d4c5a9 100%)'
                    : 'linear-gradient(145deg, #999 0%, #888 50%, #777 100%)',
                  color: termsAccepted ? '#3E2723' : '#555',
                  border: termsAccepted ? '2px solid #8b6914' : '2px solid #666',
                  borderRadius: '4px',
                  boxShadow: `
                    inset 0 2px 4px rgba(0,0,0,0.2),
                    inset 0 -2px 4px rgba(255,255,255,0.3),
                    0 4px 12px rgba(0,0,0,0.3)
                  `,
                  fontFamily: 'Garamond, serif',
                  cursor: termsAccepted ? 'text' : 'not-allowed',
                }}
              />
            ))}
          </div>
          
          <p 
            className={`text-[10px] sm:text-sm tracking-wide uppercase mt-2 ${!termsAccepted ? 'opacity-50' : ''}`} 
            style={{ fontFamily: 'Garamond, serif', color: '#d4af37' }}
          >
            Enter 8-Digit Access Code
          </p>
          
          {!termsAccepted && (
            <p 
              className="text-[9px] sm:text-xs tracking-wide mt-1 italic" 
              style={{ fontFamily: 'Garamond, serif', color: '#d4a574' }}
            >
              (Please acknowledge the notice above first)
            </p>
          )}
        </div>
      </div>

      {/* Legal Information Icons - Refined */}
      <div className="mt-4 mb-2 flex justify-center gap-6 sm:gap-8 px-4 z-10">
        {/* NC State Law */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center gap-1 sm:gap-2 text-yellow-600/80 hover:text-yellow-500 transition-all group">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  background: 'linear-gradient(145deg, #3a3a3a 0%, #2a2a2a 100%)',
                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.5),
                    inset 0 1px 2px rgba(255,255,255,0.1),
                    inset 0 -1px 2px rgba(0,0,0,0.5)
                  `,
                  border: '1px solid #8b6914',
                }}
              >
                <Gavel className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: '#d4af37' }} />
              </div>
              <span className="text-[0.6rem] sm:text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'Garamond, serif' }}>NC Law</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] parchment-bg">
            <DialogHeader>
              <DialogTitle className="text-2xl" style={{ fontFamily: 'Garamond, serif', color: '#3E2723' }}>North Carolina State Law</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm" style={{ color: '#3E2723' }}>
                <div>
                  <h3 className="font-bold text-lg mb-2">NC General Statutes Chapter 75F - Personal Data Privacy Act</h3>
                  <p className="mb-2">(House Bill 462, effective January 1, 2026)</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Key Finding:</strong> This law applies to businesses and organizations that process personal data of 35,000+ consumers OR 10,000+ consumers with 20%+ revenue from data sales</li>
                    <li><strong>Individual Exemption:</strong> The statute specifically exempts "personal or household activities" - meaning individuals storing personal documents for their own use are NOT subject to these requirements</li>
                    <li><strong>Citation:</strong> <a href="https://www.ncleg.gov/Sessions/2025/Bills/House/PDF/H462v1.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NCGS Chapter 75F</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">NC General Statutes Chapter 75, Article 2A - Identity Theft Protection Act</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Applies to businesses handling personal information</li>
                    <li>Does NOT impose requirements on individuals for personal document storage</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">NC General Statutes Chapter 132 - Public Records Act</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Governs government records only</li>
                    <li>Personal documents held by individuals are NOT subject to public disclosure requirements</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Federal Law */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center gap-1 sm:gap-2 text-yellow-600/80 hover:text-yellow-500 transition-all group">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  background: 'linear-gradient(145deg, #3a3a3a 0%, #2a2a2a 100%)',
                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.5),
                    inset 0 1px 2px rgba(255,255,255,0.1),
                    inset 0 -1px 2px rgba(0,0,0,0.5)
                  `,
                  border: '1px solid #8b6914',
                }}
              >
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: '#d4af37' }} />
              </div>
              <span className="text-[0.6rem] sm:text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'Garamond, serif' }}>Federal</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] parchment-bg">
            <DialogHeader>
              <DialogTitle className="text-2xl" style={{ fontFamily: 'Garamond, serif', color: '#3E2723' }}>Federal Law</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm" style={{ color: '#3E2723' }}>
                <div>
                  <h3 className="font-bold text-lg mb-2">18 U.S.C. §§ 2510-2523 (Wiretap Act) and §§ 2701-2712 (Stored Communications Act)</h3>
                  <p className="mb-2 font-semibold">Electronic Communications Privacy Act (ECPA) of 1986</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Protects YOUR privacy from unauthorized access by others</li>
                    <li>Makes it ILLEGAL for others to intercept or access your stored electronic communications without authorization</li>
                    <li>This law protects YOU, not restricts you</li>
                    <li>Covers electronic communications and personal records stored in electronic storage or cloud databases</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">44 U.S.C. - Federal Records Act</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Applies only to federal employees and federal records</li>
                    <li>Does NOT apply to private individuals storing personal documents</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Your Rights */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center gap-1 sm:gap-2 text-yellow-600/80 hover:text-yellow-500 transition-all group">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  background: 'linear-gradient(145deg, #3a3a3a 0%, #2a2a2a 100%)',
                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.5),
                    inset 0 1px 2px rgba(255,255,255,0.1),
                    inset 0 -1px 2px rgba(0,0,0,0.5)
                  `,
                  border: '1px solid #8b6914',
                }}
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: '#d4af37' }} />
              </div>
              <span className="text-[0.6rem] sm:text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'Garamond, serif' }}>Rights</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] parchment-bg">
            <DialogHeader>
              <DialogTitle className="text-2xl" style={{ fontFamily: 'Garamond, serif', color: '#3E2723' }}>Your Legal Rights</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm" style={{ color: '#3E2723' }}>
                <h3 className="font-bold text-lg mb-2">Bottom Line for Your Private Password-Protected Website:</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-800 mb-1">✓ Legal Right to Store Documents</p>
                    <p>You have the LEGAL RIGHT to store your own personal documents, photos, and records on a private password-protected website</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-800 mb-1">✓ Exempt from Business Regulations</p>
                    <p>You are NOT subject to business data privacy regulations since you're storing documents for personal/household use, not operating as a business</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-800 mb-1">✓ No Prohibitions</p>
                    <p>No federal or NC state statute prohibits or restricts individuals from storing their own documents privately</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-800 mb-1">✓ Laws Protect You</p>
                    <p>The laws actually PROTECT you - they make it illegal for others to access your stored documents without authorization</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-blue-800 mb-2">Your Legal Boundaries:</p>
                  <p>You can store your own documents freely. Just ensure proper password protection and encryption (HTTPS/SSL) as reasonable security measures.</p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Copyright Notice - Bottom of Page */}
      <div 
        className="mt-2 mb-4 text-center px-4"
        style={{ 
          color: '#d4a574',
          fontFamily: 'Garamond, serif',
        }}
      >
        <div className="text-[10px] sm:text-sm">
          <div className="font-semibold" style={{ color: '#d4af37' }}>
            © 2025 Blankenship Judicial Archives
          </div>
          <div className="text-[9px] sm:text-xs">
            Private Evidence Documentation • Authorized Access Only
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
