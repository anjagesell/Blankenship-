import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTRY_CODE } from '../mock';
import { toast } from '../hooks/use-toast';

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
        setTimeout(() => navigate('/index'), 500);
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
          setTimeout(() => navigate('/index'), 500);
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
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#001f3f' }}>
      <div className="text-center space-y-12">
        <h1 className="text-6xl font-bold text-white tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
          Blankenship
        </h1>
        
        <div className="flex gap-3 justify-center">
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
              className="w-14 h-16 text-center text-2xl font-semibold bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          ))}
        </div>
        
        <p className="text-white/70 text-sm tracking-wide">Enter 8-digit access code</p>
      </div>
    </div>
  );
};

export default EntryPage;