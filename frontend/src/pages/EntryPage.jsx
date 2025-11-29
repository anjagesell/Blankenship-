import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTRY_CODE } from '../mock';
import { toast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Building2, Scale, ShieldCheck } from 'lucide-react';

const EntryPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title
    document.title = 'Blankenship';
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if code is complete
    if (index === 7 && value) {
      const enteredCode = newCode.join('');
      if (enteredCode === ENTRY_CODE) {
        toast({
          title: 'Access Granted',
          description: 'Welcome to Blankenship',
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
          toast({
            title: 'Access Granted',
            description: 'Welcome to Blankenship',
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4" style={{ backgroundColor: '#001f3f' }}>
      <div className="text-center space-y-8 sm:space-y-12 w-full max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
          Blankenship
        </h1>
        
        <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-semibold bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          ))}
        </div>
        
        <p className="text-white/70 text-xs sm:text-sm tracking-wide">Enter 8-digit access code</p>
      </div>

      {/* Legal Information Icons */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center gap-4 sm:gap-6 md:gap-8 px-4">
        {/* NC State Law */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center gap-1 sm:gap-2 text-white/80 hover:text-white transition-colors group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group-hover:scale-110">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </div>
              <span className="text-[0.65rem] sm:text-xs font-medium">NC State Law</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">North Carolina State Law</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm">
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
            <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group">
              <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group-hover:scale-110">
                <Scale className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium">Federal Law</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Federal Law</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm">
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

        {/* Legal Rights Summary */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group">
              <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group-hover:scale-110">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium">Your Rights</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Your Legal Rights</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm">
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