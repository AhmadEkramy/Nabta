import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
      navigate('/home');
    } catch (error) {
      toast.error(language === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8"
        >
          <div>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">دن</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'دوائر النمو' : 'Growth Circles'}
              </h2>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'مرحباً بعودتك!' : 'Welcome Back!'}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'سجل دخولك لمتابعة رحلة النمو' : 'Sign in to continue your growth journey'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 transition-colors"
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 transition-colors"
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  {language === 'ar' ? 'تذكرني' : 'Remember me'}
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-green-600 hover:text-green-500 dark:text-green-400"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{language === 'ar' ? 'جاري التسجيل...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  t('login')
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'لا تملك حساباً؟' : "Don't have an account?"}{' '}
                <Link
                  to="/signup"
                  className="font-medium text-green-600 hover:text-green-500 dark:text-green-400"
                >
                  {t('signup')}
                </Link>
              </span>
            </div>
          </form>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>{language === 'ar' ? 'للتجربة استخدم:' : 'For demo use:'}</p>
            <p>admin@growthcircles.com / any password</p>
          </div>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <div className="h-full w-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-4xl font-bold">دن</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                {language === 'ar' ? 'رحلة النمو تبدأ من هنا' : 'Your Growth Journey Starts Here'}
              </h3>
              <p className="text-xl text-green-100">
                {language === 'ar' 
                  ? 'انضم إلى مجتمع يساعدك على تحقيق أهدافك الشخصية والروحية'
                  : 'Join a community that helps you achieve your personal and spiritual goals'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;