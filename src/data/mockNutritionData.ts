import { DailyNutritionLog, NutritionGoals } from '../types/nutrition';

export const mockNutritionGoals: NutritionGoals = {
  calories: 2200,
  protein: 80,
  carbs: 275,
  fat: 73,
  fiber: 28,
  water: 2.5, // Liters
};


export const mockDailyLog: DailyNutritionLog = {
  date: new Date().toISOString(),
  meals: [
    {
      id: '1',
      type: 'breakfast',
      time: '08:00',
      items: [
        {
          id: 'oatmeal1',
          name: 'Oatmeal with Berries',
          portion: {
            amount: 1,
            unit: 'bowl'
          },
          nutrition: {
            calories: 320,
            protein: {
              amount: 12,
              unit: 'g',
              percentOfDailyNeeds: 15,
              calories: 48
            },
            carbs: {
              amount: 58,
              unit: 'g',
              percentOfDailyNeeds: 21,
              calories: 232
            },
            fat: {
              amount: 5,
              unit: 'g',
              percentOfDailyNeeds: 7,
              calories: 45
            },
            fiber: {
              amount: 8,
              unit: 'g',
              percentOfDailyNeeds: 28.5
            },
            sugar: {
              amount: 12,
              unit: 'g',
              percentOfDailyNeeds: 24
            },
            sodium: {
              amount: 180,
              unit: 'mg',
              percentOfDailyNeeds: 7.5
            }
          }
        }
      ],
      totalNutrition: {
        calories: 320,
        protein: {
          amount: 12,
          unit: 'g',
          percentOfDailyNeeds: 15,
          calories: 48
        },
        carbs: {
          amount: 58,
          unit: 'g',
          percentOfDailyNeeds: 21,
          calories: 232
        },
        fat: {
          amount: 5,
          unit: 'g',
          percentOfDailyNeeds: 7,
          calories: 45
        },
        fiber: {
          amount: 8,
          unit: 'g',
          percentOfDailyNeeds: 28.5
        },
        sugar: {
          amount: 12,
          unit: 'g',
          percentOfDailyNeeds: 24
        },
        sodium: {
          amount: 180,
          unit: 'mg',
          percentOfDailyNeeds: 7.5
        }
      }
    },
    {
      id: '2',
      type: 'lunch',
      time: '13:00',
      items: [
        {
          id: 'salad1',
          name: 'Grilled Chicken Salad',
          portion: {
            amount: 1,
            unit: 'serving'
          },
          nutrition: {
            calories: 450,
            protein: {
              amount: 38,
              unit: 'g',
              percentOfDailyNeeds: 47.5,
              calories: 152
            },
            carbs: {
              amount: 25,
              unit: 'g',
              percentOfDailyNeeds: 9,
              calories: 100
            },
            fat: {
              amount: 22,
              unit: 'g',
              percentOfDailyNeeds: 30,
              calories: 198
            },
            fiber: {
              amount: 6,
              unit: 'g',
              percentOfDailyNeeds: 21.4
            },
            sugar: {
              amount: 4,
              unit: 'g',
              percentOfDailyNeeds: 8
            },
            sodium: {
              amount: 620,
              unit: 'mg',
              percentOfDailyNeeds: 25.8
            }
          }
        }
      ],
      totalNutrition: {
        calories: 450,
        protein: {
          amount: 38,
          unit: 'g',
          percentOfDailyNeeds: 47.5,
          calories: 152
        },
        carbs: {
          amount: 25,
          unit: 'g',
          percentOfDailyNeeds: 9,
          calories: 100
        },
        fat: {
          amount: 22,
          unit: 'g',
          percentOfDailyNeeds: 30,
          calories: 198
        },
        fiber: {
          amount: 6,
          unit: 'g',
          percentOfDailyNeeds: 21.4
        },
        sugar: {
          amount: 4,
          unit: 'g',
          percentOfDailyNeeds: 8
        },
        sodium: {
          amount: 620,
          unit: 'mg',
          percentOfDailyNeeds: 25.8
        }
      }
    },
    {
      id: '3',
      type: 'dinner',
      time: '19:00',
      items: [
        {
          id: 'salmon1',
          name: 'Salmon with Vegetables',
          portion: {
            amount: 1,
            unit: 'serving'
          },
          nutrition: {
            calories: 580,
            protein: {
              amount: 42,
              unit: 'g',
              percentOfDailyNeeds: 52.5,
              calories: 168
            },
            carbs: {
              amount: 35,
              unit: 'g',
              percentOfDailyNeeds: 12.7,
              calories: 140
            },
            fat: {
              amount: 30,
              unit: 'g',
              percentOfDailyNeeds: 41,
              calories: 270
            },
            fiber: {
              amount: 7,
              unit: 'g',
              percentOfDailyNeeds: 25
            },
            sugar: {
              amount: 6,
              unit: 'g',
              percentOfDailyNeeds: 12
            },
            sodium: {
              amount: 520,
              unit: 'mg',
              percentOfDailyNeeds: 21.7
            }
          }
        }
      ],
      totalNutrition: {
        calories: 580,
        protein: {
          amount: 42,
          unit: 'g',
          percentOfDailyNeeds: 52.5,
          calories: 168
        },
        carbs: {
          amount: 35,
          unit: 'g',
          percentOfDailyNeeds: 12.7,
          calories: 140
        },
        fat: {
          amount: 30,
          unit: 'g',
          percentOfDailyNeeds: 41,
          calories: 270
        },
        fiber: {
          amount: 7,
          unit: 'g',
          percentOfDailyNeeds: 25
        },
        sugar: {
          amount: 6,
          unit: 'g',
          percentOfDailyNeeds: 12
        },
        sodium: {
          amount: 520,
          unit: 'mg',
          percentOfDailyNeeds: 21.7
        }
      }
    }
  ],
  totalNutrition: {
    calories: 1350,
    protein: {
      amount: 92,
      unit: 'g',
      percentOfDailyNeeds: 115,
      calories: 368
    },
    carbs: {
      amount: 118,
      unit: 'g',
      percentOfDailyNeeds: 42.7,
      calories: 472
    },
    fat: {
      amount: 57,
      unit: 'g',
      percentOfDailyNeeds: 78,
      calories: 513
    },
    fiber: {
      amount: 21,
      unit: 'g',
      percentOfDailyNeeds: 74.9
    },
    sugar: {
      amount: 22,
      unit: 'g',
      percentOfDailyNeeds: 44
    },
    sodium: {
      amount: 1320,
      unit: 'mg',
      percentOfDailyNeeds: 55
    }
  },
  waterIntake: {
    current: 1.8,
    target: 2.5,
    unit: 'L'
  }
};