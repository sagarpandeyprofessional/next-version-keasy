/**
 * @file PricingPage.jsx
 * @description Professional membership subscription page for Keasy platform
 * 
 * Features:
 * - 4-tier pricing structure (Free, Creator, Professional, Business)
 * - Monthly/Annual toggle with savings indicator
 * - Add-ons section for additional features
 * - AI features comparison
 * - Responsive design (4 cols desktop, 2 cols tablet, stack mobile)
 * - Bilingual support (EN/KO)
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * 
 * @author Keasy
 * @version 1.0.1
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../api/supabase-client';
import {
  Check,
  X,
  Sparkles,
  Briefcase,
  Building2,
  Zap,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Globe,
  Shield,
  Rocket,
  Star,
  Crown,
  Package
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardHover = {
  scale: 1.02,
  y: -8,
  transition: { 
    duration: 0.4, 
    ease: [0.25, 0.46, 0.45, 0.94] // Smoother easing curve
  }
};


/**
 * PricingPage Component
 */
const PricingPage = () => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  const { user } = useAuth(); // Get current user from AuthContext
  const navigate = useNavigate();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [showAddons, setShowAddons] = useState(false);
  const [lang, setLang] = useState('en'); // 'en' or 'ko'
  const [selectedPlan, setSelectedPlan] = useState('free'); // Current user's plan
  const [selectedAddons, setSelectedAddons] = useState([]); // Array of selected addon IDs

  // ============================================================================
  // FETCH USER SUBSCRIPTION
  // ============================================================================
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user) {
        setSelectedPlan('free');
        return;
      }

      try {
        // Fetch user's subscription from your database
        // Adjust table name and columns based on your schema
        const { data, error } = await supabase
          .from('user_subscriptions') // Or your table name
          .select('plan_tier, addons')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
          return;
        }

        if (data) {
          setSelectedPlan(data.plan_tier || 'free');
          setSelectedAddons(data.addons || []);
        }
      } catch (err) {
        console.error('Error fetching user subscription:', err);
      }
    };

    fetchUserSubscription();
  }, [user]);

  // ============================================================================
  // PRICING DATA
  // ============================================================================
  
  const plans = [
    {
      id: 'free',
      name: { en: 'Free', ko: '무료' },
      icon: Package,
      color: 'green',
      price: { monthly: 0, annual: 0 },
      tagline: { en: 'For all users', ko: '모든 사용자용' },
      badge: { en: 'Everyone starts here', ko: '모두 여기서 시작' },
      features: [
        { en: 'Buy & sell in Marketplace', ko: '마켓플레이스에서 사고팔기', included: true },
        { en: 'Join communities', ko: '커뮤니티 가입', included: true },
        { en: 'Join & create basic events', ko: '기본 이벤트 참여 및 생성', included: true },
        { en: 'Apply for jobs', ko: '채용 지원', included: true },
        { en: 'View professionals & services', ko: '전문가 및 서비스 보기', included: true },
        { en: 'Basic Keasy AI (guides & platform help)', ko: '기본 Keasy AI (가이드 및 플랫폼 도움말)', included: true }
      ],
      cta: { en: 'Current Plan', ko: '현재 플랜' },
      popular: false
    },
    {
      id: 'creator',
      name: { en: 'Creator', ko: '크리에이터' },
      icon: Sparkles,
      color: 'purple',
      price: { monthly: 9.99, annual: 7.99 },
      tagline: { en: 'For active users, sellers, event & community creators', ko: '활발한 사용자, 판매자, 이벤트 및 커뮤니티 크리에이터용' },
      badge: { en: 'Most Popular', ko: '가장 인기 있는' },
      previousTier: 'free',
      features: [
        { en: 'More Marketplace listings', ko: '더 많은 마켓플레이스 리스팅', included: true, highlight: true },
        { en: 'Create unlimited events', ko: '무제한 이벤트 생성', included: true, highlight: true },
        { en: 'Create & manage communities', ko: '커뮤니티 생성 및 관리', included: true, highlight: true },
        { en: 'Better visibility on listings', ko: '리스팅 가시성 향상', included: true },
        { en: 'Extended Keasy AI', ko: '확장된 Keasy AI', included: true }
      ],
      cta: { en: 'Upgrade to Creator', ko: 'Creator로 업그레이드' },
      popular: true
    },
    {
      id: 'professional',
      name: { en: 'Professional', ko: '프로페셔널' },
      icon: Briefcase,
      color: 'indigo',
      price: { monthly: 19.99, annual: 15.99 },
      tagline: { en: 'For freelancers & individual service providers', ko: '프리랜서 및 개인 서비스 제공자용' },
      previousTier: 'creator',
      features: [
        { en: 'Professional profile', ko: '전문 프로필', included: true, highlight: true },
        { en: 'List services', ko: '서비스 리스팅', included: true, highlight: true },
        { en: 'Accept bookings', ko: '예약 수락', included: true, highlight: true },
        { en: 'Portfolio / previous work', ko: '포트폴리오 / 이전 작업', included: true },
        { en: 'Reviews & ratings', ko: '리뷰 및 평가', included: true },
        { en: 'Professional-level Keasy AI', ko: '전문가급 Keasy AI', included: true }
      ],
      cta: { en: 'Select Professional', ko: 'Professional 선택' },
      popular: false
    },
    {
      id: 'business',
      name: { en: 'Business', ko: '비즈니스' },
      icon: Building2,
      color: 'amber',
      price: { monthly: 49.99, annual: 39.99 },
      tagline: { en: 'For local businesses & companies', ko: '로컬 비즈니스 및 회사용' },
      previousTier: 'professional',
      features: [
        { en: 'Business profile', ko: '비즈니스 프로필', included: true, highlight: true },
        { en: 'Fully managed Keasy website', ko: '완전 관리형 Keasy 웹사이트', included: true, highlight: true },
        { en: 'Admin dashboard', ko: '관리자 대시보드', included: true, highlight: true },
        { en: 'Job posting & application tracking', ko: '채용 공고 및 지원 추적', included: true },
        { en: 'Service listings & bookings', ko: '서비스 리스팅 및 예약', included: true },
        { en: 'Business-level Keasy AI', ko: '비즈니스급 Keasy AI', included: true }
      ],
      cta: { en: 'Contact Sales', ko: '영업팀 문의' },
      popular: false
    }
  ];

  const addons = [
    {
      id: 'promote-listings',
      name: { en: 'Promote Listings', ko: '리스팅 홍보' },
      icon: TrendingUp,
      price: { monthly: 4.99, annual: 3.99 },
      description: { en: 'Boost your marketplace listings to top positions', ko: '마켓플레이스 리스팅을 상단으로 부스트' },
      availableFor: ['professional', 'business']
    },
    {
      id: 'promote-services',
      name: { en: 'Promote Services', ko: '서비스 홍보' },
      icon: Star,
      price: { monthly: 4.99, annual: 3.99 },
      description: { en: 'Feature your services prominently', ko: '서비스를 눈에 띄게 표시' },
      availableFor: ['professional', 'business']
    },
    {
      id: 'featured-jobs',
      name: { en: 'Featured Jobs', ko: '주요 채용공고' },
      icon: Zap,
      price: { monthly: 9.99, annual: 7.99 },
      description: { en: 'Get more applicants with featured job postings', ko: '주요 채용공고로 더 많은 지원자 확보' },
      availableFor: ['business']
    },
    {
      id: 'sponsored-events',
      name: { en: 'Sponsored Events', ko: '스폰서 이벤트' },
      icon: Calendar,
      price: { monthly: 7.99, annual: 5.99 },
      description: { en: 'Maximize event attendance with sponsorship', ko: '스폰서십으로 이벤트 참석률 극대화' },
      availableFor: ['creator', 'professional', 'business']
    },
    {
      id: 'brand-advertising',
      name: { en: 'Brand Advertising', ko: '브랜드 광고' },
      icon: MessageSquare,
      price: { monthly: 14.99, annual: 11.99 },
      description: { en: 'Display banner ads across the platform', ko: '플랫폼 전체에 배너 광고 표시' },
      availableFor: ['business']
    }
  ];

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getColorClasses = (color, variant = 'bg') => {
    const colors = {
      green: {
        bg: 'bg-green-500',
        bgLight: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-500',
        borderLight: 'border-green-200',
        hover: 'hover:bg-green-600',
        ring: 'ring-green-500',
        gradient: 'from-green-500 to-emerald-600'
      },
      purple: {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-500',
        borderLight: 'border-purple-200',
        hover: 'hover:bg-purple-600',
        ring: 'ring-purple-500',
        gradient: 'from-purple-500 to-violet-600'
      },
      indigo: {
        bg: 'bg-indigo-600',
        bgLight: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-600',
        borderLight: 'border-indigo-200',
        hover: 'hover:bg-indigo-700',
        ring: 'ring-indigo-600',
        gradient: 'from-indigo-600 to-blue-600'
      },
      amber: {
        bg: 'bg-amber-500',
        bgLight: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-500',
        borderLight: 'border-amber-200',
        hover: 'hover:bg-amber-600',
        ring: 'ring-amber-500',
        gradient: 'from-amber-500 to-orange-600'
      }
    };
    return colors[color] || colors.green;
  };

  const calculateSavings = (monthlyPrice) => {
    const annualTotal = monthlyPrice * 12;
    const discountedAnnual = (monthlyPrice * 0.8) * 12;
    return (annualTotal - discountedAnnual).toFixed(2);
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotalPrice = () => {
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    const planPrice = selectedPlanData?.price[billingCycle] || 0;
    
    const addonsPrice = addons
      .filter(addon => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price[billingCycle], 0);
    
    return (planPrice + addonsPrice).toFixed(2);
  };

  // Handle plan selection
  const handlePlanSelect = (planId) => {
    if (planId === selectedPlan) return;

    if (planId === 'business') {
      // Navigate to contact page for business inquiries
      navigate('/contact');
      return;
    }

    if (!user) {
      // Redirect to sign in if not authenticated
      navigate('/signin', { state: { from: '/pricing', selectedPlan: planId } });
      return;
    }

    // Navigate to payment checkout with selected plan
    navigate('/payment/checkout', { 
      state: { 
        planId, 
        billingCycle,
        addons: selectedAddons 
      } 
    });
  };

  // ============================================================================
  // RENDER: HEADER SECTION
  // ============================================================================

  const renderHeader = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="text-center max-w-4xl mx-auto mb-16"
    >
      {/* Language Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
        >
          <Globe className="w-4 h-4" />
          {lang === 'en' ? '한국어' : 'English'}
        </button>
      </div>

      {/* Billing Toggle */}
      <div className="inline-flex items-center gap-4 p-1.5 bg-gray-100 rounded-full mb-8">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`
            px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300
            ${billingCycle === 'monthly'
              ? 'bg-white text-gray-900 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {lang === 'en' ? 'Pay monthly' : '월간 결제'}
        </button>
        
        <button
          onClick={() => setBillingCycle('annual')}
          className={`
            px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 relative
            ${billingCycle === 'annual'
              ? 'bg-white text-gray-900 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {lang === 'en' ? 'Pay annually' : '연간 결제'}
        </button>
      </div>

      {/* Annual Savings Message - Above toggle */}
      <AnimatePresence mode="wait">
        {billingCycle === 'annual' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <p className="text-sm text-green-600 font-semibold flex items-center justify-center gap-2">
              <span>💰</span>
              {lang === 'en' 
                ? 'Pay annually and save up to 20% on all plans'
                : '연간 결제로 모든 플랜에서 최대 20% 절약'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ============================================================================
  // RENDER: PRICING CARD
  // ============================================================================

  const renderPricingCard = (plan, index) => {
    const colors = getColorClasses(plan.color);
    const isCurrentPlan = selectedPlan === plan.id;
    const price = plan.price[billingCycle];
    const isFree = plan.id === 'free';
    const isBusiness = plan.id === 'business';

    return (
      <motion.div
        custom={index}
        variants={fadeInUp}
        whileHover={!isCurrentPlan ? cardHover : {}}
        className={`
          relative bg-white rounded-2xl border-2 overflow-hidden flex flex-col
          transition-all duration-500 ease-out
          ${isCurrentPlan 
            ? `${colors.border} shadow-xl` 
            : 'border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {/* Popular Badge */}
        {plan.popular && (
          <div className={`absolute -top-0 left-1/2 -translate-x-1/2 ${colors.bg} text-white text-xs font-bold px-6 py-1.5 rounded-b-lg flex items-center gap-1.5 shadow-md z-10`}>
            <Crown className="w-3.5 h-3.5" />
            {plan.badge[lang]}
          </div>
        )}

        {/* Color Accent Bar - Top Border */}
        <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />

        {/* Card Content */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Icon & Name */}
          <div className="flex items-center gap-3 mb-3 mt-2">
            <plan.icon className={`w-7 h-7 ${colors.text}`} />
            <h3 className={`text-2xl font-bold ${colors.text}`}>
              {plan.name[lang]}
            </h3>
          </div>

          {/* Tagline */}
          <p className="text-sm text-gray-600 mb-6 min-h-[44px]">
            {plan.tagline[lang]}
          </p>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-gray-900">
                ${price}
              </span>
              {!isFree && (
                <span className="text-gray-500 text-base ml-1">
                  /{lang === 'en' ? (billingCycle === 'monthly' ? 'month' : 'year') : (billingCycle === 'monthly' ? '월' : '년')}
                </span>
              )}
            </div>
            
            {/* Annual Savings */}
            {!isFree && billingCycle === 'annual' && (
              <p className="text-sm text-green-600 mt-2 font-semibold">
                {lang === 'en' 
                  ? `Save $${calculateSavings(plan.price.monthly)}/year`
                  : `연간 $${calculateSavings(plan.price.monthly)} 절약`}
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8 flex-grow">
            {/* Previous tier features (collapsed) */}
            {plan.previousTier && (
              <div className={`flex items-start gap-2 text-sm ${colors.text} font-medium pb-1`}>
                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.text}`} />
                <span>{lang === 'en' ? 'Everything in' : '다음 포함:'} {plans.find(p => p.id === plan.previousTier)?.name[lang]}</span>
              </div>
            )}

            {/* Current tier features */}
            {plan.features.map((feature, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${feature.highlight ? colors.text + ' font-semibold' : 'text-gray-700'}`}
              >
                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.text}`} />
                <span className="text-sm leading-relaxed">{feature[lang]}</span>
              </div>
            ))}
          </div>

          {/* CTA Button - At bottom of card */}
          <div className="mt-auto">
            <button
              onClick={() => handlePlanSelect(plan.id)}
              disabled={isCurrentPlan}
              className={`
                w-full py-3.5 px-4 rounded-xl font-bold text-base transition-all duration-300
                ${isCurrentPlan
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-2 border-gray-200'
                  : isBusiness
                    ? `bg-gradient-to-r ${colors.gradient} text-white ${colors.hover} shadow-lg hover:shadow-xl transform hover:scale-105`
                    : `${colors.bg} text-white ${colors.hover} shadow-lg hover:shadow-xl transform hover:scale-105`
                }
              `}
            >
              {isCurrentPlan ? plan.cta[lang] : plan.cta[lang]}
            </button>

            {/* Current Plan Indicator */}
            {isCurrentPlan && (
              <div className="mt-3 text-center">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${colors.text}`}>
                  <Shield className="w-4 h-4" />
                  {lang === 'en' ? 'Active Plan' : '활성 플랜'}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        {renderHeader()}

        {/* Pricing Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 items-stretch"
        >
          {plans.map((plan, index) => (
            <React.Fragment key={plan.id}>
              {renderPricingCard(plan, index)}
            </React.Fragment>
          ))}
        </motion.div>

        {/* ====================================================================
            ADD-ONS SECTION
            ==================================================================== */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          {/* Section Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowAddons(!showAddons)}
              className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Rocket className="w-6 h-6" />
              <span className="font-semibold text-lg">
                {lang === 'en' ? '➕ Boost Your Presence (Optional Add-ons)' : '➕ 프레즌스 강화 (선택적 추가 기능)'}
              </span>
              {showAddons ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Add-ons Grid */}
          <AnimatePresence>
            {showAddons && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                  {addons.map((addon, index) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    const price = addon.price[billingCycle];
                    
                    return (
                      <motion.div
                        key={addon.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => toggleAddon(addon.id)}
                        className={`
                          relative p-6 rounded-xl border-2 cursor-pointer
                          transition-all duration-300
                          ${isSelected
                            ? 'bg-pink-50 border-pink-500 shadow-lg'
                            : 'bg-white border-gray-200 hover:border-pink-300 hover:shadow-md'
                          }
                        `}
                      >
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <div className="bg-pink-500 text-white rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          </div>
                        )}

                        {/* Icon */}
                        <div className={`
                          inline-flex p-3 rounded-lg mb-3
                          ${isSelected ? 'bg-pink-100' : 'bg-gray-100'}
                        `}>
                          <addon.icon className={`w-6 h-6 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                        </div>

                        {/* Name */}
                        <h4 className={`text-lg font-bold mb-2 ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>
                          {addon.name[lang]}
                        </h4>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                          {addon.description[lang]}
                        </p>

                        {/* Price */}
                        <div className={`text-2xl font-bold ${isSelected ? 'text-pink-600' : 'text-gray-900'}`}>
                          +${price}
                          <span className="text-sm text-gray-500 font-normal">
                            /{lang === 'en' ? (billingCycle === 'monthly' ? 'mo' : 'yr') : (billingCycle === 'monthly' ? '월' : '년')}
                          </span>
                        </div>

                        {/* Available for badge */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            {lang === 'en' ? 'Available for: ' : '사용 가능: '}
                            <span className="font-medium text-gray-700">
                              {addon.availableFor.map(tier => 
                                plans.find(p => p.id === tier)?.name[lang]
                              ).join(', ')}
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Total with Add-ons */}
                {selectedAddons.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {lang === 'en' ? 'Your Total Monthly Cost' : '총 월간 비용'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {plans.find(p => p.id === selectedPlan)?.name[lang]} + {selectedAddons.length} {lang === 'en' ? 'add-on(s)' : '개 추가 기능'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-pink-600">
                          ${calculateTotalPrice()}
                        </div>
                        <p className="text-sm text-gray-500">
                          /{lang === 'en' ? (billingCycle === 'monthly' ? 'month' : 'year') : (billingCycle === 'monthly' ? '월' : '년')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ====================================================================
            KEASY AI COMPARISON SECTION
            ==================================================================== */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h3 className="text-2xl font-bold">
                    {lang === 'en' ? '🤖 Keasy AI Features' : '🤖 Keasy AI 기능'}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {lang === 'en' 
                      ? 'AI capabilities that grow with your plan'
                      : '플랜에 따라 성장하는 AI 기능'}
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">
                      {lang === 'en' ? 'AI Feature' : 'AI 기능'}
                    </th>
                    {plans.map(plan => (
                      <th key={plan.id} className="p-4 text-center font-semibold">
                        <div className={getColorClasses(plan.color).text}>
                          {plan.name[lang]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Basic Help */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {lang === 'en' ? 'Basic Platform Help' : '기본 플랫폼 도움말'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lang === 'en' ? 'Guides & FAQs' : '가이드 및 FAQ'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  {/* Smart Suggestions */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {lang === 'en' ? 'Smart Suggestions' : '스마트 제안'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lang === 'en' ? 'Content & listing optimization' : '콘텐츠 및 리스팅 최적화'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  {/* Advanced Analytics */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {lang === 'en' ? 'Advanced Analytics' : '고급 분석'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lang === 'en' ? 'Performance insights & trends' : '성능 인사이트 및 트렌드'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  {/* Content Generation */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {lang === 'en' ? 'AI Content Generation' : 'AI 콘텐츠 생성'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lang === 'en' ? 'Descriptions, posts & more' : '설명, 게시물 등'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-gray-500">
                        {lang === 'en' ? 'Limited' : '제한됨'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  {/* Automation */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {lang === 'en' ? 'Smart Automation' : '스마트 자동화'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lang === 'en' ? 'Scheduling & responses' : '일정 관리 및 응답'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>

                  {/* Priority Support */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {lang === 'en' ? 'AI Priority Support' : 'AI 우선 지원'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lang === 'en' ? 'Faster responses & dedicated help' : '빠른 응답 및 전담 지원'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* ====================================================================
            FOOTER CTA SECTION
            ==================================================================== */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-3">
              {lang === 'en' ? 'Still have questions?' : '여전히 궁금한 점이 있으신가요?'}
            </h3>
            <p className="text-blue-100 mb-6">
              {lang === 'en' 
                ? 'Our team is here to help you find the perfect plan'
                : '저희 팀이 완벽한 플랜을 찾을 수 있도록 도와드리겠습니다'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageSquare className="w-5 h-5" />
                {lang === 'en' ? 'Contact Sales' : '영업팀 문의'}
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
              >
                {lang === 'en' ? 'View FAQ' : 'FAQ 보기'}
              </Link>
            </div>
          </div>
        </motion.div>
        
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
      `}</style>
    </div>
  );
};

export default PricingPage;