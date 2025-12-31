import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, FileImage, Download, Users, Clock } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const ContentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        // Fetch entry data from monthly entries
        const entriesRes = await fetch(`${API_BASE}/api/monthly/12-2013`);
        const entries = await entriesRes.json();
        const foundEntry = entries.find(e => e.id === id);
        
        if (foundEntry) {
          setEntry(foundEntry);
          document.title = `Blankenship - ${foundEntry.description || 'Entry'}`;
        }

        // Fetch files for this entry
        const filesRes = await fetch(`${API_BASE}/api/files/${id}`);
        const filesData = await filesRes.json();
        setFiles(filesData || []);
      } catch (error) {
        console.error('Error fetching entry:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
    window.scrollTo(0, 0);
  }, [id]);

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

        {loading ? (
          <div className="text-center text-yellow-600 py-12">Loading entry...</div>
        ) : !entry ? (
          <div className="text-center text-yellow-600 py-12">Entry not found</div>
        ) : (
        <div 
          className="parchment-bg p-6 sm:p-10 md:p-12 rounded shadow-2xl relative"
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
            {/* Date and Time Header */}
            <div className="border-b pb-3 sm:pb-4" style={{ borderColor: '#8b6914' }}>
              <div className="flex items-center gap-4 mb-2">
                <p className="text-xs sm:text-sm" style={{ color: '#5D4037', fontFamily: 'Garamond, serif' }}>
                  {entry.date || 'Date not specified'}
                </p>
                {entry.time && (
                  <p className="text-xs sm:text-sm flex items-center gap-1" style={{ color: '#5D4037', fontFamily: 'Garamond, serif' }}>
                    <Clock className="w-3 h-3" />
                    {entry.time}
                  </p>
                )}
              </div>
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl font-bold"
                style={{ fontFamily: 'Georgia, serif', color: '#3E2723' }}
              >
                {entry.description || 'Entry'}
              </h2>
            </div>

            {/* Details Section */}
            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
              <p 
                className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap"
                style={{ color: '#3E2723', fontFamily: 'Garamond, serif' }}
              >
                {entry.details || 'No details available.'}
              </p>
            </div>

            {/* Persons Involved Section */}
            {entry.witness && (
              <div 
                className="mt-6 p-4 rounded border"
                style={{
                  background: 'linear-gradient(145deg, rgba(139,69,19,0.08) 0%, rgba(139,69,19,0.03) 100%)',
                  borderColor: '#8b6914',
                }}
              >
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#3E2723', fontFamily: 'Georgia, serif' }}>
                  <Users className="w-5 h-5" style={{ color: '#8b6914' }} />
                  Persons Involved
                </h3>
                <div className="space-y-2">
                  {entry.witness.split('\n').filter(w => w.trim()).map((person, idx) => (
                    <p key={idx} className="text-sm" style={{ color: '#5D4037', fontFamily: 'Garamond, serif' }}>
                      • {person}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Exhibits Section */}
            {files.length > 0 && (
              <div 
                className="mt-8 p-4 rounded border"
                style={{
                  background: 'linear-gradient(145deg, rgba(42,82,152,0.08) 0%, rgba(42,82,152,0.03) 100%)',
                  borderColor: '#8b6914',
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#3E2723', fontFamily: 'Georgia, serif' }}>
                  <FileImage className="w-5 h-5" style={{ color: '#8b6914' }} />
                  Exhibits ({files.length} documents)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, idx) => (
                    <div 
                      key={file.file_id}
                      className="relative group cursor-pointer rounded overflow-hidden border"
                      style={{ borderColor: '#8b6914', background: '#f5f0e1' }}
                      onClick={() => setSelectedImage(file)}
                    >
                      <div className="aspect-square bg-amber-100 flex items-center justify-center overflow-hidden">
                        {/* Universal image URL - works on ALL devices (Android, iOS, PC, Tablet) */}
                        <img 
                          src={`${API_BASE}/api/file/${file.file_id}`}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-full items-center justify-center">
                          <FileImage className="w-12 h-12 text-amber-700/50" />
                        </div>
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-xs truncate" style={{ color: '#5D4037', fontFamily: 'Garamond, serif' }}>
                          {file.filename}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm">Click to view</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {entry.notes && (
              <div 
                className="mt-6 p-4 rounded border"
                style={{
                  background: 'linear-gradient(145deg, rgba(139,69,19,0.1) 0%, rgba(139,69,19,0.05) 100%)',
                  borderColor: '#8b6914',
                }}
              >
                <p className="text-sm italic" style={{ color: '#5D4037', fontFamily: 'Garamond, serif' }}>
                  Note: {entry.notes}
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <button 
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 z-10"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            {selectedImage.file_content ? (
              <img 
                src={`data:image/jpeg;base64,${selectedImage.file_content}`}
                alt={selectedImage.filename}
                className="max-w-full max-h-[85vh] object-contain"
              />
            ) : (
              <div className="text-white text-center p-8">Image not available</div>
            )}
            <p className="text-white text-center mt-4">{selectedImage.filename}</p>
            {selectedImage.description && (
              <p className="text-white/70 text-center text-sm mt-2">{selectedImage.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPage;
