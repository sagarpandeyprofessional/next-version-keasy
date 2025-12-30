/**
 * @file AdminDashboard.jsx
 * @description Main admin dashboard providing overview and navigation to admin functions.
 *
 * Features:
 * - Platform statistics overview
 * - Quick navigation to admin sections
 * - Recent activities feed
 * - Content moderation summary
 * - User management overview
 * - Admin-only access
 * - Bilingual support (EN/KO)
 *
 * @requires react
 * @requires react-router-dom
 * @requires supabase-client
 * @requires lucide-react
 * @requires framer-motion
 *
 * @author Keasy
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "../../api/supabase-client";
import { isSuperadmin } from "../../utils/adminUtils";
import { motion } from 'framer-motion';
import AdminSignIn from './AdminSignIn';
import {
  Globe,
  Shield,
  Users,
  Briefcase,
  Building2,
  FileText,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  BarChart3,
  Activity,
  ArrowRight,
  Loader2,
  RefreshCw,
  Calendar,
  MessageSquare,
  ShoppingCart,
  MapPin
} from 'lucide-react';

const LABELS = {
  pageTitle: { en: 'Admin Dashboard', ko: '관리자 대시보드' },
  pageSubtitle: { en: 'Platform overview and management', ko: '플랫폼 개요 및 관리' },
  totalUsers: { en: 'Total Users', ko: '총 사용자' },
  totalJobs: { en: 'Total Jobs', ko: '총 채용공고' },
  totalCompanies: { en: 'Total Companies', ko: '총 회사' },
  pendingJobs: { en: 'Pending Jobs', ko: '대기 중인 채용공고' },
  pendingCompanies: { en: 'Pending Companies', ko: '대기 중인 회사' },
  totalGuides: { en: 'Total Guides', ko: '총 가이드' },
  pendingGuides: { en: 'Pending Guides', ko: '대기 중인 가이드' },
  totalMarketplace: { en: 'Marketplace Items', ko: '마켓플레이스 상품' },
  totalEvents: { en: 'Total Events', ko: '총 이벤트' },
  recentActivity: { en: 'Recent Activity', ko: '최근 활동' },
  quickActions: { en: 'Quick Actions', ko: '빠른 작업' },
  manageJobs: { en: 'Manage Jobs', ko: '채용공고 관리' },
  manageCompanies: { en: 'Manage Companies', ko: '회사 관리' },
  manageGuides: { en: 'Manage Guides', ko: '가이드 관리' },
  viewAnalytics: { en: 'View Analytics', ko: '분석 보기' },
  systemSettings: { en: 'System Settings', ko: '시스템 설정' },
  contentModeration: { en: 'Content Moderation', ko: '콘텐츠 조정' },
  userManagement: { en: 'User Management', ko: '사용자 관리' },
  marketplaceModeration: { en: 'Marketplace Moderation', ko: '마켓플레이스 조정' },
  adminOnly: { en: 'Admin access required', ko: '관리자 권한이 필요합니다' },
  goBack: { en: 'Go Back', ko: '돌아가기' },
  refresh: { en: 'Refresh', ko: '새로고침' },
  loading: { en: 'Loading...', ko: '로딩 중...' },
  noActivity: { en: 'No recent activity', ko: '최근 활동 없음' },
  viewAll: { en: 'View All', ko: '전체 보기' },
  pendingApprovals: { en: 'Pending Approvals', ko: '대기 중인 승인' },
  approvedToday: { en: 'Approved Today', ko: '오늘 승인됨' },
  newRegistrations: { en: 'New Registrations', ko: '새 등록' },
  activeUsers: { en: 'Active Users', ko: '활성 사용자' }
};

/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

/**
 * Stats Card Component
 */
