import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GameSession } from '../hooks/useGameStats';

// Sample user data for testing
const sampleUsers = [
  { id: 'user1', name: 'Ahmed Hassan', avatar: 'https://ui-avatars.com/api/?name=Ahmed+Hassan&background=4f46e5' },
  { id: 'user2', name: 'Sara Mohamed', avatar: 'https://ui-avatars.com/api/?name=Sara+Mohamed&background=059669' },
  { id: 'user3', name: 'Omar Ali', avatar: 'https://ui-avatars.com/api/?name=Omar+Ali&background=dc2626' },
  { id: 'user4', name: 'Fatima Ahmed', avatar: 'https://ui-avatars.com/api/?name=Fatima+Ahmed&background=7c3aed' },
  { id: 'user5', name: 'Youssef Ibrahim', avatar: 'https://ui-avatars.com/api/?name=Youssef+Ibrahim&background=ea580c' },
  { id: 'user6', name: 'Nour Mahmoud', avatar: 'https://ui-avatars.com/api/?name=Nour+Mahmoud&background=0891b2' },
  { id: 'user7', name: 'Karim Mostafa', avatar: 'https://ui-avatars.com/api/?name=Karim+Mostafa&background=be185d' },
  { id: 'user8', name: 'Mona Sayed', avatar: 'https://ui-avatars.com/api/?name=Mona+Sayed&background=16a34a' }
];

// Sample games data
const sampleGames = [
  { id: 'memory-cards', name: 'Memory Cards', category: 'memory', difficulty: 'easy' },
  { id: 'word-scramble', name: 'Word Scramble', category: 'language', difficulty: 'medium' },
  { id: 'quick-math', name: 'Quick Math', category: 'math', difficulty: 'medium' },
  { id: 'logic-puzzles', name: 'Logic Puzzles', category: 'logic', difficulty: 'hard' },
  { id: 'vocabulary-builder', name: 'Vocabulary Builder', category: 'language', difficulty: 'medium' }
];

const getRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

const generateRandomScore = (difficulty: string) => {
  const baseScore = difficulty === 'easy' ? 800 : difficulty === 'medium' ? 600 : 400;
  const variance = 300;
  return Math.floor(baseScore + (Math.random() - 0.5) * variance);
};

const generateRandomXP = (score: number, difficulty: string) => {
  const multiplier = difficulty === 'easy' ? 0.02 : difficulty === 'medium' ? 0.03 : 0.04;
  return Math.floor(score * multiplier) + Math.floor(Math.random() * 10);
};

const generateRandomDuration = () => {
  return Math.floor(Math.random() * 600) + 120; // 2-12 minutes in seconds
};

export const seedGameSessions = async (numberOfSessions: number = 100) => {
  try {
    console.log(`Seeding ${numberOfSessions} game sessions...`);
    
    const sessions: Omit<GameSession, 'id'>[] = [];
    
    for (let i = 0; i < numberOfSessions; i++) {
      const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const game = sampleGames[Math.floor(Math.random() * sampleGames.length)];
      const score = generateRandomScore(game.difficulty);
      const xpEarned = generateRandomXP(score, game.difficulty);
      const duration = generateRandomDuration();
      
      // Create sessions across different time periods
      const daysAgo = Math.random() < 0.3 ? 7 : // 30% within last week
                     Math.random() < 0.6 ? 30 : // 30% within last month  
                     90; // 40% within last 3 months
      
      const session: Omit<GameSession, 'id'> = {
        userId: user.id,
        gameId: game.id,
        gameName: game.name,
        score,
        xpEarned,
        duration,
        difficulty: game.difficulty,
        category: game.category,
        completedAt: getRandomDate(daysAgo)
      };
      
      sessions.push(session);
    }
    
    // Add sessions to Firestore
    const addedSessions = [];
    for (const session of sessions) {
      try {
        const docRef = await addDoc(collection(db, 'gameSessions'), session);
        addedSessions.push({ id: docRef.id, ...session });
      } catch (error) {
        console.error('Error adding session:', error);
      }
    }
    
    console.log(`Successfully seeded ${addedSessions.length} game sessions`);
    
    // Also seed user documents if they don't exist
    await seedUsers();
    
    return addedSessions;
  } catch (error) {
    console.error('Error seeding game sessions:', error);
    throw error;
  }
};

const seedUsers = async () => {
  try {
    console.log('Seeding user documents...');
    
    for (const user of sampleUsers) {
      try {
        // Create user document with basic info
        await addDoc(collection(db, 'users'), {
          name: user.name,
          avatar: user.avatar,
          email: `${user.name.toLowerCase().replace(' ', '.')}@example.com`,
          xp: Math.floor(Math.random() * 2000) + 500,
          level: Math.floor(Math.random() * 10) + 1,
          streak: Math.floor(Math.random() * 15),
          joinedAt: getRandomDate(60),
          circles: [],
          completedTasks: Math.floor(Math.random() * 50),
          readVerses: [],
          readVersesCount: Math.floor(Math.random() * 100),
          focusHours: Math.floor(Math.random() * 50)
        });
      } catch (error) {
        console.error(`Error seeding user ${user.name}:`, error);
      }
    }
    
    console.log('Successfully seeded user documents');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Helper function to clear all game sessions (for testing)
export const clearGameSessions = async () => {
  try {
    console.log('This function would clear game sessions in a real implementation');
    console.log('For safety, manual deletion is recommended');
  } catch (error) {
    console.error('Error clearing game sessions:', error);
  }
};
