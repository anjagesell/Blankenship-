import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Scale } from 'lucide-react';

const SynopsisPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Blankenship';
    // Force scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  // No Read Aloud feature - removed per user request
  const letterText = `Dear Witness to These Events,

In the United States of America, our Constitution establishes a sacred principle through the Fifth and Fourteenth Amendments: no person shall be deprived of life, liberty, or property without due process of law. The Supreme Court declared in In re Winship, 397 U.S. 358 (1970), "We have no doubt that the Due Process Clause protects the accused against conviction except upon proof beyond a reasonable doubt of every fact necessary to constitute the crime with which he is charged."

Yet in 2024 alone, 147 innocent people were exonerated after spending an average of 13.5 years wrongfully imprisoned—nearly 2,000 years of human life stolen. Since 1989, there have been 3,646 documented exonerations in our nation. Behind each number is a shattered life, a devastated family, and a mockery of the justice we claim to uphold.

The intersection of Family and Criminal Law creates a particularly vulnerable space where accusations can destroy lives without the burden of proof our Constitution demands. When family disputes enter the criminal justice system, the presumption of innocence—that bedrock principle which should protect every citizen—often crumbles under the weight of emotion, bias, and procedural shortcuts.

In 72% of wrongful conviction cases, perjury or false accusations played a role. Official misconduct was present in over 70% of 2024 exonerations. But perhaps most disturbing is this: 15% of wrongful convictions involved false confessions—innocent people admitting to crimes they never committed. Among juveniles, this number climbs to over one-third of wrongful conviction cases.

How does an innocent person confess to something they did not do? Our law recognizes this danger. The Supreme Court declared in Brown v. Mississippi (1936) that confessions obtained through duress, coercion, or violence violate the Fourteenth Amendment's guarantee of due process. In Miranda v. Arizona (1966), the Court established that suspects must be informed of their constitutional rights before custodial interrogation. Federal law, 18 U.S.C. § 3501, requires that confessions be "voluntarily given" and mandates judges assess whether a defendant's will was overborne by coercion before admitting any confession as evidence.

These protections exist because our founders understood a fundamental truth: confessions obtained under duress are inherently unreliable and constitute a denial of justice. Yet despite these constitutional safeguards, the vulnerable—the young, the mentally impaired, those who cannot fully comprehend their Miranda rights—are subjected to psychological manipulation, presented with false evidence, isolated for hours, and worn down until they sign away their freedom. They confess because they are told it will help them, that cooperation will lead to leniency, that resistance is futile. They do not understand that once those words leave their lips, the presumption of innocence evaporates. They do not understand that the law's protections against coerced confessions often fail in practice, even when they exist in theory.

These are not mere statistics—they represent systematic failures to honor the principle that it is better for ten guilty persons to escape than for one innocent to suffer.

What does "due process of law" truly mean? Both the Fifth and Fourteenth Amendments mandate that no person shall be deprived of life, liberty, or property without due process. This is not mere formality—it requires specific protections: clear notice of charges, the right to counsel, arraignment where charges are formally read, a preliminary hearing to establish probable cause, the right to confront and cross-examine witnesses, a fair hearing before an impartial decision-maker, the right to remain silent without that silence being used against them, and if convicted, a sentencing that considers all relevant factors. Each step exists to prevent the very injustices our Constitution was designed to prohibit.

Yet when these procedural safeguards are ignored, manipulated, or merely given lip service—when the process becomes a formality rather than a protection—due process becomes due persecution.

The pages that follow document one such case—a case where the solemn promise of "innocent until proven guilty" became an empty phrase, where family law and criminal accusations intertwined to create injustice, where the very institutions meant to protect the innocent became instruments of persecution, where due process existed on paper but not in practice.

I present these records not in anger, but in the hope that truth, though delayed, will ultimately prevail. Justice demands it. The Constitution requires it. Human decency compels it.

Respectfully,
Blankenship`;

  const handleReadAloud = () => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech. This feature works best on desktop browsers like Chrome, Firefox, Safari, or Edge.');
      return;
    }

    if (isReading) {
      // Stop reading
      try {
        window.speechSynthesis.cancel();
        setIsReading(false);
      } catch (error) {
        console.error('Error stopping speech:', error);
        setIsReading(false);
      }
      return;
    }

    // Start reading - with improved error handling
    try {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      // Wait a bit for voices to load (especially important on mobile)
      const startSpeech = () => {
        const utterance = new SpeechSynthesisUtterance(letterText);
        
        // Configure speech
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.lang = 'en-US';
        utterance.volume = 1.0;
        
        // Get available voices and prefer a good quality one
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Try to find a good English voice
          const preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Enhanced'))
          ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
          utterance.voice = preferredVoice;
        }
        
        // Event handlers
        utterance.onstart = () => {
          console.log('Speech started');
          setIsReading(true);
        };
        
        utterance.onend = () => {
          console.log('Speech ended');
          setIsReading(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech error:', event.error, event);
          setIsReading(false);
          
          // Provide user-friendly error messages
          let errorMessage = 'An error occurred with the text-to-speech feature. ';
          if (event.error === 'not-allowed') {
            errorMessage += 'Please make sure you have allowed audio playback in your browser settings.';
          } else if (event.error === 'network') {
            errorMessage += 'Network error. Please check your internet connection.';
          } else if (event.error === 'synthesis-failed') {
            errorMessage += 'Speech synthesis failed. This feature may not be fully supported in your current browser or app.';
          } else {
            errorMessage += `Error: ${event.error}. This feature works best on desktop browsers.`;
          }
          
          alert(errorMessage);
        };
        
        // Speak
        window.speechSynthesis.speak(utterance);
        
        // Backup check - if still not speaking after 2 seconds, show error
        setTimeout(() => {
          if (!window.speechSynthesis.speaking && isReading) {
            setIsReading(false);
            alert('Text-to-speech could not start. This feature may not work properly in this app/browser. It works best in Chrome, Firefox, Safari, or Edge on desktop.');
          }
        }, 2000);
      };
      
      // Check if voices are already loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        startSpeech();
      } else {
        // Wait for voices to load (important for Chrome/Edge)
        window.speechSynthesis.onvoiceschanged = () => {
          startSpeech();
        };
        
        // Fallback: try anyway after 500ms if voices still not loaded
        setTimeout(() => {
          if (window.speechSynthesis.getVoices().length === 0) {
            console.warn('Voices not loaded, attempting speech anyway');
          }
          startSpeech();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error initializing speech:', error);
      setIsReading(false);
      alert('Failed to initialize text-to-speech. This feature may not be supported in your current browser or viewing environment. It works best on desktop browsers like Chrome, Firefox, Safari, or Edge.');
    }
  };

  return (
    <div 
      className="min-h-screen marble-bg relative overflow-hidden"
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
            Judicial Archives
          </div>
        </div>
      </div>

      {/* Letter Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-5xl relative z-10">
        {/* Read Aloud Button */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <button
            onClick={handleReadAloud}
            className={`brass-button px-8 py-4 rounded text-base sm:text-lg font-semibold uppercase tracking-wider transition-all ${
              isReading ? 'bg-red-800' : ''
            }`}
            style={{
              fontFamily: 'Garamond, serif',
              color: '#1a0f0a',
            }}
          >
            {isReading ? (
              <>
                <Square className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" />
                Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" />
                Read Aloud
              </>
            )}
          </button>
          <p className="text-yellow-600/70 text-xs sm:text-sm text-center italic px-4" style={{ fontFamily: 'Garamond, serif' }}>
            Note: This feature works best on desktop browsers (Chrome, Firefox, Safari, Edge)
          </p>
        </div>

        {/* Parchment Letter Box */}
        <div 
          className="parchment-bg p-6 sm:p-10 md:p-16 rounded shadow-2xl relative"
          style={{
            border: '3px solid #8b6914',
            boxShadow: `
              0 25px 60px rgba(0,0,0,0.6),
              inset 0 2px 4px rgba(255,255,255,0.3),
              inset 0 -2px 8px rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* Decorative corners */}
          {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-4 h-4`}>
              <div 
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, #8B6914 0%, #6B5310 100%)',
                  clipPath: i < 2 
                    ? 'polygon(0 0, 100% 0, 100% 40%, 40% 40%, 40% 100%, 0 100%)'
                    : 'polygon(0 0, 40% 0, 40% 60%, 100% 60%, 100% 100%, 0 100%)',
                }}
              />
            </div>
          ))}

          <div 
            className="text-gray-800 space-y-4 sm:space-y-6 leading-relaxed relative z-10"
            style={{ fontFamily: "'Kalam', cursive" }}
          >
            <p className="mb-6 sm:mb-8 text-lg sm:text-xl md:text-2xl font-semibold" style={{ color: '#3E2723' }}>
              Dear Witness to These Events,
            </p>
            
            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              In the United States of America, our Constitution establishes a sacred principle through the Fifth and Fourteenth Amendments: no person shall be deprived of life, liberty, or property without due process of law. The Supreme Court declared in In re Winship, 397 U.S. 358 (1970), "We have no doubt that the Due Process Clause protects the accused against conviction except upon proof beyond a reasonable doubt of every fact necessary to constitute the crime with which he is charged."
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              Yet in 2024 alone, 147 innocent people were exonerated after spending an average of 13.5 years wrongfully imprisoned—nearly 2,000 years of human life stolen. Since 1989, there have been 3,646 documented exonerations in our nation. Behind each number is a shattered life, a devastated family, and a mockery of the justice we claim to uphold.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              The intersection of Family and Criminal Law creates a particularly vulnerable space where accusations can destroy lives without the burden of proof our Constitution demands. When family disputes enter the criminal justice system, the presumption of innocence—that bedrock principle which should protect every citizen—often crumbles under the weight of emotion, bias, and procedural shortcuts.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              In 72% of wrongful conviction cases, perjury or false accusations played a role. Official misconduct was present in over 70% of 2024 exonerations. But perhaps most disturbing is this: 15% of wrongful convictions involved false confessions—innocent people admitting to crimes they never committed. Among juveniles, this number climbs to over one-third of wrongful conviction cases.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              How does an innocent person confess to something they did not do? Our law recognizes this danger. The Supreme Court declared in Brown v. Mississippi (1936) that confessions obtained through duress, coercion, or violence violate the Fourteenth Amendment's guarantee of due process. In Miranda v. Arizona (1966), the Court established that suspects must be informed of their constitutional rights before custodial interrogation. Federal law, 18 U.S.C. § 3501, requires that confessions be "voluntarily given" and mandates judges assess whether a defendant's will was overborne by coercion before admitting any confession as evidence.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              These protections exist because our founders understood a fundamental truth: confessions obtained under duress are inherently unreliable and constitute a denial of justice. Yet despite these constitutional safeguards, the vulnerable—the young, the mentally impaired, those who cannot fully comprehend their Miranda rights—are subjected to psychological manipulation, presented with false evidence, isolated for hours, and worn down until they sign away their freedom. They confess because they are told it will help them, that cooperation will lead to leniency, that resistance is futile. They do not understand that once those words leave their lips, the presumption of innocence evaporates. They do not understand that the law's protections against coerced confessions often fail in practice, even when they exist in theory.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              These are not mere statistics—they represent systematic failures to honor the principle that it is better for ten guilty persons to escape than for one innocent to suffer.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              What does "due process of law" truly mean? Both the Fifth and Fourteenth Amendments mandate that no person shall be deprived of life, liberty, or property without due process. This is not mere formality—it requires specific protections: clear notice of charges, the right to counsel, arraignment where charges are formally read, a preliminary hearing to establish probable cause, the right to confront and cross-examine witnesses, a fair hearing before an impartial decision-maker, the right to remain silent without that silence being used against them, and if convicted, a sentencing that considers all relevant factors. Each step exists to prevent the very injustices our Constitution was designed to prohibit.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              Yet when these procedural safeguards are ignored, manipulated, or merely given lip service—when the process becomes a formality rather than a protection—due process becomes due persecution.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              The pages that follow document one such case—a case where the solemn promise of "innocent until proven guilty" became an empty phrase, where family law and criminal accusations intertwined to create injustice, where the very institutions meant to protect the innocent became instruments of persecution, where due process existed on paper but not in practice.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg" style={{ color: '#3E2723' }}>
              I present these records not in anger, but in the hope that truth, though delayed, will ultimately prevail. Justice demands it. The Constitution requires it. Human decency compels it.
            </p>

            <p className="mt-8 sm:mt-12 text-base sm:text-lg md:text-xl" style={{ color: '#3E2723' }}>
              Respectfully,
            </p>
            <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#3E2723' }}>
              Blankenship
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-8 sm:mt-12 px-4">
          <button
            onClick={() => navigate('/index')}
            className="brass-button px-10 py-4 rounded text-base sm:text-lg font-semibold uppercase tracking-wider flex items-center gap-3"
            style={{
              fontFamily: 'Garamond, serif',
              color: '#1a0f0a',
            }}
          >
            Continue to Archives
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SynopsisPage;
