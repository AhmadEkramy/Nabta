import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings } from '../firebase/userSettings';
import BiblePage from '../pages/BiblePage';
import QuranPage from '../pages/QuranPage';

const SacredTextPage: React.FC = () => {
  const { user } = useAuth();
  const [religion, setReligion] = useState<'muslim' | 'christian' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReligionPreference = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const settings = await getUserSettings(user.id);
        setReligion(settings.preferences.religion || 'muslim');
      } catch (error) {
        console.error('Error loading religion preference:', error);
        setReligion('muslim'); // Default to muslim
      } finally {
        setLoading(false);
      }
    };

    loadReligionPreference();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Quran if muslim, Bible if christian
  if (religion === 'christian') {
    return <BiblePage />;
  }

  // Default to Quran (muslim or null)
  return <QuranPage />;
};

export default SacredTextPage;

