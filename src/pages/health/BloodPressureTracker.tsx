import { ArrowLeft, Heart } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  addBloodPressureEntry, 
  createDailyBloodPressureLog, 
  getDailyBloodPressureLog, 
  getWeeklyBloodPressureLogs, 
  BloodPressureLogWithId, 
  deleteBloodPressureEntry 
} from '../../firebase/bloodPressure';

const BloodPressureTracker: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isDark } = useTheme();

  // state
  const { user, loading: authLoading } = useAuth();
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [history, setHistory] = useState<{ id?:string; sys:number; dia:number; pulse:number; ts:string }[]>([]);
  const [view, setView] = useState<'day'|'week'|'month'>('day');
  const [showCheck, setShowCheck] = useState(false);
  const [invalid, setInvalid] = useState<{s?:boolean;d?:boolean;p?:boolean}>({});
  const confettiRef = useRef<HTMLCanvasElement|null>(null);
  const [reminders, setReminders] = useState(false);
  const [tooltip, setTooltip] = useState<{x:number;y:number;txt:string} | null>(null);
  const [dailyLog, setDailyLog] = useState<BloodPressureLogWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // use HealthTracker cyan tokens
  const colors = { bg: 'bg-gradient-to-br from-cyan-50 to-sky-50', accent: 'text-cyan-500', glow: 'bg-cyan-500/30' };

  // load today's log and weekly history
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
        let daily = await getDailyBloodPressureLog(uid, today);
        if (!daily) {
          const newLog = { date: today, entries: [] };
          const id = await createDailyBloodPressureLog(uid, newLog);
          daily = { id, ...newLog } as BloodPressureLogWithId;
        }
        if (!isMounted) return;
        setDailyLog(daily);
        // weekly history flattened to recent list for chart/cards
        const d = new Date();
        const end = today;
        const startDate = new Date(d.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weekly = await getWeeklyBloodPressureLogs(uid, startDate, end);
        const flat = weekly
          .flatMap(w => (w.entries || []))
          .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 50)
          .map(e => ({ id: e.id, sys: e.sys, dia: e.dia, pulse: e.pulse, ts: e.timestamp }));
        setHistory(flat);
      } catch (e) {
        console.error('Failed to load blood pressure logs:', e);
        setError('Failed to load blood pressure');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user, authLoading]);

  // small confetti burst
  function fireConfetti(canvas: HTMLCanvasElement|null){
    if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    const W = (canvas.width = window.innerWidth); const H = (canvas.height = window.innerHeight);
    const items: {x:number;y:number;vx:number;vy:number;r:number;color:string}[] = [];
    for(let i=0;i<50;i++) items.push({ x: W/2 + (Math.random()-0.5)*200, y: H/2 + (Math.random()-0.5)*50, vx:(Math.random()-0.5)*8, vy:-Math.random()*8-2, r:Math.random()*6+3, color: ['#0ea5e9','#3b82f6','#14b8a6'][Math.floor(Math.random()*3)] });
    let raf=0; const draw = ()=>{ ctx.clearRect(0,0,W,H); items.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.r,p.r); }); raf=requestAnimationFrame(draw); };
    draw(); setTimeout(()=>cancelAnimationFrame(raf),900);
  }

  const validate = ()=>{
    const s = Number(systolic), d = Number(diastolic), p = Number(pulse);
    const invalidState:{s?:boolean;d?:boolean;p?:boolean}={};
    if(!(s>=40 && s<=250)) invalidState.s = true;
    if(!(d>=30 && d<=160)) invalidState.d = true;
    if(!(p>=30 && p<=220)) invalidState.p = true;
    setInvalid(invalidState);
    return Object.keys(invalidState).length===0;
  };

  const submit = async ()=>{
    if(!validate() || !dailyLog) return;
    const entry = { id: Date.now().toString(), sys: Number(systolic), dia: Number(diastolic), pulse: Number(pulse), timestamp: new Date().toISOString() };
    // optimistic UI
    setHistory(h=>[{ id: entry.id, sys: entry.sys, dia: entry.dia, pulse: entry.pulse, ts: entry.timestamp }, ...h].slice(0,50));
    setShowCheck(true);
    fireConfetti(confettiRef.current);
    setTimeout(()=>setShowCheck(false),1200);
    try {
      await addBloodPressureEntry(dailyLog.id, entry);
    } catch (e) {
      console.error('Failed to save blood pressure entry:', e);
      setError('Failed to save blood pressure');
    }
  };

  const removeEntry = async (entryId?: string) => {
    try {
      if (!dailyLog || !entryId) return;
      // Optimistic remove
      setHistory(prev => prev.filter(e => e.id !== entryId));
      await deleteBloodPressureEntry(dailyLog.id, entryId);
    } catch (e) {
      console.error('Failed to delete blood pressure entry:', e);
      setError('Failed to delete entry');
    }
  };

  // chart path builder
  const chartPath = useMemo(()=>{
    const items = history.slice(0,20).reverse(); if(items.length===0) return '';
    const w=600,h=140,pad=12; const max = Math.max(220, ...items.map(i=>i.sys));
    return items.map((it,i)=>{ const x = pad + (i/(items.length-1||1))*(w-2*pad); const y = pad + (1-(it.sys/max))*(h-2*pad); return `${i===0?'M':'L'} ${x} ${y}`; }).join(' ');
  },[history]);

  // trend indicator comparing newest two
  const trend = useMemo(()=>{
    if(history.length<2) return { dir: 'flat', diff: 0 };
    const diff = history[0].sys - history[1].sys; if(diff>0) return { dir: 'up', diff }; if(diff<0) return { dir: 'down', diff: Math.abs(diff) }; return { dir:'flat', diff:0 };
  },[history]);

  return (
    <div className={`${isDark ? 'bg-[#02172b] text-white' : colors.bg + ' text-black'} min-h-screen pb-12`}> 
      <canvas ref={confettiRef} className="pointer-events-none fixed inset-0 z-0" />

      {/* Header */}
      <div className={`mx-auto max-w-6xl sticky top-4 ${isDark ? 'bg-gray-900/30' : 'bg-white/60'} backdrop-blur-md rounded-2xl p-4 shadow-md z-20`}> 
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={()=>navigate('/health')} className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white/90'} mr-4`}>
              <ArrowLeft className={`${isDark ? 'text-gray-200' : 'text-gray-700'} w-5 h-5`} />
            </button>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} slide-in`}>{language==='ar'?'تتبع ضغط الدم':'Track Your Blood Pressure'}</h1>
            <div className="ml-4 flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 text-white shadow pulse-on-hover"><Heart className="w-5 h-5" /></div>
              <div className="text-sm text-gray-400">{language==='ar'?'نظرة عامة':'Overview'}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" checked={reminders} onChange={()=>setReminders(r=>!r)} className="toggle-checkbox" />
              <span>{language==='ar'?'تذكيرات':'Reminders'}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 pt-8 relative z-10">
        {loading && (
          <div className="py-6 text-center text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="py-2 mb-4 text-center text-red-500">{error}</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className={`${isDark ? 'bg-gray-800/40' : 'bg-white/80'} rounded-3xl p-6 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.01]`}> 
            <div className="text-sm text-gray-400 mb-3">{language==='ar'?'أدخل قراءتك':'Enter a Reading'}</div>

            <div className={`mb-3 relative ${invalid.s ? 'shake' : ''}`}>
              <label className={`absolute left-4 -top-3 px-1 text-xs ${isDark?'text-gray-300':'text-gray-700'}`}>{language==='ar'?'الانقباضي (Systolic)':'Systolic'}</label>
              <input value={systolic} onChange={e=>setSystolic(e.target.value.replace(/[^0-9]/g,''))} className={`w-full p-4 rounded-xl mt-2 bg-transparent border ${invalid.s ? 'border-red-400' : (isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-black')} focus:outline-none`} />
            </div>

            <div className={`mb-3 relative ${invalid.d ? 'shake' : ''}`}>
              <label className={`absolute left-4 -top-3 px-1 text-xs ${isDark?'text-gray-300':'text-gray-700'}`}>{language==='ar'?'الانبساطي (Diastolic)':'Diastolic'}</label>
              <input value={diastolic} onChange={e=>setDiastolic(e.target.value.replace(/[^0-9]/g,''))} className={`w-full p-4 rounded-xl mt-2 bg-transparent border ${invalid.d ? 'border-red-400' : (isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-black')} focus:outline-none`} />
            </div>

            <div className={`mb-3 relative ${invalid.p ? 'shake' : ''}`}>
              <label className={`absolute left-4 -top-3 px-1 text-xs ${isDark?'text-gray-300':'text-gray-700'}`}>{language==='ar'?'النبض (Pulse)':'Pulse'}</label>
              <input value={pulse} onChange={e=>setPulse(e.target.value.replace(/[^0-9]/g,''))} className={`w-full p-4 rounded-xl mt-2 bg-transparent border ${invalid.p ? 'border-red-400' : (isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-black')} focus:outline-none`} />
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={submit} className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>{language==='ar'?'تسجيل':'Log Reading'}</button>
              <button onClick={()=>{ setSystolic('120'); setDiastolic('80'); setPulse('72'); setInvalid({}); }} className={`flex-1 py-3 rounded-xl border ${isDark ? 'text-gray-200 border-gray-700' : 'text-gray-700 border-gray-200'}`}>{language==='ar'?'مسح':'Clear'}</button>
            </div>
          </div>

          {/* Chart */}
          <div className={`${isDark ? 'bg-gray-800/40' : 'bg-white/80'} rounded-3xl p-6 shadow-lg lg:col-span-2`}> 
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-semibold ${isDark?'text-white':'text-gray-900'}`}>{language==='ar'?'الاتجاهات':'Trends'}</h3>
                <div className="text-sm text-gray-400">{language==='ar'?'عرض البيانات':'View readings over time'}</div>
              </div>
              <div className="flex gap-2">
                {(['day','week','month'] as const).map(v=> (
                  <button key={v} onClick={()=>setView(v)} className={`px-3 py-1 rounded-full text-sm ${view===v ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white' : (isDark ? 'bg-gray-700 text-gray-200' : 'bg-white/60 text-gray-700')} transition-all`}>{v}</button>
                ))}
              </div>
            </div>

            <div className="relative">
              <svg width="100%" height="180" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bpGrad" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <path d={chartPath} fill="none" stroke="url(#bpGrad)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                {history.slice(0,20).reverse().map((it,idx)=>{
                  const items = history.slice(0,20).reverse(); const max = Math.max(220, ...items.map(i=>i.sys)); const x=12 + (idx/(items.length-1||1))*(600-24); const y=12 + (1-(it.sys/max))*(140-24);
                  return <circle key={idx} cx={x} cy={y} r={6} fill="#0ea5e9" className="cursor-pointer" onMouseEnter={()=>setTooltip({ x, y, txt:`${it.sys}/${it.dia} · ${it.pulse} bpm` })} onMouseLeave={()=>setTooltip(null)} />;
                })}
              </svg>

              {tooltip && (
                <div style={{ left: tooltip.x, top: tooltip.y-60 }} className={`absolute px-3 py-2 rounded shadow-md text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                  <div className="font-semibold">{tooltip.txt}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent readings and gauge */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${isDark ? 'bg-gray-800/40' : 'bg-white/80'} p-4 rounded-2xl shadow-lg`}> 
            <div className="text-sm text-gray-400">{language==='ar'?'الاتجاه':'Trend'}</div>
            <div className="flex items-center gap-3 mt-2">
              <div className={`p-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 text-white`}>{trend.dir==='up' ? '↑' : (trend.dir==='down' ? '↓' : '−')}</div>
              <div className="text-lg font-bold">{trend.dir==='flat' ? (language==='ar'?'ثابت':'Stable') : (trend.dir==='up' ? (language==='ar'?'ارتفاع':'Increase') : (language==='ar'?'انخفاض':'Decrease'))}</div>
            </div>
            <div className="mt-3 text-sm text-gray-500">{trend.diff ? `${trend.diff} ${language==='ar'?'mmHg':'mmHg'}` : ''}</div>
          </div>

          {history.slice(0,2).map((it,idx)=> (
            <div key={idx} className={`${isDark ? 'bg-gray-800/40' : 'bg-white/80'} p-4 rounded-2xl shadow transition-transform hover:scale-[1.02]`} style={{ animationDelay: `${idx*80}ms` }}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">{new Date(it.ts).toLocaleString()}</div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold">{it.sys}/{it.dia}</div>
                  <button onClick={()=>removeEntry(it.id)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200">{language==='ar'?'حذف':'Remove'}</button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">{it.pulse} {language==='ar'?'نبضة':'bpm'}</div>
            </div>
          ))}
        </div>

        {/* Empty state animation */}
        {history.length===0 && (
          <div className="mt-8 p-8 rounded-2xl text-center">
            <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 text-white animate-pulse">❤</div>
            <p className="mt-4 text-gray-500">{language==='ar'?'سجل القراءة الأولى لتتبع الاتجاه':'Log your first reading to begin tracking trends'}</p>
          </div>
        )}

      </div>

      {/* check animation */}
      {showCheck && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-full p-4 shadow-lg animate-check" style={{ width: 120, height: 120 }}>
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-cyan-500 mx-auto"><path d="M20 6L9 17l-5-5" stroke="#0ea5e9" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          </div>
        </div>
      )}

      <style>{`
        .slide-in { animation: slideDown .6s ease; }
        @keyframes slideDown { from { transform: translateY(-6px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        .pulse-on-hover:hover { transform: scale(1.05); transition: transform .18s ease; }
        .shake { animation: shakeX .36s ease; }
        @keyframes shakeX { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        .animate-check { animation: checkPop 600ms ease; }
        @keyframes checkPop { 0%{ transform: scale(.6); opacity:0 } 60%{ transform: scale(1.08); opacity:1 } 100%{ transform: scale(1); opacity:1 } }
        input[type="checkbox"].toggle-checkbox { width: 36px; height: 20px; -webkit-appearance: none; background: #ddd; border-radius: 999px; position: relative; outline: none; cursor: pointer; }
        input[type="checkbox"].toggle-checkbox:before { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; background: white; border-radius: 999px; transition: all .2s ease; }
        input[type="checkbox"].toggle-checkbox:checked { background: linear-gradient(90deg,#06b6d4,#3b82f6); }
        input[type="checkbox"].toggle-checkbox:checked:before { transform: translateX(16px); }
      `}</style>
    </div>
  );
};

export default BloodPressureTracker;