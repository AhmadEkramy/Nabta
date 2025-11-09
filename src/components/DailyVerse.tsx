import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Check, Loader2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import { hasUserReadVerse } from '../firebase/quran';
import { hasUserReadBibleVerse } from '../firebase/bible';
import { useDailyVerse } from '../hooks/useHomePage';

const DailyVerse: React.FC = () => {
  const { language, t } = useLanguage();
  const { markVerseRead } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRead, setIsRead] = useState(false);
  const [checkingReadStatus, setCheckingReadStatus] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use the existing hook for daily verse
  const { verse, loading, error, refreshVerse, isBible } = useDailyVerse();

  // Check if verse is already read when verse loads
  useEffect(() => {
    const checkReadStatus = async () => {
      if (!verse?.id || !user?.id) return;

      try {
        setCheckingReadStatus(true);
        let isAlreadyRead = false;
        
        if (isBible) {
          isAlreadyRead = await hasUserReadBibleVerse(user.id, verse.id);
        } else {
          isAlreadyRead = await hasUserReadVerse(user.id, verse.id);
        }
        
        console.log('Daily verse read status:', { verseId: verse.id, isRead: isAlreadyRead, isBible });
        setIsRead(isAlreadyRead);
      } catch (error) {
        console.error('Error checking verse read status:', error);
        setIsRead(false);
      } finally {
        setCheckingReadStatus(false);
      }
    };

    checkReadStatus();
  }, [verse?.id, user?.id, isBible]);

  const handleMarkAsRead = async () => {
    if (!verse?.id || !user?.id || isRead || markingAsRead) return;

    try {
      setMarkingAsRead(true);
      console.log('✅ Marking daily verse as read:', verse.id, 'isBible:', isBible);

      // Import the appropriate daily verse function
      const { markDailyVerseAsRead, markDailyBibleVerseAsRead } = await import('../firebase/homePage');

      // Mark as read using the appropriate daily verse system
      if (isBible) {
        await markDailyBibleVerseAsRead(user.id, verse.id);
      } else {
        await markDailyVerseAsRead(user.id, verse.id);
      }

      // Update local state
      setIsRead(true);

      // Update game context (XP, etc.)
      markVerseRead();

      console.log('✅ Daily verse marked as read successfully');
      console.log('📅 Tomorrow you will get the next verse in sequence');

      // Show success message briefly, but don't refresh immediately
      // The verse will automatically advance tomorrow or when user refreshes

    } catch (error) {
      console.error('❌ Error marking daily verse as read:', error);
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Clean up audio when component unmounts or verse changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [verse?.id]);

  // Generate audio URL for the verse (only for Quran)
  const getAudioUrl = useCallback((surahNumber: number, verseNumber: number) => {
    if (isBible) {
      // Bible doesn't have audio support yet
      return null;
    }
    // Using Al-Afasy recitation from everyayah.com
    const surahPadded = surahNumber.toString().padStart(3, '0');
    const versePadded = verseNumber.toString().padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_128kbps/${surahPadded}${versePadded}.mp3`;
  }, [isBible]);

  // Handle audio playback
  const handlePlayAudio = useCallback(async () => {
    if (!verse) return;

    try {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setAudioLoading(true);
      setAudioError(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (isBible) {
        setAudioError('Audio not available for Bible verses');
        return;
      }

      const surahNumber = verse.surahNumber || 1;
      const verseNumber = verse.ayah || 1;
      const audioUrl = getAudioUrl(surahNumber, verseNumber);
      
      if (!audioUrl) {
        setAudioError('Audio not available');
        return;
      }

      console.log('🔊 Loading daily verse audio:', audioUrl);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.volume = volume;

      audio.addEventListener('canplay', () => setAudioLoading(false));
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        audioRef.current = null;
      });
      audio.addEventListener('error', () => {
        setAudioError('Failed to load audio');
        setIsPlaying(false);
        setAudioLoading(false);
        audioRef.current = null;
      });

      await audio.play();
    } catch (error) {
      console.error('❌ Error playing daily verse audio:', error);
      setAudioError('Failed to play audio');
      setIsPlaying(false);
      setAudioLoading(false);
    }
  }, [verse, isPlaying, volume, getAudioUrl]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const handleGoToQuran = () => {
    navigate('/quran');
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>{language === 'ar' ? 'جاري تحميل الآية اليومية...' : 'Loading daily verse...'}</span>
        </div>
      </motion.div>
    );
  }

  if (error || !verse) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl p-6 text-white"
      >
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">
            {error
              ? (language === 'ar' ? 'خطأ في تحميل الآية' : 'Error loading verse')
              : (language === 'ar' ? 'لا توجد آية متاحة اليوم' : 'No verse available today')
            }
          </p>
          {error && (
            <p className="text-sm opacity-75 mb-4">
              {language === 'ar' ? 'يرجى المحاولة مرة أخرى لاحقاً' : 'Please try again later'}
            </p>
          )}
          <button
            onClick={handleGoToQuran}
            className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2 mx-auto"
          >
            <BookOpen className="w-5 h-5" />
            <span>{language === 'ar' ? 'اذهب إلى القرآن' : 'Go to Quran'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6" />
          <h3 className="text-xl font-semibold">
            {language === 'ar' 
              ? (isBible ? 'الآية اليومية من الإنجيل' : 'الآية اليومية')
              : (isBible ? 'Daily Bible Verse' : 'Daily Verse')
            }
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAsRead}
            disabled={isRead || markingAsRead || checkingReadStatus}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isRead
                ? 'bg-green-500 text-white'
                : markingAsRead
                ? 'bg-white/10 text-white cursor-not-allowed'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {markingAsRead ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span className="text-sm">
              {checkingReadStatus
                ? (language === 'ar' ? 'جاري التحقق...' : 'Checking...')
                : markingAsRead
                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                : isRead
                ? (language === 'ar' ? 'تم القراءة' : 'Read')
                : (language === 'ar' ? 'اقرأ' : 'Mark as Read')
              }
            </span>
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-2xl font-bold mb-4 leading-relaxed" style={{ fontFamily: 'serif', direction: isBible ? 'ltr' : 'rtl' }}>
          {isBible ? verse.english : verse.arabic}
        </p>
        {isBible && verse.arabic && (
          <p className="text-xl font-bold mb-4 leading-relaxed" style={{ fontFamily: 'serif', direction: 'rtl' }}>
            {verse.arabic}
          </p>
        )}
        {!isBible && verse.translation && (
          <p className="text-lg mb-4 opacity-90">
            {verse.translation}
          </p>
        )}
        <p className="text-sm opacity-70 mb-2">
          {isBible 
            ? (verse.reference || `${verse.book} ${verse.chapter}:${verse.verse}`)
            : (verse.reference || `${verse.surahAr || verse.surah}: ${verse.ayah}`)
          }
        </p>

        {/* Progress Information */}
        <div className="bg-white/10 rounded-lg p-3 mb-2">
          <p className="text-xs opacity-80 mb-1">
            {language === 'ar' 
              ? (isBible ? '📍 موقعك الحالي في الإنجيل' : '📍 موقعك الحالي في القرآن')
              : (isBible ? '📍 Your Current Position in Bible' : '📍 Your Current Position in Quran')
            }
          </p>
          <p className="text-sm font-medium">
            {isBible
              ? (language === 'ar'
                  ? `${verse.bookAr || verse.book} • الأصحاح ${verse.chapter}`
                  : `${verse.book} • Chapter ${verse.chapter}`
                )
              : (language === 'ar'
                  ? `الجزء ${verse.juzNumber || 1} • السورة ${verse.surahNumber || verse.surah}`
                  : `Juz ${verse.juzNumber || 1} • Surah ${verse.surahNumber || verse.surah}`
                )
            }
          </p>
        </div>

        {/* Audio Controls (only for Quran) */}
        {!isBible && (
        <div className="flex items-center justify-center space-x-3 mb-4">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayAudio}
            disabled={audioLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : audioLoading
                ? 'bg-white/5 text-white/50 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {audioLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="text-sm">
              {audioLoading
                ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
                : isPlaying
                ? (language === 'ar' ? 'إيقاف' : 'Pause')
                : (language === 'ar' ? 'استمع' : 'Listen')
              }
            </span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
            <button
              onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.8)}
              className="text-white/70 hover:text-white"
            >
              {volume > 0 ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>
        </div>
        )}

        {/* Audio Error */}
        {!isBible && audioError && (
          <div className="text-xs text-red-300 bg-red-500/20 px-3 py-2 rounded-lg mb-4">
            {language === 'ar' ? 'خطأ في تشغيل الصوت' : 'Audio Error'}
          </div>
        )}

        {/* Reading Instructions */}
        <div className="text-xs opacity-75 bg-white/5 rounded-lg p-2">
          {isRead ? (
            <p>
              {language === 'ar'
                ? '✅ تم قراءة هذه الآية! ستحصل على الآية التالية غداً'
                : '✅ Verse read! You\'ll get the next verse tomorrow'
              }
            </p>
          ) : (
            <p>
              {language === 'ar'
                ? '📖 اقرأ هذه الآية واضغط "تم القراءة" للانتقال للآية التالية غداً'
                : '📖 Read this verse and click "Mark as Read" to advance to the next verse tomorrow'
              }
            </p>
          )}
        </div>
      </div>

      {/* Navigation to Sacred Text Page */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate(isBible ? '/bible' : '/quran')}
          className="flex items-center space-x-2 bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors group"
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">
            {language === 'ar' 
              ? (isBible ? 'اقرأ المزيد من الإنجيل' : 'اقرأ المزيد من القرآن')
              : (isBible ? 'Read More Bible' : 'Read More Quran')
            }
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default DailyVerse;