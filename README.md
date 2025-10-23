# 🌱 Nabta (Growth Circles) - نبتة

<div align="center">
  <img src="public/logo.png" alt="Nabta Logo" width="200" height="200" />
  
  ### Personal Growth Platform - منصة النمو الشخصي
  
  [![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-10.x-orange.svg)](https://firebase.google.com/)
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
- **Reactions & Comments**: Engage with community content
- **User Profiles**: Customizable profiles with avatars and bios

### 🎯 Personal Development
- **Focus Modes**: Productivity, meditation, and deep focus sessions with XP rewards
- **Todo List**: Organize tasks and track daily progress
- **Habit Tracker**: Build and maintain positive habits with point rewards
- **Weekly Goals**: AI-suggested goals based on your progress

### 🎮 Gamification & XP System
- **25 Progress Levels**: Unique titles and achievements
- **XP Points**: Earn points through activities and achievements
- **Interactive Games**: 
  - Pattern Memory Game
  - Tic-Tac-Toe
  - Chess
  - Sudoku
  - And more!
- **Leaderboards**: Compete with friends and community

### 🤖 AI Coach
- Smart personal coach that analyzes your progress
- Weekly goal suggestions
- Personalized recommendations
- Progress tracking and insights

### 📖 Quran Integration
- Daily verse with translations
- Progress tracking for Quran reading
- Beautiful verse display with audio
- Multi-language support

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

### APIs
- **Quran API** - Holy Quran verses and translations
- **OpenAI API** - AI coaching features

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

1. **Sign Up/Login**: Create an account or sign in
2. **Complete Profile**: Add your information and avatar
3. **Join Circles**: Find and join growth circles that interest you
4. **Set Goals**: Start with daily todos and habits
5. **Track Progress**: Monitor your health, activities, and achievements
6. **Engage**: Post, comment, and connect with the community
7. **Level Up**: Earn XP and unlock achievements
8. **Stay Consistent**: Use the AI coach for personalized guidance

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
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── games/        # Game components
│   │   └── health/       # Health tracking components
│   ├── contexts/         # React contexts
│   ├── firebase/         # Firebase configuration and services
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── functions/            # Firebase Cloud Functions
├── firestore.rules       # Firestore security rules
├── package.json
└── README.md
```

---

## 🔒 Security

- Firebase Authentication for secure user management
- Firestore security rules for data protection
- Input validation and sanitization
- Secure file upload with Storage rules
- Environment variables for sensitive data

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

