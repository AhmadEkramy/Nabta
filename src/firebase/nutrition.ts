import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { DailyNutritionLog, Meal, NutritionGoals } from '../types/nutrition';
import { db } from './config';

const NUTRITION_COLLECTION = 'nutrition';
const NUTRITION_GOALS_COLLECTION = 'nutritionGoals';

export const getNutritionGoals = async (userId: string): Promise<NutritionGoals> => {
  try {
    console.log('Getting nutrition goals for user:', userId);
    const goalsRef = doc(db, NUTRITION_GOALS_COLLECTION, userId);
    const goalsDoc = await getDoc(goalsRef);

    if (!goalsDoc.exists()) {
      console.log('No goals found, creating default goals');
      // Default nutrition goals
      const defaultGoals: NutritionGoals = {
        calories: 2000,
        protein: 50,
        carbs: 275,
        fat: 70,
        fiber: 25,
        water: 2.5 // Liters
      };

      // Create default goals document
      await setDoc(goalsRef, defaultGoals);
      return defaultGoals;
    }

    const data = goalsDoc.data();
    console.log('Retrieved goals data:', data);
    return data as NutritionGoals;
  } catch (error) {
    console.error('Error in getNutritionGoals:', error);
    throw error;
  }
};

export type NutritionLogWithId = DailyNutritionLog & { id: string };

export const getDailyNutritionLog = async (userId: string, date: string): Promise<NutritionLogWithId | null> => {
  try {
    console.log('Getting nutrition log for user:', userId, 'date:', date);
    const nutritionRef = collection(db, NUTRITION_COLLECTION);
    const q = query(
      nutritionRef,
      where('userId', '==', userId),
      where('date', '==', date)
    );

    console.log('Executing query...');
    const querySnapshot = await getDocs(q);
    console.log('Query complete. Empty?', querySnapshot.empty);
    
    if (querySnapshot.empty) {
      console.log('No log found for today');
      return null;
    }

    const logDoc = querySnapshot.docs[0];
    const data = logDoc.data();
    console.log('Retrieved log data:', data);
    return {
      ...data,
      id: logDoc.id
    } as NutritionLogWithId;
  } catch (error) {
    console.error('Error in getDailyNutritionLog:', error);
    throw error;
  }
};

export const createDailyNutritionLog = async (userId: string, log: DailyNutritionLog) => {
  try {
    console.log('Creating new nutrition log for user:', userId);
    const nutritionRef = collection(db, NUTRITION_COLLECTION);
    const newDocRef = doc(nutritionRef);
    
    const logData = {
      ...log,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Saving log data:', logData);
    await setDoc(newDocRef, logData);
    console.log('Log created successfully with ID:', newDocRef.id);
  } catch (error) {
    console.error('Error in createDailyNutritionLog:', error);
    throw error;
  }
};

export const updateDailyNutritionLog = async (logId: string, updates: Partial<DailyNutritionLog>) => {
  const logRef = doc(db, NUTRITION_COLLECTION, logId);
  await updateDoc(logRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const addMealToLog = async (logId: string, meal: Meal, currentTotalNutrition: any) => {
  const logRef = doc(db, NUTRITION_COLLECTION, logId);
  const logDoc = await getDoc(logRef);

  if (!logDoc.exists()) {
    throw new Error('Nutrition log not found');
  }

  const currentLog = logDoc.data() as DailyNutritionLog;
  
  await updateDoc(logRef, {
    meals: [...currentLog.meals, meal],
    totalNutrition: currentTotalNutrition,
    updatedAt: new Date().toISOString()
  });
};

export const updateMealInLog = async (logId: string, updatedMeal: Meal, currentTotalNutrition: any) => {
  const logRef = doc(db, NUTRITION_COLLECTION, logId);
  const logDoc = await getDoc(logRef);

  if (!logDoc.exists()) {
    throw new Error('Nutrition log not found');
  }

  const currentLog = logDoc.data() as DailyNutritionLog;
  const updatedMeals = currentLog.meals.map(meal => 
    meal.id === updatedMeal.id ? updatedMeal : meal
  );

  await updateDoc(logRef, {
    meals: updatedMeals,
    totalNutrition: currentTotalNutrition,
    updatedAt: new Date().toISOString()
  });
};

export const deleteMealFromLog = async (logId: string, mealId: string, currentTotalNutrition: any) => {
  const logRef = doc(db, NUTRITION_COLLECTION, logId);
  const logDoc = await getDoc(logRef);

  if (!logDoc.exists()) {
    throw new Error('Nutrition log not found');
  }

  const currentLog = logDoc.data() as DailyNutritionLog;
  const updatedMeals = currentLog.meals.filter(meal => meal.id !== mealId);

  await updateDoc(logRef, {
    meals: updatedMeals,
    totalNutrition: currentTotalNutrition,
    updatedAt: new Date().toISOString()
  });
};
