import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Flame
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  targetDays: number; // days per week
  completedDates: string[]; // array of date strings (YYYY-MM-DD)
  streak: number;
  longestStreak: number;
  createdAt: any;
}

const HabitTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health',
    color: 'green',
    targetDays: 7
  });

  const categories = [
    { id: 'health', label: language === 'ar' ? 'صحة' : 'Health', color: 'green' },
    { id: 'fitness', label: language === 'ar' ? 'لياقة' : 'Fitness', color: 'blue' },
    { id: 'productivity', label: language === 'ar' ? 'إنتاجية' : 'Productivity', color: 'purple' },
    { id: 'learning', label: language === 'ar' ? 'تعلم' : 'Learning', color: 'yellow' },
    { id: 'mindfulness', label: language === 'ar' ? 'تأمل' : 'Mindfulness', color: 'pink' },
    { id: 'social', label: language === 'ar' ? 'اجتماعي' : 'Social', color: 'orange' },
    { id: 'other', label: language === 'ar' ? 'أخرى' : 'Other', color: 'gray' }
  ];

  const colorOptions = [
    { id: 'green', class: 'bg-green-500' },
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'yellow', class: 'bg-yellow-500' },
    { id: 'pink', class: 'bg-pink-500' },
    { id: 'orange', class: 'bg-orange-500' },
    { id: 'red', class: 'bg-red-500' },
    { id: 'indigo', class: 'bg-indigo-500' }
  ];

  // Load habits
  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    if (!user) return;
    try {
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(habitsQuery);
      const loadedHabits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
      toast.error(language === 'ar' ? 'فشل تحميل العادات' : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!user || !formData.name.trim()) {
      toast.error(language === 'ar' ? 'الرجاء إدخال اسم العادة' : 'Please enter habit name');
      return;
    }

    try {
      const newHabit = {
        userId: user.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        color: formData.color,
        targetDays: formData.targetDays,
        completedDates: [],
        streak: 0,
        longestStreak: 0,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'habits'), newHabit);
      setHabits([{ id: docRef.id, ...newHabit, createdAt: new Date() }, ...habits]);
      
      setShowAddModal(false);
      resetForm();
      toast.success(language === 'ar' ? 'تمت إضافة العادة بنجاح' : 'Habit added successfully');
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error(language === 'ar' ? 'فشل إضافة العادة' : 'Failed to add habit');
    }
  };

  const handleUpdateHabit = async () => {
    if (!editingHabit || !formData.name.trim()) return;

    try {
      const habitRef = doc(db, 'habits', editingHabit.id);
      await updateDoc(habitRef, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        color: formData.color,
        targetDays: formData.targetDays
      });

      setHabits(habits.map(h => 
        h.id === editingHabit.id 
          ? { ...h, ...formData }
          : h
      ));

      setEditingHabit(null);
      resetForm();
      toast.success(language === 'ar' ? 'تم تحديث العادة بنجاح' : 'Habit updated successfully');
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error(language === 'ar' ? 'فشل تحديث العادة' : 'Failed to update habit');
    }
  };

  const handleDeleteHabit = async () => {
    if (!deletingHabit) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'habits', deletingHabit.id));
      setHabits(habits.filter(h => h.id !== deletingHabit.id));
      toast.success(language === 'ar' ? 'تم حذف العادة بنجاح' : 'Habit deleted successfully');
      setDeletingHabit(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error(language === 'ar' ? 'فشل حذف العادة' : 'Failed to delete habit');
    } finally {
      setDeleting(false);
    }
  };

  const toggleHabitCompletion = async (habit: Habit, date: string) => {
    const isCompleted = habit.completedDates.includes(date);
    let newCompletedDates: string[];
    let newStreak = habit.streak;
    let newLongestStreak = habit.longestStreak;

    if (isCompleted) {
      // Remove completion
      newCompletedDates = habit.completedDates.filter(d => d !== date);
    } else {
      // Add completion
      newCompletedDates = [...habit.completedDates, date].sort();
      
      // Calculate streak
      newStreak = calculateStreak(newCompletedDates);
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
    }

    try {
      const habitRef = doc(db, 'habits', habit.id);
      await updateDoc(habitRef, {
        completedDates: newCompletedDates,
        streak: newStreak,
        longestStreak: newLongestStreak
      });

      setHabits(habits.map(h =>
        h.id === habit.id
          ? { ...h, completedDates: newCompletedDates, streak: newStreak, longestStreak: newLongestStreak }
          : h
      ));
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast.error(language === 'ar' ? 'فشل تحديث العادة' : 'Failed to update habit');
    }
  };

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const sortedDates = [...dates].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today or yesterday is in the list
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (!sortedDates.includes(today) && !sortedDates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'health',
      color: 'green',
      targetDays: 7
    });
    setShowAddModal(false);
    setEditingHabit(null);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      category: habit.category,
      color: habit.color,
      targetDays: habit.targetDays
    });
  };

  // Get last 7 days for the week view
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const today = new Date().toISOString().split('T')[0];

  // Calculate statistics
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-green-500" />
            {language === 'ar' ? 'متتبع العادات' : 'Habit Tracker'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' ? 'تتبع وطور عاداتك اليومية' : 'Track and build your daily habits'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة عادة' : 'Add Habit'}
        </motion.button>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {language === 'ar' ? 'مجموع العادات' : 'Total Habits'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalHabits}</p>
            </div>
            <Target className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {language === 'ar' ? 'مكتمل اليوم' : 'Completed Today'}
              </p>
              <p className="text-3xl font-bold text-green-500 mt-1">{completedToday}/{totalHabits}</p>
            </div>
            <Check className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {language === 'ar' ? 'مجموع السلاسل' : 'Total Streaks'}
              </p>
              <p className="text-3xl font-bold text-orange-500 mt-1">{totalStreak}</p>
            </div>
            <Flame className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {language === 'ar' ? 'أطول سلسلة' : 'Longest Streak'}
              </p>
              <p className="text-3xl font-bold text-purple-500 mt-1">{longestStreak}</p>
            </div>
            <Award className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </motion.div>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg"
        >
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'لا توجد عادات بعد' : 'No habits yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' ? 'ابدأ ببناء عاداتك الإيجابية اليوم!' : 'Start building your positive habits today!'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
          >
            {language === 'ar' ? 'إضافة أول عادة' : 'Add Your First Habit'}
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Habit Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${colorOptions.find(c => c.id === habit.color)?.class} rounded-xl flex items-center justify-center`}>
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {habit.name}
                        </h3>
                        {habit.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {habit.description}
                          </p>
                        )}
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                          {categories.find(c => c.id === habit.category)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(habit)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => setDeletingHabit(habit)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'السلسلة:' : 'Streak:'} <span className="font-bold text-orange-500">{habit.streak}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'الأفضل:' : 'Best:'} <span className="font-bold text-purple-500">{habit.longestStreak}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'الهدف:' : 'Goal:'} <span className="font-bold text-blue-500">{habit.targetDays}/7</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Week View */}
                <div className="lg:w-1/2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {habit.completedDates.filter(d => last7Days.some(day => day.date === d)).length}/{7}
                    </p>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {last7Days.map((day) => {
                      const isCompleted = habit.completedDates.includes(day.date);
                      const isToday = day.date === today;
                      return (
                        <button
                          key={day.date}
                          onClick={() => toggleHabitCompletion(habit, day.date)}
                          className={`aspect-square rounded-lg transition-all ${
                            isCompleted
                              ? `${colorOptions.find(c => c.id === habit.color)?.class} text-white shadow-lg`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } ${isToday ? 'ring-2 ring-offset-2 ring-green-500' : ''} flex flex-col items-center justify-center p-1`}
                        >
                          <span className="text-xs font-medium">{day.dayName}</span>
                          <span className="text-lg font-bold">{day.dayNumber}</span>
                          {isCompleted && <Check className="w-4 h-4 absolute" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingHabit) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingHabit
                    ? (language === 'ar' ? 'تعديل العادة' : 'Edit Habit')
                    : (language === 'ar' ? 'إضافة عادة جديدة' : 'Add New Habit')}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'اسم العادة' : 'Habit Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={language === 'ar' ? 'مثال: شرب 8 أكواب ماء' : 'e.g., Drink 8 glasses of water'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف (اختياري)' : 'Description (Optional)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder={language === 'ar' ? 'تفاصيل إضافية...' : 'Additional details...'}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          formData.category === cat.id
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'اللون' : 'Color'}
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setFormData({ ...formData, color: color.id })}
                        className={`w-10 h-10 ${color.class} rounded-lg transition-all ${
                          formData.color === color.id ? 'ring-4 ring-offset-2 ring-green-500 scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Target Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الهدف الأسبوعي' : 'Weekly Goal'}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={formData.targetDays}
                      onChange={(e) => setFormData({ ...formData, targetDays: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-green-500 w-16 text-center">
                      {formData.targetDays}/7
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={editingHabit ? handleUpdateHabit : handleAddHabit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg"
                  >
                    {editingHabit
                      ? (language === 'ar' ? 'تحديث' : 'Update')
                      : (language === 'ar' ? 'إضافة' : 'Add')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingHabit}
        onClose={() => setDeletingHabit(null)}
        onConfirm={handleDeleteHabit}
        title={language === 'ar' ? 'حذف العادة' : 'Delete Habit'}
        message={language === 'ar' 
          ? `هل أنت متأكد من حذف عادة "${deletingHabit?.name}"؟ سيتم حذف جميع البيانات المرتبطة بها ولا يمكن التراجع عن هذا الإجراء.`
          : `Are you sure you want to delete the habit "${deletingHabit?.name}"? All associated data will be deleted and this action cannot be undone.`}
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default HabitTrackerPage;

