import { AnimatePresence, motion } from 'framer-motion';
import {
    Archive,
    Bell,
    Calendar,
    CheckCircle2,
    Clock,
    Copy,
    Edit3,
    Eye,
    EyeOff,
    Grid3X3,
    List,
    MoreHorizontal,
    Plus,
    Search,
    SortAsc,
    SortDesc,
    Star,
    Target,
    Trash2,
    TrendingUp,
    X,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CreateTodoData, Todo as FirebaseTodo } from '../firebase/todos';
import { useTodos } from '../hooks/useTodos';

// Use Firebase Todo interface
type Todo = FirebaseTodo & {
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  attachments?: string[];
  collaborators?: string[];
  reminders?: Reminder[];
  notes?: string;
  isArchived?: boolean;
  isFavorite?: boolean;
  xpReward?: number;
  streak?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
};

interface Reminder {
  id: string;
  datetime: string;
  message: string;
  sent: boolean;
}

const TodoListPage: React.FC = () => {
  const { language } = useLanguage();
  const { addXP, completeTask } = useGame();
  const { user } = useAuth();
  
  // Firebase hooks
  const {
    todos: firebaseTodos,
    categories: firebaseCategories,
    loading,
    error,
    stats: firebaseStats,
    addTodo,
    editTodo,
    removeTodo,
    toggleComplete,
    addTodoSubtask,
    toggleSubtaskComplete,
    removeSubtask,
    addCategory,
    removeCategory,
    clearCompleted,
    markAllComplete
  } = useTodos(user?.id);
  
  // Local state management
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created' | 'alphabetical'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [newTodo, setNewTodo] = useState<CreateTodoData & { estimatedTime: number; difficulty: 'easy' | 'medium' | 'hard' }>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    tags: [],
    dueDate: undefined,
    estimatedTime: 30,
    difficulty: 'medium'
  });

  // Edit form state
  const [editTodoForm, setEditTodoForm] = useState<CreateTodoData & { estimatedTime: number; difficulty: 'easy' | 'medium' | 'hard' }>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    tags: [],
    dueDate: undefined,
    estimatedTime: 30,
    difficulty: 'medium'
  });

  // Categories - combine default categories with Firebase categories
  const defaultCategories = [
    { id: 'all', name: language === 'ar' ? 'جميع المهام' : 'All Tasks', color: 'gray' },
    { id: 'work', name: language === 'ar' ? 'العمل' : 'Work', color: 'blue' },
    { id: 'personal', name: language === 'ar' ? 'شخصي' : 'Personal', color: 'green' },
    { id: 'health', name: language === 'ar' ? 'الصحة' : 'Health', color: 'red' },
    { id: 'learning', name: language === 'ar' ? 'التعلم' : 'Learning', color: 'purple' },
    { id: 'spiritual', name: language === 'ar' ? 'روحاني' : 'Spiritual', color: 'teal' },
    { id: 'social', name: language === 'ar' ? 'اجتماعي' : 'Social', color: 'pink' },
    { id: 'finance', name: language === 'ar' ? 'المالية' : 'Finance', color: 'yellow' },
    { id: 'hobbies', name: language === 'ar' ? 'الهوايات' : 'Hobbies', color: 'orange' }
  ];

  const categories = [
    ...defaultCategories,
    ...firebaseCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color
    }))
  ];

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  };

  const difficultyXP = {
    easy: 10,
    medium: 25,
    hard: 50
  };

  // Sync Firebase todos with local state
  useEffect(() => {
    const todosWithDefaults: Todo[] = firebaseTodos.map(todo => ({
      ...todo,
      estimatedTime: 30,
      actualTime: 0,
      attachments: [],
      collaborators: [],
      reminders: [],
      notes: '',
      isArchived: false,
      isFavorite: false,
      xpReward: todo.priority === 'high' ? 50 : todo.priority === 'medium' ? 25 : 10,
      streak: 0,
      difficulty: 'medium' as const
    }));
    setTodos(todosWithDefaults);
  }, [firebaseTodos]);

  // Populate edit form when todo is selected
  useEffect(() => {
    if (selectedTodo) {
      setEditTodoForm({
        title: selectedTodo.title,
        description: selectedTodo.description || '',
        priority: selectedTodo.priority,
        category: selectedTodo.category,
        tags: selectedTodo.tags || [],
        dueDate: selectedTodo.dueDate,
        estimatedTime: selectedTodo.estimatedTime || 30,
        difficulty: selectedTodo.difficulty || 'medium'
      });
    }
  }, [selectedTodo]);

  // Create default categories if none exist
  useEffect(() => {
    if (user?.id && firebaseCategories.length === 0) {
      const createDefaultCategories = async () => {
        try {
          const defaultCats = [
            { name: language === 'ar' ? 'العمل' : 'Work', color: 'blue' },
            { name: language === 'ar' ? 'شخصي' : 'Personal', color: 'green' },
            { name: language === 'ar' ? 'الصحة' : 'Health', color: 'red' },
            { name: language === 'ar' ? 'التعلم' : 'Learning', color: 'purple' }
          ];

          for (const cat of defaultCats) {
            await addCategory(cat.name, cat.color);
          }
        } catch (error) {
          console.error('Error creating default categories:', error);
        }
      };

      // Only create if we have loaded categories and there are none
      if (firebaseCategories.length === 0) {
        createDefaultCategories();
      }
    }
  }, [user?.id, firebaseCategories.length, language, addCategory]);

  // Filter and search logic
  useEffect(() => {
    let filtered = todos.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || todo.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || todo.priority === selectedPriority;
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'completed' && todo.completed) ||
                           (selectedStatus === 'pending' && !todo.completed) ||
                           (selectedStatus === 'overdue' && !todo.completed && todo.dueDate && todo.dueDate < new Date());
      
      const matchesVisibility = showCompleted || !todo.completed;
      const notArchived = !todo.isArchived;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesVisibility && notArchived;
    });

    // Sort logic
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          const dateA = a.dueDate ? a.dueDate.getTime() : Infinity;
          const dateB = b.dueDate ? b.dueDate.getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'created':
          comparison = b.createdAt.getTime() - a.createdAt.getTime();
          break;
        case 'alphabetical':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredTodos(filtered);
  }, [todos, searchTerm, selectedCategory, selectedPriority, selectedStatus, showCompleted, sortBy, sortOrder]);

  // Todo operations
  const createTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال عنوان المهمة' : 'Please enter task title');
      return;
    }

    try {
      const todoData: CreateTodoData = {
        title: newTodo.title,
        description: newTodo.description,
        priority: newTodo.priority,
        category: newTodo.category || 'personal',
        tags: newTodo.tags,
        dueDate: newTodo.dueDate
      };

      await addTodo(todoData);
      
      setNewTodo({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        tags: [],
        dueDate: undefined,
        estimatedTime: 30,
        difficulty: 'medium'
      });
      setShowCreateModal(false);
      toast.success(language === 'ar' ? 'تم إنشاء المهمة بنجاح' : 'Task created successfully');
    } catch (error) {
      console.error('Error creating todo:', error);
      toast.error(language === 'ar' ? 'خطأ في إنشاء المهمة' : 'Error creating task');
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      await toggleComplete(id, !todo.completed);
      
      if (!todo.completed) {
        // Task completed
        const xpReward = todo.xpReward || 25;
        await addXP(xpReward, `Completed: ${todo.title}`);
        await completeTask();
        toast.success(language === 'ar' ? `تم إنجاز المهمة! +${xpReward} XP` : `Task completed! +${xpReward} XP`);
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error(language === 'ar' ? 'خطأ في تحديث المهمة' : 'Error updating task');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await removeTodo(id);
      toast.success(language === 'ar' ? 'تم حذف المهمة' : 'Task deleted');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error(language === 'ar' ? 'خطأ في حذف المهمة' : 'Error deleting task');
    }
  };

  const toggleFavorite = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      // For now, we'll just show a message since favorites aren't in Firebase schema
      toast.info(language === 'ar' ? 'ميزة المفضلة قريباً' : 'Favorites feature coming soon');
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const archiveTodo = async (id: string) => {
    try {
      // For now, we'll just delete the todo since archive isn't in Firebase schema
      await removeTodo(id);
      toast.success(language === 'ar' ? 'تم أرشفة المهمة' : 'Task archived');
    } catch (error) {
      console.error('Error archiving todo:', error);
      toast.error(language === 'ar' ? 'خطأ في أرشفة المهمة' : 'Error archiving task');
    }
  };

  const duplicateTodo = async (id: string) => {
    const originalTodo = todos.find(todo => todo.id === id);
    if (!originalTodo) return;

    try {
      const duplicatedTodoData: CreateTodoData = {
        title: `${originalTodo.title} (Copy)`,
        description: originalTodo.description,
        priority: originalTodo.priority,
        category: originalTodo.category,
        tags: originalTodo.tags || [],
        dueDate: originalTodo.dueDate
      };

      await addTodo(duplicatedTodoData);
      toast.success(language === 'ar' ? 'تم نسخ المهمة' : 'Task duplicated');
    } catch (error) {
      console.error('Error duplicating todo:', error);
      toast.error(language === 'ar' ? 'خطأ في نسخ المهمة' : 'Error duplicating task');
    }
  };

  const saveEditedTodo = async () => {
    if (!selectedTodo) return;
    
    if (!editTodoForm.title.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال عنوان المهمة' : 'Please enter task title');
      return;
    }

    try {
      const updateData = {
        title: editTodoForm.title,
        description: editTodoForm.description,
        priority: editTodoForm.priority,
        category: editTodoForm.category,
        tags: editTodoForm.tags,
        dueDate: editTodoForm.dueDate
      };

      await editTodo(selectedTodo.id, updateData);
      setShowEditModal(false);
      setSelectedTodo(null);
      toast.success(language === 'ar' ? 'تم تحديث المهمة بنجاح' : 'Task updated successfully');
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error(language === 'ar' ? 'خطأ في تحديث المهمة' : 'Error updating task');
    }
  };

  // Statistics - use Firebase stats or fallback to local calculation
  const stats = firebaseStats || {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => !t.completed && t.dueDate && t.dueDate < new Date()).length,
    byPriority: { high: 0, medium: 0, low: 0 },
    byCategory: {},
    completionRate: todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0
  };

  const getDaysUntilDue = (dueDate: Date | undefined) => {
    if (!dueDate) return null;
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDueDate = (dueDate: Date | undefined) => {
    if (!dueDate) return '';
    const days = getDaysUntilDue(dueDate);
    if (days === null) return '';
    
    if (days < 0) return language === 'ar' ? `متأخر ${Math.abs(days)} يوم` : `${Math.abs(days)} days overdue`;
    if (days === 0) return language === 'ar' ? 'اليوم' : 'Today';
    if (days === 1) return language === 'ar' ? 'غداً' : 'Tomorrow';
    return language === 'ar' ? `خلال ${days} يوم` : `In ${days} days`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            {language === 'ar' ? 'خطأ في تحميل المهام' : 'Error loading tasks'}
          </p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'قائمة المهام' : 'To Do List'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ar' ? 'نظم مهامك واحصل على نقاط XP عند إنجازها' : 'Organize your tasks and earn XP when you complete them'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>{language === 'ar' ? 'مهمة جديدة' : 'New Task'}</span>
        </button>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'مكتملة' : 'Completed'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
              </p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'متأخرة' : 'Overdue'}
              </p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <Bell className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}
              </p>
              <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'البحث في المهام...' : 'Search tasks...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{language === 'ar' ? 'جميع الأولويات' : 'All Priorities'}</option>
            <option value="urgent">{language === 'ar' ? 'عاجل' : 'Urgent'}</option>
            <option value="high">{language === 'ar' ? 'عالي' : 'High'}</option>
            <option value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</option>
            <option value="low">{language === 'ar' ? 'منخفض' : 'Low'}</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="dueDate">{language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</option>
              <option value="priority">{language === 'ar' ? 'الأولوية' : 'Priority'}</option>
              <option value="created">{language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</option>
              <option value="alphabetical">{language === 'ar' ? 'أبجدي' : 'Alphabetical'}</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>

          {/* Show Completed Toggle */}
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {showCompleted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-sm">{language === 'ar' ? 'المكتملة' : 'Completed'}</span>
          </button>
        </div>
      </motion.div>

      {/* Tasks List/Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        <AnimatePresence>
          {filteredTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all ${
                todo.completed ? 'opacity-75' : ''
              } ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  todo.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                }`}
              >
                {todo.completed && <CheckCircle2 className="w-4 h-4" />}
              </button>

              {/* Content */}
              <div className={`flex-1 ${viewMode === 'grid' ? 'mt-4' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-semibold text-gray-900 dark:text-white ${
                    todo.completed ? 'line-through' : ''
                  }`}>
                    {todo.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFavorite(todo.id)}
                      className={`p-1 rounded transition-colors ${
                        todo.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => {setSelectedTodo(todo); setShowEditModal(true);}}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => duplicateTodo(todo.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>{language === 'ar' ? 'نسخ' : 'Duplicate'}</span>
                        </button>
                        <button
                          onClick={() => archiveTodo(todo.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                        >
                          <Archive className="w-4 h-4" />
                          <span>{language === 'ar' ? 'أرشفة' : 'Archive'}</span>
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {todo.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {todo.description}
                  </p>
                )}

                {/* Tags */}
                {todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {todo.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Subtasks Progress */}
                {todo.subtasks.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>{language === 'ar' ? 'المهام الفرعية' : 'Subtasks'}</span>
                      <span>
                        {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${todo.subtasks.length > 0 ? (todo.subtasks.filter(s => s.completed).length / todo.subtasks.length) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    {/* Priority */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[todo.priority]}`}>
                      {language === 'ar' ? 
                        (todo.priority === 'urgent' ? 'عاجل' : 
                         todo.priority === 'high' ? 'عالي' : 
                         todo.priority === 'medium' ? 'متوسط' : 'منخفض') :
                        todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)
                      }
                    </span>

                    {/* Category */}
                    <span className="text-gray-500 dark:text-gray-400">
                      {categories.find(c => c.id === todo.category)?.name || todo.category}
                    </span>

                    {/* XP Reward */}
                    <div className="flex items-center space-x-1 text-green-600">
                      <Zap className="w-3 h-3" />
                      <span>{todo.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Due Date */}
                  {todo.dueDate && (
                    <div className={`flex items-center space-x-1 ${
                      getDaysUntilDue(todo.dueDate) !== null && getDaysUntilDue(todo.dueDate)! < 0 
                        ? 'text-red-600' 
                        : getDaysUntilDue(todo.dueDate) === 0 
                        ? 'text-orange-600' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      <span>{formatDueDate(todo.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTodos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'لا توجد مهام' : 'No tasks found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {language === 'ar' ? 'ابدأ بإنشاء مهمة جديدة أو جرب تغيير الفلاتر' : 'Start by creating a new task or try changing the filters'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {language === 'ar' ? 'إنشاء مهمة جديدة' : 'Create New Task'}
          </button>
        </motion.div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {language === 'ar' ? 'إنشاء مهمة جديدة' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'عنوان المهمة' : 'Task Title'} *
                </label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل عنوان المهمة...' : 'Enter task title...'}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل وصف المهمة...' : 'Enter task description...'}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
                  rows={3}
                />
              </div>

              {/* Priority and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Todo['priority'] })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">{language === 'ar' ? 'منخفض' : 'Low'}</option>
                    <option value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</option>
                    <option value="high">{language === 'ar' ? 'عالي' : 'High'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={newTodo.dueDate ? newTodo.dueDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewTodo({ 
                      ...newTodo, 
                      dueDate: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الصعوبة' : 'Difficulty'}
                  </label>
                  <select
                    value={newTodo.difficulty}
                    onChange={(e) => setNewTodo({ ...newTodo, difficulty: e.target.value as Todo['difficulty'] })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="easy">{language === 'ar' ? 'سهل (10 XP)' : 'Easy (10 XP)'}</option>
                    <option value="medium">{language === 'ar' ? 'متوسط (25 XP)' : 'Medium (25 XP)'}</option>
                    <option value="hard">{language === 'ar' ? 'صعب (50 XP)' : 'Hard (50 XP)'}</option>
                  </select>
                </div>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الوقت المقدر (بالدقائق)' : 'Estimated Time (minutes)'}
                </label>
                <input
                  type="number"
                  value={newTodo.estimatedTime}
                  onChange={(e) => setNewTodo({ ...newTodo, estimatedTime: parseInt(e.target.value) || 30 })}
                  min="5"
                  max="480"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={createTodo}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {language === 'ar' ? 'إنشاء المهمة' : 'Create Task'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {language === 'ar' ? 'تعديل المهمة' : 'Edit Task'}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTodo(null);
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'عنوان المهمة' : 'Task Title'} *
                </label>
                <input
                  type="text"
                  value={editTodoForm.title}
                  onChange={(e) => setEditTodoForm({ ...editTodoForm, title: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل عنوان المهمة...' : 'Enter task title...'}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  value={editTodoForm.description}
                  onChange={(e) => setEditTodoForm({ ...editTodoForm, description: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل وصف المهمة...' : 'Enter task description...'}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
                  rows={3}
                />
              </div>

              {/* Priority and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={editTodoForm.priority}
                    onChange={(e) => setEditTodoForm({ ...editTodoForm, priority: e.target.value as Todo['priority'] })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">{language === 'ar' ? 'منخفض' : 'Low'}</option>
                    <option value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</option>
                    <option value="high">{language === 'ar' ? 'عالي' : 'High'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    value={editTodoForm.category}
                    onChange={(e) => setEditTodoForm({ ...editTodoForm, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={editTodoForm.dueDate ? editTodoForm.dueDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditTodoForm({ 
                      ...editTodoForm, 
                      dueDate: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الصعوبة' : 'Difficulty'}
                  </label>
                  <select
                    value={editTodoForm.difficulty}
                    onChange={(e) => setEditTodoForm({ ...editTodoForm, difficulty: e.target.value as Todo['difficulty'] })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="easy">{language === 'ar' ? 'سهل (10 XP)' : 'Easy (10 XP)'}</option>
                    <option value="medium">{language === 'ar' ? 'متوسط (25 XP)' : 'Medium (25 XP)'}</option>
                    <option value="hard">{language === 'ar' ? 'صعب (50 XP)' : 'Hard (50 XP)'}</option>
                  </select>
                </div>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الوقت المقدر (بالدقائق)' : 'Estimated Time (minutes)'}
                </label>
                <input
                  type="number"
                  value={editTodoForm.estimatedTime}
                  onChange={(e) => setEditTodoForm({ ...editTodoForm, estimatedTime: parseInt(e.target.value) || 30 })}
                  min="5"
                  max="480"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTodo(null);
                }}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={saveEditedTodo}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TodoListPage;