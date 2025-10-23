import { motion } from 'framer-motion';
import { Apple, ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditMealModal from '../../components/health/EditMealModal';
import MacronutrientBar from '../../components/health/MacronutrientBar';
import MealCard from '../../components/health/MealCard';
import NutritionProgress from '../../components/health/NutritionProgress';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  createDailyNutritionLog, 
  getDailyNutritionLog, 
  getNutritionGoals, 
  addMealToLog, 
  updateMealInLog, 
  deleteMealFromLog, 
  NutritionLogWithId 
} from '../../firebase/nutrition';
import { DailyNutritionLog, Meal, NutritionGoals, NutritionInfo } from '../../types/nutrition';

const NutritionTracker = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const [nutritionLog, setNutritionLog] = useState<NutritionLogWithId | null>(null);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Clear any existing errors
        setError(null);

        // Don't proceed if auth is still loading or there's no user
        if (authLoading || !user) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Get user's nutrition goals
        const userGoals = await getNutritionGoals(user.id);
        if (!isMounted) return;

        // Get today's nutrition log
        const today = new Date().toISOString().split('T')[0];
        const log = await getDailyNutritionLog(user.id, today);
        if (!isMounted) return;

        if (log) {
          setNutritionLog(log);
          setGoals(userGoals);
        } else {
          // Create new log for today
          const newLog: DailyNutritionLog = {
            date: today,
            meals: [],
            totalNutrition: {
              calories: 0,
              protein: { amount: 0, unit: 'g', percentOfDailyNeeds: 0, calories: 0 },
              carbs: { amount: 0, unit: 'g', percentOfDailyNeeds: 0, calories: 0 },
              fat: { amount: 0, unit: 'g', percentOfDailyNeeds: 0, calories: 0 },
              fiber: { amount: 0, unit: 'g', percentOfDailyNeeds: 0 },
              sugar: { amount: 0, unit: 'g', percentOfDailyNeeds: 0 },
              sodium: { amount: 0, unit: 'mg', percentOfDailyNeeds: 0 }
            },
            waterIntake: {
              current: 0,
              target: userGoals.water * 1000,
              unit: 'ml'
            }
          };

          await createDailyNutritionLog(user.id, newLog);
          const createdLog = await getDailyNutritionLog(user.id, today);
          if (createdLog && isMounted) {
            setNutritionLog(createdLog);
            setGoals(userGoals);
          }
        }
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
        if (isMounted) {
          setError('Failed to load nutrition data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const calculateTotalNutrition = (meals: Meal[], currentGoals: NutritionGoals): NutritionInfo => {
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalNutrition.calories,
      protein: acc.protein + meal.totalNutrition.protein.amount,
      carbs: acc.carbs + meal.totalNutrition.carbs.amount,
      fat: acc.fat + meal.totalNutrition.fat.amount
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      calories: totals.calories,
      protein: {
        amount: totals.protein,
        unit: 'g',
        percentOfDailyNeeds: (totals.protein / currentGoals.protein) * 100,
        calories: totals.protein * 4
      },
      carbs: {
        amount: totals.carbs,
        unit: 'g',
        percentOfDailyNeeds: (totals.carbs / currentGoals.carbs) * 100,
        calories: totals.carbs * 4
      },
      fat: {
        amount: totals.fat,
        unit: 'g',
        percentOfDailyNeeds: (totals.fat / currentGoals.fat) * 100,
        calories: totals.fat * 9
      },
      fiber: { amount: 0, unit: 'g', percentOfDailyNeeds: 0 },
      sugar: { amount: 0, unit: 'g', percentOfDailyNeeds: 0 },
      sodium: { amount: 0, unit: 'mg', percentOfDailyNeeds: 0 }
    };
  };

  const handleEditMeal = async (editedMeal: Meal) => {
    try {
      if (!nutritionLog || !goals) return;
      const updatedMeals = nutritionLog.meals.map(meal => 
        meal.id === editedMeal.id ? editedMeal : meal
      );
      const newTotals = calculateTotalNutrition(updatedMeals, goals);
      await updateMealInLog(nutritionLog.id, editedMeal, newTotals);
      setNutritionLog(prev => prev ? ({ ...prev, meals: updatedMeals, totalNutrition: newTotals }) : prev);
    } catch (e) {
      console.error('Failed to update meal:', e);
    }
  };

  const handleDeleteMeal = async (mealToDelete: Meal) => {
    try {
      if (!nutritionLog || !goals) return;
      const updatedMeals = nutritionLog.meals.filter(meal => meal.id !== mealToDelete.id);
      const newTotals = calculateTotalNutrition(updatedMeals, goals);
      await deleteMealFromLog(nutritionLog.id, mealToDelete.id, newTotals);
      setNutritionLog(prev => prev ? ({ ...prev, meals: updatedMeals, totalNutrition: newTotals }) : prev);
    } catch (e) {
      console.error('Failed to delete meal:', e);
    }
  };

  const handleAddMeal = async (newMeal: Meal) => {
    try {
      if (!nutritionLog || !goals) return;
      const updatedMeals = [...nutritionLog.meals, newMeal];
      const newTotals = calculateTotalNutrition(updatedMeals, goals);
      await addMealToLog(nutritionLog.id, newMeal, newTotals);
      setNutritionLog(prev => prev ? ({ ...prev, meals: updatedMeals, totalNutrition: newTotals }) : prev);
    } catch (e) {
      console.error('Failed to add meal:', e);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-6">
        <div className="text-center py-12 space-y-2">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // Handle not signed in state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">
            {language === 'ar' 
              ? 'يرجى تسجيل الدخول لعرض بيانات التغذية الخاصة بك'
              : 'Please sign in to view your nutrition data.'
            }
          </p>
        </div>
      </div>
    );
  }

  // Handle data loading error state
  if (!nutritionLog || !goals) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-6">
        <div className="text-center py-12 space-y-2">
          <p className="text-gray-500">
            {language === 'ar'
              ? 'تعذر تحميل بيانات التغذية. يرجى المحاولة مرة أخرى لاحقاً'
              : 'Unable to load nutrition data. Please try again later.'
            }
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // Main content with type assertions
  const log = nutritionLog as DailyNutritionLog;
  const userGoals = goals as NutritionGoals;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-green-50 to-emerald-50'} p-3 sm:p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Back Button and Title */}
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/health')}
            className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">
              {language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
            </span>
          </motion.button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8"
          >
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-2 sm:p-3 rounded-full bg-emerald-100"
            >
              <Apple className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
            </motion.div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'متابعة التغذية' : 'Nutrition Tracking'}
            </h1>
          </motion.div>

          {/* Progress Section */}
          <div className="mb-8">
            <NutritionProgress
              caloriesConsumed={log.totalNutrition.calories}
              calorieGoal={userGoals.calories}
              meals={log.meals.map(meal => ({
                type: meal.type,
                calories: meal.totalNutrition.calories
              }))}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Calories Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.03 }}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 sm:mb-2 text-sm sm:text-base`}>
                {language === 'ar' ? 'السعرات الحرارية اليومية' : 'Daily Calories'}
              </h3>
              <div className="flex items-baseline">
                <motion.span 
                  className="text-2xl sm:text-4xl font-bold text-emerald-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  {log.totalNutrition.calories}
                </motion.span>
                <span className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-2`}>/ {userGoals.calories} {language === 'ar' ? 'سعر حراري' : 'kcal'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <motion.div 
                  className="bg-emerald-500 rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((log.totalNutrition.calories / userGoals.calories) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
            
            {/* Protein Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <h3 className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{language === 'ar' ? 'البروتين' : 'Protein'}</h3>
              <div className="flex items-baseline">
                <motion.span 
                  className="text-4xl font-bold text-emerald-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                >
                  {log.totalNutrition.protein.amount}
                </motion.span>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ml-2`}>/ {userGoals.protein}g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <motion.div 
                  className="bg-emerald-500 rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((log.totalNutrition.protein.amount / userGoals.protein) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </div>

          {/* Macronutrients Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-6`}
          >
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'ar' ? 'المغذيات الكبرى' : 'Macronutrients'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <MacronutrientBar
                label={language === 'ar' ? 'البروتين' : 'Protein'}
                percentage={log.totalNutrition.protein.percentOfDailyNeeds}
                color="bg-blue-400"
                calories={log.totalNutrition.protein.calories}
              />
              <MacronutrientBar
                label={language === 'ar' ? 'الكربوهيدرات' : 'Carbs'}
                percentage={log.totalNutrition.carbs.percentOfDailyNeeds}
                color="bg-green-400"
                calories={log.totalNutrition.carbs.calories}
              />
              <MacronutrientBar
                label={language === 'ar' ? 'الدهون' : 'Fat'}
                percentage={log.totalNutrition.fat.percentOfDailyNeeds}
                color="bg-yellow-400"
                calories={log.totalNutrition.fat.calories}
              />
            </div>
          </motion.div>

          {/* Meal Log Section */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 sm:p-8 shadow-sm`}>
            <h2 className={`text-lg sm:text-2xl font-semibold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'ar' ? 'سجل التغذية اليومي' : "Today's Nutrition Log"}
            </h2>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              {log.meals.map((meal) => (
                <MealCard 
                  key={meal.id} 
                  meal={meal}
                  onEdit={(meal) => {
                    setSelectedMeal(meal);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={handleDeleteMeal}
                />
              ))}
            </motion.div>

            {/* Add Meal Button */}
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedMeal(undefined);
                setIsEditModalOpen(true);
              }}
              className="mt-6 w-full bg-emerald-500 text-white py-3 px-4 rounded-lg 
                       hover:bg-emerald-600 transition-all duration-200 flex items-center
                       justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              {language === 'ar' ? 'إضافة وجبة' : 'Add Meal'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditMealModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMeal(undefined);
        }}
        meal={selectedMeal}
        onSave={(meal) => {
          if (selectedMeal) {
            handleEditMeal(meal);
          } else {
            handleAddMeal(meal);
          }
          setIsEditModalOpen(false);
          setSelectedMeal(undefined);
        }}
      />
    </div>
  );
};

export default NutritionTracker;