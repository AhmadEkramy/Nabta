import { motion } from 'framer-motion';
import { BookOpen, Check, Heart, Loader2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { VerseDisplayInfo } from '../types';

interface QuranVerseDisplayProps {
  verseInfo: VerseDisplayInfo;
  isRead: boolean;
  onMarkAsRead: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  loading?: boolean;
}

const QuranVerseDisplay: React.FC<QuranVerseDisplayProps> = ({
  verseInfo,
  isRead,
  onMarkAsRead,
  onToggleFavorite,
  isFavorite = false,
  loading = false
}) => {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { verse, position, navigation, progress } = verseInfo;

  // Clean up audio when component unmounts or verse changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [verse.id]);

  // Generate audio URL for the verse
  const getAudioUrl = useCallback((surahNumber: number, verseNumber: number) => {
    // Using Al-Afasy recitation from everyayah.com (popular Quran audio API)
    // Format: https://everyayah.com/data/Alafasy_128kbps/{surah:03d}{verse:03d}.mp3
    const surahPadded = surahNumber.toString().padStart(3, '0');
    const versePadded = verseNumber.toString().padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_128kbps/${surahPadded}${versePadded}.mp3`;
  }, []);

  // Handle audio playback
  const handlePlayAudio = useCallback(async () => {
    try {
      if (isPlaying && audioRef.current) {
        // Pause current audio
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      setAudioError(null);

      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Get audio URL
      const audioUrl = getAudioUrl(position.surahNumber, position.verseNumber);
      console.log('🔊 Loading audio:', audioUrl);

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set volume
      audio.volume = volume;

      // Audio event listeners
      audio.addEventListener('loadstart', () => {
        console.log('🔄 Audio loading started');
      });

      audio.addEventListener('canplay', () => {
        console.log('✅ Audio can play');
        setIsLoading(false);
      });

      audio.addEventListener('play', () => {
        console.log('▶️ Audio started playing');
        setIsPlaying(true);
      });

      audio.addEventListener('pause', () => {
        console.log('⏸️ Audio paused');
        setIsPlaying(false);
      });

      audio.addEventListener('ended', () => {
        console.log('🏁 Audio ended');
        setIsPlaying(false);
        audioRef.current = null;
      });

      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error:', e);
        setAudioError('Failed to load audio');
        setIsPlaying(false);
        setIsLoading(false);
        audioRef.current = null;
      });

      // Start playing
      await audio.play();

    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setAudioError('Failed to play audio');
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [isPlaying, position.surahNumber, position.verseNumber, volume, getAudioUrl]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full mb-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Verse Header with Position Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? position.surahNameAr : position.surahName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ar' 
                ? `الجزء ${position.juzNumber} • الآية ${position.verseNumber}`
                : `Juz ${position.juzNumber} • Verse ${position.verseNumber}`
              }
            </p>
          </div>
        </div>
        
        {/* Progress Badge */}
        <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {progress.overallPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-6">
        <div 
          className="text-2xl md:text-3xl leading-relaxed text-right font-arabic text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          style={{ 
            fontFamily: 'Amiri, "Times New Roman", serif',
            lineHeight: '2.2',
            direction: 'rtl'
          }}
        >
          {verse.arabic}
        </div>
      </div>

      {/* Translation */}
      <div className="mb-6">
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 italic">
          "{verse.translation}"
        </p>
      </div>

      {/* Reference */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {verse.reference || `${position.surahName} ${position.verseNumber}`}
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Overall Progress */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'التقدم العام' : 'Overall'}
            </span>
            <span className="text-xs text-gray-500">
              {progress.overallPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.overallPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Juz Progress */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {language === 'ar' ? `الجزء ${position.juzNumber}` : `Juz ${position.juzNumber}`}
            </span>
            <span className="text-xs text-gray-500">
              {progress.juzPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.juzPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Surah Progress */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {language === 'ar' ? position.surahNameAr : position.surahName}
            </span>
            <span className="text-xs text-gray-500">
              {progress.surahPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.surahPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Audio Controls */}
          <div className="flex items-center space-x-2">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayAudio}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isPlaying
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                  : isLoading
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="text-sm">
                {isLoading
                  ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
                  : isPlaying
                  ? (language === 'ar' ? 'إيقاف' : 'Pause')
                  : (language === 'ar' ? 'استمع' : 'Listen')
                }
              </span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <button
                onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.8)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
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
                className="w-16 h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${volume * 100}%, #d1d5db ${volume * 100}%, #d1d5db 100%)`
                }}
              />
            </div>
          </div>

          {/* Audio Error Message */}
          {audioError && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
              {language === 'ar' ? 'خطأ في تشغيل الصوت' : 'Audio Error'}
            </div>
          )}

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isFavorite
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="text-sm">
                {language === 'ar' ? 'مفضل' : 'Favorite'}
              </span>
            </button>
          )}
        </div>

        {/* Mark as Read Button */}
        <button
          onClick={onMarkAsRead}
          disabled={isRead}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isRead
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isRead 
              ? (language === 'ar' ? 'مقروءة' : 'Read')
              : (language === 'ar' ? 'تم القراءة' : 'Mark as Read')
            }
          </span>
        </button>
      </div>

      {/* Navigation Status */}
      {(navigation.isFirst || navigation.isLast) && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
            {navigation.isFirst && (language === 'ar' 
              ? 'هذه هي الآية الأولى في القرآن الكريم' 
              : 'This is the first verse of the Holy Quran'
            )}
            {navigation.isLast && (language === 'ar' 
              ? 'هذه هي الآية الأخيرة في القرآن الكريم' 
              : 'This is the last verse of the Holy Quran'
            )}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default QuranVerseDisplay;
