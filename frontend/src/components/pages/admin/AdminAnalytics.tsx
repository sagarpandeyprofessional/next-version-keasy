// @ts-nocheck
/**
 * @file AdminAnalytics.jsx
 * @description Admin analytics dashboard for platform usage, views, and trending content.
 *
 * Features:
 * - Platform-wide KPIs (users, activity, applications, views)
 * - Quick timeframe toggle
 * - Simple line charts for daily activity
 * - Trending guides and marketplace items
 * - Admin-only access with bilingual labels
 */

"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSuperadmin } from '@/utils/adminUtils';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Flame,
  Globe,
  RefreshCw,
  Shield,
  ShoppingCart,
  Sun,
  TrendingUp,
  Users
} from 'lucide-react';

const LABELS = {
  pageTitle: { en: 'Analytics', ko: '분석 대시보드' },
  pageSubtitle: { en: 'Platform health, engagement, and content reach', ko: '플랫폼 지표와 참여 현황' },
  totalUsers: { en: 'Total users', ko: '전체 사용자' },
  activeUsers: { en: 'Active (last window)', ko: '활성 사용자(기간)' },
  todayVisitors: { en: "Today's visitors", ko: '오늘 방문' },
  jobApplications: { en: 'Job applications', ko: '채용 지원' },
  guideViews: { en: 'Guide views', ko: '가이드 조회수' },
  marketplaceViews: { en: 'Marketplace views', ko: '마켓플레이스 조회수' },
  activityTitle: { en: 'Daily activity', ko: '일별 활동' },
  contentMomentum: { en: 'Content momentum', ko: '콘텐츠 업데이트' },
  trendingGuides: { en: 'Trending guides', ko: '인기 가이드' },
  trendingMarketplace: { en: 'Trending marketplace', ko: '인기 마켓 상품' },
  noData: { en: 'No data yet', ko: '데이터 없음' },
  timeframe: { en: 'Timeframe', ko: '기간' },
  adminOnly: { en: 'Admin access required', ko: '관리자 권한 필요' },
  goBack: { en: 'Go back', ko: '돌아가기' },
  refresh: { en: 'Refresh', ko: '새로고침' }
};

const formatNumber = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

const formatKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDayLabel = (date) => `${date.getMonth() + 1}/${date.getDate()}`;

const buildDailyCounts = (items, days, field) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const buckets = Array.from({ length: days }, (_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    return { key: formatKey(d), label: formatDayLabel(d), value: 0 };
  });

  items?.forEach((item) => {
    const raw = item?.[field];
    if (!raw) return;
    const d = new Date(raw);
    const key = formatKey(d);
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += 1;
  });

  return buckets;
};

