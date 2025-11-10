import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Bot, TrendingUp, Target, Lightbulb, MessageCircle, Send, Loader2, Sparkles, BookOpen, Brain, Zap, Rocket } from 'lucide-react';
import { getGroqResponse, ChatMessage } from '../services/groqAPI';

const AICoachPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai' as const,
      content: language === 'ar' ? 
        'مرحباً! أنا مدربك الشخصي الذكي. كيف يمكنني مساعدتك اليوم في رحلة النمو الشخصي؟' :
        'Hello! I\'m your AI personal coach. How can I help you today on your personal growth journey?',
      timestamp: new Date().toISOString()
    }
  ]);

  const suggestedPrompts = useMemo(() => [
    {
      id: 1,
      icon: Target,
      prompt: language === 'ar' 
        ? 'ساعدني في وضع خطة لتحقيق أهدافي الأسبوعية' 
        : 'Help me create a plan to achieve my weekly goals',
      color: 'purple'
    },
    {
      id: 2,
      icon: TrendingUp,
      prompt: language === 'ar' 
        ? 'كيف يمكنني تحسين إنتاجيتي اليومية؟' 
        : 'How can I improve my daily productivity?',
      color: 'blue'
    },
    {
      id: 3,
      icon: BookOpen,
      prompt: language === 'ar' 
        ? 'اقترح عليّ عادات يومية مفيدة للنمو الشخصي' 
        : 'Suggest useful daily habits for personal growth',
      color: 'green'
    },
    {
      id: 4,
      icon: Brain,
      prompt: language === 'ar' 
        ? 'كيف أطور مهاراتي في إدارة الوقت؟' 
        : 'How can I develop my time management skills?',
      color: 'pink'
    },
    {
      id: 5,
      icon: Zap,
      prompt: language === 'ar' 
        ? 'أعطني نصائح لزيادة التركيز والانتباه' 
        : 'Give me tips to increase focus and attention',
      color: 'yellow'
    },
    {
      id: 6,
      icon: Rocket,
      prompt: language === 'ar' 
        ? 'ساعدني في بناء روتين صباحي فعال' 
        : 'Help me build an effective morning routine',
      color: 'orange'
    }
  ], [language]);


  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || chatInput.trim();
    if (textToSend && !isLoading) {
      const userMessageText = textToSend.trim();
      setChatInput('');
      setIsLoading(true);

      // Add user message immediately
      const userMessage = {
        id: chatMessages.length + 1,
        type: 'user' as const,
        content: userMessageText,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, userMessage]);

      try {
        // Prepare conversation history for Groq API
        const conversationHistory: ChatMessage[] = chatMessages
          .filter(msg => msg.id !== 1) // Exclude initial greeting
          .map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));

        // Add current user message
        conversationHistory.push({
          role: 'user',
          content: userMessageText
        });

        // Get AI response from Groq API
        const aiResponseText = await getGroqResponse(conversationHistory, language);

        // Add AI response
        const aiResponse = {
          id: chatMessages.length + 2,
          type: 'ai' as const,
          content: aiResponseText,
          timestamp: new Date().toISOString()
        };

        setChatMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        // Show error message
        const errorMessage = {
          id: chatMessages.length + 2,
          type: 'ai' as const,
          content: language === 'ar' 
            ? 'عذراً، حدث خطأ في الاتصال بالمدرب الذكي. يرجى المحاولة مرة أخرى.' 
            : 'Sorry, there was an error connecting to the AI coach. Please try again.',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUsePrompt = async (prompt: string) => {
    if (!isLoading) {
      await handleSendMessage(prompt);
    }
  };

  const promptColorClasses = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="text-center relative"
      >
        <motion.div 
          className="flex items-center justify-center space-x-3 mb-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div 
            className="w-12 h-12 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg shadow-purple-500/50"
            whileHover={{ 
              scale: 1.1,
              rotate: 360,
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.8)"
            }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(168, 85, 247, 0.5)",
                "0 0 30px rgba(168, 85, 247, 0.8)",
                "0 0 20px rgba(168, 85, 247, 0.5)"
              ]
            }}
            transition={{ 
              scale: { type: "spring", stiffness: 400, damping: 17 },
              rotate: { duration: 0.6 },
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <Bot className="w-6 h-6 text-white relative z-10" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0"
              whileHover={{ opacity: 0.3 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "200% auto"
            }}
          >
            {t('ai.coach')}
          </motion.h1>
        </motion.div>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {language === 'ar' ? 
            'مدربك الشخصي الذكي لتحقيق أهدافك وتطوير مهاراتك' :
            'Your intelligent personal coach to achieve your goals and develop your skills'
          }
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-[600px] lg:h-[calc(100vh-16rem)] flex flex-col relative overflow-hidden group"
            whileHover={{ 
              scale: 1.01,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
            }}
            transition={{ 
              scale: { type: "spring", stiffness: 300, damping: 20 },
              boxShadow: { duration: 0.3 }
            }}
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
                  "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))",
                  "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div 
              className="p-4 border-b border-gray-200 dark:border-gray-700 relative z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center relative shadow-md"
                  whileHover={{ 
                    scale: 1.15,
                    rotate: [0, -10, 10, -10, 0],
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)"
                  }}
                  transition={{ 
                    scale: { type: "spring", stiffness: 400, damping: 17 },
                    rotate: { duration: 0.5 }
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 10px rgba(168, 85, 247, 0.4)",
                      "0 0 20px rgba(168, 85, 247, 0.6)",
                      "0 0 10px rgba(168, 85, 247, 0.4)"
                    ]
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <Bot className="w-5 h-5 text-white relative z-10" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'المدرب الذكي' : 'AI Coach'}
                  </h3>
                  <motion.p 
                    className="text-sm text-green-500 flex items-center gap-1"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.span
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {language === 'ar' ? 'متاح الآن' : 'Online now'}
                  </motion.p>
                </div>
              </div>
            </motion.div>

            <div className="flex-1 p-4 overflow-y-auto relative z-10">
              <div className="space-y-4">
                <AnimatePresence>
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: message.type === 'user' ? 100 : -100 }}
                      transition={{ 
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: [0.6, -0.05, 0.01, 0.99]
                      }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                        }`}
                        whileHover={{ 
                          scale: 1.05,
                          y: -2,
                          boxShadow: message.type === 'user' 
                            ? "0 10px 25px rgba(34, 197, 94, 0.4)"
                            : "0 10px 25px rgba(0, 0, 0, 0.2)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <p className="text-sm whitespace-pre-wrap relative z-10">{message.content}</p>
                        {message.type === 'user' && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 rounded-lg"
                            whileHover={{ opacity: 0.2 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div 
                    className="flex justify-start"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md"
                      animate={{ 
                        boxShadow: [
                          "0 0 0px rgba(168, 85, 247, 0)",
                          "0 0 10px rgba(168, 85, 247, 0.5)",
                          "0 0 0px rgba(168, 85, 247, 0)"
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'المدرب يكتب...' : 'Coach is typing...'}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>

            <motion.div 
              className="p-4 border-t border-gray-200 dark:border-gray-700 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <motion.input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  whileFocus={{ 
                    scale: 1.02,
                    borderColor: "rgb(168, 85, 247)",
                    boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={isLoading || !chatInput.trim()}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg relative overflow-hidden shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isLoading && chatInput.trim() ? { 
                    scale: 1.1,
                    boxShadow: "0 10px 25px rgba(168, 85, 247, 0.5)"
                  } : {}}
                  whileTap={!isLoading && chatInput.trim() ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  ) : (
                    <Send className="w-4 h-4 relative z-10" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg relative overflow-hidden group"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
            }}
            transition={{ 
              scale: { type: "spring", stiffness: 300, damping: 20 },
              boxShadow: { duration: 0.3 }
            }}
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
                  "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))",
                  "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 relative z-10">
              {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            <div className="space-y-2 relative z-10">
              {[
                { 
                  icon: Target, 
                  bgColor: "bg-purple-100 dark:bg-purple-900/20", 
                  iconColor: "text-purple-500", 
                  text: language === 'ar' ? 'تحديد أهداف جديدة' : 'Set new goals',
                  prompt: language === 'ar' 
                    ? 'ساعدني في تحديد أهداف جديدة ووضع خطة لتحقيقها' 
                    : 'Help me set new goals and create a plan to achieve them'
                },
                { 
                  icon: TrendingUp, 
                  bgColor: "bg-blue-100 dark:bg-blue-900/20", 
                  iconColor: "text-blue-500", 
                  text: t('progress.analysis'),
                  prompt: language === 'ar' 
                    ? 'حلل تقدمي وأعطني ملاحظات حول أدائي' 
                    : 'Analyze my progress and give me feedback on my performance'
                },
                { 
                  icon: Lightbulb, 
                  bgColor: "bg-yellow-100 dark:bg-yellow-900/20", 
                  iconColor: "text-yellow-500", 
                  text: language === 'ar' ? 'اقتراحات مخصصة' : 'Custom suggestions',
                  prompt: language === 'ar' 
                    ? 'أعطني اقتراحات مخصصة لتحسين روتيني اليومي' 
                    : 'Give me custom suggestions to improve my daily routine'
                }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleUsePrompt(action.prompt)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-lg relative overflow-hidden group/button disabled:opacity-50 disabled:cursor-not-allowed"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.6 + index * 0.1, 
                      duration: 0.5,
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17 
                    }}
                    whileHover={!isLoading ? { 
                      x: 5,
                      scale: 1.02
                    } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover/button:opacity-100 rounded-lg"
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex items-center space-x-2 relative z-10">
                      <motion.div
                        className={`w-8 h-8 rounded-lg ${action.bgColor} flex items-center justify-center`}
                        whileHover={{ 
                          scale: 1.2,
                          rotate: 360
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className={`w-4 h-4 ${action.iconColor}`} />
                      </motion.div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {action.text}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Suggested Prompts */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg relative overflow-hidden group"
        whileHover={{ 
          scale: 1.01,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
        }}
        transition={{ 
          scale: { type: "spring", stiffness: 300, damping: 20 },
          boxShadow: { duration: 0.3 }
        }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))",
              "linear-gradient(225deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))",
              "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))"
            ]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <motion.h3 
            className="text-2xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "200% auto"
            }}
          >
            {language === 'ar' ? 'برومبتات مقترحة' : 'Suggested Prompts'}
          </motion.h3>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-6 h-6 text-purple-500" />
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {suggestedPrompts.map((promptItem, index) => {
            const Icon = promptItem.icon;
            return (
              <motion.button
                key={promptItem.id}
                onClick={() => handleUsePrompt(promptItem.prompt)}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.8 + index * 0.1,
                  duration: 0.6,
                  ease: [0.6, -0.05, 0.01, 0.99]
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`p-5 rounded-xl relative overflow-hidden border-2 ${promptColorClasses[promptItem.color as keyof typeof promptColorClasses]} shadow-md group/prompt cursor-pointer text-left`}
                disabled={isLoading}
              >
                {/* Animated gradient overlay */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover/prompt:opacity-20 pointer-events-none"
                  animate={{
                    background: [
                      `linear-gradient(135deg, ${promptItem.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' : promptItem.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : promptItem.color === 'green' ? 'rgba(34, 197, 94, 0.3)' : promptItem.color === 'pink' ? 'rgba(236, 72, 153, 0.3)' : promptItem.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(249, 115, 22, 0.3)'}, transparent)`,
                      `linear-gradient(225deg, transparent, ${promptItem.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' : promptItem.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : promptItem.color === 'green' ? 'rgba(34, 197, 94, 0.3)' : promptItem.color === 'pink' ? 'rgba(236, 72, 153, 0.3)' : promptItem.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(249, 115, 22, 0.3)'})`,
                      `linear-gradient(135deg, ${promptItem.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' : promptItem.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : promptItem.color === 'green' ? 'rgba(34, 197, 94, 0.3)' : promptItem.color === 'pink' ? 'rgba(236, 72, 153, 0.3)' : promptItem.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(249, 115, 22, 0.3)'}, transparent)`
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="flex items-start space-x-3 relative z-10">
                  <motion.div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      promptItem.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      promptItem.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      promptItem.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      promptItem.color === 'pink' ? 'bg-pink-100 dark:bg-pink-900/30' :
                      promptItem.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-orange-100 dark:bg-orange-900/30'
                    }`}
                    whileHover={{ 
                      scale: 1.2,
                      rotate: 360
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`w-5 h-5 ${
                      promptItem.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      promptItem.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      promptItem.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      promptItem.color === 'pink' ? 'text-pink-600 dark:text-pink-400' :
                      promptItem.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`} />
                  </motion.div>
                  <p className="text-sm font-medium leading-relaxed relative z-10 flex-1">
                    {promptItem.prompt}
                  </p>
                  <motion.div
                    className="flex-shrink-0 opacity-0 group-hover/prompt:opacity-100 transition-opacity"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AICoachPage;