# 🌱 Nabta (Growth Circles) - نبتة

<div align="center">
  <img src="public/logo.png" alt="Nabta Logo" width="200" height="200" />
  
  ### Personal Growth Platform - منصة النمو الشخصي
  
  [![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.x-orange.svg)](https://firebase.google.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
</div>

## 📖 About

**Nabta** is a comprehensive personal and spiritual growth platform that combines modern technology with traditional wisdom. It provides users with a holistic ecosystem for self-development, featuring social networking, health tracking, gamification, AI coaching, and spiritual practices.

حوّل وقتك المهدور إلى وقت نمو. تواصل، انمُ، العب، تأمل، وازدهر في منصة واحدة شاملة.

---

## ✨ Key Features

### 🌐 Social & Community
- **Growth Circles (نبتة)**: Join specialized circles for languages, programming, health, and more
- **Real-time Chat**: Connect with circle members through text and voice messages
- **Posts & Stories**: Share your journey with the community
- **Reactions & Comments**: Engage with community content (text, emoji, and voice comments)
- **User Profiles**: Customizable profiles with avatars and bios
- **Follow System**: Follow users and see suggested users
- **Shared Posts**: Share posts across circles

### 🎯 Personal Development
- **Focus Modes**: Productivity, meditation, and deep focus sessions with XP rewards
- **Todo List**: Organize tasks and track daily progress
- **Habit Tracker**: Build and maintain positive habits with point rewards
- **Weekly Goals**: AI-suggested goals based on your progress
- **Daily Log**: Track your daily activities and reflections
- **Streak Tracking**: Maintain daily activity streaks for rewards

### 🎮 Gamification & XP System
- **25 Progress Levels**: Unique titles and achievements
- **XP Points**: Earn points through activities and achievements
- **Streak System**: Daily activity tracking with streak rewards
- **Interactive Games**: 
  - Pattern Memory Game
  - Memory Card Game
  - Tic-Tac-Toe
  - Chess
  - Sudoku
  - Logic Puzzle Game
  - Math Quiz Game
  - Vocabulary Game
  - Word Scramble Game
- **Leaderboards**: Compete with friends and community
- **Game Statistics**: Track your performance across all games

### 🤖 AI Coach
- **Interactive Chat Interface**: Real-time conversation with AI coach powered by Groq API
- **Smart Personal Coach**: Analyzes your progress and provides personalized guidance
- **Suggested Prompts**: Quick-start prompts for common goals and challenges
- **Weekly Goal Suggestions**: AI-generated goal recommendations based on your progress
- **Personalized Recommendations**: Tailored advice for personal development
- **Progress Tracking & Insights**: Get intelligent insights on your goals and achievements
- **Conversation History**: Maintain context across multiple sessions
- **Bilingual Support**: Full Arabic and English support for AI conversations

### 📖 Sacred Texts Integration
- **Quran**: Daily verse with translations, progress tracking, beautiful verse display with audio
- **Bible**: Complete Bible (66 books) in Arabic and English, progress tracking, verse navigation
- Multi-language support (Arabic/English)
- Reading position tracking
- Streak system for daily reading

### 💪 Health Tracking
- **Nutrition Tracker**: Log meals and track calories
- **Water Intake**: Daily hydration monitoring
- **Activity Tracker**: Exercise and movement logging
- **Sleep Tracker**: Sleep quality and duration
- **Steps Counter**: Daily step goals
- **Heart Rate Monitor**: Track cardiovascular health
- **Blood Sugar Tracker**: For diabetes management
- **Blood Pressure Monitor**: Cardiovascular health tracking

### 🎨 Customization
- **Dark/Light Themes**: Eye-friendly interface options
- **Bilingual Support**: Full Arabic and English interface
- **Custom Profiles**: Personalize your space
- **Usage Time Control**: Set and manage app usage limits

### 👑 Admin Dashboard
- User management and moderation
- Content oversight
- Analytics and statistics
- System configuration

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Navigation
- **Lucide React** - Icon library

### Backend & Services
- **Firebase Authentication** - User management
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Functions** - Serverless functions
- **Firebase Hosting** - Web hosting

### APIs & AI
- **Quran API** - Holy Quran verses and translations
- **Bible API** - Bible verses and translations
- **Groq API** - AI coaching chat interface (Llama 3.1 model)
- **Google Generative AI** - AI coaching features
- **Genkit AI** - AI framework integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nabta-growth-circles.git
cd nabta-growth-circles
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase config

4. **Configure environment**
   - Create a `src/firebase/config.ts` file
   - Add your Firebase configuration:
```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

5. **Set up Firebase Functions** (Optional)
```bash
cd functions
npm install
```

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Deploy to Firebase

```bash
npm run build
firebase deploy
```

---

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in with email/password
2. **Complete Profile**: Add your information, avatar, and bio
3. **Join Circles**: Find and join growth circles that interest you
4. **Set Goals**: Start with daily todos and habits
5. **Track Progress**: Monitor your health, activities, and achievements
6. **Read Sacred Texts**: Daily verses from Quran and Bible with progress tracking
7. **Play Games**: Challenge yourself with 9 different games and earn XP
8. **Engage**: Post, comment, react, and connect with the community
9. **Level Up**: Earn XP and unlock achievements across 25 levels
10. **Stay Consistent**: Use the AI coach for personalized guidance and maintain streaks
11. **Follow Users**: Discover and follow other users in the community
12. **Share Stories**: Create and share stories with your circles

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Ahmed Ekramy"/><br />
      <sub><b>Ahmed Ekramy</b></sub><br />
      <sub>Software Engineer</sub>
    </td>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Ahmed Elrefaey"/><br />
      <sub><b>Ahmed Elrefaey</b></sub><br />
      <sub>Back-end Engineer</sub>
    </td>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Ahmed Eltohami"/><br />
      <sub><b>Ahmed Eltohami</b></sub><br />
      <sub>Cloud Engineer</sub>
    </td>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Ahmed Saber"/><br />
      <sub><b>Ahmed Saber</b></sub><br />
      <sub>Flutter Developer</sub>
    </td>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Mahmoud Atef"/><br />
      <sub><b>Mahmoud Atef</b></sub><br />
      <sub>AI Engineer</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Hussien Eid"/><br />
      <sub><b>Hussien Eid</b></sub><br />
      <sub>AI Engineer</sub>
    </td>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Habiba Gohar"/><br />
      <sub><b>Habiba Gohar</b></sub><br />
      <sub>UI/UX Developer</sub>
    </td>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Esraa Nofal"/><br />
      <sub><b>Esraa Nofal</b></sub><br />
      <sub>UI/UX Developer</sub>
    </td>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Esraa Elwakil"/><br />
      <sub><b>Esraa Elwakil</b></sub><br />
      <sub>Front-end Developer</sub>
    </td>
    <td align="center">
      <img src="public/avatar.jpeg" width="100px;" alt="Shimaa Abdelwahab"/><br />
      <sub><b>Shimaa Abdelwahab</b></sub><br />
      <sub>Front-end Developer</sub>
    </td>
  </tr>
</table>

---

## 💡 Creative Contributors

Special thanks to the creative minds who contributed amazing ideas:

- **Shaza Ghanem** (شذى غانم) - XP Points and Gamification 🎮
- **Lena Gad** (لينا جاد) - Themes System 🎨
- **Duha Abdulsalam** (ضحى عبدالسلام) - Usage Time Control ⏰
- **Guayria Wael** (جويرية وائل) - Interactive Games 🎯
- **Ahmed Elnabawy** (أحمد النبوي) - Audio Comments 🎤
- **Ahmed Gabr** (أحمد جبر) - Message Scheduling 📅
- **Malak Islam** (ملك إسلام) - AI Coach 🤖
- **Habiba Salah** (حبيبة صلاح) - Habit Tracker & Points System ✅

---

## 📂 Project Structure

```
nabta-growth-circles/
├── public/                 # Static assets (images, logos, JSON data)
├── src/
│   ├── components/        # React components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── games/        # Game components (9 games)
│   │   └── health/       # Health tracking components
│   ├── contexts/         # React contexts (Auth, Game, Language, Theme, etc.)
│   ├── firebase/         # Firebase configuration and services
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions (Quran, Bible APIs, etc.)
│   ├── services/         # External service integrations
│   ├── data/             # Mock data and seed data
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── functions/            # Firebase Cloud Functions
│   ├── src/              # Functions source code
│   └── package.json      # Functions dependencies
├── firestore.rules       # Firestore security rules
├── vercel.json           # Vercel deployment configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

---

## 🔒 Security

- Firebase Authentication for secure user management
- Firestore security rules for data protection
- Input validation and sanitization
- Secure file upload with Storage rules
- Environment variables for sensitive data
- Protected routes for authenticated users
- Admin role-based access control
- Secure API key management

---

## 🌍 Internationalization

The platform supports:
- 🇬🇧 English (en)
- 🇸🇦 Arabic (ar)

Language can be toggled throughout the interface with automatic RTL support for Arabic.

---

## 📊 Analytics & Monitoring

- User activity tracking
- Performance monitoring
- Error logging
- Usage statistics
- Growth metrics

---

## 🎯 Roadmap

- [ ] Mobile app (Flutter)
- [ ] Advanced AI features
- [ ] More interactive games
- [ ] Video calls in circles
- [ ] Meditation guides
- [ ] Course marketplace
- [ ] Community challenges
- [ ] Rewards store
- [ ] Integration with wearables
- [ ] More language support
- [ ] Enhanced Bible features (audio, bookmarks)
- [ ] Advanced analytics dashboard
- [ ] Export/import user data

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is part of a graduation project. All rights reserved © 2024 Nabta Team.

---

## 📞 Contact

- **Email**: support@growthcircles.com
- **Website**: [Coming Soon]
- **Social Media**: [Coming Soon]

---

## 🙏 Acknowledgments

- Thanks to all team members for their dedication
- Special thanks to our creative contributors
- Firebase for the robust backend infrastructure
- The React and Open Source community
- Our users and testers for valuable feedback

---

<div align="center">
  <p>Made with ❤️ in Egypt 🇪🇬</p>
  <p>
    <strong>Transform wasted time into growth time</strong><br/>
    حوّل وقتك المهدور إلى وقت نمو
  </p>
</div>

