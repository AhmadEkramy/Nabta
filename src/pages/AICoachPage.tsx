import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Bot, TrendingUp, Target, Lightbulb, MessageCircle, Send } from 'lucide-react';

const AICoachPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: language === 'ar' ? 
        'مرحباً! أنا مدربك الشخصي الذكي. كيف يمكنني مساعدتك اليوم في رحلة النمو الشخصي؟' :
        'Hello! I\'m your AI personal coach. How can I help you today on your personal growth journey?',
      timestamp: new Date().toISOString()
    }
  ]);

  const weeklyGoals = [
    {
      id: 1,
      title: language === 'ar' ? 'قراءة 3 كتب' : 'Read 3 books',
      progress: 65,
      status: 'in_progress'
    },
    {
      id: 2,
      title: language === 'ar' ? 'تعلم 50 كلمة إنجليزية' : 'Learn 50 English words',
      progress: 80,
      status: 'in_progress'
    },
    {
      id: 3,
      title: language === 'ar' ? 'ممارسة التأمل يومياً' : 'Daily meditation practice',
      progress: 100,
      status: 'completed'
    }
  ];

  const insights = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: language === 'ar' ? 'تقدم ممتاز' : 'Excellent Progress',
      description: language === 'ar' ? 
        'تقدمك في الأسبوع الماضي كان رائعاً! زيادة 15% في الإنتاجية.' :
        'Your progress last week was amazing! 15% increase in productivity.',
      color: 'green'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: language === 'ar' ? 'نصيحة للتركيز' : 'Focus Tip',
      description: language === 'ar' ? 
        'جرب تقنية البومودورو لمدة 25 دقيقة يومياً لتحسين التركيز.' :
        'Try the Pomodoro technique for 25 minutes daily to improve focus.',
      color: 'blue'
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: language === 'ar' ? 'اقتراح جديد' : 'New Suggestion',
      description: language === 'ar' ? 
        'بناءً على تقدمك، أنصحك بالانضمام لدائرة تعلم اللغات.' :
        'Based on your progress, I suggest joining the language learning circle.',
      color: 'purple'
    }
  ];

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Add user message
      const userMessage = {
        id: chatMessages.length + 1,
        type: 'user' as const,
        content: chatInput,
        timestamp: new Date().toISOString()
      };

      // Simulate AI response
      const aiResponse = {
        id: chatMessages.length + 2,
        type: 'ai' as const,
        content: language === 'ar' ? 
          'شكراً لك على سؤالك! بناءً على تقدمك الحالي، أنصحك بالتركيز على...' :
          'Thank you for your question! Based on your current progress, I recommend focusing on...',
        timestamp: new Date().toISOString()
      };

      setChatMessages([...chatMessages, userMessage, aiResponse]);
      setChatInput('');
    }
  };

  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t('ai.coach')}
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {language === 'ar' ? 
            'مدربك الشخصي الذكي لتحقيق أهدافك وتطوير مهاراتك' :
            'Your intelligent personal coach to achieve your goals and develop your skills'
          }
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-96 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'المدرب الذكي' : 'AI Coach'}
                  </h3>
                  <p className="text-sm text-green-500">
                    {language === 'ar' ? 'متاح الآن' : 'Online now'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weekly Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('weekly.goals')}
            </h3>
            <div className="space-y-4">
              {weeklyGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {goal.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      goal.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {language === 'ar' ? 'تحديد أهداف جديدة' : 'Set new goals'}
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {t('progress.analysis')}
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {language === 'ar' ? 'اقتراحات مخصصة' : 'Custom suggestions'}
                  </span>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {language === 'ar' ? 'رؤى وتوصيات ذكية' : 'AI Insights & Recommendations'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${colorClasses[insight.color]}`}
            >
              <div className="flex items-center space-x-3 mb-3">
                {insight.icon}
                <h4 className="font-semibold">{insight.title}</h4>
              </div>
              <p className="text-sm opacity-90">{insight.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AICoachPage;