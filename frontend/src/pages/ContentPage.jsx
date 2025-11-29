import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEntryContent, indexEntries } from '../mock';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ContentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = getEntryContent(id);
  const indexEntry = indexEntries.find(e => e.id === parseInt(id));

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Justicia statue */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-4">
            <img 
              src="https://images.pexels.com/photos/10320852/pexels-photo-10320852.jpeg"
              alt="Justicia Bronze Statue"
              className="h-32 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          onClick={() => navigate('/index')}
          variant="outline"
          className="mb-8 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Index
        </Button>

        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-600 mb-2">{indexEntry?.date}</p>
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
              {entry.title}
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 italic">
              Note: Content and photos for this entry will be added later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;