const Sparkline = ({ data = [], color = '#2563eb' }) => {
  const id = useMemo(() => `spark-${Math.random().toString(36).slice(2, 8)}`, []);
  const values = data.length ? data : [0];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? 100 / (values.length - 1) : 100;
  const points = values
    .map((v, idx) => {
      const x = idx * step;
      const y = 100 - ((v - min) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,90 ${points} 100,90`}
        fill={`url(#${id})`}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const LineChart = ({ labels = [], series = [] }) => {
  const allValues = series.flatMap((s) => s.data);
  const maxValue = Math.max(...allValues, 1);
  const step = labels.length > 1 ? 100 / (labels.length - 1) : 100;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-56">
      <line x1="0" x2="100" y1="90" y2="90" stroke="#e5e7eb" strokeWidth="1" />
      {labels.map((label, idx) => (
        <text
          key={label + idx}
          x={idx * step}
          y="97"
          fontSize="3"
          fill="#9ca3af"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
      {series.map((s, sIdx) => {
        const points = (s.data.length ? s.data : [0])
          .map((v, idx) => {
            const x = idx * step;
            const y = 90 - (v / maxValue) * 70;
            return `${x},${y}`;
          })
          .join(' ');
        return (
          <polyline
            key={s.name + sIdx}
            points={points}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
};

const StatCard = ({ label, value, icon: Icon, color, helper, chartData }) => {
  const colorClasses = {
    blue: 'from-blue-50 via-white to-blue-100 border-blue-100',
    green: 'from-emerald-50 via-white to-emerald-100 border-emerald-100',
    amber: 'from-amber-50 via-white to-amber-100 border-amber-100',
    purple: 'from-purple-50 via-white to-purple-100 border-purple-100',
    gray: 'from-gray-50 via-white to-gray-100 border-gray-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border bg-gradient-to-br ${colorClasses[color] || colorClasses.gray} shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(value)}</p>
          {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
        </div>
        <div className="p-2 rounded-lg bg-white shadow-inner text-gray-700">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {chartData && <div className="mt-2"><Sparkline data={chartData} color="#2563eb" /></div>}
    </motion.div>
  );
};

const TrendingList = ({ title, items, lang, type }) => {
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const valueLabel = type === 'marketplace'
    ? (lang === 'ko' ? '조회' : 'views')
    : (lang === 'ko' ? '조회' : 'views');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <Flame className="w-4 h-4 text-orange-500" />
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{LABELS.noData[lang]}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="truncate text-gray-900">{item.title}</span>
                </div>
                <span className="text-gray-600">{formatNumber(item.value)} {valueLabel}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminAnalytics = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isSuperadminUser, setIsSuperadminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('en');
  const [timeframe, setTimeframe] = useState('14d');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayVisitors: 0,
    jobApplications: 0,
    guideViews: 0,
    marketplaceViews: 0
  });
  const [chartData, setChartData] = useState({
    labels: [],
    signups: [],
    applications: [],
    listings: []
  });
  const [trendingGuides, setTrendingGuides] = useState([]);
  const [trendingMarketplace, setTrendingMarketplace] = useState([]);

  const t = useCallback((key) => LABELS[key]?.[lang] || LABELS[key]?.en || key, [lang]);

  const windowDays = useMemo(() => {
    switch (timeframe) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      default:
        return 14;
    }
  }, [timeframe]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        { data: profilesData, error: profilesError },
        { data: jobsData, error: jobsError },
        { data: jobApplicationsData, error: applicationsError },
        { data: guidesData, error: guidesError },
        { data: marketplaceData, error: marketplaceError }
      ] = await Promise.all([
        supabase.from('profiles').select('user_id, created_at, updated_at'),
        supabase.from('job').select('id, created_at, created_by'),
        supabase.from('job_application').select('user_id, created_at'),
        supabase.from('guide').select('id, name, view, created_at, created_by'),
        supabase.from('marketplace').select('id, title, views, created_at, user_id')
      ]);

      if (profilesError || jobsError || applicationsError || guidesError || marketplaceError) {
        throw (
          profilesError ||
          jobsError ||
          applicationsError ||
          guidesError ||
          marketplaceError
        );
      }

      const profiles = profilesData || [];
      const jobs = jobsData || [];
      const applications = jobApplicationsData || [];
      const guides = guidesData || [];
      const marketplace = marketplaceData || [];

      const startWindow = new Date();
      startWindow.setHours(0, 0, 0, 0);
      startWindow.setDate(startWindow.getDate() - (windowDays - 1));

      const startToday = new Date();
      startToday.setHours(0, 0, 0, 0);

      const activeSet = new Set();
      const todaySet = new Set();

      const addActive = (arr, idField, dateField) => {
        arr.forEach((item) => {
          const id = item?.[idField];
          const dateRaw = item?.[dateField];
          if (!id || !dateRaw) return;
          const d = new Date(dateRaw);
          if (d >= startWindow) activeSet.add(id);
          if (d >= startToday) todaySet.add(id);
        });
      };

      addActive(profiles, 'user_id', 'updated_at' in (profiles[0] || {}) ? 'updated_at' : 'created_at');
      addActive(jobs, 'created_by', 'created_at');
      addActive(applications, 'user_id', 'created_at');
      addActive(guides, 'created_by', 'created_at');
      addActive(marketplace, 'user_id', 'created_at');

      const totalUsers = profiles.length;
      const activeUsers = activeSet.size;
      const todayVisitors = todaySet.size;
      const jobApplications = applications.length;

      const guideViews = guides.reduce((sum, g) => sum + (parseInt(g.view, 10) || 0), 0);
      const marketplaceViews = marketplace.reduce((sum, m) => sum + (parseInt(m.views, 10) || 0), 0);

      const signupsSeries = buildDailyCounts(profiles, windowDays, 'created_at');
      const applicationsSeries = buildDailyCounts(applications, windowDays, 'created_at');
      const listingSeries = buildDailyCounts(
        [...jobs, ...guides, ...marketplace],
        windowDays,
        'created_at'
      );

      setChartData({
        labels: signupsSeries.map((d) => d.label),
        signups: signupsSeries.map((d) => d.value),
        applications: applicationsSeries.map((d) => d.value),
        listings: listingSeries.map((d) => d.value)
      });

      const sortedGuides = [...guides]
        .sort((a, b) => (parseInt(b.view, 10) || 0) - (parseInt(a.view, 10) || 0))
        .slice(0, 5)
        .map((g) => ({
          id: g.id,
          title: g.name || 'Untitled',
          value: parseInt(g.view, 10) || 0
        }));

      const sortedMarketplace = [...marketplace]
        .sort((a, b) => (parseInt(b.views, 10) || 0) - (parseInt(a.views, 10) || 0))
        .slice(0, 5)
        .map((m) => ({
          id: m.id,
          title: m.title || 'Untitled listing',
          value: parseInt(m.views, 10) || 0
        }));

      setMetrics({
        totalUsers,
        activeUsers,
        todayVisitors,
        jobApplications,
        guideViews,
        marketplaceViews
      });
      setTrendingGuides(sortedGuides);
      setTrendingMarketplace(sortedMarketplace);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [windowDays]);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
          router.push('/admin/signin');
          return;
        }

        setUser(currentUser);

        const isSuper = await isSuperadmin(currentUser);
        setIsSuperadminUser(isSuper);

        if (isSuper) {
          await fetchAnalytics();
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message || 'Unable to verify admin access');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Activity className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isSuperadminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('adminOnly')}</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('goBack')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  {t('pageTitle')}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">{t('pageSubtitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                {[
                  { id: '7d', label: '7d' },
                  { id: '14d', label: '14d' },
                  { id: '30d', label: '30d' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTimeframe(option.id)}
                    className={`px-3 py-2 text-sm font-semibold ${
                      timeframe === option.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchAnalytics}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title={t('refresh')}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLang((prev) => (prev === 'en' ? 'ko' : 'en'))}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Globe className="w-4 h-4" />
                {lang === 'ko' ? 'EN' : '한국어'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
            <Activity className="w-5 h-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Users}
            label={t('totalUsers')}
            value={metrics.totalUsers}
            color="blue"
            helper={lang === 'ko' ? '가입자 기준' : 'Based on profiles'}
            chartData={chartData.signups}
          />
          <StatCard
            icon={Activity}
            label={t('activeUsers')}
            value={metrics.activeUsers}
            color="green"
            helper={`${windowDays}d window`}
            chartData={chartData.listings}
          />
          <StatCard
            icon={Sun}
            label={t('todayVisitors')}
            value={metrics.todayVisitors}
            color="amber"
            helper={lang === 'ko' ? '오늘 활동 사용자' : 'Users active today'}
          />
          <StatCard
            icon={BarChart3}
            label={t('jobApplications')}
            value={metrics.jobApplications}
            color="purple"
            helper={lang === 'ko' ? '총 누적' : 'All-time total'}
            chartData={chartData.applications}
          />
          <StatCard
            icon={BookOpen}
            label={t('guideViews')}
            value={metrics.guideViews}
            color="gray"
            helper={lang === 'ko' ? '합산 조회수' : 'Sum of guide views'}
            chartData={trendingGuides.map((g) => g.value)}
          />
          <StatCard
            icon={ShoppingCart}
            label={t('marketplaceViews')}
            value={metrics.marketplaceViews}
            color="gray"
            helper={lang === 'ko' ? '합산 조회수' : 'Sum of listing views'}
            chartData={trendingMarketplace.map((m) => m.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold">{t('activityTitle')}</p>
                <h3 className="text-lg font-bold text-gray-900">
                  {windowDays} {lang === 'ko' ? '일간 활동 흐름' : 'day activity overview'}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 text-blue-600">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Signups
                </span>
                <span className="inline-flex items-center gap-1 text-purple-600">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  Applications
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Listings
                </span>
              </div>
            </div>
            <LineChart
              labels={chartData.labels}
              series={[
                { name: 'Signups', color: '#2563eb', data: chartData.signups },
                { name: 'Applications', color: '#7c3aed', data: chartData.applications },
                { name: 'Listings', color: '#059669', data: chartData.listings }
              ]}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold">{t('contentMomentum')}</p>
                <h3 className="text-lg font-bold text-gray-900">+{chartData.listings.reduce((a, b) => a + b, 0)}</h3>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {lang === 'ko'
                ? '채용, 가이드, 마켓 신규 게시물 수 기준'
                : 'New jobs, guides, and listings over the selected window.'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Signups
                </span>
                <span className="font-semibold text-gray-900">{chartData.signups.reduce((a, b) => a + b, 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Applications
                </span>
                <span className="font-semibold text-gray-900">{chartData.applications.reduce((a, b) => a + b, 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Listings
                </span>
                <span className="font-semibold text-gray-900">{chartData.listings.reduce((a, b) => a + b, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendingList
            title={t('trendingGuides')}
            items={trendingGuides}
            lang={lang}
            type="guides"
          />
          <TrendingList
            title={t('trendingMarketplace')}
            items={trendingMarketplace}
            lang={lang}
            type="marketplace"
          />
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
