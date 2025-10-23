import { motion } from 'framer-motion';
import {
    AlertCircle,
    Edit,
    Eye,
    MessageCircle,
    RefreshCw,
    Shield,
    Trash2,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmDeletePostModal from '../components/admin/ConfirmDeletePostModal';
import CreateCircleModal from '../components/admin/CreateCircleModal';
import DeleteCircleModal from '../components/admin/DeleteCircleModal';
import DeleteUserModal from '../components/admin/DeleteUserModal';
import EditCircleModal from '../components/admin/EditCircleModal';
import EditUserModal from '../components/admin/EditUserModal';
import { useLanguage } from '../contexts/LanguageContext';
import {
    AdminStats,
    CircleWithStats,
    deletePost,
    getAdminStats,
    getAllCircles,
    getAllUsers,
    getRecentPosts,
    updateUserStatus,
    UserWithStats
} from '../firebase/admin';
import { Post } from '../types';

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  
  // Define a type for tab IDs
  type TabId = 'overview' | 'users' | 'circles' | 'reports';
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Real data state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [circles, setCircles] = useState<CircleWithStats[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; user: UserWithStats | null }>({
    isOpen: false,
    user: null
  });
  const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean; user: UserWithStats | null }>({
    isOpen: false,
    user: null
  });
  const [createCircleModal, setCreateCircleModal] = useState(false);
  const [editCircleModal, setEditCircleModal] = useState<{ isOpen: boolean; circle: CircleWithStats | null }>({
    isOpen: false,
    circle: null
  });
  const [deleteCircleModal, setDeleteCircleModal] = useState<{ isOpen: boolean; circle: CircleWithStats | null }>({
    isOpen: false,
    circle: null
  });
  const [deletePostModal, setDeletePostModal] = useState<{ isOpen: boolean; post: Post | null }>({
    isOpen: false,
    post: null
  });

  // Load all admin data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, usersData, circlesData, postsData] = await Promise.all([
        getAdminStats(),
        getAllUsers(20),
        getAllCircles(),
        getRecentPosts(10)
      ]);
      
      setAdminStats(statsData);
      setUsers(usersData.users);
      setCircles(circlesData);
      setRecentPosts(postsData);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data');
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  // Load data on component mount
  useEffect(() => {
    loadAdminData();
  }, []);

  // Format stats for display
  const getFormattedStats = () => {
    if (!adminStats) return [];
    
    return [
      {
        label: language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',
        value: adminStats.totalUsers.toLocaleString(),
        change: `+${adminStats.weeklyUsers}`,
        changeLabel: language === 'ar' ? 'هذا الأسبوع' : 'this week',
        icon: <Users className="w-6 h-6" />
      },
      {
        label: language === 'ar' ? 'دوائر النمو' : 'Growth Circles',
        value: adminStats.totalCircles.toLocaleString(),
        change: adminStats.totalCircles > 0 ? 'Active' : 'None',
        changeLabel: '',
        icon: <MessageCircle className="w-6 h-6" />
      },
      {
        label: language === 'ar' ? 'المنشورات اليومية' : 'Daily Posts',
        value: adminStats.dailyPosts.toLocaleString(),
        change: `${adminStats.totalPosts}`,
        changeLabel: language === 'ar' ? 'إجمالي' : 'total',
        icon: <TrendingUp className="w-6 h-6" />
      },
      {
        label: language === 'ar' ? 'المستخدمين النشطين' : 'Active Users',
        value: adminStats.activeUsers.toLocaleString(),
        change: `${Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100)}%`,
        changeLabel: language === 'ar' ? 'من الإجمالي' : 'of total',
        icon: <Eye className="w-6 h-6" />
      }
    ];
  };

  // User management functions
  const handleToggleUserAdmin = async (userId: string, currentAdminStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentAdminStatus);
      await loadAdminData(); // Refresh data
      toast.success(
        language === 'ar' 
          ? 'تم تحديث حالة المستخدم بنجاح' 
          : 'User status updated successfully'
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في تحديث حالة المستخدم' 
          : 'Failed to update user status'
      );
    }
  };

  // Modal handlers
  const handleEditUser = (user: UserWithStats) => {
    setEditUserModal({ isOpen: true, user });
  };

  const handleDeleteUser = (user: UserWithStats) => {
    setDeleteUserModal({ isOpen: true, user });
  };

  const handleEditCircle = (circle: CircleWithStats) => {
    setEditCircleModal({ isOpen: true, circle });
  };

  const handleDeleteCircle = (circle: CircleWithStats) => {
    setDeleteCircleModal({ isOpen: true, circle });
  };

  const handleCreateCircle = () => {
    setCreateCircleModal(true);
  };

  const closeModals = () => {
    setEditUserModal({ isOpen: false, user: null });
    setDeleteUserModal({ isOpen: false, user: null });
    setCreateCircleModal(false);
    setEditCircleModal({ isOpen: false, circle: null });
    setDeleteCircleModal({ isOpen: false, circle: null });
    setDeletePostModal({ isOpen: false, post: null });
  };

  const handleDataUpdated = () => {
    loadAdminData();
    closeModals();
  };

  // Delete post function - open modal
  const handleDeletePostClick = (post: Post) => {
    setDeletePostModal({ isOpen: true, post });
  };

  // Confirm delete post
  const confirmDeletePost = async () => {
    if (!deletePostModal.post) return;

    try {
      await deletePost(deletePostModal.post.id);
      await loadAdminData(); // Refresh data
      toast.success(
        language === 'ar' 
          ? 'تم حذف المنشور بنجاح' 
          : 'Post deleted successfully'
      );
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في حذف المنشور' 
          : 'Failed to delete post'
      );
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }
    );
  };

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview' },
    { id: 'users', label: language === 'ar' ? 'المستخدمين' : 'Users' },
    { id: 'circles', label: language === 'ar' ? 'الدوائر' : 'Circles' },
    { id: 'reports', label: language === 'ar' ? 'التقارير' : 'Reports' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'لوحة التحكم الإدارية' : 'Admin Dashboard'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'إدارة المنصة والمستخدمين' : 'Manage platform and users'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))
        ) : (
          getFormattedStats().map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {stat.change} {stat.changeLabel}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'نظرة عامة على النظام' : 'System Overview'}
              </h3>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {language === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'إجمالي المستخدمين:' : 'Total Users:'}
                        </span>
                        <span className="font-medium">{adminStats?.totalUsers.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'المستخدمون النشطون:' : 'Active Users:'}
                        </span>
                        <span className="font-medium">{adminStats?.activeUsers.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'إجمالي المنشورات:' : 'Total Posts:'}
                        </span>
                        <span className="font-medium">{adminStats?.totalPosts.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'منشورات اليوم:' : 'Today\'s Posts:'}
                        </span>
                        <span className="font-medium">{adminStats?.dailyPosts.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'مستخدمون هذا الأسبوع:' : 'This Week\'s Users:'}
                        </span>
                        <span className="font-medium">{adminStats?.weeklyUsers.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'دوائر النمو:' : 'Growth Circles:'}
                        </span>
                        <span className="font-medium">{adminStats?.totalCircles.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                      <th className="px-6 py-3">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th className="px-6 py-3">{language === 'ar' ? 'المستوى' : 'Level'}</th>
                      <th className="px-6 py-3">{language === 'ar' ? 'النقاط' : 'XP'}</th>
                      <th className="px-6 py-3">{language === 'ar' ? 'المنشورات' : 'Posts'}</th>
                      <th className="px-6 py-3">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-6 py-3">{language === 'ar' ? 'مشرف' : 'Admin'}</th>
                      <th className="px-6 py-3">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div></td>
                          <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></td>
                          <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
                          <td className="px-6 py-4"><div className="flex space-x-2">
                            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div></td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'لا توجد مستخدمين' : 'No users found'}
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.level}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.xp.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.postsCount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {language === 'ar' ? (user.status === 'active' ? 'نشط' : 'غير نشط') : user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleUserAdmin(user.id, user.isAdmin)}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                user.isAdmin
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {user.isAdmin
                                ? (language === 'ar' ? 'مشرف' : 'Admin')
                                : (language === 'ar' ? 'عادي' : 'User')
                              }
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                title={language === 'ar' ? 'تعديل المستخدم' : 'Edit User'}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleUserAdmin(user.id, user.isAdmin)}
                                className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
                                title={language === 'ar' ? 'تغيير الصلاحيات' : 'Toggle Admin'}
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400"
                                title={language === 'ar' ? 'حذف المستخدم' : 'Delete User'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Circles Tab */}
          {activeTab === 'circles' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'إدارة الدوائر' : 'Circle Management'}
                </h3>
                <button
                  onClick={handleCreateCircle}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إنشاء دائرة' : 'Create Circle'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                        <div className="flex space-x-2">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                  ))
                ) : circles.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'لا توجد دوائر' : 'No circles found'}
                  </div>
                ) : (
                  circles.map(circle => (
                    <div key={circle.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {language === 'ar' ? circle.nameAr : circle.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            circle.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {language === 'ar' ? (circle.status === 'active' ? 'نشط' : 'غير نشط') : circle.status}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditCircle(circle)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                              title={language === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCircle(circle)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400"
                              title={language === 'ar' ? 'حذف' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {language === 'ar' ? circle.categoryAr : circle.category}
                      </p>
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                        {language === 'ar' ? circle.descriptionAr : circle.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {circle.members.toLocaleString()} {language === 'ar' ? 'عضو' : 'members'}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {circle.posts.toLocaleString()} {language === 'ar' ? 'منشور' : 'posts'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {language === 'ar' ? 'تم الإنشاء:' : 'Created:'} {formatDate(circle.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Analytics'}
              </h3>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                      <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-3"></div>
                      <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        {language === 'ar' ? 'المستخدمون النشطون' : 'Active Users'}
                      </h4>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {adminStats?.activeUsers.toLocaleString() || '0'}
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {adminStats ? Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100) : 0}% {language === 'ar' ? 'من الإجمالي' : 'of total'}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                        {language === 'ar' ? 'المنشورات اليومية' : 'Daily Posts'}
                      </h4>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {adminStats?.dailyPosts.toLocaleString() || '0'}
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {language === 'ar' ? 'آخر 24 ساعة' : 'Last 24 hours'}
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                        {language === 'ar' ? 'المستخدمون الأسبوعيون' : 'Weekly Users'}
                      </h4>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {adminStats?.weeklyUsers.toLocaleString() || '0'}
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}
                      </p>
                    </div>
                  </div>

                  {/* Recent Posts */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      {language === 'ar' ? 'المنشورات الأخيرة' : 'Recent Posts'}
                    </h4>
                    <div className="space-y-4">
                      {recentPosts.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          {language === 'ar' ? 'لا توجد منشورات' : 'No recent posts'}
                        </p>
                      ) : (
                        recentPosts.slice(0, 5).map(post => (
                          <div key={post.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group">
                            <img
                              src={post.user?.avatar || post.userAvatar || ''}
                              alt={post.user?.name || post.userName || 'User'}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {post.user?.name || post.userName || 'Unknown User'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(post.createdAt)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeletePostClick(post)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                                  title={language === 'ar' ? 'حذف المنشور' : 'Delete Post'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {post.content}
                              </p>
                              {(post.likes !== undefined || post.comments !== undefined) && (
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>{post.likes || 0} {language === 'ar' ? 'إعجاب' : 'likes'}</span>
                                  <span>{post.comments || 0} {language === 'ar' ? 'تعليق' : 'comments'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <EditUserModal
        isOpen={editUserModal.isOpen}
        onClose={closeModals}
        user={editUserModal.user}
        onUserUpdated={handleDataUpdated}
      />

      <DeleteUserModal
        isOpen={deleteUserModal.isOpen}
        onClose={closeModals}
        user={deleteUserModal.user}
        onUserDeleted={handleDataUpdated}
      />

      <CreateCircleModal
        isOpen={createCircleModal}
        onClose={closeModals}
        onCircleCreated={handleDataUpdated}
      />

      <EditCircleModal
        isOpen={editCircleModal.isOpen}
        onClose={closeModals}
        circle={editCircleModal.circle}
        onCircleUpdated={handleDataUpdated}
      />

      <DeleteCircleModal
        isOpen={deleteCircleModal.isOpen}
        onClose={closeModals}
        circle={deleteCircleModal.circle}
        onCircleDeleted={handleDataUpdated}
      />

      <ConfirmDeletePostModal
        isOpen={deletePostModal.isOpen}
        onClose={closeModals}
        onConfirm={confirmDeletePost}
        postContent={deletePostModal.post?.content}
      />
    </div>
  );
};

export default AdminDashboard;
