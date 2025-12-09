import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTRY_CODE } from '../mock';
import { toast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Scale, Shield, Gavel } from 'lucide-react';

const EntryPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Blankenship';
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
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
        if (!termsAccepted) {
          toast({
            title: 'Terms Required',
            description: 'Please acknowledge the Terms of Use to proceed',
            variant: 'destructive',
          });
          return;
        }
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
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 8);
    if (/^[0-9]+$/.test(pastedData)) {
      const newCode = pastedData.split('').concat(Array(8 - pastedData.length).fill(''));
      setCode(newCode.slice(0, 8));
      const lastFilledIndex = Math.min(pastedData.length, 7);
      inputRefs.current[lastFilledIndex]?.focus();
      
      if (pastedData.length === 8) {
        if (pastedData === ENTRY_CODE) {
          if (!termsAccepted) {
            toast({
              title: 'Terms Required',
              description: 'Please acknowledge the Terms of Use to proceed',
              variant: 'destructive',
            });
            return;
          }
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
      className="min-h-screen flex flex-col items-center justify-center relative px-3 overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.98) 100%),
          radial-gradient(ellipse at 30% 20%, rgba(139,69,19,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(42,82,152,0.1) 0%, transparent 50%)
        `,
      }}
    >
      {/* Courthouse columns effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/20 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/20 to-transparent" />
      </div>

      {/* Main content */}
      <div className="text-center space-y-6 sm:space-y-8 md:space-y-12 w-full max-w-md sm:max-w-2xl md:max-w-4xl relative z-10">
        {/* Justicia symbol with dramatic lighting */}
        <div className="mb-6 relative">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <Scale className="w-16 h-16 sm:w-20 sm:h-20 mx-auto relative z-10" style={{ color: '#d4af37', filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.6))' }} />
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

        {/* Code entry boxes with brass styling */}
        <div className="flex gap-1.5 sm:gap-2 md:gap-3 justify-center px-2">
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
              onPaste={handlePaste}
              className="w-9 h-11 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-bold transition-all"
              style={{
                background: 'linear-gradient(145deg, #f4e8c1 0%, #e8dcc8 50%, #d4c5a9 100%)',
                color: '#3E2723',
                border: '2px solid #8b6914',
                borderRadius: '4px',
                boxShadow: `
                  inset 0 2px 4px rgba(0,0,0,0.2),
                  inset 0 -2px 4px rgba(255,255,255,0.3),
                  0 4px 12px rgba(0,0,0,0.3)
                `,
                fontFamily: 'Garamond, serif',
              }}
            />
          ))}
        </div>
        
        <p className="text-yellow-600/70 text-xs sm:text-sm tracking-wide px-2 uppercase" style={{ fontFamily: 'Garamond, serif' }}>
          Enter 8-Digit Access Code
        </p>

        {/* Terms of Use - Required Acknowledgement */}
        <div 
          className="mt-8 p-6 sm:p-8 rounded mx-4"
          style={{
            background: 'linear-gradient(145deg, rgba(212,175,55,0.1) 0%, rgba(139,105,20,0.1) 100%)',
            border: '2px solid #8b6914',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <h3 
            className="text-lg sm:text-xl font-bold mb-4 text-center"
            style={{ 
              color: '#d4af37',
              fontFamily: 'Georgia, serif',
            }}
          >
            TERMS OF USE
          </h3>
          <div 
            className="text-xs sm:text-sm space-y-3 mb-4 text-left"
            style={{ 
              color: '#f5e6c8',
              fontFamily: 'Garamond, serif',
              lineHeight: '1.6',
            }}
          >
            <p>
              <strong>Access Restrictions:</strong> This website contains legally protected evidence and documentation. Access is restricted to authorized individuals only. By entering this site, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
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
          
          {/* Checkbox for acknowledgement */}
          <label 
            className="flex items-start gap-3 cursor-pointer group"
            style={{
              color: '#f5e6c8',
              fontFamily: 'Georgia, serif',
            }}
          >
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 cursor-pointer"
              style={{
                accentColor: '#d4af37',
              }}
            />
            <span className="text-sm sm:text-base font-semibold group-hover:text-yellow-400 transition-colors">
              I have read and agree to the Terms of Use, and I acknowledge that all content is legally protected evidence.
            </span>
          </label>
        </div>
      </div>

      {/* Legal Information Icons - Refined */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center gap-4 sm:gap-6 md:gap-8 px-4 z-10">
        {/* NC State Law */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center gap-1 sm:gap-2 text-yellow-600/80 hover:text-yellow-500 transition-all group">
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded flex items-center justify-center transition-all group-hover:scale-110"
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
                <Gavel className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: '#d4af37' }} />
              </div>
              <span className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'Garamond, serif' }}>NC State Law</span>
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
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded flex items-center justify-center transition-all group-hover:scale-110"
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
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: '#d4af37' }} />
              </div>
              <span className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'Garamond, serif' }}>Federal Law</span>
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
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded flex items-center justify-center transition-all group-hover:scale-110"
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
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: '#d4af37' }} />
              </div>
              <span className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'Garamond, serif' }}>Your Rights</span>
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
    </div>
  );
};

export default EntryPage;