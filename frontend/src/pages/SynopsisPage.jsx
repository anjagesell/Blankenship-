import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';

const SynopsisPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Blankenship';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Justicia statue */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-4">
            <img 
              src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxMYWR5JTIwSnVzdGljZSUyMHN0YXR1ZXxlbnwwfHx8fDE3NjQ0MzcxNzZ8MA&ixlib=rb-4.1.0&q=85"
              alt="Justicia Bronze Statue"
              className="h-32 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-center text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            Blankenship
          </h1>
        </div>
      </div>

      {/* Letter Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-amber-50 p-12 rounded-lg shadow-lg border border-amber-200">
          <div 
            className="text-gray-800 space-y-6 leading-relaxed"
            style={{ 
              fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
              fontSize: '1.5rem',
              lineHeight: '2.5rem'
            }}
          >
            <p className="mb-8">Dear Sir/Madam,</p>
            
            <p className="indent-12">
              [Your content will be placed here. This is a placeholder for the introduction text that will discuss the gravity of misrepresentation and the principles of justice.]
            </p>

            <p className="indent-12">
              [Additional paragraphs of content can be added here to complete your letter.]
            </p>

            <p className="indent-12">
              [The letter will continue with your serious-toned message about justice and due process.]
            </p>

            <p className="mt-12">
              Respectfully,
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => navigate('/index')}
            size="lg"
            className="text-lg px-8 py-6"
          >
            Continue to Index
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SynopsisPage;
