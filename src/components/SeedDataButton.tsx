import { Database, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { seedSampleData } from '../firebase/seedData';

const SeedDataButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await seedSampleData();
      if (result) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to seed data');
      }
    } catch (err) {
      setError('Error seeding data');
      console.error('Seed data error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleSeedData}
        disabled={loading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
          success
            ? 'bg-green-500 text-white'
            : error
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Database className="w-4 h-4" />
        )}
        <span className="text-sm">
          {loading
            ? 'Seeding...'
            : success
            ? 'Data Added!'
            : error
            ? 'Error!'
            : 'Add Sample Data'
          }
        </span>
      </button>
      
      {error && (
        <div className="absolute bottom-full right-0 mb-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default SeedDataButton;