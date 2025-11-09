import { motion } from 'framer-motion';
import {
  AlertCircle,
  Clock,
  Edit3,
  Pause,
  Play,
  RotateCcw,
  Square,
  Target,
  Trash2,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import VoiceRecorder from '../components/VoiceRecorder';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  completeFocusSession,
  createFocusSession,
  deleteFocusSession,
  getActiveFocusSession,
  getFileDownloadURL,
  getUserFocusSessions,
  getUserFocusStats,
  updateFocusSession,
  uploadFile
} from '../firebase';
import { FocusSession } from '../types';

const FocusModesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { addFocusTime } = useGame();
  const { user } = useAuth();
  
  // Session state
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Stats state
  const [focusStats, setFocusStats] = useState({
    sessionsThisWeek: 0,
    totalHours: 0,
    consecutiveDays: 0
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Post-session reflection state
  const [lastFinished, setLastFinished] = useState<{
    id: string;
    modeName: string;
    seconds: number;
    status: 'completed' | 'stopped';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [isSavingReflection, setIsSavingReflection] = useState(false);

  // Finished sessions list
  const [finishedSessions, setFinishedSessions] = useState<FocusSession[]>([]);
  const [isLoadingFinished, setIsLoadingFinished] = useState(false);

  // Edit session state
  const [editingSession, setEditingSession] = useState<FocusSession | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<FocusSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const focusModes = [
    {
      id: 'productivity',
      name: language === 'ar' ? 'وضع الإنتاجية' : 'Productivity Mode',
      description: language === 'ar' ? 'تقنية البومودورو - 25 دقيقة تركيز + 5 دقائق راحة' : 'Pomodoro Technique - 25min focus + 5min break',
      duration: 25 * 60,
      xpReward: 25,
      icon: <Target className="w-8 h-8" />,
      color: 'blue'
    },
    {
      id: 'meditation',
      name: language === 'ar' ? 'وضع التأمل' : 'Meditation Mode',
      description: language === 'ar' ? 'جلسة تأمل هادئة لتطوير الوعي الذهني' : 'Quiet meditation session for mindfulness development',
      duration: 15 * 60,
      xpReward: 20,
      icon: <Clock className="w-8 h-8" />,
      color: 'green'
    },
    {
      id: 'urgent',
      name: language === 'ar' ? 'الوضع العاجل' : 'Urgent Mode',
      description: language === 'ar' ? 'تركيز عميق لمدة 60 دقيقة - مكافأة مضاعفة' : 'Deep focus for 60 minutes - double XP reward',
      duration: 60 * 60,
      xpReward: 100,
      icon: <Zap className="w-8 h-8" />,
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  };

  // Load user focus stats
  useEffect(() => {
    const loadFocusStats = async () => {
      if (!user) return;
      
      try {
        const stats = await getUserFocusStats(user.id);
        setFocusStats(stats);
      } catch (error) {
        console.error('Error loading focus stats:', error);
      }
    };
    
    loadFocusStats();
  }, [user]);

  // Load finished sessions
  useEffect(() => {
    const loadFinished = async () => {
      if (!user) return;
      try {
        setIsLoadingFinished(true);
        const sessions = await getUserFocusSessions(user.id);
        const finished = sessions
          .filter(s => s.status === 'completed' || s.status === 'stopped')
          .sort((a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt).getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt).getTime());
        setFinishedSessions(finished);
      } catch (e) {
        console.error('Error loading finished sessions:', e);
      } finally {
        setIsLoadingFinished(false);
      }
    };
    loadFinished();
  }, [user]);

  // Restore active session on mount
  useEffect(() => {
    const restoreActiveSession = async () => {
      if (!user) return;

      try {
        const activeSession = await getActiveFocusSession(user.id);
        
        if (activeSession) {
          // Find the mode that matches this session
          const mode = focusModes.find(m => m.id === activeSession.modeId);
          if (!mode) {
            console.error('Mode not found for active session:', activeSession.modeId);
            return;
          }

          const now = new Date();
          let totalElapsed = activeSession.totalSeconds || 0;

          // If session is active, add time since it started or was last resumed
          if (activeSession.status === 'active') {
            // If there's a pausedAt, we need to calculate from when it was resumed (updatedAt)
            // Otherwise calculate from createdAt
            const timeReference = activeSession.pausedAt && activeSession.updatedAt
              ? new Date(activeSession.updatedAt) // When session was resumed
              : new Date(activeSession.createdAt); // When session was started
            
            const elapsedSinceResume = Math.floor((now.getTime() - timeReference.getTime()) / 1000);
            // totalSeconds already includes time before pause, so just add elapsed since resume
            totalElapsed = totalElapsed + Math.max(0, elapsedSinceResume);
          }
          // If session is paused, elapsed time is already in totalSeconds (time when paused)
          
          // Calculate remaining time
          const remaining = Math.max(0, mode.duration - totalElapsed);

          // Restore session state
          setSessionId(activeSession.id);
          setActiveMode(activeSession.modeId);
          setElapsedTime(totalElapsed);
          setTimeRemaining(remaining);
          
          // Set running state based on session status
          setIsRunning(activeSession.status === 'active');
          
          // If session is complete (remaining <= 0), mark it as complete
          if (remaining <= 0 && activeSession.status === 'active') {
            // Complete the session
            try {
              await completeFocusSession(activeSession.id, mode.duration, 'completed');
              const hoursSpent = mode.duration / 3600;
              addFocusTime(hoursSpent);
              
              setLastFinished({ 
                id: activeSession.id, 
                modeName: mode.name, 
                seconds: mode.duration, 
                status: 'completed' 
              });
              setNotes('');
              setRating(0);
              setVoiceBlob(null);
              setVoiceDuration(0);
              
              setIsRunning(false);
              setActiveMode(null);
              setSessionId(null);
              
              toast.success(language === 'ar' ? 'تم إنهاء الجلسة بنجاح!' : 'Session completed successfully!');
              
              // Refresh focus stats and finished list
              const [stats, sessions] = await Promise.all([
                getUserFocusStats(user.id),
                getUserFocusSessions(user.id)
              ]);
              setFocusStats(stats);
              setFinishedSessions(
                sessions
                  .filter(s => s.status === 'completed' || s.status === 'stopped')
                  .sort((a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt).getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt).getTime())
              );
            } catch (error) {
              console.error('Error completing restored session:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error restoring active session:', error);
      }
    };

    restoreActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Start a new focus session
  const startSession = async (mode: any) => {
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must be logged in first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a new session in Firestore
      const newSession: Omit<FocusSession, 'id'> = {
        userId: user.id,
        modeId: mode.id,
        modeName: mode.name,
        duration: mode.duration,
        totalSeconds: 0,
        xpReward: mode.xpReward,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      
      const id = await createFocusSession(user.id, newSession);
      setSessionId(id);
      
      // Update local state
      setActiveMode(mode.id);
      setTimeRemaining(mode.duration);
      setElapsedTime(0);
      setIsRunning(true);
      
      toast.success(language === 'ar' ? 'بدأت الجلسة!' : 'Session started!');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء بدء الجلسة' : 'Error starting session');
    } finally {
      setIsLoading(false);
    }
  };

  // Pause the current session
  const pauseSession = async () => {
    if (!sessionId) return;
    
    try {
      await updateFocusSession(sessionId, {
        status: 'paused',
        totalSeconds: elapsedTime,
        pausedAt: new Date().toISOString()
      });
      
      setIsRunning(false);
      toast.success(language === 'ar' ? 'تم إيقاف الجلسة مؤقتًا' : 'Session paused');
    } catch (error) {
      console.error('Error pausing session:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إيقاف الجلسة' : 'Error pausing session');
    }
  };

  // Resume the current session
  const resumeSession = async () => {
    if (!sessionId) return;
    
    try {
      await updateFocusSession(sessionId, {
        status: 'active',
        updatedAt: new Date().toISOString() // Explicitly set updatedAt to track resume time
      });
      
      setIsRunning(true);
      toast.success(language === 'ar' ? 'تم استئناف الجلسة' : 'Session resumed');
    } catch (error) {
      console.error('Error resuming session:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء استئناف الجلسة' : 'Error resuming session');
    }
  };

  // Toggle between pause and resume
  const toggleSession = () => {
    if (isRunning) {
      pauseSession();
    } else {
      resumeSession();
    }
  };

  // Reset the current session
  const resetSession = async () => {
    if (!sessionId || !activeMode) return;
    
    try {
      const mode = focusModes.find(m => m.id === activeMode);
      // Mark the session as stopped in Firestore
      await completeFocusSession(sessionId, elapsedTime, 'stopped');
      
      // Set reflection prompt
      setLastFinished({ id: sessionId, modeName: mode?.name || '', seconds: elapsedTime, status: 'stopped' });
      setNotes('');
      setRating(0);
      setVoiceBlob(null);
      setVoiceDuration(0);
      
      // Reset local state
      setActiveMode(null);
      setTimeRemaining(0);
      setElapsedTime(0);
      setIsRunning(false);
      setSessionId(null);
      
      toast.success(language === 'ar' ? 'تم إعادة تعيين الجلسة' : 'Session reset');
      
      // Refresh focus stats and finished list
      if (user) {
        const [stats, sessions] = await Promise.all([
          getUserFocusStats(user.id),
          getUserFocusSessions(user.id)
        ]);
        setFocusStats(stats);
        setFinishedSessions(
          sessions
            .filter(s => s.status === 'completed' || s.status === 'stopped')
            .sort((a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt).getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt).getTime())
        );
      }
    } catch (error) {
      console.error('Error resetting session:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إعادة تعيين الجلسة' : 'Error resetting session');
    }
  };

  // Stop the current session and record progress
  const stopSession = async () => {
    if (!sessionId || !activeMode) return;
    
    try {
      const mode = focusModes.find(m => m.id === activeMode);
      if (!mode) return;
      
      // Mark the session as stopped in Firestore
      await completeFocusSession(sessionId, elapsedTime, 'stopped');
      
      // Add focus time to user's profile
      const hoursSpent = elapsedTime / 3600;
      addFocusTime(hoursSpent);
      
      // Calculate partial XP based on completion percentage
      const completionPercentage = elapsedTime / mode.duration;
      const earnedXP = Math.floor(mode.xpReward * completionPercentage);
      
      if (earnedXP > 0) {
        toast.success(`+${earnedXP} XP - ${language === 'ar' ? 'جلسة تركيز جزئية' : 'Partial focus session'}`);
      }
      
      // Show reflection section
      setLastFinished({ id: sessionId, modeName: mode.name, seconds: elapsedTime, status: 'stopped' });
      setNotes('');
      setRating(0);
      setVoiceBlob(null);
      setVoiceDuration(0);
      
      // Reset active timer state
      setActiveMode(null);
      setTimeRemaining(0);
      setElapsedTime(0);
      setIsRunning(false);
      setSessionId(null);
      
      toast.success(language === 'ar' ? 'تم إنهاء الجلسة وتسجيل التقدم' : 'Session stopped and progress recorded');
      
      // Refresh focus stats and finished list
      if (user) {
        const [stats, sessions] = await Promise.all([
          getUserFocusStats(user.id),
          getUserFocusSessions(user.id)
        ]);
        setFocusStats(stats);
        setFinishedSessions(
          sessions
            .filter(s => s.status === 'completed' || s.status === 'stopped')
            .sort((a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt).getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt).getTime())
        );
      }
    } catch (error) {
      console.error('Error stopping session:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إنهاء الجلسة' : 'Error stopping session');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let syncInterval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0 && sessionId) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Session completed
            completeSession();
            return 0;
          }
          return prev - 1;
        });
        
        setElapsedTime(prev => prev + 1);
      }, 1000);

      // Sync elapsed time to Firebase every 10 seconds
      syncInterval = setInterval(async () => {
        if (sessionId) {
          try {
            // Get current elapsed time from state (will be captured in closure)
            setElapsedTime(currentElapsed => {
              // Update Firebase periodically (every 10 seconds)
              updateFocusSession(sessionId, {
                totalSeconds: currentElapsed
              }).catch(err => console.error('Error syncing session:', err));
              return currentElapsed; // Return unchanged
            });
          } catch (error) {
            console.error('Error syncing session time:', error);
          }
        }
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [isRunning, timeRemaining, sessionId]);

  // Function to handle session completion
  const completeSession = async () => {
    if (!sessionId || !activeMode) return;

    try {
      const mode = focusModes.find(m => m.id === activeMode);
      if (!mode) return;

      // Mark the session as completed in Firestore
      await completeFocusSession(sessionId, mode.duration, 'completed');

      // Add focus time to user's profile
      const hoursSpent = mode.duration / 3600;
      addFocusTime(hoursSpent);

      // Show reflection section
      setLastFinished({ id: sessionId, modeName: mode.name, seconds: mode.duration, status: 'completed' });
      setNotes('');
      setRating(0);
      setVoiceBlob(null);
      setVoiceDuration(0);

      // Reset local state
      setIsRunning(false);
      setActiveMode(null);
      setSessionId(null);

      toast.success(language === 'ar' ? 'تم إنهاء الجلسة بنجاح!' : 'Session completed successfully!');

      // Refresh focus stats and finished list
      if (user) {
        const [stats, sessions] = await Promise.all([
          getUserFocusStats(user.id),
          getUserFocusSessions(user.id)
        ]);
        setFocusStats(stats);
        setFinishedSessions(
          sessions
            .filter(s => s.status === 'completed' || s.status === 'stopped')
            .sort((a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt).getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt).getTime())
        );
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إنهاء الجلسة' : 'Error completing session');
    }
  };

  // Function to start editing a session
  const startEditingSession = (session: FocusSession) => {
    setEditingSession(session);
    setEditNotes(session.notes || '');
    setEditRating(session.rating || 0);
  };

  // Function to save edited session
  const saveEditedSession = async () => {
    if (!editingSession || !user) return;

    try {
      setIsSavingEdit(true);

      await updateFocusSession(editingSession.id, {
        notes: editNotes.trim() || undefined,
        rating: editRating > 0 ? editRating : undefined,
        updatedAt: new Date().toISOString(),
      });

      // Refresh finished sessions list
      const sessions = await getUserFocusSessions(user.id);
      setFinishedSessions(
        sessions
          .filter(s => s.status === 'completed' || s.status === 'stopped')
          .sort((a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt).getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt).getTime())
      );

      // Reset edit state
      setEditingSession(null);
      setEditNotes('');
      setEditRating(0);

      toast.success(language === 'ar' ? 'تم حفظ التعديلات' : 'Changes saved');
    } catch (error) {
      console.error('Error saving edited session:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حفظ التعديلات' : 'Error saving changes');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingSession(null);
    setEditNotes('');
    setEditRating(0);
  };

  // Function to show delete confirmation modal
  const showDeleteConfirmation = (session: FocusSession) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!sessionToDelete || !user) return;

    try {
      setIsDeleting(true);
      await deleteFocusSession(sessionToDelete.id, user.id);

      // Refresh focus stats and finished sessions list
      const [stats, sessions] = await Promise.all([
        getUserFocusStats(user.id),
        getUserFocusSessions(user.id)
      ]);
      setFocusStats(stats);
      setFinishedSessions(
        sessions
          .filter(s => s.status === 'completed' || s.status === 'stopped')
          .sort((a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt).getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt).getTime())
      );

      toast.success(language === 'ar' ? 'تم حذف الجلسة' : 'Session deleted');

      // Close modal and reset state
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حذف الجلسة' : 'Error deleting session');
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to cancel delete
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('focus.modes')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {language === 'ar' ? 'اختر وضع التركيز المناسب وابدأ رحلة الإنتاجية' : 'Choose your focus mode and start your productivity journey'}
        </p>
      </motion.div>

      {/* Active Session */}
      {activeMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center"
        >
          <div className="mb-6">
            <div className="text-6xl font-bold text-green-600 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {focusModes.find(m => m.id === activeMode)?.name}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {language === 'ar' ? 'الوقت المنقضي:' : 'Elapsed time:'} {formatTime(elapsedTime)}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleSession}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isRunning ? (language === 'ar' ? 'إيقاف' : 'Pause') : (language === 'ar' ? 'استئناف' : 'Resume')}</span>
            </button>

            <button
              onClick={resetSession}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RotateCcw className="w-5 h-5" />
              <span>{language === 'ar' ? 'إعادة تعيين' : 'Reset'}</span>
            </button>
            
            <button
              onClick={stopSession}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Square className="w-5 h-5" />
              <span>{language === 'ar' ? 'إنهاء' : 'Stop'}</span>
            </button>
          </div>
          
          {elapsedTime > 0 && elapsedTime < 60 && (
            <div className="mt-4 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {language === 'ar' 
                  ? 'يجب أن تكون مدة الجلسة دقيقة واحدة على الأقل لتسجيل التقدم' 
                  : 'Session must be at least 1 minute to record progress'}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Focus Modes */}
      {!activeMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {focusModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colorClasses[mode.color]} flex items-center justify-center text-white mb-4 mx-auto`}>
                {mode.icon}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                {mode.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                {mode.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.floor(mode.duration / 60)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {language === 'ar' ? 'دقيقة' : 'minutes'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    +{mode.xpReward}
                  </div>
                  <div className="text-sm text-gray-500">XP</div>
                </div>
              </div>

              <button
                onClick={() => startSession(mode)}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors bg-gradient-to-r ${colorClasses[mode.color]} hover:opacity-90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : t('start.session')}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'إحصائيات التركيز' : 'Focus Statistics'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{focusStats.sessionsThisWeek}</div>
            <div className="text-sm text-gray-500">
              {language === 'ar' ? 'جلسات هذا الأسبوع' : 'Sessions this week'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{focusStats.totalHours}</div>
            <div className="text-sm text-gray-500">
              {language === 'ar' ? 'ساعات التركيز' : 'Focus hours'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{focusStats.consecutiveDays}</div>
            <div className="text-sm text-gray-500">
              {language === 'ar' ? 'أيام متتالية' : 'Consecutive days'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Post-session reflection */}
      {lastFinished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'تسجيل الجلسة' : 'Record Your Session'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ar' ? `انتهت جلسة: ${lastFinished.modeName} — المدة: ${formatTime(lastFinished.seconds)}. أضف ملاحظاتك أو تقييمك.` : `Finished: ${lastFinished.modeName} — Duration: ${formatTime(lastFinished.seconds)}. Add your notes or rating.`}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`${rating >= star ? 'text-yellow-500' : 'text-gray-400'} text-2xl`}
                aria-label={`rate-${star}`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">{language === 'ar' ? 'تقييم' : 'Rating'}</span>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={language === 'ar' ? 'اكتب ملاحظاتك هنا...' : 'Write your notes here...'}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
            rows={3}
          />

          {/* Voice note */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setRecorderOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {language === 'ar' ? 'تسجيل ملاحظة صوتية' : 'Record Voice Note'}
            </button>
            {voiceBlob && (
              <span className="text-sm text-green-600">{language === 'ar' ? 'تم إرفاق ملاحظة صوتية' : 'Voice note attached'}</span>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => setLastFinished(null)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100"
            >
              {language === 'ar' ? 'لاحقًا' : 'Later'}
            </button>
            <button
              disabled={isSavingReflection}
              onClick={async () => {
                if (!lastFinished?.id) return;
                try {
                  setIsSavingReflection(true);
                  let voiceUrl: string | undefined;
                  if (voiceBlob && user) {
                    // Convert Blob to File for upload helper
                    const file = new File([voiceBlob], `voice-${lastFinished.id}.wav`, { type: voiceBlob.type || 'audio/wav' });
                    const path = `focusSessions/${user.id}/${lastFinished.id}.wav`;
                    const result = await uploadFile(file, path);
                    voiceUrl = await getFileDownloadURL(result.ref.fullPath);
                  }

                  await updateFocusSession(lastFinished.id, {
                    notes: notes?.trim() ? notes.trim() : undefined,
                    rating: rating > 0 ? rating : undefined,
                    voiceNoteUrl: voiceUrl, // will be removed if undefined by backend util
                    reflectionAt: new Date().toISOString(),
                  });

                  // Refresh stats and finished list
                  if (user) {
                    const [stats, sessions] = await Promise.all([
                      getUserFocusStats(user.id),
                      getUserFocusSessions(user.id)
                    ]);
                    setFocusStats(stats);
                    setFinishedSessions(
                      sessions
                        .filter(s => s.status === 'completed' || s.status === 'stopped')
                        .sort((a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt).getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt).getTime())
                    );
                  }

                  setLastFinished(null);
                  setNotes('');
                  setRating(0);
                  setVoiceBlob(null);
                  setVoiceDuration(0);

                  toast.success(language === 'ar' ? 'تم حفظ تسجيل الجلسة' : 'Session record saved');
                } catch (e) {
                  console.error(e);
                  toast.error(language === 'ar' ? 'تعذر حفظ تسجيل الجلسة' : 'Failed to save session record');
                } finally {
                  setIsSavingReflection(false);
                }
              }}
              className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ${isSavingReflection ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSavingReflection ? (language === 'ar' ? 'جارِ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
            </button>
          </div>

          {/* Recorder modal */}
          <VoiceRecorder
            isOpen={recorderOpen}
            onClose={() => setRecorderOpen(false)}
            onSendVoice={(blob, duration) => {
              setVoiceBlob(blob);
              setVoiceDuration(duration);
              setRecorderOpen(false);
            }}
            language={language}
          />
        </motion.div>
      )}

      {/* Finished Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'الجلسات المنتهية' : 'Finished Sessions'}
        </h3>

        {isLoadingFinished ? (
          <div className="text-gray-500 text-sm">{language === 'ar' ? 'جارِ التحميل...' : 'Loading...'}</div>
        ) : finishedSessions.length === 0 ? (
          <div className="text-gray-500 text-sm">{language === 'ar' ? 'لا توجد جلسات منتهية بعد' : 'No finished sessions yet'}</div>
        ) : (
          <div className="space-y-3">
            {finishedSessions.slice(0, 10).map((s) => (
              <div key={s.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                {editingSession?.id === s.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 dark:text-white">{s.modeName}</div>
                      <div className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                        {s.status === 'completed' ? (language === 'ar' ? 'مكتملة' : 'Completed') : (language === 'ar' ? 'متوقفة' : 'Stopped')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(s.totalSeconds || s.duration)} • {new Date(s.completedAt || s.updatedAt || s.createdAt).toLocaleString()}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          onClick={() => setEditRating(star)}
                          className={`${editRating >= star ? 'text-yellow-500' : 'text-gray-400'} text-xl hover:text-yellow-500 transition-colors`}
                          aria-label={`rate-${star}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-500">{language === 'ar' ? 'تقييم' : 'Rating'}</span>
                    </div>

                    {/* Notes */}
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب ملاحظاتك هنا...' : 'Write your notes here...'}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      rows={2}
                    />

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        onClick={saveEditedSession}
                        disabled={isSavingEdit}
                        className={`px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer ${isSavingEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSavingEdit ? (language === 'ar' ? 'جارِ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{s.modeName}</div>
                      <div className="text-sm text-gray-500">
                        {formatTime(s.totalSeconds || s.duration)} • {new Date(s.completedAt || s.updatedAt || s.createdAt).toLocaleString()}
                      </div>
                      {(s.notes || s.rating || s.voiceNoteUrl) && (
                        <div className="text-sm text-gray-500 mt-1">
                          {s.rating ? `${language === 'ar' ? 'تقييم' : 'Rating'}: ${s.rating}/5` : ''}
                          {s.notes ? ` • ${language === 'ar' ? 'ملاحظات' : 'Notes'}: ${s.notes}` : ''}
                          {s.voiceNoteUrl ? ` • ${language === 'ar' ? 'صوت' : 'Voice'} 🔊` : ''}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                        {s.status === 'completed' ? (language === 'ar' ? 'مكتملة' : 'Completed') : (language === 'ar' ? 'متوقفة' : 'Stopped')}
                      </div>
                      <button
                        onClick={() => startEditingSession(s)}
                        className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors cursor-pointer"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => showDeleteConfirmation(s)}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={
          sessionToDelete
            ? language === 'ar'
              ? `هل أنت متأكد من حذف جلسة "${sessionToDelete.modeName}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete the "${sessionToDelete.modeName}" session? This action cannot be undone.`
            : ''
        }
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
};

export default FocusModesPage;