import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEntryContent, indexEntries } from '../mock';
import { ArrowLeft, Scale } from 'lucide-react';

const ContentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = getEntryContent(id);
  const indexEntry = indexEntries.find(e => e.id === parseInt(id));

  useEffect(() => {
    document.title = `Blankenship - ${indexEntry?.header || 'Entry'}`;
  }, [indexEntry]);

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
            Judicial Archives
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl relative z-10">
        <button
          onClick={() => navigate('/index')}
          className="mb-8 px-6 py-3 rounded transition-all brass-button flex items-center gap-2"
          style={{
            fontFamily: 'Garamond, serif',
            color: '#1a0f0a',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Index
        </button>

        <div 
          className="parchment-bg p-6 sm:p-10 md:p-12 rounded shadow-2xl"
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

          <div className="space-y-4 sm:space-y-6">
            <div className="border-b pb-3 sm:pb-4" style={{ borderColor: '#8b6914' }}>
              <p className="text-xs sm:text-sm mb-2" style={{ color: '#5D4037', fontFamily: 'Garamond, serif' }}>
                {indexEntry?.date || 'Date not specified'}
              </p>
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl font-bold"
                style={{ fontFamily: 'Georgia, serif', color: '#3E2723' }}
              >
                {entry.title}
              </h2>
            </div>

            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
              <p 
                className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap"
                style={{ color: '#3E2723', fontFamily: 'Garamond, serif' }}
              >
                {entry.content}
              </p>
            </div>

            <div 
              className="mt-8 p-6 rounded border"
              style={{
                background: 'linear-gradient(145deg, rgba(139,69,19,0.1) 0%, rgba(139,69,19,0.05) 100%)',
                borderColor: '#8b6914',
              }}
            >
              <p className="text-sm italic" style={{ color: '#5D4037', fontFamily: 'Garamond, serif' }}>
                Note: Content and photos for this entry will be added later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
