// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
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

// ... (keep all the animation variants and formatPrice function the same)
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
    ease: [0.25, 0.46, 0.45, 0.94]
  }
};

function formatPrice(price) {
  if (price == null) return '';
  return Number(price).toLocaleString('en-US');
}

const Pricing = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showAddons, setShowAddons] = useState(false);
  const [lang, setLang] = useState('en');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Fetch user subscription
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user) {
        setSelectedPlan(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
          return;
        }

        if (data) {
          setSelectedPlan(data.plan || 'free');
        }
      } catch (err) {
        console.error('Error fetching user subscription:', err);
      }
    };

    fetchUserSubscription();
  }, [user]);

  // Handle plan selection/upgrade
  const handleSelectPlan = (planId) => {
    if (planId === 'free') {
      // Free plan doesn't require checkout
      return;
    }

    if (planId === 'business') {
      // Business plan goes to contact page
      router.push('/contact');
      return;
    }

    if (!user) {
      // Redirect to signin with return URL
      router.push(`/signin?redirect=/subscription/checkout?plan=${planId}&billing=${billingCycle}`);
      return;
    }

    // Navigate to subscription checkout
    router.push(`/subscription/checkout?plan=${planId}&billing=${billingCycle}`);
  };

  // ... (keep all the pricing data the same - plans and addons arrays)
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
      price: { monthly: 9999, annual: 7999 },
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
      price: { monthly: 19999, annual: 15999 },
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
      price: { monthly: 49999, annual: 39999 },
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

  // Determine button text and action for each plan
  const getPlanButtonConfig = (plan) => {
    if (!user && plan.id !== 'free') {
      return {
        text: lang === 'en' ? 'Sign In to Subscribe' : '가입하여 구독',
        disabled: false
      };
    }

    if (plan.id === 'free') {
      return {
        text: selectedPlan === 'free' 
          ? (lang === 'en' ? 'Current Plan' : '현재 플랜')
          : (lang === 'en' ? 'Downgrade to Free' : '무료로 다운그레이드'),
        disabled: selectedPlan === 'free'
      };
    }

    if (plan.id === 'business') {
      return {
        text: lang === 'en' ? 'Contact Sales' : '영업팀 문의',
        disabled: false
      };
    }

    if (selectedPlan === plan.id) {
      return {
        text: lang === 'en' ? 'Current Plan' : '현재 플랜',
        disabled: true
      };
    }

    return {
      text: lang === 'en' ? `Upgrade to ${plan.name.en}` : `${plan.name.ko}로 업그레이드`,
      disabled: false
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold mb-6"
          >
            <Rocket className="w-4 h-4" />
            <span>{lang === 'en' ? 'Pricing Plans' : '가격 플랜'}</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            {lang === 'en' ? 'Choose Your Plan' : '플랜 선택하기'}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {lang === 'en' 
              ? 'Unlock powerful features to grow your presence on Keasy'
              : 'Keasy에서 당신의 존재감을 키울 수 있는 강력한 기능을 잠금 해제하세요'}
          </p>

          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('ko')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                lang === 'ko'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              한국어
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-4 bg-gray-100 p-2 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'en' ? 'Monthly' : '월간'}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'en' ? 'Annual' : '연간'}
              <span className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                {lang === 'en' ? 'Save 20%' : '20% 할인'}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const buttonConfig = getPlanButtonConfig(plan);
            const isCurrentPlan = selectedPlan === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                variants={fadeInUp}
                whileHover={!isCurrentPlan ? cardHover : {}}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500 shadow-2xl' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-bl-2xl">
                    {plan.badge[lang]}
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-br-2xl">
                    {lang === 'en' ? 'Active' : '활성'}
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${
                      plan.color === 'green' ? 'bg-green-100' :
                      plan.color === 'purple' ? 'bg-purple-100' :
                      plan.color === 'indigo' ? 'bg-indigo-100' :
                      'bg-amber-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        plan.color === 'green' ? 'text-green-600' :
                        plan.color === 'purple' ? 'text-purple-600' :
                        plan.color === 'indigo' ? 'text-indigo-600' :
                        'text-amber-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {plan.name[lang]}
                    </h3>
                  </div>

                  {/* Tagline */}
                  <p className="text-gray-600 text-sm mb-6 min-h-[40px]">
                    {plan.tagline[lang]}
                  </p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ₩{formatPrice(plan.price[billingCycle])}
                      </span>
                      <span className="text-gray-500">
                        /{billingCycle === 'monthly' ? (lang === 'en' ? 'mo' : '월') : (lang === 'en' ? 'yr' : '년')}
                      </span>
                    </div>
                    {billingCycle === 'annual' && plan.price.annual > 0 && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {lang === 'en' ? 'Save' : '절약'} ₩{formatPrice((plan.price.monthly * 12) - plan.price.annual)} {lang === 'en' ? '/year' : '/년'}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={buttonConfig.disabled}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all mb-6 ${
                      buttonConfig.disabled
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' :
                        plan.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl' :
                        plan.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl' :
                        'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {buttonConfig.text}
                  </button>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          feature.highlight
                            ? (plan.color === 'purple' ? 'text-purple-600' :
                               plan.color === 'indigo' ? 'text-indigo-600' :
                               plan.color === 'amber' ? 'text-amber-600' :
                               'text-green-600')
                            : 'text-gray-400'
                        }`} />
                        <span className={`text-sm ${
                          feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {feature[lang]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Rest of the component (comparison table, FAQ, etc.) remains the same */}
        {/* Footer CTA */}
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
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageSquare className="w-5 h-5" />
                {lang === 'en' ? 'Contact Sales' : '영업팀 문의'}
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
              >
                {lang === 'en' ? 'View FAQ' : 'FAQ 보기'}
              </Link>
            </div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

export default Pricing;