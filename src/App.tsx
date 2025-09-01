import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { CircleProvider } from './contexts/CircleContext';
import { GameProvider } from './contexts/GameContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminDashboard from './pages/AdminDashboard';
import AICoachPage from './pages/AICoachPage';
import ChatPage from './pages/ChatPage';
import CircleDetailsPage from './pages/CircleDetailsPage';
import FocusModesPage from './pages/FocusModesPage';
import GamesPage from './pages/GamesPage';
import GrowthCirclesPage from './pages/GrowthCirclesPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import QuranPage from './pages/QuranPage';
import SettingsPage from './pages/SettingsPage';
import SignupPage from './pages/SignupPage';
import StorePage from './pages/StorePage';
import TodoListPage from './pages/TodoListPage';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <GameProvider>
            <CircleProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
                  <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/home" element={
                    <ProtectedRoute>
                      <Layout>
                        <HomePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/circles" element={
                    <ProtectedRoute>
                      <Layout>
                        <GrowthCirclesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/circle/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <CircleDetailsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Layout>
                        <ChatPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/todos" element={
                    <ProtectedRoute>
                      <Layout>
                        <TodoListPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile/:userId" element={
                    <ProtectedRoute>
                      <Layout>
                        <PublicProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/focus" element={
                    <ProtectedRoute>
                      <Layout>
                        <FocusModesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/coach" element={
                    <ProtectedRoute>
                      <Layout>
                        <AICoachPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/games" element={
                    <ProtectedRoute>
                      <Layout>
                        <GamesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/quran" element={
                    <ProtectedRoute>
                      <Layout>
                        <QuranPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/store" element={
                    <ProtectedRoute>
                      <Layout>
                        <StorePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <Layout>
                        <NotificationsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#10B981',
                      color: '#ffffff',
                    },
                  }}
                />
              </div>
            </Router>
            </CircleProvider>
          </GameProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}

export default App;