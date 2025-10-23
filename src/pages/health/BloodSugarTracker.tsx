import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { addBloodSugarEntry, createDailyBloodSugarLog, getDailyBloodSugarLog, getWeeklyBloodSugarLogs, BloodSugarLogWithId, deleteBloodSugarEntry } from '../../firebase/bloodSugar';

const BloodSugarTracker: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isDark } = useTheme();

  // State
  const { user, loading: authLoading } = useAuth();
  const [input, setInput] = useState('100');
  const [timeOfDay, setTimeOfDay] = useState('Fasting');
  const [history, setHistory] = useState<{ id?:string; value:number; ts: string; when: string }[]>([]);
  const [view, setView] = useState<'day'|'week'|'month'>('day');
  const [tooltip, setTooltip] = useState<{ x:number; y:number; value:number; ts:string } | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement|null>(null);
  const chartRef = useRef<SVGPathElement|null>(null);
  const [dailyLog, setDailyLog] = useState<BloodSugarLogWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Color tokens from HealthTracker for Blood Sugar (amber)
  const colors = {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    accent: 'text-amber-500',
    glow: 'bg-amber-500/30'
  };

  // confetti (scoped small burst)
  function fireConfetti(canvas: HTMLCanvasElement | null){
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    const W = (canvas.width = window.innerWidth); const H = (canvas.height = window.innerHeight);
    const parts: {x:number;y:number;vx:number;vy:number;r:number;color:string}[] = [];
    for(let i=0;i<60;i++) parts.push({ x: W/2 + (Math.random()-0.5)*200, y: H/2 + (Math.random()-0.5)*50, vx:(Math.random()-0.5)*8, vy:-Math.random()*8-2, r:Math.random()*6+3, color: [`#f59e0b`, `#f97316`, `#fca5a5`, `#fde68a`][Math.floor(Math.random()*4)] });
    let raf = 0; const draw = ()=>{ ctx.clearRect(0,0,W,H); parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.r,p.r); }); raf=requestAnimationFrame(draw); };
    draw(); setTimeout(()=>cancelAnimationFrame(raf),1200);
  }

  const avg = Math.round(history.reduce((a,b)=>a+b.value,0)/history.length || 0);

  const statusFor = (val:number)=>{
    if(val < 70) return { label: language==='ar' ? 'منخفض' : 'Low', color: 'from-emerald-400 to-emerald-500', text: 'text-emerald-600' };
    if(val <= 140) return { label: language==='ar' ? 'طبيعي' : 'Normal', color: 'from-emerald-400 to-emerald-500', text: 'text-emerald-600' };
    if(val <= 199) return { label: language==='ar' ? 'مرتفع قليلاً' : 'Elevated', color: 'from-yellow-400 to-yellow-500', text: 'text-yellow-600' };
    return { label: language==='ar' ? 'مرتفع' : 'High', color: 'from-red-400 to-rose-500', text: 'text-red-600' };
  };

  // add reading
  // Load today's log and last 20 entries
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
        let daily = await getDailyBloodSugarLog(uid, today);
        if (!daily) {
          const newLog = { date: today, entries: [] };
          const id = await createDailyBloodSugarLog(uid, newLog);
          daily = { id, ...newLog } as BloodSugarLogWithId;
        }
        if (!isMounted) return;
        setDailyLog(daily);
        // Build history for chart from weekly logs (flatten entries)
        const d = new Date();
        const end = today;
        const startDate = new Date(d.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weekly = await getWeeklyBloodSugarLogs(uid, startDate, end);
        const flat = weekly
          .flatMap(w => (w.entries || []))
          .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 50)
          .map(e => ({ id: e.id, value: e.value, ts: e.timestamp, when: e.when }));
        setHistory(flat);
      } catch (e) {
        console.error('Failed to load blood sugar logs:', e);
        setError('Failed to load blood sugar');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user, authLoading]);

  const logReading = async ()=>{
    if (!dailyLog) return;
    const n = Math.max(20, Math.min(600, Number(input||0)));
    const entry = { id: Date.now().toString(), value: n, when: timeOfDay, timestamp: new Date().toISOString() };
    // Optimistic UI
    setHistory(h=>[{ id: entry.id, value: entry.value, ts: entry.timestamp, when: entry.when }, ...h].slice(0,50));
    setShowCheck(true);
    fireConfetti(confettiRef.current);
    setTimeout(()=>setShowCheck(false),1200);
    setInput('');
    try {
      await addBloodSugarEntry(dailyLog.id, entry);
    } catch (e) {
      console.error('Failed to add blood sugar entry:', e);
      setError('Failed to save blood sugar');
    }
  };

  const removeEntry = async (entryId?: string) => {
    try {
      if (!dailyLog || !entryId) return;
      // Optimistic remove
      setHistory(prev => prev.filter(e => e.id !== entryId));
      await deleteBloodSugarEntry(dailyLog.id, entryId);
    } catch (e) {
      console.error('Failed to delete blood sugar entry:', e);
      setError('Failed to delete entry');
    }
  };

  // chart path builder and animation
  const pathD = useMemo(()=>{
    const items = history.slice(0,20).reverse();
    const w = 600, h = 160, pad = 12; if(items.length===0) return '';
    const max = Math.max(200, ...items.map(i=>i.value));
    return items.map((it,idx)=>{ const x = pad + (idx/(items.length-1||1))*(w-2*pad); const y = pad + (1-(it.value/max))*(h-2*pad); return `${idx===0?'M':'L'} ${x} ${y}`; }).join(' ');
  },[history]);

  useEffect(()=>{
    // draw-line animation using strokeDashoffset
    const path = chartRef.current; if(!path) return;
    const length = path.getTotalLength();
    path.style.transition = 'stroke-dashoffset 900ms ease';
    path.style.strokeDasharray = `${length} ${length}`;
    path.style.strokeDashoffset = `${length}`;
    requestAnimationFrame(()=>{ path.style.strokeDashoffset = '0'; });
  },[pathD]);

  return (
    <div className={`${isDark ? 'bg-[#021018] text-white' : 'bg-gradient-to-br from-amber-50 to-yellow-50 text-black'} min-h-screen pb-12`}> 
      <canvas ref={confettiRef} className="pointer-events-none fixed inset-0 z-0" />

  {/* Floating glass navbar — use sticky inside container so it aligns with app layout (avoids centering over viewport when there is a left sidebar) */}
  <div className={`mx-auto max-w-6xl sticky top-4 ${isDark ? 'bg-gray-900/40' : 'bg-white/50'} backdrop-blur-md rounded-2xl p-3 shadow-md z-30` }>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={()=>navigate('/health')} className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white/90'} mr-4`}>
              <ArrowLeft className={`${isDark ? 'text-gray-200' : 'text-gray-700'} w-5 h-5`} />
            </button>
            <h2 className={`text-lg font-bold ${colors.accent} animate-pulse`}>{language==='ar' ? 'متعقب سكر الدم' : 'Blood Sugar Tracker'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow`}>💧</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 pt-28 relative z-10">
        {loading && (
          <div className="py-6 text-center text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="py-2 mb-4 text-center text-red-500">{error}</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Card */}
          <div className={`${isDark ? 'bg-gray-800/40' : 'bg-white/70'} rounded-3xl p-6 shadow-lg backdrop-blur-sm transition-all transform hover:scale-[1.01]`}> 
            <div className="text-sm text-gray-400 mb-2">{language==='ar' ? 'سجل قراءة' : 'Log Reading'}</div>
            <div className="relative mt-4">
              <label className={`absolute left-4 -top-3 px-1 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-all`}>{language==='ar' ? 'مستوى السكر (mg/dL)' : 'Blood Sugar (mg/dL)'}</label>
              <input value={input} onChange={e=>setInput(e.target.value.replace(/[^0-9]/g,''))} className={`w-full p-4 rounded-xl mt-2 bg-transparent border ${isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-black'} focus:ring-2 focus:ring-amber-300 transition-all`} />
            </div>

            <div className="mt-4">
              <label className="text-xs text-gray-400">{language==='ar' ? 'وقت اليوم' : 'Time of Day'}</label>
              <select value={timeOfDay} onChange={e=>setTimeOfDay(e.target.value)} className={`w-full mt-2 p-3 rounded-lg bg-transparent border ${isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-black'}`}>
                <option>Fasting</option>
                <option>Before Meal</option>
                <option>After Meal</option>
                <option>Bedtime</option>
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={logReading} className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>{language==='ar' ? 'تسجيل القراءة' : 'Log Reading'}</button>
              <button onClick={()=>setInput('')} className={`flex-1 py-3 rounded-xl border ${isDark ? 'text-gray-200 border-gray-700' : 'text-gray-700 border-gray-200'}`}>{language==='ar' ? 'مسح' : 'Clear'}</button>
            </div>
          </div>

          {/* Chart area */}
          <div className={`${isDark ? 'bg-gray-800/40' : 'bg-white/80'} rounded-3xl p-6 shadow-lg lg:col-span-2`}> 
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{language==='ar' ? 'الاتجاهات' : 'Trends'}</h3>
                <div className="text-sm text-gray-400">{language==='ar' ? 'عرض البيانات' : 'View readings over time'}</div>
              </div>
              <div className="flex gap-2">
                {(['day','week','month'] as const).map(v=> (
                  <button key={v} onClick={()=>setView(v)} className={`px-3 py-1 rounded-full text-sm ${view===v ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white' : (isDark ? 'bg-gray-700 text-gray-200' : 'bg-white/60 text-gray-700')} transition-all`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <svg width="100%" height="180" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bsGrad" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#facc15" />
                  </linearGradient>
                </defs>
                <path ref={chartRef} d={pathD} fill="none" stroke="url(#bsGrad)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

                {history.slice(0,20).reverse().map((it, idx)=>{
                  const items = history.slice(0,20).reverse(); const max = Math.max(200, ...items.map(i=>i.value));
                  const x = 12 + (idx/(items.length-1||1))*(600-24); const y = 12 + (1-(it.value/max))*(160-24);
                  return <circle key={idx} cx={x} cy={y} r={6} fill="#f59e0b" className="cursor-pointer" onMouseEnter={()=>setTooltip({ x, y, value: it.value, ts: it.ts })} onMouseLeave={()=>setTooltip(null)} />;
                })}
              </svg>

              {tooltip && (
                <div style={{ left: tooltip.x, top: tooltip.y-60 }} className={`absolute px-3 py-2 rounded shadow-md text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                  <div className="font-semibold">{tooltip.value} mg/dL</div>
                  <div className="text-xs text-gray-400">{new Date(tooltip.ts).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gauge & recent */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${isDark ? 'bg-gray-800/40' : 'bg-white/80'} p-4 rounded-2xl shadow-lg`}> 
            <div className="text-sm text-gray-400">{language==='ar' ? 'المتوسط الحالي' : 'Current Average'}</div>
            <div className="text-3xl font-bold mt-2">{avg} mg/dL</div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div style={{ width: `${Math.min(100, Math.round((avg/200)*100))}%` }} className={`h-3 bg-gradient-to-r ${statusFor(avg).color} transition-all`} />
            </div>
            <div className="mt-2 text-sm text-gray-600">{statusFor(avg).label}</div>
          </div>

          {history.slice(0,2).map((it,idx)=> (
            <div key={idx} className={`${isDark ? 'bg-gray-800/40' : 'bg-white/80'} p-4 rounded-2xl shadow transition-transform hover:scale-[1.02]`}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">{new Date(it.ts).toLocaleDateString()}</div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold">{it.value} mg/dL</div>
                  <button onClick={()=>removeEntry(it.id)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200">Remove</button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">{it.when}</div>
            </div>
          ))}
        </div>

      </div>

      {/* check animation */}
      {showCheck && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-full p-4 shadow-lg animate-check" style={{ width: 120, height: 120 }}>
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-amber-500 mx-auto"><path d="M20 6L9 17l-5-5" stroke="#b45309" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          </div>
        </div>
      )}

      <style>{`
        .animate-check { animation: checkPop 600ms ease; }
        @keyframes checkPop { 0%{ transform: scale(.6); opacity:0 } 60%{ transform: scale(1.08); opacity:1 } 100%{ transform: scale(1); opacity:1 } }
        path { transition: stroke-dashoffset 900ms ease; }
      `}</style>
    </div>
  );
};

export default BloodSugarTracker;