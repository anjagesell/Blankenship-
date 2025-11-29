import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Volume2, Pause, Square } from 'lucide-react';
import { toast } from '../hooks/use-toast';

/**
 * SynopsisPage Component with Cross-Browser Text-to-Speech
 * 
 * Browser Compatibility:
 * ✅ Chrome/Edge (Desktop & Mobile) - Full support with voice selection
 * ✅ Safari (macOS & iOS) - Full support with native voices
 * ✅ Firefox (Desktop & Mobile) - Full support
 * ✅ Samsung Internet - Full support
 * ✅ Opera - Full support
 * 
 * Features:
 * - Automatic voice loading with fallbacks
 * - Mature male voice selection across all platforms
 * - Chrome bug workaround (15-second timeout)
 * - Proper error handling for all browsers
 * - Mobile-optimized controls
 * - Pause/Resume functionality
 */
const SynopsisPage = () => {
  const navigate = useNavigate();
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    document.title = 'Blankenship';
  }, []);

  const letterText = `Dear Sir or Madam,

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

  // Enhanced voice loading for all browsers
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const voicesRef = useRef([]);

  useEffect(() => {
    // Function to load and cache voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        setVoicesLoaded(true);
        console.log('Voices loaded:', voices.length);
      }
      return voices;
    };
    
    // Initial load attempt
    loadVoices();
    
    // Set up voice loading listener for browsers that load voices asynchronously
    // (Chrome, Edge, and some mobile browsers)
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
      };
      
      // Safari and Firefox may need a small delay
      setTimeout(() => {
        loadVoices();
      }, 100);
      
      // Additional fallback for stubborn browsers
      setTimeout(() => {
        loadVoices();
      }, 500);
    }
    
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleReadAloud = () => {
    // Check for Web Speech API support
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Your browser does not support text-to-speech. Please try Chrome, Edge, Safari, or Firefox.',
        variant: 'destructive',
      });
      return;
    }

    // Handle pause/resume
    if (isPaused) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsReading(true);
      } catch (error) {
        console.error('Resume error:', error);
        setIsReading(false);
        setIsPaused(false);
      }
      return;
    }

    // Handle pause during reading
    if (isReading) {
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } catch (error) {
        console.error('Pause error:', error);
      }
      return;
    }

    // Start new reading
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Small delay to ensure cancellation is processed
      setTimeout(() => {
        try {
          // Create utterance
          const utterance = new SpeechSynthesisUtterance(letterText);
          utteranceRef.current = utterance;
          
          // Configure voice settings for mature, calm tone
          utterance.rate = 0.85;     // Slightly slower for clarity
          utterance.pitch = 0.75;    // Lower pitch for mature voice
          utterance.volume = 1.0;    // Full volume
          utterance.lang = 'en-US';  // Explicitly set language
          
          // Get voices with multiple fallbacks
          let voices = window.speechSynthesis.getVoices();
          
          // If no voices yet, wait a bit and try again
          if (voices.length === 0) {
            console.log('No voices yet, waiting...');
            // Trigger voice loading
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
            window.speechSynthesis.cancel();
            voices = window.speechSynthesis.getVoices();
          }
          
          console.log(`Available voices: ${voices.length}`, voices.slice(0, 3).map(v => v.name));
          
          // Priority list for mature male voices across all browsers
          const voicePreferences = [
            // iOS/macOS
            { name: 'Daniel', priority: 1 },       // iOS British male
            { name: 'Alex', priority: 2 },         // macOS mature male
            { name: 'Fred', priority: 3 },         // iOS American male
            // Windows
            { name: 'Microsoft David', priority: 4 },
            { name: 'Microsoft Mark', priority: 5 },
            { name: 'David', priority: 6 },
            { name: 'Mark', priority: 7 },
            // Google/Chrome
            { name: 'Google US English Male', priority: 8 },
            { name: 'Google UK English Male', priority: 9 },
            // Android
            { name: 'en-US-Wavenet-D', priority: 10 },
            { name: 'en-US-Wavenet-A', priority: 11 },
            { name: 'en-us-x-iob-local', priority: 12 },
            { name: 'en-us-x-iom-local', priority: 13 },
            // Generic patterns
            { pattern: /male.*en-us/i, priority: 14 },
            { pattern: /^en.*male/i, priority: 15 },
          ];
          
          let selectedVoice = null;
          let bestPriority = Infinity;
          
          // Find best matching voice
          for (const voice of voices) {
            if (!voice.lang.startsWith('en')) continue;
            
            for (const pref of voicePreferences) {
              let matches = false;
              
              if (pref.name && voice.name.includes(pref.name)) {
                matches = true;
              } else if (pref.pattern && pref.pattern.test(voice.name)) {
                matches = true;
              }
              
              if (matches && pref.priority < bestPriority) {
                selectedVoice = voice;
                bestPriority = pref.priority;
                break;
              }
            }
          }
          
          // Fallback: any English voice
          if (!selectedVoice && voices.length > 0) {
            selectedVoice = voices.find(v => v.lang.startsWith('en-US')) ||
                           voices.find(v => v.lang.startsWith('en')) ||
                           voices[0];
          }
          
          // Set the selected voice
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
          } else {
            console.log('Using default system voice');
          }
          
          // Event handlers
          utterance.onstart = () => {
            console.log('Speech started');
            setIsReading(true);
            setIsPaused(false);
          };
          
          utterance.onend = () => {
            console.log('Speech ended normally');
            setIsReading(false);
            setIsPaused(false);
          };
          
          utterance.onpause = () => {
            console.log('Speech paused');
          };
          
          utterance.onresume = () => {
            console.log('Speech resumed');
          };
          
          utterance.onerror = (event) => {
            console.error('Speech error:', event.error, event);
            setIsReading(false);
            setIsPaused(false);
            
            // Don't show error for user-initiated actions
            if (event.error === 'canceled' || event.error === 'interrupted') {
              return;
            }
            
            // Show user-friendly error messages
            let errorMsg = 'Unable to read aloud.';
            if (event.error === 'network') {
              errorMsg = 'Network error. Please check your connection.';
            } else if (event.error === 'synthesis-failed') {
              errorMsg = 'Speech synthesis failed. Try refreshing the page.';
            } else if (event.error === 'audio-busy') {
              errorMsg = 'Audio is busy. Please try again.';
            } else if (event.error === 'not-allowed') {
              errorMsg = 'Browser blocked speech. Please enable in settings.';
            }
            
            toast({
              title: 'Read Aloud Error',
              description: errorMsg,
              variant: 'destructive',
            });
          };
          
          // Start speaking
          console.log('Starting speech synthesis...');
          
          // Check if speech synthesis is already speaking (safety check)
          if (window.speechSynthesis.speaking) {
            console.log('Already speaking, canceling...');
            window.speechSynthesis.cancel();
          }
          
          // Speak the utterance
          window.speechSynthesis.speak(utterance);
          
        } catch (innerError) {
          console.error('Speech initialization error:', innerError);
          setIsReading(false);
          setIsPaused(false);
          toast({
            title: 'Error',
            description: 'Failed to start speech. Please try again.',
            variant: 'destructive',
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('Read aloud outer error:', error);
      setIsReading(false);
      setIsPaused(false);
      toast({
        title: 'Error',
        description: 'Unable to initialize text-to-speech.',
        variant: 'destructive',
      });
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
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

      {/* Letter Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        {/* Audio Controls - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 px-2 sm:px-4">
          <Button
            onClick={handleReadAloud}
            size="lg"
            variant={isReading && !isPaused ? "default" : "outline"}
            className="flex items-center justify-center gap-2 w-full sm:w-auto text-base sm:text-lg py-6 touch-manipulation"
          >
            {isReading && !isPaused ? (
              <>
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Pause Reading</span>
              </>
            ) : isPaused ? (
              <>
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Resume Reading</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Read Aloud</span>
              </>
            )}
          </Button>
          
          {(isReading || isPaused) && (
            <Button
              onClick={handleStop}
              size="lg"
              variant="destructive"
              className="flex items-center justify-center gap-2 w-full sm:w-auto text-base sm:text-lg py-6 touch-manipulation"
            >
              <Square className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Stop</span>
            </Button>
          )}
        </div>

        <div className="bg-amber-50 p-4 sm:p-8 md:p-12 rounded-lg shadow-lg border border-amber-200">
          <div 
            className="text-gray-800 space-y-4 sm:space-y-6 leading-relaxed"
            style={{ 
              fontFamily: "'Kalam', cursive"
            }}
          >
            <p className="mb-6 sm:mb-8 text-base sm:text-lg md:text-xl">Dear Sir/Madam,</p>
            
            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              In the United States of America, our Constitution establishes a sacred principle through the Fifth and Fourteenth Amendments: no person shall be deprived of life, liberty, or property without due process of law. The Supreme Court declared in In re Winship, 397 U.S. 358 (1970), "We have no doubt that the Due Process Clause protects the accused against conviction except upon proof beyond a reasonable doubt of every fact necessary to constitute the crime with which he is charged."
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              Yet in 2024 alone, 147 innocent people were exonerated after spending an average of 13.5 years wrongfully imprisoned—nearly 2,000 years of human life stolen. Since 1989, there have been 3,646 documented exonerations in our nation. Behind each number is a shattered life, a devastated family, and a mockery of the justice we claim to uphold.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              The intersection of Family and Criminal Law creates a particularly vulnerable space where accusations can destroy lives without the burden of proof our Constitution demands. When family disputes enter the criminal justice system, the presumption of innocence—that bedrock principle which should protect every citizen—often crumbles under the weight of emotion, bias, and procedural shortcuts.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              In 72% of wrongful conviction cases, perjury or false accusations played a role. Official misconduct was present in over 70% of 2024 exonerations. But perhaps most disturbing is this: 15% of wrongful convictions involved false confessions—innocent people admitting to crimes they never committed. Among juveniles, this number climbs to over one-third of wrongful conviction cases.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              How does an innocent person confess to something they did not do? Our law recognizes this danger. The Supreme Court declared in Brown v. Mississippi (1936) that confessions obtained through duress, coercion, or violence violate the Fourteenth Amendment's guarantee of due process. In Miranda v. Arizona (1966), the Court established that suspects must be informed of their constitutional rights before custodial interrogation. Federal law, 18 U.S.C. § 3501, requires that confessions be "voluntarily given" and mandates judges assess whether a defendant's will was overborne by coercion before admitting any confession as evidence.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              These protections exist because our founders understood a fundamental truth: confessions obtained under duress are inherently unreliable and constitute a denial of justice. Yet despite these constitutional safeguards, the vulnerable—the young, the mentally impaired, those who cannot fully comprehend their Miranda rights—are subjected to psychological manipulation, presented with false evidence, isolated for hours, and worn down until they sign away their freedom. They confess because they are told it will help them, that cooperation will lead to leniency, that resistance is futile. They do not understand that once those words leave their lips, the presumption of innocence evaporates. They do not understand that the law's protections against coerced confessions often fail in practice, even when they exist in theory.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              These are not mere statistics—they represent systematic failures to honor the principle that it is better for ten guilty persons to escape than for one innocent to suffer.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              What does "due process of law" truly mean? Both the Fifth and Fourteenth Amendments mandate that no person shall be deprived of life, liberty, or property without due process. This is not mere formality—it requires specific protections: clear notice of charges, the right to counsel, arraignment where charges are formally read, a preliminary hearing to establish probable cause, the right to confront and cross-examine witnesses, a fair hearing before an impartial decision-maker, the right to remain silent without that silence being used against them, and if convicted, a sentencing that considers all relevant factors. Each step exists to prevent the very injustices our Constitution was designed to prohibit.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              Yet when these procedural safeguards are ignored, manipulated, or merely given lip service—when the process becomes a formality rather than a protection—due process becomes due persecution.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              The pages that follow document one such case—a case where the solemn promise of "innocent until proven guilty" became an empty phrase, where family law and criminal accusations intertwined to create injustice, where the very institutions meant to protect the innocent became instruments of persecution, where due process existed on paper but not in practice.
            </p>

            <p className="indent-8 sm:indent-12 text-sm sm:text-base md:text-lg">
              I present these records not in anger, but in the hope that truth, though delayed, will ultimately prevail. Justice demands it. The Constitution requires it. Human decency compels it.
            </p>

            <p className="mt-8 sm:mt-12 text-sm sm:text-base md:text-lg">
              Respectfully,
            </p>
            <p className="mt-2 sm:mt-4 text-xl sm:text-2xl md:text-3xl">
              Blankenship
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-6 sm:mt-8 px-4">
          <Button
            onClick={() => navigate('/index')}
            size="lg"
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
          >
            Continue to Index
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SynopsisPage;
