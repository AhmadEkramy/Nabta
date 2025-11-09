import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGame } from '../contexts/GameContext';
import { 
  ShoppingBag, 
  Star, 
  Crown, 
  Gamepad2,
  Palette, 
  Zap, 
  Shield, 
  Gift,
  Filter,
  Search,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoreItems, getUserPurchasedItems, purchaseStoreItem, deleteAllStoreItems, addGameItemsToStore, removeDuplicateGameItems } from '../firebase/store';

interface StoreItem {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  category: 'avatar' | 'theme' | 'badge' | 'boost' | 'special';
  icon: string;
  image?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isPurchased?: boolean;
  isLimited?: boolean;
  discount?: number;
}

const StorePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language } = useLanguage();
  const { addXP } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: language === 'ar' ? 'جميع العناصر' : 'All Items', icon: ShoppingBag },
    { id: 'game', name: language === 'ar' ? 'الألعاب' : 'Games', icon: Gamepad2 },
    { id: 'avatar', name: language === 'ar' ? 'الصور الرمزية' : 'Avatars', icon: Crown },
    { id: 'theme', name: language === 'ar' ? 'الثيمات' : 'Themes', icon: Palette },
    { id: 'badge', name: language === 'ar' ? 'الشارات' : 'Badges', icon: Shield },
    { id: 'boost', name: language === 'ar' ? 'التعزيزات' : 'Boosts', icon: Zap },
    { id: 'special', name: language === 'ar' ? 'عناصر خاصة' : 'Special Items', icon: Gift }
  ];

  // Remove duplicate game items and add game items to store on mount
  useEffect(() => {
    const setupGameItems = async () => {
      try {
        // First, remove any duplicate game items
        await removeDuplicateGameItems();
        // Then, add game items if they don't exist
        await addGameItemsToStore();
      } catch (error) {
        console.error('Error setting up game items:', error);
      }
    };
    
    setupGameItems();
  }, []);

  // Load store items and purchased items on mount
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        
        // Load store items from Firebase
        const items = await getStoreItems();
        setStoreItems(items);
        
        // Load user's purchased items
        if (user?.id) {
          const purchased = await getUserPurchasedItems(user.id);
          setPurchasedItems(purchased);
        }
      } catch (error) {
        console.error('Error loading store data:', error);
        toast.error(
          language === 'ar' 
            ? 'حدث خطأ أثناء تحميل العناصر' 
            : 'Error loading store items'
        );
      } finally {
        setLoading(false);
      }
    };
    
    loadStoreData();
  }, [user?.id, language]);

  const filteredItems = storeItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.nameAr.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-500';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300';
      case 'rare':
        return 'border-blue-400';
      case 'epic':
        return 'border-purple-400';
      case 'legendary':
        return 'border-yellow-400';
      default:
        return 'border-gray-300';
    }
  };

  const handlePurchase = async (item: StoreItem) => {
    if (!user) {
      toast.error(
        language === 'ar' 
          ? 'يجب تسجيل الدخول أولاً' 
          : 'Please login first'
      );
      return;
    }

    // Prevent multiple clicks
    if (purchasingItemId === item.id) {
      return;
    }

    const finalPrice = item.discount 
      ? Math.floor(item.price * (1 - item.discount / 100))
      : item.price;

    // Check if user already owns this item
    if (purchasedItems.includes(item.id)) {
      toast.error(
        language === 'ar' 
          ? 'لقد قمت بشراء هذا العنصر بالفعل' 
          : 'You already own this item'
      );
      return;
    }

    // Check if user has enough XP
    if (user.xp < finalPrice) {
      toast.error(
        language === 'ar' 
          ? 'ليس لديك نقاط XP كافية!' 
          : 'Not enough XP points!'
      );
      return;
    }

    setPurchasingItemId(item.id);

    try {
      // Purchase item (deducts XP and adds to purchased items)
      const result = await purchaseStoreItem(user.id, item.id, finalPrice);
      
      if (result.success) {
        // Update local state
        setPurchasedItems([...purchasedItems, item.id]);
        
        // Refresh user data to get updated XP
        await refreshUser();
        
        // If it's a game item, emit event to refresh games page
        if (item.category === 'game') {
          window.dispatchEvent(new CustomEvent('gamePurchased'));
        }
        
        toast.success(
          language === 'ar' 
            ? `تم شراء ${item.nameAr} بنجاح!` 
            : `Successfully purchased ${item.name}!`
        );
      } else {
        toast.error(
          language === 'ar' 
            ? result.error || 'فشل شراء العنصر' 
            : result.error || 'Failed to purchase item'
        );
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء شراء العنصر' 
          : 'Error purchasing item'
      );
    } finally {
      setPurchasingItemId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'متجر XP' : 'XP Store'}
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          {language === 'ar' ? 
            'استخدم نقاط XP لشراء عناصر حصرية وتخصيص تجربتك' :
            'Use your XP points to buy exclusive items and customize your experience'
          }
        </p>
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full">
            <span className="text-lg font-bold">{user?.xp || 0} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن العناصر...' : 'Search items...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.name}</span>
          </button>
        ))}
      </motion.div>

      {/* Store Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 ${getRarityBorder(item.rarity)} relative overflow-hidden`}
          >
            {/* Rarity Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(item.rarity)} opacity-5 pointer-events-none`}></div>
            
            {/* Limited Badge */}
            {item.isLimited && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {language === 'ar' ? 'محدود' : 'Limited'}
              </div>
            )}

            {/* Discount Badge */}
            {item.discount && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                -{item.discount}%
              </div>
            )}

            {/* Item Icon */}
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRarityColor(item.rarity)} flex items-center justify-center text-3xl mb-4 mx-auto`}>
              {item.icon}
            </div>

            {/* Item Info */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
              {language === 'ar' ? item.nameAr : item.name}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
              {language === 'ar' ? item.descriptionAr : item.description}
            </p>

            {/* Rarity */}
            <div className="flex items-center justify-center mb-4">
              <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${getRarityColor(item.rarity)} text-white font-medium`}>
                {item.rarity.toUpperCase()}
              </span>
            </div>

            {/* Price and Purchase */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-gray-900 dark:text-white">
                  {item.discount 
                    ? (
                      <>
                        <span className="line-through text-gray-500 text-sm">{item.price}</span>
                        <span className="ml-1">{Math.floor(item.price * (1 - item.discount / 100))}</span>
                      </>
                    )
                    : item.price
                  } XP
                </span>
              </div>
              
              {purchasedItems.includes(item.id) ? (
                <div className="flex items-center space-x-1 text-green-500">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? 'مملوك' : 'Owned'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={
                    (user?.xp || 0) < (item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price) ||
                    purchasingItemId === item.id ||
                    !user
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    (user?.xp || 0) >= (item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price) &&
                    purchasingItemId !== item.id &&
                    user
                      ? 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {purchasingItemId === item.id 
                    ? (language === 'ar' ? 'جاري الشراء...' : 'Purchasing...')
                    : (language === 'ar' ? 'شراء' : 'Buy')
                  }
                </button>
              )}
            </div>
          </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'لا توجد عناصر' : 'No items found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ar' ? 'جرب البحث بكلمات أخرى أو تغيير الفئة' : 'Try searching with different keywords or change the category'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StorePage;