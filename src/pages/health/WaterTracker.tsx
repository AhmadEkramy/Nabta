import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Droplet, Settings, TrendingUp, CheckCircle2, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  WaterLogWithId, 
  WaterEntryDB, 
  getDailyWaterLog, 
  createDailyWaterLog, 
  addWaterEntry, 
  deleteWaterEntry, 
  updateDailyWaterGoal, 
  getWeeklyWaterLogs, 
  resetWaterEntries, 
  setWaterEntries 
} from '../../firebase/water';

interface WaterEntry {
  id: string;
  amount: number;
  timestamp: Date;
}

interface WeekData {
  date: Date;
  total: number;
  goal: number;
}

const WaterTracker: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const { user, loading: authLoading } = useAuth();

  const text = {
    backToDashboard: language === 'ar' ? 'العودة إلى لوحة المعلومات' : 'Back to Dashboard',
    waterTracking: language === 'ar' ? 'تتبع المياه' : 'Water Tracking',
    dailyProgress: language === 'ar' ? 'التقدم اليومي' : 'Daily Progress',
    weeklyAverage: language === 'ar' ? 'المتوسط الأسبوعي' : 'Weekly Average',
    remainingToday: language === 'ar' ? 'المتبقي اليوم' : 'Remaining Today',
    weeklyProgress: language === 'ar' ? 'التقدم الأسبوعي' : 'Weekly Progress',
    todayLog: language === 'ar' ? 'سجل اليوم' : 'Today\'s Log',
    remove: language === 'ar' ? 'حذف' : 'Remove',
    addWater: language === 'ar' ? 'إضافة ماء' : 'Add Water',
    drinkWater: language === 'ar' ? 'اشرب الماء' : 'Drink Water',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    add: language === 'ar' ? 'إضافة' : 'Add',
    settings: language === 'ar' ? 'الإعدادات' : 'Settings',
    dailyGoal: language === 'ar' ? 'الهدف اليومي' : 'Daily Goal',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    smallGlass: language === 'ar' ? 'كوب صغير' : 'Small Glass',
    mediumGlass: language === 'ar' ? 'كوب متوسط' : 'Medium Glass',
    bottle: language === 'ar' ? 'زجاجة' : 'Bottle',
    customAmount: language === 'ar' ? 'كمية مخصصة' : 'Custom Amount',
    amountInMl: language === 'ar' ? 'الكمية (مل)' : 'Amount (ml)'
  };
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2500); // 2.5L
  const [log, setLog] = useState<WaterLogWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const bottleRef = useRef<HTMLDivElement>(null);
  const prevPercentRef = useRef(0);
  const [celebrate, setCelebrate] = useState(false);

  // Calculate totals
  const totalToday = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const percentComplete = Math.min((totalToday / dailyGoal) * 100, 100);
  const remaining = Math.max(0, dailyGoal - totalToday);
  const hasReachedGoal = totalToday >= dailyGoal;

  useEffect(() => {
    const prev = prevPercentRef.current;
    if (prev < 100 && percentComplete >= 100) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1500);
    }
    prevPercentRef.current = percentComplete;
  }, [percentComplete]);

  const refreshWeekly = async (uid: string, overrideTodayTotal?: number) => {
    try {
      const today = new Date();
      const end = today.toISOString().split('T')[0];
      const startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weekly = await getWeeklyWaterLogs(uid, startDate, end);
      const byDate = new Map(weekly.map(w => [w.date, w]));
      const newWeekData = Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const key = dt.toISOString().split('T')[0];
        const dayLog = byDate.get(key);
        // Keep today's value in sync with local or explicit override to avoid flash
        const total = key === end
          ? (typeof overrideTodayTotal === 'number' ? overrideTodayTotal : entries.reduce((s, e) => s + e.amount, 0))
          : (dayLog ? (dayLog.entries || []).reduce((s, e) => s + e.amount, 0) : 0);
        const goalForDay = key === end ? dailyGoal : (dayLog?.dailyGoal ?? dailyGoal);
        return { date: dt, total, goal: goalForDay };
      });
      setWeekData(newWeekData);
    } catch (e) {
      console.error('Failed to refresh weekly logs:', e);
    }
  };

  const updateWeekTodayLocal = (newTotal: number) => {
    const todayKey = new Date().toISOString().split('T')[0];
    setWeekData(prev => prev.map(d => {
      const key = d.date.toISOString().split('T')[0];
      if (key === todayKey) {
        return { ...d, total: newTotal, goal: dailyGoal };
      }
      return d;
    }));
  };

  // Weekly data
  const [weekData, setWeekData] = useState<WeekData[]>(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
      total: Math.random() * 2500, // Mock data
      goal: 2500
    })).reverse();
  });

  // Add water entry
  const addWater = async (amount: number) => {
    try {
      if (!log) return;
      const newEntry: WaterEntry = {
        id: Date.now().toString(),
        amount,
        timestamp: new Date()
      };
      // Optimistic UI update
      setEntries(prev => [...prev, newEntry]);
      animateWaterLevel();
      const optimisticTotal = totalToday + amount;
      updateWeekTodayLocal(optimisticTotal);
      // Persist to Firestore
      const entryDb: WaterEntryDB = { id: newEntry.id, amount: newEntry.amount, timestamp: newEntry.timestamp.toISOString() };
      await addWaterEntry(log.id, entryDb);
      if (user) await refreshWeekly(user.id, optimisticTotal);
    } catch (e) {
      console.error('Failed to add water entry:', e);
      setError('Failed to add water entry');
    }
  };

  // Animate water bottle
  const animateWaterLevel = () => {
    if (bottleRef.current) {
      const wave = document.createElement('div');
      wave.className = 'water-wave';
      bottleRef.current.appendChild(wave);
      setTimeout(() => wave.remove(), 1000);
    }
  };

  // Handle custom amount
  const handleCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addWater(amount);
      setCustomAmount('');
      setShowCustomModal(false);
    }
  };

  // Update daily goal
  const updateDailyGoalLocal = async (newGoal: number) => {
    try {
      // Update local goal state
      setDailyGoal(newGoal);
      setShowSettings(false);

      // Update today's goal in weekly view immediately
      const todayKey = new Date().toISOString().split('T')[0];
      setWeekData(prev => prev.map(d => {
        const key = d.date.toISOString().split('T')[0];
        return key === todayKey ? { ...d, goal: newGoal } : d;
      }));

      // Persist goal to Firestore and refresh weekly using current total
      if (log) {
        await updateDailyWaterGoal(log.id, newGoal);
      }
      if (user) {
        const currentTotal = entries.reduce((s, e) => s + e.amount, 0);
        await refreshWeekly(user.id, currentTotal);
      }
    } catch (e) {
      console.error('Failed to update daily goal:', e);
      setError('Failed to update daily goal');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setError(null);
        const today = new Date().toISOString().split('T')[0];
        if (authLoading || !user) {
          setLoading(false);
          return;
        }
        const userId = user.id;
        let daily = await getDailyWaterLog(userId, today);
        if (!daily) {
          const newLog = { date: today, entries: [], dailyGoal };
          const id = await createDailyWaterLog(userId, newLog);
          daily = { id, ...newLog };
        }
        if (!isMounted) return;
        setLog(daily);
        setDailyGoal(daily.dailyGoal);
        const mapped: WaterEntry[] = (daily.entries || []).map(e => ({ id: e.id, amount: e.amount, timestamp: new Date(e.timestamp) }));
        setEntries(mapped);
        // Weekly logs
        const d = new Date();
        const end = today;
        const startDate = new Date(d.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weekly = await getWeeklyWaterLogs(userId, startDate, end);
        const byDate = new Map(weekly.map(w => [w.date, w]));
        const newWeekData = Array.from({ length: 7 }, (_, i) => {
          const dt = new Date(d.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          const key = dt.toISOString().split('T')[0];
          const dayLog = byDate.get(key);
          const total = dayLog ? (dayLog.entries || []).reduce((s, e) => s + e.amount, 0) : 0;
          return { date: dt, total, goal: dayLog?.dailyGoal ?? dailyGoal };
        });
        setWeekData(newWeekData);
      } catch (e) {
        console.error('Failed to load water logs:', e);
        setError('Failed to load water logs');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <motion.div 
        className="max-w-7xl mx-auto p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button 
          onClick={() => navigate('/health')}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {text.backToDashboard}
        </motion.button>

        <motion.div 
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div 
              className="p-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 15 }}
            >
              <Droplet className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {text.waterTracking}
            </h1>
          </div>
          <motion.button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-full hover:bg-blue-50 transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            <Settings className="w-6 h-6 text-blue-500" />
          </motion.button>
        </motion.div>

        {/* Water Bottle - simplified UI */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl font-bold mb-6 text-blue-900 dark:text-white">Today's Water Level</h2>
          <div className="relative mb-8" ref={bottleRef}>
            {/* Cap */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-6 rounded-b-md bg-blue-500 border-4 border-blue-400" />
            {/* Bottle */}
            <div className="w-44 h-[360px] border-[6px] border-blue-400 rounded-b-[110px] rounded-t-xl overflow-hidden bg-gradient-to-b from-white to-blue-50 relative">
              {/* Fill */}
              <motion.div 
                className="absolute bottom-0 left-0 w-full"
                animate={{ height: `${percentComplete}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="h-full w-full bg-gradient-to-t from-blue-500 to-blue-300" />
                {/* Level line */}
                <div className="absolute -top-[6px] left-0 w-full h-[6px] bg-blue-200/70" />
              </motion.div>
            </div>
            {hasReachedGoal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none absolute -inset-3 rounded-[1.5rem]"
                style={{ boxShadow: '0 0 0 6px rgba(34,197,94,0.2), 0 0 24px rgba(34,197,94,0.5)' }}
              />
            )}
          </div>

          {/* Summary */}
          <div className="text-center">
            <motion.div 
              key={totalToday}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-extrabold text-blue-900 dark:text-white"
            >
              {totalToday}ml
            </motion.div>
            <div className="text-gray-500 mt-2">of {dailyGoal}ml</div>
            <button onClick={() => setShowCustomModal(true)} className="text-blue-500 font-semibold mt-3 hover:underline">
              <motion.span key={Math.round(percentComplete)} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {Math.round(percentComplete)}% Complete
              </motion.span>
            </button>
            {hasReachedGoal && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700"
              >
                <span>✓</span>
                <span>Goal Achieved</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Add Water Presets */}
        <div className="max-w-7xl mx-auto w-full mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-600 text-2xl leading-none">+</span>
            <h3 className="text-xl font-semibold text-blue-900 dark:text-white">Add Water</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Small Glass */}
            <motion.button
              onClick={() => addWater(250)}
              className="text-left p-6 rounded-xl bg-gradient-to-b from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="60" height="80" viewBox="0 0 60 80" className="text-blue-500">
                  {/* Glass body */}
                  <path
                    d="M15 20 L15 70 Q15 75 20 75 L40 75 Q45 75 45 70 L45 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Water level */}
                  <path
                    d="M15 50 Q15 55 20 55 L40 55 Q45 55 45 50"
                    fill="currentColor"
                    fillOpacity="0.3"
                  />
                  {/* Glass rim */}
                  <line x1="15" y1="20" x2="45" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Handle */}
                  <path
                    d="M45 30 Q55 30 55 40 Q55 50 45 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="font-semibold text-blue-900 dark:text-white">{text.smallGlass}</div>
              <div className="text-gray-600 dark:text-gray-400">250ml</div>
            </motion.button>

            {/* Medium Glass */}
            <motion.button
              onClick={() => addWater(500)}
              className="text-left p-6 rounded-xl bg-gradient-to-b from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="70" height="95" viewBox="0 0 70 95" className="text-blue-500">
                  {/* Glass body */}
                  <path
                    d="M18 20 L18 80 Q18 85 25 85 L45 85 Q52 85 52 80 L52 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Water level */}
                  <path
                    d="M18 55 Q18 60 25 60 L45 60 Q52 60 52 55"
                    fill="currentColor"
                    fillOpacity="0.3"
                  />
                  {/* Glass rim */}
                  <line x1="18" y1="20" x2="52" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Handle */}
                  <path
                    d="M52 30 Q64 30 64 42 Q64 54 52 54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="font-semibold text-blue-900 dark:text-white">{text.mediumGlass}</div>
              <div className="text-gray-600 dark:text-gray-400">500ml</div>
            </motion.button>

            {/* Bottle */}
            <motion.button
              onClick={() => addWater(1000)}
              className="text-left p-6 rounded-xl bg-gradient-to-b from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="50" height="100" viewBox="0 0 50 100" className="text-blue-500">
                  {/* Bottle cap */}
                  <rect x="20" y="5" width="10" height="8" rx="2" fill="currentColor" />
                  {/* Bottle neck */}
                  <rect x="22" y="13" width="6" height="12" fill="currentColor" />
                  {/* Bottle body */}
                  <path
                    d="M15 25 L15 85 Q15 90 20 90 L30 90 Q35 90 35 85 L35 25 Q35 20 30 20 L20 20 Q15 20 15 25 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Water level */}
                  <rect x="15" y="50" width="20" height="35" fill="currentColor" fillOpacity="0.3" rx="5" />
                  {/* Bottle label area */}
                  <rect x="18" y="35" width="14" height="15" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                </svg>
              </div>
              <div className="font-semibold text-blue-900 dark:text-white">{text.bottle}</div>
              <div className="text-gray-600 dark:text-gray-400">1000ml</div>
            </motion.button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setShowCustomModal(true)}
              className="px-5 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Add
            </button>
            <button
              onClick={async () => {
                if (!entries.length) return;
                const last = entries[entries.length - 1];
                setEntries(prev => prev.slice(0, -1));
                const optimisticTotal = Math.max(0, totalToday - last.amount);
                updateWeekTodayLocal(optimisticTotal);
                if (log) await deleteWaterEntry(log.id, last.id);
                if (user) await refreshWeekly(user.id, optimisticTotal);
              }}
              className="px-5 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
            >
              Remove
            </button>
            <button
              onClick={async () => {
                setEntries([]);
                updateWeekTodayLocal(0);
                if (log) await resetWaterEntries(log.id);
                if (user) await refreshWeekly(user.id, 0);
              }}
              className="px-5 py-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              Reset
            </button>
          </div>
        </div>
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Stats cards with hover effects */}
          <motion.div 
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm`}
            whileHover={{ y: -5 }}
          >
            <h3 className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{text.dailyProgress}</h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-blue-500">
                {(totalToday / 1000).toFixed(1)}
              </span>
              <span className="text-gray-500 ml-2">/ {dailyGoal / 1000}L</span>
            </div>
            <div className="mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${percentComplete}%` }}
              />
            </div>
          </motion.div>

          <motion.div 
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm`}
            whileHover={{ y: -5 }}
          >
            <h3 className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{text.weeklyAverage}</h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-blue-500">
                {(weekData.reduce((sum, day) => sum + day.total, 0) / 7000).toFixed(1)}
              </span>
              <span className="text-gray-500 ml-2">L/day</span>
            </div>
          </motion.div>

          <motion.div 
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm`}
            whileHover={{ y: -5 }}
          >
            <h3 className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{text.remainingToday}</h3>
            <div className="flex items-baseline">
              <span className={`text-4xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                {(remaining / 1000).toFixed(1)}
              </span>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ml-2`}>L</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Weekly Record */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <h2 className="text-2xl font-semibold">{text.weeklyProgress}</h2>
          </div>
          <div className="grid grid-cols-7 gap-6">
            {weekData.map((day, index) => {
              const pct = Math.round((day.total / day.goal) * 100);
              const heightPct = Math.min(pct, 100);
              const achieved = day.total >= day.goal;
              const label = day.date.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <motion.div
                  key={day.date.toISOString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex flex-col items-center"
                >
                  {/* Mini bottle */}
                  <div className="relative mb-3">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-b-sm bg-blue-500 border-2 border-blue-400" />
                    <div className="w-12 h-40 border-2 border-blue-400 rounded-b-2xl rounded-t-md overflow-hidden bg-gradient-to-b from-white to-blue-50 relative">
                      <motion.div
                        className="absolute bottom-0 left-0 w-full"
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        <div className="h-full w-full bg-gradient-to-t from-blue-500 to-blue-300" />
                        <div className="absolute -top-[2px] left-0 w-full h-[2px] bg-blue-200/70" />
                      </motion.div>
                    </div>
                  </div>
                  {/* Day label */}
                  <div className="text-sm text-gray-600 mb-1">{label}</div>
                  <div className="text-green-600 text-sm font-semibold">{Math.round(day.total)}ml</div>
                  <div className="text-gray-500 text-sm">{pct}%</div>
                  <div className="mt-2 h-5">
                    {achieved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Water Log */}
        <motion.div
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 shadow-lg`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{text.todayLog}</h2>
          <AnimatePresence>
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border ${isDark ? 'border-gray-700' : 'border-gray-100'} rounded-lg flex items-center justify-between
                           hover:shadow-md transition-shadow backdrop-blur-sm`}
                >
                  <div className="flex-1">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{entry.amount}ml</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {entry.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <motion.button
                    onClick={async () => {
                      try {
                        // Optimistic UI update
                        const newEntries = entries.filter(e => e.id !== entry.id);
                        setEntries(newEntries);
                        const optimisticTotal = newEntries.reduce((sum, e) => sum + e.amount, 0);
                        updateWeekTodayLocal(optimisticTotal);
                        
                        // Delete from Firebase
                        if (log) {
                          await deleteWaterEntry(log.id, entry.id);
                        }
                        
                        // Refresh weekly data
                        if (user) {
                          await refreshWeekly(user.id, optimisticTotal);
                        }
                      } catch (e) {
                        console.error('Failed to delete water entry:', e);
                        setError('Failed to delete water entry');
                        // Revert optimistic update on error
                        setEntries(entries);
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
                        : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={text.remove}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>

      </motion.div>

      {/* SVG Filters */}
      <svg className="hidden">
        <defs>
          <filter id="water">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            <feColorMatrix
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -10"
            />
          </filter>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 w-96 shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-4">{text.settings}</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{text.dailyGoal} (L)</label>
                <input
                  type="number"
                  value={dailyGoal / 1000}
                  onChange={(e) => updateDailyGoalLocal(parseFloat(e.target.value) * 1000)}
                  className="w-full p-2 border rounded-lg"
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="flex justify-end">
                <motion.button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {text.close}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Amount Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 w-[32rem] shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-6">{text.addWater}</h3>
              
              {/* Preset Water Amounts */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button
                  onClick={() => {
                    addWater(250);
                    setShowCustomModal(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                    isDark ? 'border-blue-800 hover:border-blue-700 hover:bg-blue-900/30' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mb-2">
                    <svg width="50" height="65" viewBox="0 0 60 80" className={isDark ? 'text-blue-400' : 'text-blue-500'}>
                      <path
                        d="M12 16 L12 56 Q12 60 15 60 L25 60 Q28 60 28 56 L28 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 40 Q12 42 15 42 L25 42 Q28 42 28 40"
                        fill="currentColor"
                        fillOpacity="0.3"
                      />
                      <line x1="12" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path
                        d="M28 24 Q36 24 36 32 Q36 40 28 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{text.smallGlass}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>250ml</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    addWater(500);
                    setShowCustomModal(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                    isDark ? 'border-blue-800 hover:border-blue-700 hover:bg-blue-900/30' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mb-2">
                    <svg width="55" height="75" viewBox="0 0 70 95" className={isDark ? 'text-blue-400' : 'text-blue-500'}>
                      <path
                        d="M14 16 L14 64 Q14 68 18 68 L30 68 Q34 68 34 64 L34 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14 44 Q14 48 18 48 L30 48 Q34 48 34 44"
                        fill="currentColor"
                        fillOpacity="0.3"
                      />
                      <line x1="14" y1="16" x2="34" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path
                        d="M34 24 Q44 24 44 34 Q44 44 34 44"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{text.mediumGlass}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>500ml</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    addWater(1000);
                    setShowCustomModal(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                    isDark ? 'border-blue-800 hover:border-blue-700 hover:bg-blue-900/30' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mb-2">
                    <svg width="40" height="80" viewBox="0 0 50 100" className={isDark ? 'text-blue-400' : 'text-blue-500'}>
                      <rect x="18" y="4" width="8" height="6" rx="1" fill="currentColor" />
                      <rect x="20" y="10" width="4" height="10" fill="currentColor" />
                      <path
                        d="M12 20 L12 68 Q12 72 16 72 L24 72 Q28 72 28 68 L28 20 Q28 16 24 16 L16 16 Q12 16 12 20 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <rect x="12" y="40" width="16" height="28" fill="currentColor" fillOpacity="0.3" rx="3" />
                      <rect x="15" y="28" width="10" height="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5,1.5" opacity="0.5" />
                    </svg>
                  </div>
                  <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{text.bottle}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>1000ml</span>
                </motion.button>

                {/* Custom Amount Section */}
                <div className="flex flex-col p-4 border border-blue-200 rounded-xl">
                  <span className="text-blue-500 font-medium mb-2">{text.customAmount}</span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full p-2 pr-20 border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                      placeholder={text.amountInMl}
                    />
                    <motion.button
                      onClick={handleCustomAmount}
                      className="absolute right-1 px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!customAmount}
                    >
                      {text.add}
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <motion.button
                  onClick={() => setShowCustomModal(false)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {text.cancel}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterTracker;