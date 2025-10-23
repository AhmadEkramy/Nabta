import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Meal, MealItem, NutritionInfo } from '../../types/nutrition';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Meal) => void;
  meal?: Meal;
}

const EditMealModal: React.FC<EditMealModalProps> = ({ isOpen, onClose, onSave, meal }) => {
  const { isDark } = useTheme();
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(meal?.type || 'breakfast');
  const [time, setTime] = useState(meal?.time || '');
  const [items, setItems] = useState<MealItem[]>(meal?.items || [{ id: Date.now(), name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);

  useEffect(() => {
    if (meal) {
      setMealType(meal.type);
      setTime(meal.time);
      setItems(meal.items);
    } else if (isOpen) {
      // Reset form when opening a new meal
      setMealType('breakfast');
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      setItems([{ id: Date.now(), name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
    }
  }, [meal, isOpen]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: number, field: keyof MealItem, value: string | number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    const totalNutrition: NutritionInfo = {
      calories: items.reduce((sum, item) => sum + Number(item.calories), 0),
      protein: {
        amount: items.reduce((sum, item) => sum + Number(item.protein), 0),
        unit: 'g',
        percentOfDailyNeeds: 0,
        calories: items.reduce((sum, item) => sum + Number(item.protein), 0) * 4
      },
      carbs: {
        amount: items.reduce((sum, item) => sum + Number(item.carbs), 0),
        unit: 'g',
        percentOfDailyNeeds: 0,
        calories: items.reduce((sum, item) => sum + Number(item.carbs), 0) * 4
      },
      fat: {
        amount: items.reduce((sum, item) => sum + Number(item.fat), 0),
        unit: 'g',
        percentOfDailyNeeds: 0,
        calories: items.reduce((sum, item) => sum + Number(item.fat), 0) * 9
      },
      fiber: { amount: 0, unit: 'g', percentOfDailyNeeds: 0 },
      sugar: { amount: 0, unit: 'g', percentOfDailyNeeds: 0 },
      sodium: { amount: 0, unit: 'mg', percentOfDailyNeeds: 0 }
    };

    onSave({
      id: (meal?.id || Date.now().toString()),
      type: mealType,
      time,
      items: items.map(item => ({
        id: item.id.toString(),
        name: item.name,
        portion: {
          amount: 1,
          unit: 'serving'
        },
        nutrition: {
          calories: Number(item.calories),
          protein: {
            amount: Number(item.protein),
            unit: 'g',
            percentOfDailyNeeds: 0,
            calories: Number(item.protein) * 4
          },
          carbs: {
            amount: Number(item.carbs),
            unit: 'g',
            percentOfDailyNeeds: 0,
            calories: Number(item.carbs) * 4
          },
          fat: {
            amount: Number(item.fat),
            unit: 'g',
            percentOfDailyNeeds: 0,
            calories: Number(item.fat) * 9
          },
          fiber: { amount: 0, unit: 'g', percentOfDailyNeeds: 0 },
          sugar: { amount: 0, unit: 'g', percentOfDailyNeeds: 0 },
          sodium: { amount: 0, unit: 'mg', percentOfDailyNeeds: 0 }
        }
      })),
      totalNutrition
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`relative w-full h-full sm:h-auto sm:max-w-2xl p-4 sm:p-6 ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white'
        } rounded-lg shadow-xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 pr-8">
          {meal ? 'Edit Meal' : 'Add New Meal'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Type
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
              className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Table Headers */}
        <div className="hidden sm:grid sm:grid-cols-[1fr,80px,80px,80px,80px,40px] gap-4 mb-2 px-2">
          <div className="text-sm font-medium text-gray-500">Food Item</div>
          <div className="text-sm font-medium text-gray-500 text-center">Calories</div>
          <div className="text-sm font-medium text-gray-500 text-center">Protein(g)</div>
          <div className="text-sm font-medium text-gray-500 text-center">Carbs(g)</div>
          <div className="text-sm font-medium text-gray-500 text-center">Fat(g)</div>
          <div></div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:grid sm:grid-cols-[1fr,80px,80px,80px,80px,40px] gap-2 sm:gap-4 items-start bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
              <div className="w-full">
                <label className="block text-xs text-gray-500 mb-1 sm:hidden">Food Item</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                  placeholder="Enter food name"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2 w-full sm:hidden">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Calories</label>
                  <input
                    type="number"
                    value={item.calories}
                    onChange={(e) => handleItemChange(item.id, 'calories', Number(e.target.value))}
                    placeholder="kcal"
                    className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Protein</label>
                  <input
                    type="number"
                    value={item.protein}
                    onChange={(e) => handleItemChange(item.id, 'protein', Number(e.target.value))}
                    placeholder="g"
                    className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Carbs</label>
                  <input
                    type="number"
                    value={item.carbs}
                    onChange={(e) => handleItemChange(item.id, 'carbs', Number(e.target.value))}
                    placeholder="g"
                    className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fat</label>
                  <input
                    type="number"
                    value={item.fat}
                    onChange={(e) => handleItemChange(item.id, 'fat', Number(e.target.value))}
                    placeholder="g"
                    className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center text-sm"
                    min="0"
                  />
                </div>
              </div>

              {/* Desktop view inputs */}
              <div className="hidden sm:block">
                <input
                  type="number"
                  value={item.calories}
                  onChange={(e) => handleItemChange(item.id, 'calories', Number(e.target.value))}
                  placeholder="kcal"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center text-sm"
                  min="0"
                />
              </div>
              <div className="hidden sm:block">
                <input
                  type="number"
                  value={item.protein}
                  onChange={(e) => handleItemChange(item.id, 'protein', Number(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center text-sm"
                  min="0"
                />
              </div>
              <div className="hidden sm:block">
                <input
                  type="number"
                  value={item.carbs}
                  onChange={(e) => handleItemChange(item.id, 'carbs', Number(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center text-sm"
                  min="0"
                />
              </div>
              <div className="hidden sm:block">
                <input
                  type="number"
                  value={item.fat}
                  onChange={(e) => handleItemChange(item.id, 'fat', Number(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center text-sm"
                  min="0"
                />
              </div>

              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute right-2 top-2 sm:static p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Remove item"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            onClick={handleAddItem}
            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            Add Item
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg"
          >
            Save Meal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditMealModal;