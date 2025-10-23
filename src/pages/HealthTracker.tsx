import {
    Activity,
    Apple,
    Droplet,
    DropletIcon,
    Footprints,
    HeartPulse,
    Moon,
    Stethoscope
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface HealthMetric {
  current: number | string;
  goal?: number | string;
  unit: string;
}

interface HealthCardProps {
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  icon: React.ElementType;
  colors: {
    bg: string;
    accent: string;
    glow: string;
  };
  metric: HealthMetric;
  route: string;
}

const HealthCard: React.FC<HealthCardProps> = ({ title, description, icon: Icon, colors, metric, route }) => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div 
      className="group relative cursor-pointer"
      onClick={() => navigate(route)}
    >
      {/* Glow effect on hover */}
      <div 
        className={`absolute -inset-0.5 ${colors.glow} opacity-0 group-hover:opacity-75
          blur-lg transition-all duration-500 ease-in-out rounded-2xl`}
      />
      
      <div 
        className={`relative h-full ${isDark ? 'bg-gray-800 border border-gray-700' : colors.bg + ' border border-white/20'} rounded-2xl p-6
          shadow-lg backdrop-blur-sm
          transition-all duration-300 ease-in-out
          group-hover:scale-[1.02] group-hover:shadow-xl
          flex flex-col justify-between`}
      >
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <Icon className={`w-8 h-8 ${colors.accent} animate-pulse`} />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'ar' ? title.ar : title.en}
            </h3>
          </div>

          {/* Main Metric */}
          <div className="text-center my-4">
            <span className={`text-4xl font-bold ${colors.accent}`}>
              {metric.current}
            </span>
            {metric.goal && (
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} ml-2 text-lg`}>
                of {metric.goal} {metric.unit}
              </span>
            )}
            {!metric.goal && (
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} ml-2 text-lg`}>
                {metric.unit}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className={`text-center mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {language === 'ar' ? description.ar : description.en}
        </p>
      </div>
    </div>
  );
};

const HealthTracker: React.FC = () => {
  const { isDark } = useTheme();

  const healthCards: HealthCardProps[] = [
    {
      title: { en: "Nutrition Tracking", ar: "تتبع التغذية" },
      description: { en: "Track your daily nutrition", ar: "تتبع تغذيتك اليومية" },
      icon: Apple,
      colors: {
        bg: "bg-gradient-to-br from-green-50 to-emerald-50",
        accent: "text-emerald-500",
        glow: "bg-emerald-500/30"
      },
      metric: { current: "1,800", goal: "2,200", unit: "kcal" },
      route: "/health/nutrition"
    },
    {
      title: { en: "Water Tracking", ar: "تتبع المياه" },
      description: { en: "Monitor your hydration", ar: "راقب مستوى الترطيب" },
      icon: Droplet,
      colors: {
        bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
        accent: "text-blue-500",
        glow: "bg-blue-500/30"
      },
      metric: { current: "1.8", goal: "2.5", unit: "L" },
      route: "/health/water"
    },
    {
      title: { en: "Activity Tracking", ar: "تتبع النشاط" },
      description: { en: "Stay active every day", ar: "حافظ على نشاطك اليومي" },
      icon: Activity,
      colors: {
        bg: "bg-gradient-to-br from-purple-50 to-violet-50",
        accent: "text-purple-500",
        glow: "bg-purple-500/30"
      },
      metric: { current: "45", goal: "60", unit: "min" },
      route: "/health/activity"
    },
    {
      title: { en: "Sleep Tracking", ar: "تتبع النوم" },
      description: { en: "Track your sleep quality", ar: "تتبع جودة نومك" },
      icon: Moon,
      colors: {
        bg: "bg-gradient-to-br from-indigo-50 to-blue-50",
        accent: "text-indigo-500",
        glow: "bg-indigo-500/30"
      },
      metric: { current: "7", goal: "8", unit: "h" },
      route: "/health/sleep"
    },
    {
      title: { en: "Steps Tracking", ar: "تتبع الخطوات" },
      description: { en: "Track your daily steps", ar: "تتبع خطواتك اليومية" },
      icon: Footprints,
      colors: {
        bg: "bg-gradient-to-br from-pink-50 to-rose-50",
        accent: "text-pink-500",
        glow: "bg-pink-500/30"
      },
      metric: { current: "8,432", goal: "10,000", unit: "steps" },
      route: "/health/steps"
    },
    {
      title: { en: "Heart Rate", ar: "معدل ضربات القلب" },
      description: { en: "Monitor your heart health", ar: "راقب صحة قلبك" },
      icon: HeartPulse,
      colors: {
        bg: "bg-gradient-to-br from-red-50 to-rose-50",
        accent: "text-red-500",
        glow: "bg-red-500/30"
      },
      metric: { current: "72", unit: "BPM" },
      route: "/health/heart-rate"
    },
    {
      title: { en: "Blood Sugar", ar: "سكر الدم" },
      description: { en: "Track your blood sugar levels", ar: "تتبع مستويات السكر في الدم" },
      icon: DropletIcon,
      colors: {
        bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
        accent: "text-amber-500",
        glow: "bg-amber-500/30"
      },
      metric: { current: "95", unit: "mg/dL" },
      route: "/health/blood-sugar"
    },
    {
      title: { en: "Blood Pressure", ar: "ضغط الدم" },
      description: { en: "Monitor your blood pressure", ar: "راقب ضغط دمك" },
      icon: Stethoscope,
      colors: {
        bg: "bg-gradient-to-br from-cyan-50 to-sky-50",
        accent: "text-cyan-500",
        glow: "bg-cyan-500/30"
      },
      metric: { current: "120/80", unit: "mmHg" },
      route: "/health/blood-pressure"
    }
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'} min-h-screen`}>
      {/* Welcome Header */}
      <div className="text-center pt-8 pb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          Welcome To Health Pulse
        </h1>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2 text-lg`}>
          Track your health
        </p>
      </div>

      {/* Cards grid */}
      <div className="max-w-[1400px] w-full mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {healthCards.map((card, index) => (
            <HealthCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthTracker;
