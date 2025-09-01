import { useEffect, useState } from 'react';
import { addGame, getActiveGames } from '../firebase/games';
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
            const gameId = await addGame(gameData);
            seededGames.push({ id: gameId, ...gameData });
          } catch (seedError) {
            console.error('Error seeding game:', seedError);
          }
        }
        
        setGames(seededGames);
      } else {
        setGames(fetchedGames);
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
      const gameId = await addGame(gameData);
      const newGame = { id: gameId, ...gameData };
      setGames(prev => [...prev, newGame]);
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
