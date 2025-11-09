import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Eye, EyeOff, Mail, Lock, User, AtSign, Check, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkUsernameAvailability } from '../firebase/userProfile';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [religion, setReligion] = useState<'muslim' | 'christian'>('muslim');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const { signup, user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      const trimmedUsername = username.trim().toLowerCase();
      
      if (trimmedUsername.length === 0) {
        setUsernameAvailable(null);
        setUsernameError('');
        return;
      }

      if (trimmedUsername.length < 3) {
        setUsernameAvailable(false);
        setUsernameError(language === 'ar' ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters');
        return;
      }

      const usernameRegex = /^[a-z0-9_.]+$/;
      if (!usernameRegex.test(trimmedUsername)) {
        setUsernameAvailable(false);
        setUsernameError(language === 'ar' ? 'يمكن استخدام الحروف والأرقام و _ و . فقط' : 'Only letters, numbers, _ and . are allowed');
        return;
      }

      setCheckingUsername(true);
      setUsernameError('');

      try {
        const available = await checkUsernameAvailability(trimmedUsername);
        setUsernameAvailable(available);
        if (!available) {
          setUsernameError(language === 'ar' ? 'اسم المستخدم محجوز بالفعل' : 'Username is already taken');
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setUsernameAvailable(null);
        setUsernameError(language === 'ar' ? 'حدث خطأ أثناء التحقق' : 'Error checking availability');
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error(language === 'ar' ? 'اسم المستخدم مطلوب' : 'Username is required');
      return;
    }

    if (!usernameAvailable) {
      toast.error(language === 'ar' ? 'اسم المستخدم غير متاح' : 'Username is not available');
      return;
    }

    if (password !== confirmPassword) {
      toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, name, username.trim().toLowerCase(), religion);
      toast.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
      navigate('/home');
    } catch (error) {
      toast.error(language === 'ar' ? 'خطأ في إنشاء الحساب' : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Animated Background Image with Overlay */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero_section_img.png')`,
          }}
        />
        {/* Dark overlay with blue tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-green-900/50" />
        
        {/* Animated particles effect */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Glassmorphism Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          className="backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-8 sm:p-10 transition-all duration-500 hover:shadow-green-500/20 hover:shadow-[0_0_50px_rgba(34,197,94,0.3)]"
        >
          {/* Logo with animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <motion.img
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              src="/logo.png"
              alt="Growth Circles Logo"
              className="h-20 drop-shadow-2xl"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
            </h1>
            <p className="text-gray-200 drop-shadow-md">
              {language === 'ar' ? 'انضم إلى مجتمع دوائر النمو' : 'Join the Growth Circles community'}
            </p>
          </motion.div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-hover:scale-110">
                  <User className="h-5 w-5 text-gray-300 group-hover:text-green-400 transition-colors duration-300" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/20 backdrop-blur-sm border border-white/30 placeholder-gray-300 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white/25 hover:border-green-400/50"
                  placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                />
              </div>
            </motion.div>

            {/* Username Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                {language === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-hover:scale-110">
                  <AtSign className="h-5 w-5 text-gray-300 group-hover:text-green-400 transition-colors duration-300" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white/20 backdrop-blur-sm border border-white/30 placeholder-gray-300 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white/25 hover:border-green-400/50"
                  placeholder={language === 'ar' ? 'مثال: ahmed_ekramy' : 'e.g., ahmed_ekramy'}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  {checkingUsername && (
                    <Loader2 className="h-5 w-5 text-gray-300 animate-spin" />
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check className="h-5 w-5 text-green-400" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              </div>
              {usernameError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-300 drop-shadow-md"
                >
                  {usernameError}
                </motion.p>
              )}
              {!usernameError && usernameAvailable === true && username.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-green-300 drop-shadow-md"
                >
                  {language === 'ar' ? '✓ اسم المستخدم متاح!' : '✓ Username is available!'}
                </motion.p>
              )}
              <p className="mt-1 text-xs text-gray-300 drop-shadow-md">
                {language === 'ar' 
                  ? 'يمكنك استخدام الحروف الإنجليزية والأرقام و _ و . فقط'
                  : 'Use only letters, numbers, _ and . (3-30 characters)'}
              </p>
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-hover:scale-110">
                  <Mail className="h-5 w-5 text-gray-300 group-hover:text-green-400 transition-colors duration-300" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/20 backdrop-blur-sm border border-white/30 placeholder-gray-300 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white/25 hover:border-green-400/50"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-hover:scale-110">
                  <Lock className="h-5 w-5 text-gray-300 group-hover:text-green-400 transition-colors duration-300" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white/20 backdrop-blur-sm border border-white/30 placeholder-gray-300 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white/25 hover:border-green-400/50"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-300 hover:text-green-400 transition-colors duration-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-300 hover:text-green-400 transition-colors duration-300" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-hover:scale-110">
                  <Lock className="h-5 w-5 text-gray-300 group-hover:text-green-400 transition-colors duration-300" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white/20 backdrop-blur-sm border border-white/30 placeholder-gray-300 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white/25 hover:border-green-400/50"
                  placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
                />
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-300 hover:text-green-400 transition-colors duration-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-300 hover:text-green-400 transition-colors duration-300" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Religion Selection Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <label htmlFor="religion" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                {language === 'ar' ? 'الدين' : 'Religion'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-hover:scale-110">
                  <BookOpen className="h-5 w-5 text-gray-300 group-hover:text-green-400 transition-colors duration-300" />
                </div>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  id="religion"
                  name="religion"
                  required
                  value={religion}
                  onChange={(e) => setReligion(e.target.value as 'muslim' | 'christian')}
                  className="w-full px-4 py-3 pl-12 pr-10 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white/25 hover:border-green-400/50 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d1d5db'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem'
                  }}
                >
                  <option value="muslim" className="bg-gray-800 text-white">
                    {language === 'ar' ? 'مسلم' : 'Muslim'}
                  </option>
                  <option value="christian" className="bg-gray-800 text-white">
                    {language === 'ar' ? 'مسيحي' : 'Christian'}
                  </option>
                </motion.select>
              </div>
              <p className="mt-1 text-xs text-gray-300 drop-shadow-md">
                {language === 'ar' 
                  ? 'سيتم عرض القرآن للمسلمين والإنجيل للمسيحيين'
                  : 'Quran will be shown for Muslims and Bible for Christians'}
              </p>
            </motion.div>

            {/* Terms Checkbox */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95, duration: 0.6 }}
              className="flex items-center group"
            >
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-500 focus:ring-green-500 border-white/30 rounded bg-white/20 backdrop-blur-sm transition-all duration-300 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-white cursor-pointer">
                {language === 'ar' ? 'أوافق على ' : 'I agree to the '}
                <Link to="/terms" className="font-semibold text-green-300 hover:text-green-200 transition-colors duration-300 hover:underline">
                  {language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}
                </Link>
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34,197,94,0.6)" }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{language === 'ar' ? 'جاري الإنشاء...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  t('signup')
                )}
              </motion.button>
            </motion.div>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-center pt-2"
            >
              <span className="text-sm text-white">
                {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <Link
                  to="/login"
                  className="font-semibold text-green-300 hover:text-green-200 transition-colors duration-300 hover:underline"
                >
                  {t('login')}
                </Link>
              </span>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
