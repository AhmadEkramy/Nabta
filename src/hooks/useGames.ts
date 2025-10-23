import { useEffect, useState } from 'react';
import { addGameIfNotExists, getActiveGames } from '../firebase/games';
import { Game } from '../types';

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultGames: Omit<Game, 'id'>[] = [
    {
      name: 'Memory Cards',
      nameAr: 'كروت الذاكرة',
      description: 'Test your memory with this classic card matching game. Flip cards to find matching pairs!',
      descriptionAr: 'اختبر ذاكرتك مع لعبة مطابقة الكروت الكلاسيكية. اقلب الكروت لتجد الأزواج المتطابقة!',
      category: 'memory',
      xpReward: 15,
      difficulty: 'easy',
      playTime: '5-10 min',
      players: 1,
      icon: '🧠',
      color: 'purple',
      isActive: true
    },
    {
      name: 'Word Scramble',
      nameAr: 'ترتيب الكلمات',
      description: 'Unscramble letters to form words and improve your vocabulary skills.',
      descriptionAr: 'رتب الحروف لتكوين كلمات وحسن مهاراتك في المفردات.',
      category: 'language',
      xpReward: 20,
      difficulty: 'medium',
      playTime: '8-12 min',
      players: 1,
      icon: '📝',
      color: 'blue',
      isActive: true
    },
    {
      name: 'Quick Math',
      nameAr: 'الرياضيات السريعة',
      description: 'Solve math problems as fast as you can to boost your calculation skills.',
      descriptionAr: 'حل المسائل الرياضية بأسرع ما يمكن لتعزيز مهاراتك في الحساب.',
      category: 'math',
      xpReward: 25,
      difficulty: 'medium',
      playTime: '5-8 min',
      players: 1,
      icon: '🔢',
      color: 'green',
      isActive: true
    },
    {
      name: 'Logic Puzzles',
      nameAr: 'ألغاز المنطق',
      description: 'Challenge your logical thinking with pattern recognition and sequence puzzles.',
      descriptionAr: 'تحدى تفكيرك المنطقي مع ألغاز التعرف على الأنماط والتسلسلات.',
      category: 'logic',
      xpReward: 30,
      difficulty: 'hard',
      playTime: '10-15 min',
      players: 1,
      icon: '🧩',
      color: 'orange',
      isActive: true
    },
    {
      name: 'Vocabulary Builder',
      nameAr: 'بناء المفردات',
      description: 'Expand your vocabulary by matching words with their definitions.',
      descriptionAr: 'وسع مفرداتك من خلال مطابقة الكلمات مع تعريفاتها.',
      category: 'language',
      xpReward: 22,
      difficulty: 'medium',
      playTime: '10-15 min',
      players: 1,
      icon: '📚',
      color: 'indigo',
      isActive: true
    },
    {
      name: 'Pattern Memory',
      nameAr: 'ذاكرة الأنماط',
      description: 'Remember and repeat increasingly complex patterns to train your memory.',
      descriptionAr: 'تذكر وكرر أنماطاً معقدة متزايدة لتدريب ذاكرتك.',
      category: 'memory',
      xpReward: 18,
      difficulty: 'medium',
      playTime: '6-10 min',
      players: 1,
      icon: '🎯',
      color: 'pink',
      isActive: true
    }
    ,
    {
      name: 'Sudoku',
      nameAr: 'سودوكو',
      description: 'Fill the 9x9 grid so each row, column and 3x3 box contains 1-9.',
      descriptionAr: 'املأ الشبكة 9×9 بحيث تحتوي كل صف وعمود ومربع 3×3 على الأرقام 1-9.',
      category: 'logic',
      xpReward: 35,
      difficulty: 'hard',
      playTime: '10-20 min',
      players: 1,
      icon: '🧮',
      color: 'orange',
      isActive: true
    },
    {
      name: 'Chess',
      nameAr: 'شطرنج',
      description: 'Challenge a strategic AI opponent in this futuristic 3D chess game with cyber aesthetics!',
      descriptionAr: 'تحدى منافس ذكاء اصطناعي استراتيجي في لعبة شطرنج ثلاثية الأبعاد مستقبلية!',
      category: 'logic',
      xpReward: 40,
      difficulty: 'hard',
      playTime: '10-20 min',
      players: 1,
      icon: '♟️',
      color: 'indigo',
      isActive: true
    },
    {
      name: 'Tic Tac Toe',
      nameAr: 'تيك تاك تو',
      description: 'Play the classic Tic Tac Toe game against a smart computer opponent.',
      descriptionAr: 'العب لعبة تيك تاك تو الكلاسيكية ضد منافس كمبيوتر ذكي.',
      category: 'logic',
      xpReward: 20,
      difficulty: 'easy',
      playTime: '3-5 min',
      players: 1,
      icon: '⭕',
      color: 'blue',
      isActive: true
    }
  ];

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedGames = await getActiveGames();

      // If no games exist in Firestore, seed with default games
      if (fetchedGames.length === 0) {
        console.log('No games found in Firestore, seeding default games...');
        const seededGames: Game[] = [];
        
        for (const gameData of defaultGames) {
          try {
            const gameId = await addGameIfNotExists(gameData);
            seededGames.push({ id: gameId, ...gameData });
          } catch (seedError) {
            console.error('Error seeding game:', seedError);
          }
        }
        
        // Ensure no duplicates by name
        const uniqueSeeded = dedupeByName(seededGames);
        setGames(uniqueSeeded);
      } else {
        // If games exist, ensure any new defaults (e.g., newly added games) are present
        const existingNames = new Set(
          fetchedGames.map(g => g.name.trim().toLowerCase())
        );
        const missingDefaults = defaultGames.filter(d => !existingNames.has(d.name.trim().toLowerCase()));

        const newlyAdded: Game[] = [];
        for (const gameData of missingDefaults) {
          try {
            const gameId = await addGameIfNotExists(gameData);
            newlyAdded.push({ id: gameId, ...gameData });
          } catch (seedError) {
            console.error('Error adding missing default game:', seedError);
          }
        }

        // Ensure no duplicates by name if the collection already has duplicates
        const uniqueCombined = dedupeByName([...fetchedGames, ...newlyAdded]);
        setGames(uniqueCombined);
      }
    } catch (err) {
      console.error('Error loading games:', err);
      setError('Failed to load games');
      // Fallback to default games with temporary IDs
      const fallbackGames = defaultGames.map((game, index) => ({
        id: `temp-${index}`,
        ...game
      }));
      setGames(fallbackGames);
    } finally {
      setLoading(false);
    }
  };

  const addNewGame = async (gameData: Omit<Game, 'id'>) => {
    try {
      // Prevent duplicates by name
      const gameId = await addGameIfNotExists(gameData);
      const newGame = { id: gameId, ...gameData };
      setGames(prev => dedupeByName([...prev, newGame]));
      return newGame;
    } catch (err) {
      console.error('Error adding game:', err);
      throw err;
    }
  };

  const getGamesByCategory = (category: string) => {
    if (category === 'all') return games;
    return games.filter(game => game.category === category);
  };

  const getGameById = (id: string) => {
    return games.find(game => game.id === id);
  };

  useEffect(() => {
    loadGames();
  }, []);

  return {
    games,
    loading,
    error,
    loadGames,
    addNewGame,
    getGamesByCategory,
    getGameById
  };
};

// Helpers
const dedupeByName = (list: Game[]) => {
  const seen = new Set<string>();
  return list.filter((game) => {
    const key = game.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