const StatsCard = ({ icon: Icon, label, value, color, trend, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-80">{label}</p>
          {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <TrendingUp className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Quick Action Card Component
 */
const QuickActionCard = ({ icon: Icon, title, description, to, color, external }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
  };

  const CardComponent = external ? 'a' : Link;
  const cardProps = external ? { href: to, target: '_blank', rel: 'noopener noreferrer' } : { to };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="block"
    >
      <CardComponent
        {...cardProps}
        className={`p-6 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all ${colorClasses[color]}`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      </CardComponent>
    </motion.div>
  );
};

/**
 * Activity Item Component
 */
const ActivityItem = ({ icon: Icon, title, description, time, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </motion.div>
  );
};

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  const [user, setUser] = useState(null);
  const [isSuperadminUser, setIsSuperadminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    companies: 0,
    pendingJobs: 0,
    pendingCompanies: 0,
    guides: 0,
    pendingGuides: 0,
    marketplace: 0,
    events: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [lang, setLang] = useState('en');

  // ============================================================================
  // LABELS HELPER
  // ============================================================================

  const t = useCallback((key) => {
    return LABELS[key]?.[lang] || LABELS[key]?.en || key;
  }, [lang]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchStats = useCallback(async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch jobs stats
      const { data: jobsData } = await supabase
        .from('job')
        .select('approved');

      const totalJobs = jobsData?.length || 0;
      const pendingJobs = jobsData?.filter(j => j.approved === null || j.approved === undefined).length || 0;

      // Fetch companies stats
      const { data: companiesData } = await supabase
        .from('companies')
        .select('verified');

      const totalCompanies = companiesData?.length || 0;
      const pendingCompanies = companiesData?.filter(c => c.verified === null || c.verified === undefined).length || 0;

      // Fetch guides stats
      const { data: guidesData } = await supabase
        .from('guide')
        .select('approved');

      const totalGuides = guidesData?.length || 0;
      const pendingGuides = guidesData?.filter(g => g.approved === null || g.approved === undefined).length || 0;

      // Fetch marketplace count
      const { count: marketplaceCount } = await supabase
        .from('marketplace')
        .select('*', { count: 'exact', head: true });

      // Fetch events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setStats({
        users: usersCount || 0,
        jobs: totalJobs,
        companies: totalCompanies,
        pendingJobs,
        pendingCompanies,
        guides: totalGuides,
        pendingGuides,
        marketplace: marketplaceCount || 0,
        events: eventsCount || 0
      });

      // Generate recent activity (mock data for now)
      const activities = [
        {
          id: 1,
          type: 'job_approved',
          title: lang === 'ko' ? '채용공고 승인됨' : 'Job Approved',
          description: lang === 'ko' ? '새로운 채용공고가 승인되었습니다' : 'New job posting was approved',
          time: lang === 'ko' ? '2시간 전' : '2 hours ago',
          color: 'green'
        },
        {
          id: 2,
          type: 'company_registered',
          title: lang === 'ko' ? '회사 등록' : 'Company Registered',
          description: lang === 'ko' ? '새 회사가 등록되었습니다' : 'New company registered',
          time: lang === 'ko' ? '4시간 전' : '4 hours ago',
          color: 'blue'
        },
        {
          id: 3,
          type: 'user_joined',
          title: lang === 'ko' ? '새 사용자' : 'New User',
          description: lang === 'ko' ? '새 사용자가 가입했습니다' : 'New user joined the platform',
          time: lang === 'ko' ? '6시간 전' : '6 hours ago',
          color: 'purple'
        }
      ];
      setRecentActivity(activities);

    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [lang]);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
          navigate('/admin/signin');
          return;
        }

        setUser(currentUser);

        // Check if user is superadmin
        const isSuperAdmin = await isSuperadmin(currentUser);
        setIsSuperadminUser(isSuperAdmin);

        if (isSuperAdmin) {
          await fetchStats();
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, fetchStats]);

  // ============================================================================
  // RENDER: Loading
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // ============================================================================
  // RENDER: Not Superuser
  // ============================================================================

  if (!isSuperadminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('adminOnly')}</h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <ArrowRight className="w-5 h-5" />
            {t('goBack')}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: Main Dashboard
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {t('pageTitle')}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">{t('pageSubtitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchStats}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title={t('refresh')}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Globe className="w-4 h-4" />
                {lang === 'ko' ? 'EN' : '한국어'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={Users}
            label={t('totalUsers')}
            value={stats.users}
            color="blue"
            trend={lang === 'ko' ? '+12% 이번 달' : '+12% this month'}
          />
          <StatsCard
            icon={Briefcase}
            label={t('totalJobs')}
            value={stats.jobs}
            color="green"
            subtitle={`${stats.pendingJobs} ${t('pendingJobs').toLowerCase()}`}
          />
          <StatsCard
            icon={Building2}
            label={t('totalCompanies')}
            value={stats.companies}
            color="purple"
            subtitle={`${stats.pendingCompanies} ${t('pendingCompanies').toLowerCase()}`}
          />
          <StatsCard
            icon={FileText}
            label={t('totalGuides')}
            value={stats.guides}
            color="amber"
            subtitle={`${stats.pendingGuides} ${t('pendingGuides').toLowerCase()}`}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard
            icon={ShoppingCart}
            label={t('totalMarketplace')}
            value={stats.marketplace}
            color="gray"
          />
          <StatsCard
            icon={MapPin}
            label={t('totalEvents')}
            value={stats.events}
            color="red"
          />
          <StatsCard
            icon={Activity}
            label={t('activeUsers')}
            value={Math.floor(stats.users * 0.3)} // Mock active users
            color="green"
            trend={lang === 'ko' ? '+8% 이번 주' : '+8% this week'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickActionCard
                icon={Briefcase}
                title={t('manageJobs')}
                description={lang === 'ko' ? '???? ?? ? ??' : 'Review and approve job postings'}
                to="/admin/jobs"
                color="blue"
              />
              <QuickActionCard
                icon={Building2}
                title={t('manageCompanies')}
                description={lang === 'ko' ? '?? ?? ?? ? ??' : 'Review and verify company registrations'}
                to="/admin/companies"
                color="green"
              />
              <QuickActionCard
                icon={BookOpen}
                title={t('manageGuides')}
                description={lang === 'ko' ? '가이드 승인 및 관리를 처리합니다' : 'Review and approve guide submissions'}
                to="/admin/guides"
                color="amber"
              />
              <QuickActionCard
                icon={BarChart3}
                title={t('viewAnalytics')}
                description={lang === 'ko' ? '??? ?? ? ??' : 'Platform analytics and statistics'}
                to="#"
                color="purple"
              />
              <QuickActionCard
                icon={Settings}
                title={t('systemSettings')}
                description={lang === 'ko' ? '??? ?? ? ??' : 'System settings and configuration'}
                to="#"
                color="gray"
              />
              <QuickActionCard
                icon={MessageSquare}
                title={t('contentModeration')}
                description={lang === 'ko' ? '???? ??? ??' : 'Moderate community content'}
                to="/community"
                color="amber"
              />
              <QuickActionCard
                icon={Users}
                title={t('userManagement')}
                description={lang === 'ko' ? '??? ?? ??' : 'Manage user accounts'}
                to="#"
                color="red"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('recentActivity')}</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                {t('viewAll')}
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{t('noActivity')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentActivity.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      icon={
                        activity.type === 'job_approved' ? CheckCircle :
                        activity.type === 'company_registered' ? Building2 :
                        activity.type === 'user_joined' ? Users : Activity
                      }
                      title={activity.title}
                      description={activity.description}
                      time={activity.time}
                      color={activity.color}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;



