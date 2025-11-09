import { ArrowLeft, Footprints, PlusCircle } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { addStepsEntry, createDailyStepsLog, getDailyStepsLog, getWeeklyStepsLogs, StepsLogWithId } from '../../firebase/steps';

// Small helper for animated number
function useAnimatedNumber(value: number, ms = 700) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const start = performance.now();
    const from = display;
    const to = value;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const v = Math.round(from + (to - from) * p);
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return display;
}

// Lightweight confetti using canvas
function fireConfetti(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = (canvas.width = window.innerWidth);
  const H = (canvas.height = window.innerHeight);
  const pieces: { x: number; y: number; vx: number; vy: number; r: number; color: string; rot: number }[] = [];
  for (let i = 0; i < 80; i++) {
    pieces.push({
      x: W / 2 + (Math.random() - 0.5) * 200,
      y: H / 2 + (Math.random() - 0.5) * 50,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 6 - 2,
      r: Math.random() * 6 + 4,
      color: `hsl(${Math.random() * 360},80%,60%)`,
      rot: Math.random() * Math.PI
    });
  }
  let raf = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      ctx.restore();
    });
    raf = requestAnimationFrame(draw);
  };
  draw();
  setTimeout(() => cancelAnimationFrame(raf), 1600);
}

const StepsTracker: React.FC = () => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // state
  const [steps, setSteps] = useState<number>(0);
  const animatedSteps = useAnimatedNumber(steps, 700);
  const goal = 10000;
  // Colors for Steps page — reuse tokens from HealthTracker Steps card
  const stepsColors = useMemo(() => ({
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
    accent: 'text-pink-500',
    glow: 'bg-pink-500/30'
  }), []);
  const [history, setHistory] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [showModal, setShowModal] = useState(false);
  const [inputSteps, setInputSteps] = useState<string>('500');
  const [showCheck, setShowCheck] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  const [log, setLog] = useState<StepsLogWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const percent = Math.min(100, Math.round((steps / goal) * 100));
  const ringRadius = 110;
  const circumference = 2 * Math.PI * ringRadius;
  const filled = (percent / 100) * circumference;

  useEffect(() => {
    // subtle pulse using theme accent color
    const el = document.getElementById('progress-ring');
    if (!el) return;
    const keyframes = [
      { transform: 'scale(1)', boxShadow: `0 0 0px rgba(219,39,119,0.10)` },
      { transform: 'scale(1.02)', boxShadow: `0 0 30px rgba(219,39,119,0.12)` },
      { transform: 'scale(1)', boxShadow: `0 0 0px rgba(219,39,119,0.10)` }
    ];
    const anim = el.animate(keyframes, { duration: 2400, iterations: Infinity });
    return () => anim.cancel();
  }, []);

  // animate bars on mount
  const [barsReady, setBarsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBarsReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Load today's log and weekly data
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setError(null);
        if (authLoading || !user) {
          setLoading(false);
          return;
        }
        const uid = user.id;
        const today = new Date().toISOString().split('T')[0];
        let daily = await getDailyStepsLog(uid, today);
        if (!daily) {
          const newLog = { date: today, entries: [], total: 0 };
          const id = await createDailyStepsLog(uid, newLog);
          daily = { id, ...newLog } as StepsLogWithId;
        }
        if (!isMounted) return;
        setLog(daily);
        setSteps(daily.total || 0);

        // Weekly logs (last 7 days including today)
        const d = new Date();
        const end = today;
        const startDate = new Date(d.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weekly = await getWeeklyStepsLogs(uid, startDate, end);
        const byDate = new Map(weekly.map(w => [w.date, w]));
        const newHistory = Array.from({ length: 7 }, (_, i) => {
          const dt = new Date(d.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          const key = dt.toISOString().split('T')[0];
          const dayLog = byDate.get(key);
          return dayLog ? (dayLog.total ?? 0) : 0;
        });
        setHistory(newHistory);
      } catch (e) {
        console.error('Failed to load steps logs:', e);
        setError('Failed to load steps');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user, authLoading]);

  const updateWeekTodayLocal = (newTotal: number) => {
    // Update first week's latest day (index 6) since history is oldest..newest
    setHistory(prev => {
      const next = [...prev];
      next[6] = newTotal;
      return next;
    });
  };

  const addSteps = async (n: number) => {
    if (!log) return;
    const newSteps = steps + n;
    // Optimistic update
    setSteps(newSteps);
    updateWeekTodayLocal(newSteps);
    setShowModal(false);
    setShowCheck(true);
    // Persist to Firestore
    try {
      const entry = { id: Date.now().toString(), amount: n, timestamp: new Date().toISOString() };
      await addStepsEntry(log.id, entry);
    } catch (e) {
      console.error('Failed to add steps entry:', e);
      setError('Failed to add steps');
    }
    // Small delay so modal closes before confetti plays
    setTimeout(()=> fireConfetti(confettiRef.current), 120);
    setTimeout(() => setShowCheck(false), 1400);
  };

  // helper for bar tooltip
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number } | null>(null);

  return (
    <div className={`${isDark ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-pink-50 to-rose-50 text-black'} min-h-screen p-6 overflow-hidden relative`}> 
      {/* decorative floating particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-16 top-10 w-48 h-48 rounded-full bg-pink-200 opacity-20 blur-3xl animate-blob" />
        <div className="absolute right-8 bottom-10 w-36 h-36 rounded-full bg-rose-200 opacity-18 blur-2xl animate-blob animation-delay-2000" />
        <div className="absolute left-1/2 -translate-x-1/2 top-1/3 w-24 h-24 rounded-full bg-pink-100 opacity-12 blur-xl animate-blob animation-delay-1200" />
      </div>

      {/* confetti canvas (keep behind overlays but above background) */}
      <canvas ref={confettiRef} className="pointer-events-none fixed inset-0 z-10" />

      <div className="max-w-5xl mx-auto relative z-20">
        {loading && (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="py-2 mb-4 text-center text-red-500">{error}</div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/health')}
              className={`p-2 rounded-full transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white/90'}`}
            >
              <ArrowLeft className={`${isDark ? 'text-gray-200' : 'text-gray-700'} w-6 h-6`} />
            </button>
            <h1 className={`ml-4 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{language === 'ar' ? 'تتبع الخطوات' : 'Steps Tracker'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white/90'} shadow-sm`}>🌟</span>
          </div>
        </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Big ring + counter */}
          <div className={`col-span-1 ${isDark ? 'bg-gray-800/60' : 'bg-white/70'} rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center transition-transform duration-300 transform-gpu hover:scale-[1.01]` }>
            <div id="progress-ring" className="relative">
              <svg width="260" height="260" viewBox="0 0 260 260">
                <defs>
                    <linearGradient id="g1" x1="0%" x2="100%">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#fb7185" />
                    </linearGradient>
                </defs>
                <g transform="translate(130,130)">
                  <circle r={ringRadius} fill="none" stroke={isDark ? '#0b1220' : '#f1f5f9'} strokeWidth="18" />
                  <circle
                    r={ringRadius}
                    fill="none"
                    stroke="url(#g1)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeDasharray={`${filled} ${circumference - filled}`}
                    transform="rotate(-90)"
                    style={{ transition: 'stroke-dasharray 900ms ease' }}
                  />
                </g>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-extrabold transition-transform duration-400" style={{ textShadow: '0 12px 40px rgba(219,39,119,0.16)', transformOrigin: 'center' }}>{animatedSteps.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 mt-1">{language === 'ar' ? 'من الهدف' : 'of goal'} • {percent}%</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button onClick={()=>{setShowModal(true)}} aria-label="Add Steps" className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg transform transition-transform duration-200 hover:scale-105 hover:shadow-2xl flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline-block">{language === 'ar' ? 'إضافة خطوات' : 'Add Steps'}</span>
              </button>
              <button onClick={()=>{ const diff = Math.max(0, goal - steps); if (diff > 0) addSteps(diff); }} className={`px-4 py-2 rounded-full ${isDark ? 'bg-gray-700 text-white' : 'bg-white/80 text-gray-900'} border`}>{language === 'ar' ? 'اكمال الهدف' : 'Complete Goal'}</button>
            </div>
          </div>

          {/* Middle: Stats */}
          <div className={`col-span-1 ${isDark ? 'bg-gray-800/60' : stepsColors.bg + ' border border-white/20'} rounded-3xl p-6 shadow-lg transition-transform duration-300 hover:scale-[1.01]`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Footprints className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-sm text-gray-400">{language === 'ar' ? 'المسافة اليوم' : 'Distance Today'}</div>
                  <div className="text-2xl font-bold">6.4 km</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">{language === 'ar' ? 'السعرات' : 'Calories'}</div>
                <div className="text-2xl font-bold">320 kcal</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm text-gray-400 mb-2">Weekly Goal Progress</h4>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div style={{ width: `${Math.min(100, Math.round((history.reduce((a,b)=>a+b,0)/ (history.length*goal))*100))}%` }} className={`h-2 bg-gradient-to-r from-pink-500 to-rose-500 transition-all`} />
              </div>
            </div>
          </div>

          {/* Right: Weekly chart */}
            <div className={`col-span-1 ${isDark ? 'bg-gray-800/60' : stepsColors.bg + ' border border-white/20'} rounded-3xl p-6 shadow-lg transition-transform duration-300 hover:scale-[1.01]`}>
            <h3 className="font-semibold mb-4">{language === 'ar' ? 'نظرة عامة أسبوعية' : 'Weekly Overview'}</h3>
            <div className="flex items-end gap-3 h-44 relative">
              {history.map((val, i) => {
                const max = Math.max(...history, goal);
                const pct = Math.max(6, (val / max) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      onMouseEnter={(e)=>setTooltip({ x: (e.target as HTMLElement).getBoundingClientRect().left, y: (e.target as HTMLElement).getBoundingClientRect().top - 40, value: val })}
                      onMouseLeave={()=>setTooltip(null)}
                      className={`w-full bg-gradient-to-t from-pink-400 to-rose-500 rounded-t-md transform-gpu transition-all duration-700 hover:scale-105`}
                      style={{ height: barsReady ? `${pct}%` : '6%', transitionTimingFunction: 'cubic-bezier(.2,.9,.2,1)' }}
                    />
                    <div className="text-xs mt-2 text-gray-400">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</div>
                  </div>
                );
              })}

              {tooltip && (
                <div style={{ left: tooltip.x, top: tooltip.y }} className={`absolute px-2 py-1 rounded shadow-md text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`} role="tooltip">
                  {tooltip.value.toLocaleString()} steps
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {history.slice(0,6).map((h, idx) => (
            <div key={idx} className={`${isDark ? 'bg-gray-800/60' : 'bg-white/80'} p-4 rounded-2xl shadow transition-transform duration-300 transform-gpu hover:scale-[1.02] hover:rotate-1 hover:-translate-y-1`} style={{ perspective: 800 }}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][idx]}</div>
                <div className="text-lg font-bold">{h.toLocaleString()}</div>
              </div>
              <div className="mt-2 text-xs text-gray-400">{Math.round((h/goal)*100)}% of goal</div>
            </div>
          ))}
        </div>

        {/* Motivational quote */}
        <div className="mt-8 text-center opacity-0 animate-fadeIn">
          <blockquote className="italic text-gray-500">{language === 'ar' ? 'كل خطوة تقربك من هدفك.' : 'Every step brings you closer to your goal.'}</blockquote>
        </div>
      </div>

      {/* Floating Add button removed (kept Add Steps inside main card) */}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={()=>setShowModal(false)}>
          <div className={`bg-white/95 ${isDark ? 'dark:bg-gray-800/95 text-white' : 'text-black'} rounded-t-xl md:rounded-xl w-full md:w-96 p-6 transform transition-transform duration-400 translate-y-0`} onClick={(e)=>e.stopPropagation()} style={{ animation: 'modalIn 360ms cubic-bezier(.2,.9,.2,1)' }}>
            <h3 className="text-lg font-semibold mb-2">{language === 'ar' ? 'أضف خطوات' : 'Add Steps'}</h3>
            <p className="text-sm text-gray-500 mb-4">{language === 'ar' ? 'أدخل عدد الخطوات التي ترغب في إضافتها' : 'Enter how many steps to add'}</p>
            <input
              autoFocus
              value={inputSteps}
              onChange={(e)=>setInputSteps(e.target.value.replace(/[^0-9]/g,''))}
              className={`w-full p-3 rounded-xl mb-4 bg-transparent border ${isDark ? 'border-gray-700 focus:border-pink-400' : 'border-gray-200 focus:border-rose-400'} outline-none transition-all`}
              placeholder={language === 'ar' ? 'عدد الخطوات' : 'Number of steps'}
            />
            <div className="flex gap-3">
              <button onClick={()=>{ const n = parseInt(inputSteps||'0',10); if(n>0) addSteps(n); }} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow">{language === 'ar' ? 'تأكيد' : 'Confirm'}</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2 rounded-xl border">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Check animation */}
      {showCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-full p-4 shadow-lg animate-check" style={{ width: 120, height: 120 }}>
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-green-500 mx-auto"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 900ms ease forwards; }
        @keyframes checkPop { 0%{ transform: scale(.6); opacity:0 } 60%{ transform: scale(1.08); opacity:1 } 100%{ transform: scale(1); opacity:1 } }
        .animate-check { animation: checkPop 600ms ease; }
      `}</style>
    </div>
  );
};

export default StepsTracker;
