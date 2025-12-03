import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Volume2, Square } from 'lucide-react';

const SynopsisPage = () => {
  const navigate = useNavigate();
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    document.title = 'Blankenship';
  }, []);

  // Letter text for Read Aloud
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

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }

    if (isReading) {
      // Stop reading
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      // Start reading
      const utterance = new SpeechSynthesisUtterance(letterText);
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      utterance.lang = 'en-US';
      
      utterance.onend = () => {
        setIsReading(false);
      };
      
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
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
