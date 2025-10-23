import { ArrowLeft, Play, StopCircle, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { addActivitySession, createDailyActivityLog, deleteActivitySession, getDailyActivityLog } from '../../firebase/activity';

type ActivityKey = 'running' | 'cycling' | 'swimming' | 'walking' | 'yoga' | 'strength';

const ACTIVITY_META: Record<ActivityKey, { labelEn: string; labelAr: string; emoji: string }> = {
  running: { labelEn: 'Running', labelAr: 'الجري', emoji: '🏃' },
  cycling: { labelEn: 'Cycling', labelAr: 'ركوب الدراجة', emoji: '🚴' },
  swimming: { labelEn: 'Swimming', labelAr: 'السباحة', emoji: '🏊' },
  walking: { labelEn: 'Walking', labelAr: 'المشي', emoji: '🚶' },
  yoga: { labelEn: 'Yoga', labelAr: 'اليوغا', emoji: '🧘' },
  strength: { labelEn: 'Strength', labelAr: 'تدريب القوة', emoji: '🏋️' }
};

interface Session {
  id: string;
  activity: ActivityKey;
  durationSec: number;
  calories: number;
  distanceKm?: number;
  timestamp: string;
}

const ActivityTracker: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const { user, loading: authLoading } = useAuth();

  const [selected, setSelected] = useState<ActivityKey>('running');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [calories, setCalories] = useState(0);
  const [distance, setDistance] = useState(0); // km
  const intervalRef = useRef<number | null>(null);

  const [history, setHistory] = useState<Session[]>([]);
  const [logId, setLogId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        if (authLoading || !user) return;
        const today = new Date().toISOString().split('T')[0];
        let log = await getDailyActivityLog(user.id, today);
        if (!log) {
          const id = await createDailyActivityLog(user.id, { date: today, sessions: [] });
          log = { id, date: today, sessions: [] } as any;
        }
        if (!isMounted) return;
        setLogId(log.id);
        setHistory((log.sessions || []) as Session[]);
      } catch (e) {
        console.error('Failed to load activity logs:', e);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user, authLoading]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
        setCalories(c => c + 1); // simple mock
        setDistance(d => d + 0.01);
      }, 1000) as unknown as number;
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  const start = () => {
    setRunning(true);
  };

  const stop = async () => {
    setRunning(false);
    const newSession: Session = {
      id: Date.now().toString(),
      activity: selected,
      durationSec: seconds,
      calories,
      distanceKm: Number(distance.toFixed(2)),
      timestamp: new Date().toISOString()
    };

    try {
      const today = new Date().toISOString().split('T')[0];
      if (!logId && user) {
        const id = await createDailyActivityLog(user.id, { date: today, sessions: [] });
        setLogId(id);
        await addActivitySession(id, newSession as any);
      } else if (logId) {
        await addActivitySession(logId, newSession as any);
      }
      setHistory(h => [newSession, ...h]);
    } catch (e) {
      console.error('Failed to save activity session:', e);
    } finally {
      setSeconds(0);
      setCalories(0);
      setDistance(0);
    }
  };

  const removeSession = async (id: string) => {
    try {
      if (logId) {
        await deleteActivitySession(logId, id);
      }
      setHistory(h => h.filter(s => s.id !== id));
    } catch (e) {
      console.error('Failed to delete activity session:', e);
    }
  };

  const fmt = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div className={`min-h-screen p-6`}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/health')}
              className={`p-2 rounded-full transition-colors duration-200 ${isDark ? 'bg-gray-700' : 'bg-white/80'}`}
              aria-label="Back"
            >
              <ArrowLeft className={`${isDark ? 'text-gray-200' : 'text-gray-700'} w-6 h-6`} />
            </button>
            <h1 className={`ml-4 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'ar' ? 'تتبع النشاط' : 'Activity Tracker'}
            </h1>
          </div>
          <div className="text-sm text-white/80 font-semibold animate-gradient bg-clip-text text-transparent">
            <span className="bg-gradient-to-r from-purple-300 to-violet-400 px-3 py-1 rounded-full">Fitness</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-4 shadow-sm`}>
              <h2 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'ar' ? 'اختر النشاط' : 'Select Activity'}</h2>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(ACTIVITY_META) as ActivityKey[]).map(key => {
                  const meta = ACTIVITY_META[key];
                  const active = selected === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(key)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-transform transform hover:scale-105
                        ${active ? (isDark ? 'bg-purple-600 text-white shadow-lg' : 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg') : (isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-purple-600')}`}
                    >
                      <span className="text-2xl mb-2">{meta.emoji}</span>
                      <span className={`${active ? 'text-white' : isDark ? 'text-gray-200' : 'text-gray-600'} text-xs`}>{language === 'ar' ? meta.labelAr : meta.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-6 shadow-sm flex flex-col items-center`}>
              <div className="mb-3">
                <div className="text-6xl">{ACTIVITY_META[selected].emoji}</div>
              </div>
              <h3 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{language === 'ar' ? ACTIVITY_META[selected].labelAr : ACTIVITY_META[selected].labelEn}</h3>
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-purple-700'} mb-2`}>{fmt(seconds)}</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{calories} kcal • {distance.toFixed(2)} km</div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={start}
                  className="flex-1 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-500 to-violet-600 shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {language === 'ar' ? 'ابدأ' : 'Start'}
                </button>
                <button
                  onClick={stop}
                  className="flex-1 py-3 rounded-xl text-white font-semibold bg-red-500 hover:bg-red-600 shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <StopCircle className="w-5 h-5" />
                  {language === 'ar' ? 'إيقاف' : 'Stop'}
                </button>
              </div>
            </div>
          </div>

          {/* Middle & Right Panels */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Summary */}
            <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-6 shadow-sm`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'ar' ? 'ملخص اليوم' : "Today's Summary"}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-transparent">
                  <div className="text-sm text-gray-500">Minutes</div>
                  <div className="text-2xl font-bold text-blue-500">{Math.round(history.reduce((a, s) => a + s.durationSec/60, 0))}</div>
                </div>
                <div className="p-4 rounded-lg bg-transparent">
                  <div className="text-sm text-gray-500">Calories</div>
                  <div className="text-2xl font-bold text-orange-500">{history.reduce((a,s)=>a+s.calories,0)}</div>
                </div>
                <div className="p-4 rounded-lg bg-transparent">
                  <div className="text-sm text-gray-500">Distance (km)</div>
                  <div className="text-2xl font-bold text-green-500">{history.reduce((a,s)=>a+(s.distanceKm||0),0).toFixed(1)}</div>
                </div>
                <div className="p-4 rounded-lg bg-transparent">
                  <div className="text-sm text-gray-500">Avg BPM</div>
                  <div className="text-2xl font-bold text-purple-500">{72}</div>
                </div>
              </div>
            </div>

            {/* Weekly Trends & History */}
            <div className="space-y-4">
              <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-6 shadow-sm mb-4`}>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'ar' ? 'الاتجاهات الأسبوعية' : 'Weekly Trends'}</h3>
                <div className={`h-40 rounded-lg ${isDark ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-purple-50 to-violet-50'} border-2`}>
                  {/* Placeholder for charts - gradient border */}
                </div>
              </div>

              <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-4 shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'ar' ? 'سجل التمارين' : 'Workout History'}</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {history.map(session => {
                    const meta = ACTIVITY_META[session.activity];
                    return (
                      <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg transition-transform hover:scale-[1.01] ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{meta.emoji}</div>
                          <div>
                            <div className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{language === 'ar' ? meta.labelAr : meta.labelEn}</div>
                            <div className="text-sm text-gray-400">{new Date(session.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-500">{Math.round(session.durationSec/60)}m</div>
                          <div className="text-sm text-gray-500">{session.calories} kcal</div>
                          <button onClick={() => removeSession(session.id)} className="p-2 rounded-md text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;