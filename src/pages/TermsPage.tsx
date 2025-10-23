import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Shield, FileText, Users, Lock, Heart } from 'lucide-react';

const TermsPage: React.FC = () => {
  const { language } = useLanguage();

  const sections = language === 'ar' ? [
    {
      icon: Shield,
      title: 'المقدمة',
      content: 'مرحبًا بك في دوائر النمو. باستخدامك لمنصتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يُرجى قراءتها بعناية قبل استخدام خدماتنا.'
    },
    {
      icon: Users,
      title: 'استخدام الخدمة',
      content: 'دوائر النمو هي منصة مخصصة للنمو الشخصي والروحي. يجب عليك استخدام المنصة بطريقة مسؤولة واحترام جميع المستخدمين. يُحظر أي سلوك مسيء أو مضايقات أو محتوى غير لائق.'
    },
    {
      icon: FileText,
      title: 'حسابك',
      content: 'أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور. يجب أن تكون جميع المعلومات التي تقدمها دقيقة وحديثة. أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك.'
    },
    {
      icon: Lock,
      title: 'الخصوصية والبيانات',
      content: 'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. نقوم بجمع المعلومات اللازمة فقط لتقديم خدماتنا وتحسين تجربتك. لن نشارك معلوماتك مع أطراف ثالثة دون موافقتك.'
    },
    {
      icon: Heart,
      title: 'المحتوى والسلوك',
      content: 'يجب أن يكون المحتوى الذي تنشره محترمًا وبناءً. نحن نشجع على المشاركة الإيجابية والدعم المتبادل. يحتفظ الفريق بالحق في إزالة أي محتوى ينتهك هذه المبادئ.'
    },
    {
      icon: Shield,
      title: 'حقوق الملكية الفكرية',
      content: 'جميع المحتويات والميزات على المنصة محمية بحقوق النشر. لا يجوز لك نسخ أو توزيع أو تعديل أي جزء من المنصة دون إذن كتابي منا.'
    }
  ] : [
    {
      icon: Shield,
      title: 'Introduction',
      content: 'Welcome to Growth Circles. By using our platform, you agree to comply with these terms and conditions. Please read them carefully before using our services.'
    },
    {
      icon: Users,
      title: 'Use of Service',
      content: 'Growth Circles is a platform dedicated to personal and spiritual growth. You must use the platform responsibly and respect all users. Any abusive behavior, harassment, or inappropriate content is prohibited.'
    },
    {
      icon: FileText,
      title: 'Your Account',
      content: 'You are responsible for maintaining the confidentiality of your account and password. All information you provide must be accurate and up-to-date. You are responsible for all activities that occur under your account.'
    },
    {
      icon: Lock,
      title: 'Privacy and Data',
      content: 'We respect your privacy and are committed to protecting your personal data. We collect only the information necessary to provide our services and improve your experience. We will not share your information with third parties without your consent.'
    },
    {
      icon: Heart,
      title: 'Content and Conduct',
      content: 'Content you post must be respectful and constructive. We encourage positive sharing and mutual support. The team reserves the right to remove any content that violates these principles.'
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: 'All content and features on the platform are protected by copyright. You may not copy, distribute, or modify any part of the platform without written permission from us.'
    }
  ];

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
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/50 to-green-900/50" />
        
        {/* Animated particles effect */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
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

      {/* Glassmorphism Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-8 sm:p-10 max-h-[85vh] overflow-y-auto custom-scrollbar"
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6"
          >
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 text-white hover:text-green-300 transition-colors duration-300 group"
            >
              <motion.div
                whileHover={{ x: -5 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.div>
              <span className="font-medium">
                {language === 'ar' ? 'العودة' : 'Back'}
              </span>
            </Link>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <motion.img
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              src="/logo.png"
              alt="Growth Circles Logo"
              className="h-16 drop-shadow-2xl"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              {language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}
            </h1>
            <p className="text-gray-200 drop-shadow-md">
              {language === 'ar' 
                ? 'يُرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا'
                : 'Please read these terms carefully before using our services'
              }
            </p>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
              >
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <section.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-md">
                      {section.title}
                    </h3>
                    <p className="text-gray-200 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8 pt-8 border-t border-white/20"
          >
            <div className="text-center space-y-4">
              <p className="text-gray-300 text-sm">
                {language === 'ar'
                  ? 'آخر تحديث: أكتوبر 2024'
                  : 'Last updated: October 2024'
                }
              </p>
              <p className="text-gray-300 text-sm">
                {language === 'ar'
                  ? 'إذا كان لديك أي أسئلة حول هذه الشروط، يُرجى الاتصال بنا.'
                  : 'If you have any questions about these terms, please contact us.'
                }
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/50 transition-all duration-300"
                  >
                    {language === 'ar' ? 'أوافق وأنشئ حساب' : 'I Agree & Sign Up'}
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300"
                  >
                    {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.8);
        }
      `}</style>
    </div>
  );
};

export default TermsPage;

