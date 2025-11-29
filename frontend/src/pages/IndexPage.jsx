import React from 'react';
import { useNavigate } from 'react-router-dom';
import { indexEntries } from '../mock';
import { Card } from '../components/ui/card';
import { Calendar } from 'lucide-react';

const IndexPage = () => {
  const navigate = useNavigate();

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
          <h1 className="text-4xl font-bold text-center text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            Blankenship
          </h1>
        </div>
      </div>

      {/* Index Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {indexEntries.map((entry) => (
            <Card
              key={entry.id}
              onClick={() => navigate(`/entry/${entry.id}`)}
              className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 bg-white group"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">{entry.date}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {entry.header}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {entry.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;