import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { addHeartRateEntry, createDailyHeartRateLog, getDailyHeartRateLog, getWeeklyHeartRateLogs, HeartRateLogWithId } from '../../firebase/heartRate';

const HeartRateTracker: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isDark } = useTheme();

  // state
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<number[]>([0,0,0,0,0,0,0]);
  const [bpm, setBpm] = useState<number>(0);
  const [input, setInput] = useState<string>('72');
  const [tab, setTab] = useState<'day'|'week'|'month'>('day');
  const svgRef = useRef<SVGPathElement | null>(null);
  const [log, setLog] = useState<HeartRateLogWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekDates, setWeekDates] = useState<Date[]>([]); // oldest -> newest

  // smooth counter
  const useAnimatedNumber = (value: number, ms = 700) => {
    const [display, setDisplay] = useState(value);
    useEffect(()=>{
      const start = performance.now();
      const from = display;
      const to = value;
      let raf = 0;
      const tick = (t:number)=>{
        const p = Math.min(1,(t-start)/ms);
        setDisplay(Math.round(from + (to-from)*p));
        if(p<1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return ()=> cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[value]);
    return display;
  };

  const animatedBpm = useAnimatedNumber(bpm, 700);

  const avg = useMemo(()=> Math.round(history.reduce((a,b)=>a+b,0)/history.length), [history]);

  // heartbeat pulse duration
  const pulseDuration = Math.max(300, Math.round(60000 / Math.max(30, bpm)));

  // animate svg path on tab change
  useEffect(()=>{
    if(!svgRef.current) return;
    const path = svgRef.current;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    // trigger
    void path.getBoundingClientRect();
    path.style.transition = 'stroke-dashoffset 900ms ease';
    path.style.strokeDashoffset = '0';
  },[tab]);

  // Load today's log and weekly data
  useEffect(()=>{
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
        let daily = await getDailyHeartRateLog(uid, today);
        if (!daily) {
          const newLog = { date: today, entries: [], latest: 0 } as any;
          const id = await createDailyHeartRateLog(uid, newLog);
          daily = { id, ...newLog } as HeartRateLogWithId;
        }
        if (!isMounted) return;
        setLog(daily);
        setBpm(daily.latest || 0);
        // Weekly
        const d = new Date();
        const end = today;
        const startDate = new Date(d.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weekly = await getWeeklyHeartRateLogs(uid, startDate, end);
        const byDate = new Map(weekly.map(w => [w.date, w]));
        const dates: Date[] = Array.from({ length: 7 }, (_, i) => new Date(d.getTime() - (6 - i) * 24 * 60 * 60 * 1000));
        const newHistory = dates.map((dt) => {
          const key = dt.toISOString().split('T')[0];
          const dayLog = byDate.get(key);
          return dayLog ? (dayLog.latest ?? 0) : 0;
        });
        setHistory(newHistory);
        setWeekDates(dates);
      } catch (e) {
        console.error('Failed to load heart rate logs:', e);
        setError('Failed to load heart rate');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user, authLoading]);

  const updateWeekTodayLocal = (latest: number) => {
    setHistory(prev => {
      const next = [...prev];
      next[6] = latest;
      return next;
    });
  };

  const logRate = async ()=>{
    if (!log) return;
    const n = Math.max(30, Math.min(200, Number(input||0)));
    setBpm(n);
    updateWeekTodayLocal(n);
    setInput('');
    try {
      const entry = { id: Date.now().toString(), bpm: n, timestamp: new Date().toISOString() };
      await addHeartRateEntry(log.id, entry);
    } catch (e) {
      console.error('Failed to add heart rate entry:', e);
      setError('Failed to log heart rate');
    }
  };

  const pathD = useMemo(()=>{
    const vals = history.slice(0,7).reverse();
    const w = 320, h = 140, pad = 12;
    const max = Math.max(200, ...vals);
    return vals.map((v,i)=>{
      const x = pad + (i/(vals.length-1||1))*(w-2*pad);
      const y = pad + (1 - (v/max))*(h-2*pad);
      return `${i===0?'M':'L'} ${x} ${y}`;
    }).join(' ');
  },[history]);

  return (
    <div className={`${isDark ? 'bg-gradient-to-br from-[#3b021f] to-[#2a0542] text-white' : 'bg-gradient-to-br from-red-50 to-rose-50 text-black'} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto">
        {loading && (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="py-2 mb-4 text-center text-red-500">{error}</div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={()=>navigate('/health')} className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white/90'} mr-4`}>
              <ArrowLeft className={`${isDark ? 'text-gray-200' : 'text-gray-700'} w-6 h-6`} />
            </button>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{language === 'ar' ? 'تتبع معدل ضربات القلب' : 'Heart Rate Tracker'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`${isDark ? 'bg-red-700/20 text-red-300' : 'bg-red-100 text-red-600'} px-3 py-1 rounded-full`}>{language === 'ar' ? 'صحي' : 'Vital'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 ${isDark ? 'bg-gray-800/40' : 'bg-white/80'} rounded-3xl p-6 shadow-lg transition-transform duration-200 hover:scale-[1.01]`}>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div style={{ animationDuration: `${pulseDuration*1.6}ms` }} className={`absolute -inset-3 rounded-full ${isDark ? 'bg-red-900/20' : 'bg-rose-100/50'} animate-ping-slow`}></div>
                <div style={{ animationDuration: `${pulseDuration}ms` }} className={`relative w-52 h-52 rounded-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-[#7f1724] to-[#3b0838]' : 'bg-gradient-to-br from-red-400 to-rose-500'} shadow-2xl`}> 
                  <svg width="84" height="84" viewBox="0 0 24 24" className="text-white animate-heartbeat" style={{ animationDuration: `${pulseDuration}ms` }}>
                    <path fill="currentColor" d="M12 21s-7-4.35-9-6.5C-0.6 10.9 3 6 7.5 7.5 9 8 10 9.5 12 11c2-1.5 3-3 4.5-3.5C21 6 24.6 10.9 21 14.5 19 16.65 12 21 12 21z" />
                  </svg>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-6xl font-extrabold" style={{ textShadow: isDark ? '0 8px 40px rgba(255,80,80,0.12)' : '0 8px 40px rgba(236,72,153,0.12)' }}>{animatedBpm}</div>
                <div className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>BPM • {language === 'ar' ? 'نبضة في الدقيقة' : 'beats per minute'}</div>
              </div>

              <div className="mt-6 w-full flex items-center gap-4">
                <div className={`flex-1 ${isDark ? 'bg-gray-900/30' : 'bg-white/90'} p-4 rounded-xl`}> 
                  <label className="block text-sm text-gray-400 mb-2">{language === 'ar' ? 'سجل معدل ضربات القلب' : 'Log Heart Rate'}</label>
                  <div className="relative">
                    <input value={input} onChange={e=>setInput(e.target.value.replace(/[^0-9]/g,''))} className={`w-full p-3 pr-24 rounded-xl bg-transparent border ${isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-black'} focus:outline-none focus:ring-2 focus:ring-red-400 transition-all`} placeholder={language === 'ar' ? 'مثال: 75' : 'e.g. 75'} />
                    <button onClick={logRate} className={`absolute right-2 top-2 bottom-2 px-4 rounded-lg ${isDark ? 'bg-red-600 text-white shadow' : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'} transform transition-transform duration-200 hover:scale-105`}>{language === 'ar' ? 'سجل' : 'Log Rate'}</button>
                  </div>
                </div>

                <div className={`w-40 ${isDark ? 'bg-gray-900/30' : 'bg-white/90'} p-4 rounded-xl flex flex-col items-center justify-center`}> 
                  <div className="text-sm text-gray-400">Average</div>
                  <div className="text-2xl font-bold mt-1 text-red-500">{avg}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${Math.min(100, Math.round((avg/120)*100))}%` }} className="h-2 bg-gradient-to-r from-red-500 to-rose-500 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-800/40' : 'bg-white/80'} rounded-3xl p-6 shadow-lg transition-transform duration-200 hover:scale-[1.01]`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{language === 'ar' ? 'البيانات' : 'Data'}</h3>
              <div className="flex gap-2">
                {(['day','week','month'] as const).map(t=> (
                  <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 rounded-full text-sm ${tab===t ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' : (isDark ? 'bg-gray-700 text-gray-200' : 'bg-white/60 text-gray-700')} transition-all`}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <svg width="100%" height="140" viewBox="0 0 320 140" className="rounded">
                <path ref={svgRef} d={pathD} fill="none" stroke={isDark ? '#ff6b6b' : '#ef4444'} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="transition-all" />
              </svg>
            </div>

            <div className="space-y-2">
              {weekDates.slice(0,5).map((dt,i)=> {
                const label = dt.toLocaleDateString('en-US', { weekday: 'short' });
                const val = history[i] ?? 0;
                return (
                  <div key={dt.toISOString()} className={`p-3 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-900/20' : 'bg-white/90'} transition-shadow hover:shadow-lg` }>
                    <div className="text-sm text-gray-400">{label}</div>
                    <div className="font-bold text-red-500">{val} BPM</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-heartbeat { transform-origin: center; }
        @keyframes heartbeat { 0%{ transform: scale(1)} 30%{ transform: scale(.88)} 45%{ transform: scale(1.12)} 100%{ transform: scale(1)} }
        .animate-heartbeat { animation-name: heartbeat; animation-iteration-count: infinite; }
        .animate-ping-slow { animation: ping 1800ms cubic-bezier(0,0,0.2,1) infinite; opacity:.6 }
      `}</style>
    </div>
  );
};

export default HeartRateTracker;