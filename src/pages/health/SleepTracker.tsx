import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { addSleepSession, createDailySleepLog, deleteSleepSession, getDailySleepLog } from '../../firebase/sleep';

interface SleepDay {
  id?: string;
  day: string;
  durationH: number;
  quality: number; // 1-5
  deepH: number;
  timestamp?: string;
}

const mockWeek: SleepDay[] = [];

const SleepTracker: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const { user, loading: authLoading } = useAuth();

  const [bedtime, setBedtime] = useState('23:00');
  const [waketime, setWaketime] = useState('07:00');
  const [quality, setQuality] = useState(4);
  const [history, setHistory] = useState<SleepDay[]>(mockWeek);
  const [logId, setLogId] = useState<string | null>(null);

  // Reuse Sleep color tokens from HealthTracker (indigo / blue)
  const sleepColors = useMemo(() => ({
    bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    accent: 'text-indigo-500',
    glow: 'bg-indigo-500/30'
  }), []);

  const bedRef = useRef<HTMLDivElement | null>(null);
  const [showBedTooltip, setShowBedTooltip] = useState(false);
  

  const target = 8; // target hours

  const durationH = useMemo(() => {
    // parse HH:MM
    const [bh, bm] = bedtime.split(':').map(Number);
    const [wh, wm] = waketime.split(':').map(Number);
    const now = new Date();
    const b = new Date(now.getFullYear(), now.getMonth(), now.getDate(), bh, bm);
    let w = new Date(now.getFullYear(), now.getMonth(), now.getDate(), wh, wm);
    if (w <= b) w = new Date(w.getTime() + 24 * 60 * 60 * 1000);
    const diff = (w.getTime() - b.getTime()) / (1000 * 60 * 60);
    return Math.round(diff * 10) / 10;
  }, [bedtime, waketime]);

  const bedFillPercent = Math.min(100, Math.round((durationH / target) * 100));
  const effectiveFill = bedFillPercent;

  const avgSleep = useMemo(() => {
    if (history.length === 0) return 0;
    const avg = history.reduce((a, d) => a + d.durationH, 0) / history.length;
    return Math.round(avg * 10) / 10;
  }, [history]);

  const avgQuality = useMemo(() => {
    if (history.length === 0) return 0;
    const avg = history.reduce((a, d) => a + d.quality, 0) / history.length;
    return Math.round(avg * 10) / 10;
  }, [history]);

  const deepSleep = useMemo(() => {
    if (history.length === 0) return 0;
    const avg = history.reduce((a, d) => a + d.deepH, 0) / history.length;
    return Math.round(avg * 10) / 10;
  }, [history]);

  const efficiency = Math.round((avgSleep / 8) * 100);

  const improvement = history.length > 0 && history[0].durationH > 0
    ? Math.round(((avgSleep - history[0].durationH) / history[0].durationH) * 100)
    : 0;

  const saveSession = async () => {
    const newSession: SleepDay = {
      id: Date.now().toString(),
      day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
      durationH,
      quality,
      deepH: Math.max(0, Math.round((durationH * (quality / 5)) * 10) / 10),
      timestamp: new Date().toISOString()
    };
    try {
      const sessionDb = { ...newSession } as any;
      const today = new Date().toISOString().split('T')[0];
      if (!authLoading && user) {
        if (!logId) {
          const id = await createDailySleepLog(user.id, { date: today, sessions: [] });
          setLogId(id);
          await addSleepSession(id, sessionDb);
        } else {
          await addSleepSession(logId, sessionDb);
        }
      }
      setHistory(h => [newSession, ...h.slice(0, 6)]);
    } catch (e) {
      console.error('Failed to save sleep session:', e);
    }
  };

  useEffect(() => {
    // small effect to animate bed fill when duration changes
  }, [bedFillPercent]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        if (authLoading || !user) return;
        const today = new Date().toISOString().split('T')[0];
        let log = await getDailySleepLog(user.id, today);
        if (!log) {
          const id = await createDailySleepLog(user.id, { date: today, sessions: [] });
          log = { id, date: today, sessions: [] } as any;
        }
        if (!isMounted) return;
        setLogId(log.id);
        const sessions = (log.sessions || []).map(s => ({ id: s.id, day: s.day, durationH: s.durationH, quality: s.quality, deepH: s.deepH, timestamp: s.timestamp })) as SleepDay[];
        setHistory(sessions);
      } catch (e) {
        console.error('Failed to load sleep logs:', e);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user, authLoading]);

  useEffect(() => {
    // breathing glow on bed when fill updates
    if (!bedRef.current) return;
    const el = bedRef.current;
    const anim = el.animate([
      { boxShadow: '0 0 0px rgba(99,102,241,0.00)' },
      { boxShadow: '0 0 30px rgba(99,102,241,0.10)' },
      { boxShadow: '0 0 0px rgba(99,102,241,0.00)' }
    ], { duration: 2600, iterations: Infinity });
    return () => anim.cancel();
  }, [effectiveFill]);

  return (
    <div className={`${isDark ? 'bg-gray-900 text-white' : sleepColors.bg + ' text-black'} min-h-screen p-6 relative overflow-hidden`}> 
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-16 top-8 w-72 h-36 rounded-full bg-indigo-200/10 blur-3xl animate-cloud" />
        <div className="absolute right-0 top-20 w-56 h-28 rounded-full bg-blue-200/10 blur-2xl animate-cloud animation-delay-1500" />
        <div className="absolute left-20 top-12 text-2xl opacity-60 animate-twinkle">✨</div>
      </div>

      <div className="max-w-[1400px] mx-auto relative z-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/health')}
              className={`p-2 rounded-full transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white/80'}`}
            >
              <ArrowLeft className={`${isDark ? 'text-gray-200' : 'text-gray-700'} w-6 h-6`} />
            </button>
            <h1 className={`ml-4 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{language === 'ar' ? 'تتبع النوم' : 'Sleep Tracker'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`${isDark ? 'text-gray-300' : 'text-white'} bg-gradient-to-r from-purple-400 to-violet-500 px-3 py-1 rounded-full`}>🌙</span>
          </div>
        </div>

        {/* Bed visualization - realistic SVG bed with animated fill */}
        <div className="mb-6 flex justify-center">
          <div ref={bedRef} onMouseEnter={() => setShowBedTooltip(true)} onMouseLeave={() => setShowBedTooltip(false)} className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white/60 border border-white/30'} rounded-3xl p-6 w-full max-w-3xl shadow-lg relative transition-transform duration-300 hover:scale-[1.01]'}`}>
            <div className="flex items-center justify-between mb-4">
            </div>

            <div className="relative h-44 rounded-xl overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 600 220" className="w-full h-44">
                <defs>
                  <linearGradient id="bedFill" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.95" />
                  </linearGradient>
                  <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <clipPath id="mattressClip">
                    <rect x="70" y="70" width="460" height="80" rx="22" />
                  </clipPath>
                </defs>

                {/* headboard */}
                <rect x="40" y="40" width="520" height="40" rx="12" fill={isDark ? '#0f172a' : '#f3f0ff'} stroke={isDark ? '#374151' : '#eae6ff'} strokeWidth="2" />

                {/* mattress background */}
                <rect x="70" y="70" width="460" height="80" rx="22" fill={isDark ? '#0b1220' : '#fff'} stroke={isDark ? '#374151' : '#eee'} strokeWidth="1" />

                {/* animated fill (width based on effectiveFill) */}
                <g clipPath="url(#mattressClip)">
                  <rect x="70" y="70" width={`${(effectiveFill/100)*460}`} height="80" rx="22" fill="url(#bedFill)" style={{ transition: 'width 900ms ease' }} filter="url(#softGlow)" />
                </g>

                {/* pillow shapes */}
                <rect x="90" y="60" width="120" height="30" rx="8" fill={isDark ? '#0b1220' : '#f8fafc'} stroke={isDark ? '#374151' : '#e6e6ff'} />
                <rect x="230" y="60" width="120" height="30" rx="8" fill={isDark ? '#0b1220' : '#f8fafc'} stroke={isDark ? '#374151' : '#e6e6ff'} />

                {/* small legs */}
                <rect x="90" y="150" width="20" height="10" rx="4" fill={isDark ? '#111827' : '#f3f0ff'} />
                <rect x="510" y="150" width="20" height="10" rx="4" fill={isDark ? '#111827' : '#f3f0ff'} />
              </svg>

              {/* center overlay text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{effectiveFill}%</div>
                  <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{durationH} / {target}h</div>
                </div>
              </div>

              {showBedTooltip && (
                <div className={`absolute top-4 right-6 z-30 px-3 py-2 rounded-md text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-md pointer-events-none`}>
                  {durationH}h • {Math.round((quality/5)*100)}% quality
                </div>
              )}

              {/* stars/moon accents */}
              <div className="absolute -top-3 left-6 text-xl opacity-80">⭐</div>
              <div className="absolute -top-2 right-8 text-xl opacity-80">🌙</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-4 shadow-sm transition-transform duration-300 hover:scale-[1.01]`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'ar' ? 'تسجيل جلسة نوم' : 'Log Sleep Session'}</h3>
              <div className="space-y-3">
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{language === 'ar' ? 'وقت النوم' : 'Bedtime'}</label>
                <input type="time" value={bedtime} onChange={(e)=>setBedtime(e.target.value)} className={`w-full p-2 rounded-md bg-transparent ${isDark ? 'border border-gray-700' : 'border border-white/30'}`} />

                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{language === 'ar' ? 'وقت الاستيقاظ' : 'Wake Time'}</label>
                <input type="time" value={waketime} onChange={(e)=>setWaketime(e.target.value)} className={`w-full p-2 rounded-md bg-transparent ${isDark ? 'border border-gray-700' : 'border border-white/30'}`} />

                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{language === 'ar' ? 'جودة النوم' : 'Sleep Quality'}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={quality}
                  onChange={(e)=>setQuality(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{ accentColor: '#7c3aed' }}
                />

                <button onClick={saveSession} className={`w-full py-2 rounded-xl font-semibold ${isDark ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'} shadow-sm hover:shadow-md transition-shadow duration-200`}>{language === 'ar' ? 'حفظ جلسة النوم' : 'Save Sleep Session'}</button>

                
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-4 shadow-sm`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'ar' ? 'مدة النوم المحسوبة' : 'Calculated Sleep Duration'}</h3>
              <div className="text-3xl font-bold mb-1">{durationH}h</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{language === 'ar' ? 'الهدف الموصى به 7-9 ساعة' : 'Recommended target 7-9h'}</div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-6 shadow-sm transition-transform duration-300 hover:scale-[1.01]`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'ar' ? 'ملخص النوم' : "Sleep Summary"}</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgSleep}h</div>
                  <div className="text-sm text-gray-400">Avg Sleep</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgQuality}</div>
                  <div className="text-sm text-gray-400">Avg Quality</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{deepSleep}h</div>
                  <div className="text-sm text-gray-400">Deep Sleep</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{efficiency}%</div>
                  <div className="text-sm text-gray-400">Efficiency</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Goal Achievement</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{Math.min(100, Math.round((avgSleep / target) * 100))}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div style={{ width: `${Math.min(100, Math.round((avgSleep / target) * 100))}%` }} className="h-2 bg-gradient-to-r from-purple-500 to-violet-600 transition-all" />
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-400">{language === 'ar' ? 'تحسن هذا الأسبوع' : 'This Week Improvement'}: <span className={`${improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>{improvement}%</span></div>
            </div>

            <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-white/30'} rounded-2xl p-4 shadow-sm transition-transform duration-300 hover:scale-[1.01]`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'ar' ? 'نمط النوم الأسبوعي' : 'Weekly Sleep Patterns'}</h3>
              <div className="space-y-3">
                {history.map((d, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-12 text-sm ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>{d.day}</div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded-md relative overflow-hidden" title={`Duration: ${d.durationH}h`}>
                        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-400 to-violet-600" style={{ width: `${Math.min(100,(d.durationH/10)*100)}%` }} />
                      </div>
                      <div className="mt-1 flex gap-2 text-xs text-gray-400">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 inline-block rounded-full"/>Quality: {d.quality}</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 inline-block rounded-full"/>Deep: {d.deepH}h</div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          if (logId) {
                            const sessionId = d.id || `${i}-${d.day}`;
                            await deleteSleepSession(logId, sessionId);
                          }
                        } catch (e) {
                          console.error('Failed to delete sleep session:', e);
                        } finally {
                          setHistory(h => h.filter((_, idx) => idx !== i));
                        }
                      }}
                      className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-gray-700 text-red-300' : 'bg-red-50 text-red-600'} hover:opacity-90`}
                    >
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;