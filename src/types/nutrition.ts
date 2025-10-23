export interface Nutrient {
  amount: number;
  unit: string;
  percentOfDailyNeeds: number;
}

export interface Macronutrient extends Nutrient {
  calories: number;
}

export interface NutritionInfo {
  calories: number;
  protein: Macronutrient;
  carbs: Macronutrient;
  fat: Macronutrient;
  fiber: Nutrient;
  sugar: Nutrient;
  sodium: Nutrient;
  vitamins?: { [key: string]: Nutrient };
  minerals?: { [key: string]: Nutrient };
}

export interface MealItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: {
    amount: number;
    unit: string;
  };
  nutrition: NutritionInfo;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  items: FoodItem[];
  totalNutrition: NutritionInfo;
}

export interface DailyNutritionLog {
  date: string;
  meals: Meal[];
  totalNutrition: NutritionInfo;
  waterIntake: {
    current: number;
    target: number;
    unit: 'ml' | 'L' | 'oz';
  };
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

export interface NutritionPreferences {
  units: 'metric' | 'imperial';
  mealReminders: boolean;
  trackWater: boolean;
  trackMicronutrients: boolean;
}