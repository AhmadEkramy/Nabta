import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './config';

// Sample data for testing
export const seedSampleData = async () => {
  try {
    console.log('Starting to seed sample data...');

    // Sample circles
    const circles = [
      {
        id: 'meditation-circle',
        name: 'Meditation & Mental Health Circle',
        nameAr: 'دائرة التأمل والصحة النفسية',
        description: 'A community focused on mindfulness, meditation, and mental wellness',
        descriptionAr: 'مجتمع يركز على اليقظة الذهنية والتأمل والعافية النفسية',
        category: 'Health & Wellness',
        categoryAr: 'الصحة والعافية',
        members: 156,
        posts: 89,
        color: 'green',
        icon: '🧘‍♀️',
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      },
      {
        id: 'english-learning',
        name: 'English Learning Circle',
        nameAr: 'دائرة تعلم اللغة الإنجليزية',
        description: 'Master English through daily practice and conversation',
        descriptionAr: 'أتقن الإنجليزية من خلال الممارسة اليومية والمحادثة',
        category: 'Languages',
        categoryAr: 'اللغات',
        members: 1248,
        posts: 342,
        color: 'blue',
        icon: '🗣️',
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      },
      {
        id: 'engineering-excellence',
        name: 'Engineering Excellence',
        nameAr: 'التميز الهندسي',
        description: 'Engineering concepts and practical applications',
        descriptionAr: 'المفاهيم الهندسية والتطبيقات العملية',
        category: 'Engineering',
        categoryAr: 'الهندسة',
        members: 2156,
        posts: 892,
        color: 'purple',
        icon: '💻',
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      },
      {
        id: 'fitness-sports',
        name: 'Fitness & Sports',
        nameAr: 'اللياقة والرياضة',
        description: 'Stay fit and healthy with sports activities',
        descriptionAr: 'حافظ على لياقتك وصحتك مع الأنشطة الرياضية',
        category: 'Sports',
        categoryAr: 'الرياضة',
        members: 987,
        posts: 234,
        color: 'green',
        icon: '⚽',
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      },
      {
        id: 'book-club',
        name: 'Book Club',
        nameAr: 'نادي القراءة',
        description: 'Read and discuss inspiring books together',
        descriptionAr: 'اقرأ وناقش الكتب الملهمة معاً',
        category: 'Reading',
        categoryAr: 'القراءة',
        members: 756,
        posts: 189,
        color: 'orange',
        icon: '📚',
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      },
      {
        id: 'islamic-studies',
        name: 'Islamic Studies',
        nameAr: 'العلوم الشرعية',
        description: 'Learn Islamic jurisprudence and theology',
        descriptionAr: 'تعلم الفقه الإسلامي وعلوم الشريعة',
        category: 'Islamic Studies',
        categoryAr: 'العلوم الشرعية',
        members: 543,
        posts: 127,
        color: 'teal',
        icon: '🕌',
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      },
      {
        id: 'programming-circle',
        name: 'Programming Learning Circle',
        nameAr: 'دائرة تعلم البرمجة',
        description: 'Learn programming together, share projects and help each other grow',
        descriptionAr: 'تعلم البرمجة معاً، شارك المشاريع وساعد الآخرين على النمو',
        category: 'Technology',
        categoryAr: 'التكنولوجيا',
        members: 234,
        posts: 156,
        color: 'blue',
        icon: '💻',
        isJoined: false,
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      },
      {
        id: 'french-language',
        name: 'French Language',
        nameAr: 'اللغة الفرنسية',
        description: 'Learn French language and culture',
        descriptionAr: 'تعلم اللغة والثقافة الفرنسية',
        category: 'Languages',
        categoryAr: 'اللغات',
        members: 892,
        posts: 234,
        color: 'blue',
        icon: '🇫🇷',
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      },
      {
        id: 'cultural-heritage',
        name: 'Cultural Heritage',
        nameAr: 'التراث الثقافي',
        description: 'Explore and preserve cultural traditions',
        descriptionAr: 'استكشف واحفظ التقاليد الثقافية',
        category: 'Culture',
        categoryAr: 'الثقافة',
        members: 1432,
        posts: 567,
        color: 'red',
        icon: '🏛️',
        memberIds: [],
        adminIds: ['admin-user-id'],
        createdAt: serverTimestamp(),
      }
    ];

    // Add circles
    for (const circle of circles) {
      await setDoc(doc(db, 'circles', circle.id), circle);
      console.log(`Added circle: ${circle.name}`);
    }

    // Add sample stories
    const sampleStories = [
      {
        userId: 'sample-user-1',
        userName: 'Ahmed Hassan',
        userAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Just completed my morning meditation! Starting the day with peace and gratitude 🧘‍♂️✨',
        mediaUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        likes: 8,
        comments: 2,
        views: 15,
        likedBy: [],
        viewedBy: [],
      },
      {
        userId: 'sample-user-2',
        userName: 'Sarah Al-Mahmoud',
        userAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Finished reading "Atomic Habits" today! Such an inspiring book about building good habits 📚',
        mediaUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        likes: 12,
        comments: 4,
        views: 23,
        likedBy: [],
        viewedBy: [],
      },
      {
        userId: 'sample-user-3',
        userName: 'Fatima Al-Zahra',
        userAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Beautiful sunset after a productive day! Grateful for all the blessings 🌅',
        mediaUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        likes: 18,
        comments: 6,
        views: 31,
        likedBy: [],
        viewedBy: [],
      },
      {
        userId: 'sample-user-4',
        userName: 'Omar Khalil',
        userAvatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Morning workout complete! 💪 Consistency is the key to success',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        likes: 14,
        comments: 3,
        views: 27,
        likedBy: [],
        viewedBy: [],
      },
      {
        userId: 'sample-user-5',
        userName: 'Layla Mohammed',
        userAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Volunteering at the local community center today. Giving back feels amazing! 🤝❤️',
        mediaUrl: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        likes: 22,
        comments: 8,
        views: 45,
        likedBy: [],
        viewedBy: [],
      }
    ];

    // Add stories to Firestore
    for (const story of sampleStories) {
      await addDoc(collection(db, 'stories'), story);
    }

    // Sample posts
    const posts = [
      {
        userId: 'sample-user-1',
        userName: 'Sarah Ahmed',
        userAvatar: 'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Completed 25 minutes of meditation and read 5 pages of "Atomic Habits" today. Feeling accomplished! 🌟',
        circleId: 'meditation-circle',
        circleName: 'Meditation & Mental Health Circle',
        createdAt: serverTimestamp(),
        likes: 24,
        comments: 8,
        shares: 3,
        likedBy: [],
      },
      {
        userId: 'sample-user-2',
        userName: 'Ahmed Hassan',
        userAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Reached a new level in programming! Successfully completed my first React project. Now feeling more confident in my abilities 💪',
        circleId: 'programming-circle',
        circleName: 'Programming Learning Circle',
        createdAt: serverTimestamp(),
        likes: 42,
        comments: 15,
        shares: 8,
        likedBy: [],
      },
      {
        userId: 'sample-user-3',
        userName: 'Fatima Al-Zahra',
        userAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Started the weekly reading challenge! Goal is to read 2 books this week. Who wants to join the challenge? 📚',
        circleId: 'reading-circle',
        circleName: 'Reading & Knowledge Circle',
        createdAt: serverTimestamp(),
        likes: 18,
        comments: 12,
        shares: 5,
        likedBy: [],
      },
      {
        userId: 'sample-user-4',
        userName: 'Omar Khalil',
        userAvatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Just finished a 30-minute workout session! Consistency is key to building healthy habits. 💪 #FitnessJourney',
        createdAt: serverTimestamp(),
        likes: 31,
        comments: 7,
        shares: 12,
        likedBy: [],
      },
      {
        userId: 'sample-user-5',
        userName: 'Layla Mohammed',
        userAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        content: 'Grateful for this amazing community! Your support helps me stay motivated every day. Thank you all! 🙏✨',
        createdAt: serverTimestamp(),
        likes: 56,
        comments: 23,
        shares: 15,
        likedBy: [],
      }
    ];

    // Add posts
    for (const post of posts) {
      await addDoc(collection(db, 'posts'), post);
      console.log(`Added post by: ${post.userName}`);
    }

    // Sample Quran verses
    const verses = [
      {
        arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
        translation: 'And whoever fears Allah - He will make for him a way out and provide for him from where he does not expect.',
        surah: 'At-Talaq',
        surahAr: 'الطلاق',
        ayah: 2,
        reference: 'الطلاق: 2-3',
      },
      {
        arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ',
        translation: 'And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.',
        surah: 'At-Talaq',
        surahAr: 'الطلاق',
        ayah: 3,
        reference: 'الطلاق: 3',
      },
      {
        arabic: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ وَعَسَىٰ أَن تُحِبُّوا شَيْئًا وَهُوَ شَرٌّ لَّكُمْ',
        translation: 'But perhaps you hate a thing and it is good for you; and perhaps you love a thing and it is bad for you.',
        surah: 'Al-Baqarah',
        surahAr: 'البقرة',
        ayah: 216,
        reference: 'البقرة: 216',
      },
      {
        arabic: 'وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
        translation: 'And Allah loves the doers of good',
        surah: 'Al-Baqarah',
        surahAr: 'البقرة',
        ayah: 195,
        reference: 'البقرة: 195',
      },
      {
        arabic: 'وَبَشِّرِ الصَّابِرِينَ',
        translation: 'And give good tidings to the patient',
        surah: 'Al-Baqarah',
        surahAr: 'البقرة',
        ayah: 155,
        reference: 'البقرة: 155',
      },
      {
        arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ',
        translation: 'And my success is not but through Allah. Upon him I have relied, and to Him I return.',
        surah: 'Hud',
        surahAr: 'هود',
        ayah: 88,
        reference: 'هود: 88',
      },
      {
        arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
        translation: 'And He is with you wherever you are',
        surah: 'Al-Hadid',
        surahAr: 'الحديد',
        ayah: 4,
        reference: 'الحديد: 4',
      }
    ];

    // Add Quran verses
    for (const verse of verses) {
      await addDoc(collection(db, 'quranVerses'), verse);
      console.log(`Added verse from: ${verse.surah}`);
    }

    // Create daily verses for the past week
    const dailyVerses = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // Use different verses for different days
      const verseIndex = i % verses.length;
      const verse = verses[verseIndex];

      dailyVerses.push({
        ...verse,
        date: dateString,
        isToday: i === 0,
      });
    }

    // Add daily verses
    for (const dailyVerse of dailyVerses) {
      await addDoc(collection(db, 'dailyVerses'), dailyVerse);
      console.log(`Added daily verse for: ${dailyVerse.date}`);
    }

    // Sample stories
    const stories = [
      {
        userId: 'sample-user-1',
        userName: 'Sarah Ahmed',
        userAvatar: 'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        thumbnail: 'https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=1',
        content: 'Morning meditation session complete! 🧘‍♀️',
        createdAt: serverTimestamp(),
        viewedBy: [],
      },
      {
        userId: 'sample-user-2',
        userName: 'Ahmed Hassan',
        userAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        thumbnail: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=1',
        content: 'Coding session in progress! 💻',
        createdAt: serverTimestamp(),
        viewedBy: [],
      }
    ];

    // Add stories
    for (const story of stories) {
      await addDoc(collection(db, 'stories'), story);
      console.log(`Added story by: ${story.userName}`);
    }

    console.log('✅ Sample data seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    return false;
  }
};

// Function to clear all sample data (for testing)
export const clearSampleData = async () => {
  console.log('This function would clear sample data - implement if needed');
  // Implementation would go here to delete sample documents
};