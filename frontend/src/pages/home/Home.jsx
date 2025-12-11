/**
 * =============================================================================
 * HOME PAGE - KoreaEasy (Keasy) Landing Page
 * =============================================================================
 * 
 * DESIGN DIRECTION: "Warm & Welcoming Community"
 * 
 * Aesthetic: Premium yet approachable, warm color palette with soft gradients,
 * elegant typography, sophisticated micro-interactions, and asymmetric layouts
 * that feel human and inviting. The design should make expats feel like they've
 * found their community home in Korea.
 * 
 * Color Palette:
 * - Primary: Warm Coral (#FF6B6B) - Energy, warmth, welcome
 * - Secondary: Soft Teal (#4ECDC4) - Trust, calm, growth
 * - Accent: Golden Yellow (#FFE66D) - Optimism, guidance
 * - Neutrals: Warm grays with slight warmth
 * - Background: Soft cream (#FDFBF7) with subtle grain texture
 * 
 * Typography: Clean, modern with personality
 * Motion: Elegant, purposeful animations that guide the eye
 * 
 * @author KoreaEasy Team
 * @version 3.0.0 - Expert Redesign
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from "../../api/supabase-client";

// Icons
import { FiUser, FiHeart, FiEye, FiMapPin, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { FaHeart, FaQuoteLeft } from "react-icons/fa";
import { LuMessageCircleMore, LuSparkles, LuUsers, LuCalendar, LuMapPin, LuShoppingBag } from "react-icons/lu";
import { RiShoppingBag3Line } from "react-icons/ri";
import { BiParty } from "react-icons/bi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { X, Send, Sparkles, ArrowRight, Star, ChevronRight, Play, Quote } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";


/* =============================================================================
   DESIGN SYSTEM - Colors, Animations, Utilities
   ============================================================================= */

// Color palette as CSS custom properties would be in globals.css
// Using inline for this single-file component
const colors = {
  coral: '#FF6B6B',
  coralLight: '#FF8A8A',
  coralDark: '#E85555',
  teal: '#4ECDC4',
  tealLight: '#7EDDD6',
  tealDark: '#3DBDB5',
  yellow: '#FFE66D',
  yellowLight: '#FFED9E',
  cream: '#FFFFFF',
  warmGray: {
    50: '#dda73aff',
    100: '#695c49ff',
    200: '#e4e1e8ff',
    300: '#D3D0C9',
    400: '#A8A49C',
    500: '#7D786F',
    600: '#5C5850',
    700: '#3D3A35',
    800: '#262420',
    900: '#1A1917',
  }
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCount = (count) => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
  return count.toString();
};


/* =============================================================================
   HERO SECTION - 5-Slide Carousel
   ============================================================================= */

const HeroSection = () => {
  // State for carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // State for dynamic data
  const [featuredProfessional, setFeaturedProfessional] = useState(null);
  const [topGuide, setTopGuide] = useState(null);
  const [communityCount, setCommunityCount] = useState(0);

  const totalSlides = 5;

  // Fetch data from Supabase
  useEffect(() => {
    const fetchCarouselData = async () => {
      // Fetch featured professional (verified, first one)
      const { data: proData } = await supabase
        .from('connect_professional')
        .select('id, full_name, role, quote, img_url')
        .eq('show', true)
        .eq('verified', true)
        .limit(1)
        .single();
      
      if (proData) setFeaturedProfessional(proData);

      // Fetch most viewed guide
      const { data: guideData } = await supabase
        .from('guide')
        .select('id, name, description, img_url, view')
        .eq('approved', true)
        .order('view', { ascending: false })
        .limit(1)
        .single();
      
      if (guideData) setTopGuide(guideData);

      // Fetch community count
      const { count } = await supabase
        .from('community')
        .select('*', { count: 'exact', head: true });
      
      setCommunityCount(count || 0);
    };

    fetchCarouselData();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  // Navigation handlers
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  // Format view count
  const formatViews = (count) => {
    if (!count) return '0';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <section 
      className="relative py-8 md:py-12 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <FiArrowRight className="w-5 h-5 md:w-6 md:h-6 text-[#3D3A35] rotate-180 group-hover:text-[#FF6B6B] transition-colors" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <FiArrowRight className="w-5 h-5 md:w-6 md:h-6 text-[#3D3A35] group-hover:text-[#FF6B6B] transition-colors" />
      </button>

      {/* Slides Container */}
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* SLIDE 1: Welcome Hero */}
          {currentSlide === 0 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <SlideWelcome />
            </motion.div>
          )}

          {/* SLIDE 2: Professionals */}
          {currentSlide === 1 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <SlideProfessionals professional={featuredProfessional} />
            </motion.div>
          )}

          {/* SLIDE 3: Most Viewed Guide */}
          {currentSlide === 2 && (
            <motion.div
              key="slide-3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <SlideGuide guide={topGuide} formatViews={formatViews} />
            </motion.div>
          )}

          {/* SLIDE 4: Community */}
          {currentSlide === 3 && (
            <motion.div
              key="slide-4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <SlideCommunity communityCount={communityCount} />
            </motion.div>
          )}

          {/* SLIDE 5: Advertisement */}
          {currentSlide === 4 && (
            <motion.div
              key="slide-5"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <SlideAdvertisement />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide Indicators (small dots at bottom - optional, subtle) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[...Array(totalSlides)].map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-[#FF6B6B] w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};


/* =============================================================================
   SLIDE 1: Welcome Hero (Original Design)
   ============================================================================= */

const SlideWelcome = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[500px]">
      {/* Left Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="order-2 lg:order-1"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B]/10 rounded-full mb-6">
          <span className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-pulse" />
          <span className="text-sm font-medium text-[#FF6B6B]">Your community in Korea</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          variants={fadeInUp}
          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1A1917] leading-[1.1] mb-6"
        >
          Make Korea
          <br />
          <span className="relative inline-block">
            feel like
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                d="M2 8C50 2 150 2 198 8"
                stroke="#FFE66D"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <br />
          <span className="text-[#FF6B6B]">home</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          variants={fadeInUp}
          className="text-lg md:text-xl text-[#5C5850] max-w-lg mb-8 leading-relaxed"
        >
          Join the community of over 250+ foreigners who've found KEASY community. 
          Connect, explore, and thrive in South Korea with real support from people who understands and willing to support you.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255,107,107,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-[#FF6B6B] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#FF6B6B]/25 flex items-center gap-3 transition-all duration-300"
            >
              Join the KEasy Community
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link to="/guides">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white border-2 border-[#E8E6E1] text-[#3D3A35] rounded-2xl font-semibold text-lg hover:border-[#4ECDC4] hover:text-[#4ECDC4] transition-all duration-300"
            >
              Explore Guides
            </motion.button>
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div variants={fadeInUp} className="flex items-center gap-6 mt-10">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#4ECDC4] to-[#FF6B6B] flex items-center justify-center text-white text-xs font-bold"
                style={{ zIndex: 6 - i }}
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1917]">250+ Active Members</p>
            <p className="text-xs text-[#7D786F]">Join our growing community</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Content - Hero Image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="order-1 lg:order-2 relative"
      >
        <div className="relative">
          <div className="absolute -top-6 -right-6 w-full h-full bg-[#4ECDC4] rounded-3xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#FFE66D] rounded-2xl" />
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/founder-image.png"
              alt="Welcome to KEasy Community"
              className="w-full h-[400px] md:h-[500px] object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=700&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/60 via-transparent to-transparent" />
          </div>

          {/* Floating Quote Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-8 -left-8 md:left-8 max-w-[280px] bg-white rounded-2xl p-5 shadow-xl"
          >
            <FaQuoteLeft className="text-[#FF6B6B]/20 text-2xl mb-2" />
            <p className="text-[#3D3A35] text-sm leading-relaxed mb-3">
              "KEasy helped me with navigating the first couple of week in Korea. Thank you KEasy Team!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8A8A]" />
              <div>
                <p className="text-sm font-semibold text-[#1A1917]">Mr. Steven</p>
                <p className="text-xs text-[#7D786F]">English Teacher, Woosong University</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#4ECDC4]/10 rounded-xl flex items-center justify-center">
                <LuUsers className="w-6 h-6 text-[#4ECDC4]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1917]">80+</p>
                <p className="text-xs text-[#7D786F]">Countries</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};


/* =============================================================================
   SLIDE 2: Professionals
   ============================================================================= */

const SlideProfessionals = ({ professional }) => {
  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[500px]">
      {/* Left Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="order-2 lg:order-1"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#4ECDC4]/10 rounded-full mb-6">
          <span className="w-2 h-2 bg-[#4ECDC4] rounded-full animate-pulse" />
          <span className="text-sm font-medium text-[#4ECDC4]">KEasy's Trusted Professionals</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          variants={fadeInUp}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1917] leading-[1.1] mb-6"
        >
          Connect with
          <br />
          <span className="text-[#4ECDC4]"> KEasy Verified Experts</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          variants={fadeInUp}
          className="text-lg md:text-xl text-[#5C5850] max-w-lg mb-8 leading-relaxed"
        >
          Get free English consultations from verified professionals. 
          Real estate, legal advice, Visas, Jobs & more all tailored for foreigners in Korea.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
          <Link to="/connect">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(78,205,196,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-[#4ECDC4] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#4ECDC4]/25 flex items-center gap-3 transition-all duration-300"
            >
              Find Professionals
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link to="/about">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white border-2 border-[#E8E6E1] text-[#3D3A35] rounded-2xl font-semibold text-lg hover:border-[#4ECDC4] hover:text-[#4ECDC4] transition-all duration-300"
            >
              Learn More
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div variants={fadeInUp} className="flex items-center gap-4 mt-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
            <span className="text-green-600">✓</span>
            <span className="text-sm font-medium text-green-700">Verified</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <span className="text-blue-600">🛡️</span>
            <span className="text-sm font-medium text-blue-700">Trusted</span>
          </div>
          {/* <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
            <span className="text-purple-600">⭐</span>
            <span className="text-sm font-medium text-purple-700">Top Rated</span>
          </div> */}
        </motion.div>
      </motion.div>

      {/* Right Content - Professional Image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="order-1 lg:order-2 relative"
      >
        <div className="relative">
          <div className="absolute -top-6 -right-6 w-full h-full bg-[#FF6B6B] rounded-3xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#4ECDC4] rounded-2xl" />
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={professional?.img_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=700&fit=crop'}
              alt={professional?.full_name || 'Professional'}
              className="w-full h-[400px] md:h-[500px] object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=700&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/70 via-transparent to-transparent" />
            
            {/* Professional Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#4ECDC4]">
                    <img 
                      src={professional?.img_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop'} 
                      alt={professional?.full_name || 'Professional'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1917]">{professional?.full_name || 'Expert Professional'}</p>
                    <p className="text-sm text-[#7D786F]">{professional?.role || 'Verified Expert'}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                    <span className="text-green-600 text-sm">✓</span>
                    <span className="text-xs font-medium text-green-700">Verified</span>
                  </div>
                </div>
                {professional?.quote && (
                  <p className="mt-3 text-sm text-[#5C5850] italic">"{professional.quote}"</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


/* =============================================================================
   SLIDE 3: Most Viewed Guide
   ============================================================================= */

const SlideGuide = ({ guide, formatViews }) => {
  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[500px]">
      {/* Left Content - Image First on this slide */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="order-1 relative"
      >
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-full h-full bg-[#FFE66D] rounded-3xl" />
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FF6B6B] rounded-2xl" />
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={guide?.img_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=700&fit=crop'}
              alt={guide?.name || 'Popular Guide'}
              className="w-full h-[400px] md:h-[500px] object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=700&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/60 via-transparent to-transparent" />
          </div>

          {/* Views Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-xl flex items-center justify-center">
                <FiEye className="w-6 h-6 text-[#FF6B6B]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1917]">{formatViews(guide?.view)}</p>
                <p className="text-xs text-[#7D786F]">Views</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="order-2"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B]/10 rounded-full mb-6">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-medium text-[#FF6B6B]">Most Popular Guide</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          variants={fadeInUp}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1917] leading-[1.1] mb-6"
        >
          {guide?.name || 'Essential Guide for Expats'}
        </motion.h1>

        {/* Description */}
        <motion.p 
          variants={fadeInUp}
          className="text-lg md:text-xl text-[#5C5850] max-w-lg mb-8 leading-relaxed line-clamp-4"
        >
          {guide?.description || 'Discover everything you need to know about living in Korea. Our most-read guide by the community.'}
        </motion.p>

        {/* Stats Row */}
        <motion.div variants={fadeInUp} className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <FiEye className="w-5 h-5 text-[#7D786F]" />
            <span className="text-[#5C5850] font-medium">{formatViews(guide?.view)} views</span>
          </div>
          <div className="flex items-center gap-2">
            <FiHeart className="w-5 h-5 text-[#FF6B6B]" />
            <span className="text-[#5C5850] font-medium">Community favorite</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
          <Link to={guide?.id ? `/guides/guide/${guide.id}` : '/guides'}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255,107,107,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-[#FF6B6B] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#FF6B6B]/25 flex items-center gap-3 transition-all duration-300"
            >
              Read Guide
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link to="/guides">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white border-2 border-[#E8E6E1] text-[#3D3A35] rounded-2xl font-semibold text-lg hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all duration-300"
            >
              All Guides
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};


/* =============================================================================
   SLIDE 4: Community
   ============================================================================= */

const SlideCommunity = ({ communityCount }) => {
  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[500px]">
      {/* Left Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="order-2 lg:order-1"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#9B59B6]/10 rounded-full mb-6">
          <span className="w-2 h-2 bg-[#9B59B6] rounded-full animate-pulse" />
          <span className="text-sm font-medium text-[#9B59B6]">Find your Communities</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          variants={fadeInUp}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1917] leading-[1.1] mb-6"
        >
          Join {communityCount || '50'}+
          <br />
          <span className="text-[#9B59B6]">Community Groups</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          variants={fadeInUp}
          className="text-lg md:text-xl text-[#5C5850] max-w-lg mb-8 leading-relaxed"
        >
          Connect with local foreigners who share your interests, hobbies, and experiences. 
          From 1 Stop Q&A to hiking clubs to language exchange, find your perfect community.
        </motion.p>

        {/* Community Categories Preview */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-8">
          {['Language Exchange', 'Sports & Fitness', 'Foodies', 'Professionals', 'Parents'].map((cat, idx) => (
            <span 
              key={idx}
              className="px-4 py-2 bg-gray-100 text-[#5C5850] rounded-full text-sm font-medium hover:bg-[#9B59B6]/10 hover:text-[#9B59B6] transition-colors cursor-pointer"
            >
              {cat}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
          <Link to="/community">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(155,89,182,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-[#9B59B6] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#9B59B6]/25 flex items-center gap-3 transition-all duration-300"
            >
              Browse Communities
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link to="/community/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white border-2 border-[#E8E6E1] text-[#3D3A35] rounded-2xl font-semibold text-lg hover:border-[#9B59B6] hover:text-[#9B59B6] transition-all duration-300"
            >
              Create Group
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Content - Community Image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="order-1 lg:order-2 relative"
      >
        <div className="relative">
          <div className="absolute -top-6 -right-6 w-full h-full bg-[#9B59B6] rounded-3xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#FFE66D] rounded-2xl" />
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=700&fit=crop"
              alt="Community gathering"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/60 via-transparent to-transparent" />
          </div>

          {/* Community Count Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#9B59B6]/10 rounded-xl flex items-center justify-center">
                <LuUsers className="w-6 h-6 text-[#9B59B6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1917]">{communityCount || '50'}+</p>
                <p className="text-xs text-[#7D786F]">Active Groups</p>
              </div>
            </div>
          </motion.div>

          {/* Activity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-[#9B59B6] to-[#FF6B6B]"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1917]">Active Now</p>
                <p className="text-xs text-[#7D786F]">Join the conversation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};


/* =============================================================================
   SLIDE 5: Advertisement (Placeholder)
   ============================================================================= */

const SlideAdvertisement = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[500px]">
      {/* Left Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="order-2 lg:order-1"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE66D]/30 rounded-full mb-6">
          <span className="text-lg">🤝</span>
          <span className="text-sm font-medium text-[#B8860B]">Featured Partner</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          variants={fadeInUp}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1917] leading-[1.1] mb-6"
        >
          Learn Korean
          <br />
          <span className="text-[#FF6B6B]">For Free</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          variants={fadeInUp}
          className="text-lg md:text-xl text-[#5C5850] max-w-lg mb-8 leading-relaxed"
        >
          Join free Korean language classes with Kevin at local community centers for free. 
          Perfect for beginners and advanced learners. You can also participate in various intresting activities with Kevin in Daejeon!
        </motion.p>

        {/* Features */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
            <span className="text-green-600">✓</span>
            <span className="text-sm font-medium text-green-700">100% Free</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <span className="text-blue-600">📍</span>
            <span className="text-sm font-medium text-blue-700">Multiple Locations</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
            <span className="text-purple-600">👥</span>
            <span className="text-sm font-medium text-purple-700">Small Classes</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
          <Link to="/events">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255,107,107,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-[#FF6B6B] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#FF6B6B]/25 flex items-center gap-3 transition-all duration-300"
            >
              Find Classes
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link to="/contact">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white border-2 border-[#E8E6E1] text-[#3D3A35] rounded-2xl font-semibold text-lg hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all duration-300"
            >
              Contact Us
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Content - Ad Image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="order-1 lg:order-2 relative"
      >
        <div className="relative">
          <div className="absolute -top-6 -right-6 w-full h-full bg-[#FFE66D] rounded-3xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#4ECDC4] rounded-2xl" />
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=700&fit=crop"
              alt="Korean Language Class"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/60 via-transparent to-transparent" />
          </div>

          {/* Promo Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ delay: 0.8 }}
            className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white rounded-2xl px-6 py-3 shadow-lg"
          >
            <p className="text-lg font-bold">FREE!</p>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#1A1917]">Next Class: Every Saturday 10:00 AM</p>
                <p className="text-sm text-[#7D786F]">Daejeon Community Center</p>
              </div>
              <div className="px-4 py-2 bg-[#4ECDC4]/10 rounded-xl">
                <p className="text-sm font-bold text-[#4ECDC4]">10:00 AM</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};


/* =============================================================================
   SERVICES SECTION - Clean, Iconographic, Interactive
   ============================================================================= */

const ServiceCard = ({ title, description, icon: Icon, href, color, delay = 0 }) => {
  return (
    <Link to={href}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -8 }}
        className="group relative bg-white rounded-3xl p-8 border border-[#E8E6E1] hover:border-transparent hover:shadow-2xl transition-all duration-500 h-full"
      >
        {/* Hover gradient background */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)` }}
        />
        
        <div className="relative z-10">
          {/* Icon */}
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-8 h-8" style={{ color }} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-[#1A1917] mb-3 group-hover:text-[#3D3A35] transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-[#7D786F] leading-relaxed mb-4">
            {description}
          </p>

          {/* Arrow Link */}
          <div className="flex items-center gap-2 font-medium transition-colors" style={{ color }}>
            <span className="text-sm">Explore</span>
            <FiArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ServicesSection = ({ features }) => {
  const serviceData = [
    {
      title: 'Marketplace',
      description: 'Buy, sell, or give away items within our trusted expat community. Safe transactions, real connections.',
      icon: LuShoppingBag,
      href: '/marketplace',
      color: '#FF6B6B',
    },
    {
      title: 'Events',
      description: 'Discover local events, meetups, and activities. Never miss an opportunity to connect.',
      icon: LuCalendar,
      href: '/events',
      color: '#4ECDC4',
    },
    {
      title: 'Community',
      description: 'Join groups and connect with fellow expats who share your interests and experiences.',
      icon: LuUsers,
      href: '/community',
      color: '#FFB347',
    },
    {
      title: 'Nearby Places',
      description: 'Find expat-friendly locations, hidden gems, and essential services in your area.',
      icon: LuMapPin,
      href: '/nearby',
      color: '#9B59B6',
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.span 
            variants={fadeInUp}
            className="inline-block px-4 py-2 bg-[#4ECDC4]/10 text-[#4ECDC4] rounded-full text-sm font-semibold mb-4"
          >
            What do we offer?
          </motion.span>
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-3xl font-bold text-[#1A1917] mb-4"
          >
            We offer services and guides to help you maintain a easy life
            <span className="text-[#4ECDC4]">  in South Korea</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-[#7D786F]"
          >
            From finding your guides to discovering local stores and tourist attractions, KEasy Platform will guide you.
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceData.map((service, index) => (
            <ServiceCard key={index} {...service} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};


/* =============================================================================
   FLOATING BUBBLES - Guide Topics (Auto-Fetch Most Viewed)
   ============================================================================= */

const FloatingBubble = ({ title, id, index }) => {
  // Truncate to max 8 words
  const truncatedTitle = title.split(' ').slice(0, 8).join(' ') + (title.split(' ').length > 8 ? '...' : '');

  return (
    <Link to={id ? `/guides/guide/${id}` : '/guides'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ 
          scale: 1.05, 
          backgroundColor: '#0D9488',
        }}
        className="inline-block px-5 py-2.5 rounded-full cursor-pointer border-2 border-[#0D9488] bg-white hover:bg-[#0D9488] group transition-all duration-300"
      >
        <span className="text-sm font-medium text-[#0D9488] group-hover:text-white whitespace-nowrap transition-colors duration-300">
          {truncatedTitle}
        </span>
      </motion.div>
    </Link>
  );
};

const FloatingBubblesSection = () => {
  const [topGuides, setTopGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-fetch most viewed guides from Supabase
  useEffect(() => {
    const fetchMostViewedGuides = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('guide')
          .select('id, name, view')
          .eq('approved', true)  // Only approved guides
          .order('view', { ascending: false })  // Most viewed first
          .limit(17);  // Get top 15

        if (error) {
          console.error('Error fetching guides:', error.message);
          setTopGuides([]);
        } else {
          setTopGuides(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setTopGuides([]);
      }
      
      setIsLoading(false);
    };

    fetchMostViewedGuides();
  }, []);

  // Fallback guides if database is empty
  const fallbackGuides = [
    { id: null, name: "🍖 Halal Food Mart" },
    { id: null, name: "🌍 Welcome to Daejeon" },
    { id: null, name: "🚲 How to Verify Your Phone" },
    { id: null, name: "📱 Budget iPhone Repair Shop" },
    { id: null, name: "🔧 Samsung Service Center" },
    { id: null, name: "🔒 How to Unlock Verification" },
    { id: null, name: "💊 Woosong Pharmacy" },
    { id: null, name: "🏦 Opening a Bank Account" },
    { id: null, name: "🏠 Finding an Apartment" },
    { id: null, name: "📞 Korean Phone Plans" },
    { id: null, name: "🏥 Healthcare & Insurance" },
    { id: null, name: "🗣️ Learning Korean Basics" },
  ];

  // Use fetched guides or fallback
  const bubbleData = topGuides.length > 0 ? topGuides : fallbackGuides;

  // Distribute bubbles across rows (varying items per row for organic look)
  const row1 = bubbleData.slice(0, 4);
  const row2 = bubbleData.slice(4, 8);
  const row3 = bubbleData.slice(8, 13);
  const row4 = bubbleData.slice(13, 13 + 4);

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-12 overflow-hidden bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-[#7D789F] uppercase tracking-[0.2em]">
              Popular Guide Topics
            </span>
          </div>
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Skeleton bubbles */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-10 w-32 md:w-40 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 px-8 md:px-16">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-10 w-36 md:w-44 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-3xl font-semibold text-[#7D786F] uppercase tracking-[0.2em]">
            Popular Guide Topics
          </span>
        </motion.div>

        {/* Bubbles - Full Width Justified Layout */}
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Row 1 - Justify between */}
          {row1.length > 0 && (
            <div className="flex flex-wrap justify-between items-center gap-1">
              {row1.map((guide, index) => (
                <FloatingBubble
                  key={`row1-${guide.id || index}`}
                  title={guide.name}
                  id={guide.id}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Row 2 - Center with spacing */}
          {row2.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-1 px-8 md:px-16">
              {row2.map((guide, index) => (
                <FloatingBubble
                  key={`row2-${guide.id || index}`}
                  title={guide.name}
                  id={guide.id}
                  index={index + 4}
                />
              ))}
            </div>
          )}

          {/* Row 3 - Justify between */}
          {row3.length > 0 && (
            <div className="flex flex-wrap justify-between items-center gap-1">
              {row3.map((guide, index) => (
                <FloatingBubble
                  key={`row3-${guide.id || index}`}
                  title={guide.name}
                  id={guide.id}
                  index={index + 7}
                />
              ))}
            </div>
          )}

          {/* Row 4 - Center with spacing */}
          {row4.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-1 px-4 md:px-12">
              {row4.map((guide, index) => (
                <FloatingBubble
                  key={`row4-${guide.id || index}`}
                  title={guide.name}
                  id={guide.id}
                  index={index + 11}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link 
            to="/guides"
            className="inline-flex items-center gap-2 text-[#0D9488] font-medium hover:underline transition-all"
          >
            View all guides
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};



/* =============================================================================
   GUIDES SECTION - Editorial Style Cards
   ============================================================================= */

const GuidesCard = ({ id, name, description, img_url, created_by, like = {}, onLike, currentUserId }) => {
  const [author, setAuthor] = useState("KEasy Team");
  const isLiked = currentUserId && like[currentUserId] === true;
  const likesCount = Object.values(like || {}).filter(val => val === true).length;

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!created_by) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", created_by)
        .single();
      if (!error && data) setAuthor(data.username || "KEasy Team");
    };
    fetchAuthor();
  }, [created_by]);

  return (
    <Link to={`/guides/guide/${id}`} className="block group">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      >
        {/* Image */}
        <div className="relative h-[200px] overflow-hidden">
          {img_url ? (
            <img 
              src={img_url} 
              alt={name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] flex items-center justify-center">
              <LuSparkles className="w-12 h-12 text-white/50" />
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLike();
            }}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isLiked 
                ? 'bg-[#FF6B6B] text-white' 
                : 'bg-white/90 backdrop-blur-sm text-[#7D786F] hover:text-[#FF6B6B]'
            }`}
          >
            {isLiked ? <FaHeart className="w-4 h-4" /> : <FiHeart className="w-4 h-4" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-[#7D786F] mb-2">
            <span className="w-6 h-6 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center text-[#4ECDC4]">
              {author.charAt(0).toUpperCase()}
            </span>
            <span>By {author}</span>
            <span>•</span>
            <span>{formatCount(likesCount)} likes</span>
          </div>
          <h3 className="text-lg font-bold text-[#1A1917] line-clamp-2 mb-2 group-hover:text-[#FF6B6B] transition-colors">
            {name}
          </h3>
          <p className="text-sm text-[#7D786F] line-clamp-2">
            {description || "Discover helpful tips and guides for life in Korea."}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

const GuidesSection = ({ guides, currentUserId, onGuideLike, guidesRef }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span 
              variants={fadeInUp}
              className="inline-block px-4 py-2 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-full text-sm font-semibold mb-4"
            >
              Learn & Grow
            </motion.span>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-[#1A1917]"
            >
              Explore <span className="text-[#FF6B6B]">Guides</span>
            </motion.h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/guides"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[#1A1917] text-white rounded-full font-medium hover:bg-[#3D3A35] transition-colors"
            >
              View All Guides
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Scrollable Cards */}
        <div
          ref={guidesRef}
          className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          {guides.map((guide, index) => (
            <motion.div 
              key={guide.id} 
              className="flex-none w-[300px] snap-start"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GuidesCard
                {...guide}
                currentUserId={currentUserId}
                onLike={() => onGuideLike(guide.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


/* =============================================================================
   MARKETPLACE SECTION
   ============================================================================= */

const MarketplaceCard = ({ item, userId, onToggleLike }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const imageUrl = item?.images?.images?.[0] || "/no-image.png";

  const [user_id, setUser_id] = useState(null);
  const [user_favourites, setUserFavourites] = useState([]);
  const isLiked = user_id && user_favourites.includes(item.id);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id || null;
      setUser_id(uid);
      if (uid) {
        const { data: favsData } = await supabase
          .from('profiles')
          .select('favourites_marketplace')
          .eq('user_id', uid)
          .single();
        const favourites = favsData?.favourites_marketplace;
        setUserFavourites(Array.isArray(favourites) ? favourites : []);
      }
    };
    fetchUser();
  }, []);

  const handleToggleLike = async () => {
    if (!user_id) {
      alert('Please sign in to like items!');
      return;
    }
    try {
      const updatedFavourites = isLiked
        ? user_favourites.filter((id) => id !== item.id)
        : [...user_favourites, item.id];
      setUserFavourites(updatedFavourites);
      await supabase.from('profiles').update({ favourites_marketplace: updatedFavourites }).eq('user_id', user_id);
    } catch (err) {
      console.error('Error updating favourites: ', err);
    }
  };

  const handleCardClick = async () => {
    try {
      await supabase.from("marketplace").update({ views: (item.views || 0) + 1 }).eq("id", item.id);
    } catch (err) {
      console.error(err);
    }
    navigate(`/marketplace/${item.id}`);
  };

  const conditionColors = {
    new: '#10B981',
    like_new: '#3B82F6',
    used: '#6B7280',
    refurbished: '#F59E0B',
    damaged: '#EF4444',
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-[180px] bg-gray-50 flex items-center justify-center p-4">
        <img
          src={imageError ? "/no-image.png" : imageUrl}
          onError={() => setImageError(true)}
          alt={item.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Condition Badge */}
        <span 
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: conditionColors[item.condition] || '#6B7280' }}
        >
          {item.condition?.replace('_', ' ').charAt(0).toUpperCase() + item.condition?.slice(1).replace('_', ' ') || 'Used'}
        </span>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleLike();
          }}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isLiked 
              ? 'bg-[#FF6B6B] text-white' 
              : 'bg-white/90 text-[#7D786F] hover:text-[#FF6B6B]'
          }`}
        >
          {isLiked ? <FaHeart className="w-4 h-4" /> : <FiHeart className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-1 text-xs text-[#7D786F] mb-2">
          <FiMapPin className="w-3 h-3" />
          <span>{item.location || 'Korea'}</span>
          <span className="mx-2">•</span>
          <FiEye className="w-3 h-3" />
          <span>{item.views || 0}</span>
        </div>
        <h3 className="text-base font-bold text-[#1A1917] line-clamp-1 mb-2 group-hover:text-[#4ECDC4] transition-colors">
          {item.title}
        </h3>
        <p className="text-xl font-bold text-[#FF6B6B]">
          {formatCurrency(item.price)}
        </p>
      </div>
    </motion.div>
  );
};

const MarketplaceSection = ({ items, currentUserId, onToggleLike, marketplaceRef }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span 
              variants={fadeInUp}
              className="inline-block px-4 py-2 bg-[#4ECDC4]/10 text-[#4ECDC4] rounded-full text-sm font-semibold mb-4"
            >
              Buy & Sell
            </motion.span>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-[#1A1917]"
            >
              Explore <span className="text-[#4ECDC4]">Marketplace</span>
            </motion.h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/marketplace"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[#4ECDC4] text-white rounded-full font-medium hover:bg-[#3DBDB5] transition-colors"
            >
              Browse All Items
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Scrollable Cards */}
        <div
          ref={marketplaceRef}
          className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          {items.map((item, index) => (
            <motion.div 
              key={item.id} 
              className="flex-none w-[280px] snap-start"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <MarketplaceCard
                item={item}
                userId={currentUserId}
                onToggleLike={onToggleLike}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


/* =============================================================================
   LOCAL CLASSES CTA - Bold, Engaging Banner
   ============================================================================= */

const LocalClassesCTA = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#9fd6cb] to-[#9fb3c1]"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                {/* <pattern id="circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="white" />
                </pattern> */}
              </defs>
              <rect width="100%" height="100%" fill="url(#circles)" />
            </svg>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center">
            {/* Image */}
            <div className="w-full lg:w-2/5 p-8 lg:p-12">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <img
                  src="/korean-class.jpg"
                  alt="Korean Language Class"
                  className="w-full h-[280px] lg:h-[320px] object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop';
                  }}
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <Play className="w-6 h-6 text-[#FF6B6B] ml-1" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-3/5 p-8 lg:p-12 text-white">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4">
                🎓 Free Korean Language Classes Available
              </span>
              <h3 className="text-3xl lg:text-3xl font-bold mb-4 leading-tight">
                Join Free Korean Classes
                <br /> with Kevin Park
              </h3>
              <p className="text-white/90 text-lg mb-8 max-w-lg">
                Meet fellow community members, learn Korean Language, and participate in volunteer activities. 
                All levels are welcome!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/events">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white text-[#FF6B6B] rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Join Free Class
                  </motion.button>
                </Link>
                <Link to="/community">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Join Community
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
};


/* =============================================================================
   TESTIMONIALS SECTION - EXACT Design Match
   ============================================================================= */

/* =============================================================================
   TESTIMONIALS SECTION - WITH STEPPED BOX DESIGN (EXACT MATCH)
   Images are INSIDE the light color section, not overlapping
   ============================================================================= */

/**
 * Testimonial Card with Stepped Box - Images Inside Light Section
 * 
 * @param {string} name - Person's name
 * @param {string} image - Person's image URL
 * @param {string} quote - Testimonial quote
 * @param {string} lightColor - Light background color (top section)
 * @param {string} darkColor - Dark background color (bottom section + notches)
 * @param {object} notch - Notch configuration {left: {w, h, b}, right: {w, h, t}}
 */
const TestimonialCard = ({ name, image, quote, lightColor, darkColor, notch }) => {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[280px]">
      {/* Card Container */}
      <div className="relative w-full h-[500px] md:h-[430px] overflow-hidden rounded-[10px] shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
        
        {/* Top Light Section with Image Inside */}
        <div 
          className="absolute top-0 left-0 right-0 flex items-end justify-center pb-0"
          style={{ 
            height: '50%',
            backgroundColor: lightColor 
          }}
        >
          <img
            src={image}
            alt={name}
            className="w-[200px] h-[200px] md:w-[220px] md:h-[220px] object-cover rounded-"
            onError={(e) => { 
              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
            }}
          />
        </div>
        
        {/* Bottom Dark Section with Quote */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-center"
          style={{ 
            height: '50%',
            backgroundColor: darkColor 
          }}
        >
          <p className="text-white text-[14px] md:text-[15px] leading-[1.6] mb-4 md:mb-5">
            "{quote}"
          </p>
          <p className=" absolute bottom-7 left-8 text-white text-[16px] md:text-[18px] font-bold">
            {name}
          </p>
        </div>
        
        {/* Left Notch */}
        <div 
          className="absolute left-0"
          style={{
            width: `${notch.left.w}px`,
            height: `${notch.left.h}px`,
            backgroundColor: darkColor,
            top: notch.left.t,
            bottom: notch.left.b
          }}
        />
        
        {/* Right Notch */}
        <div 
          className="absolute right-0"
          style={{
            width: `${notch.right.w}px`,
            height: `${notch.right.h}px`,
            backgroundColor: darkColor,
            top: notch.right.t,
            bottom: notch.right.b
          }}
        />
      </div>
    </div>
  );
};

/**
 * Testimonials Section - Complete with Auto-Scrolling
 */
const TestimonialsSection = () => {
  // Color combinations
  const colors = [
    { light: '#FFE5E5', dark: '#FF6B6B' },  // Coral
    { light: '#E0F7F5', dark: '#5BBFBA' },  // Teal
    { light: '#FFE5E5', dark: '#FFBDBD' },  // Light Pink
    { light: '#E0F7F5', dark: '#9DD5E3' },  // Light Blue
    { light: '#F3E8FF', dark: '#9DD5E3' },  // Purple to Blue
    { light: '#D1FAE5', dark: '#B8E5C9' },  // Mint Green
    { light: '#E0F7F5', dark: '#9DD5E3' },  // Cyan
    { light: '#FFE5E5', dark: '#FDBA9B' },  // Coral Peach
    { light: '#FFF0E1', dark: '#FFA726' },  // Orange
    { light: '#E6FBF7', dark: '#06D6A0' },  // Turquoise
    { light: '#F0E6FA', dark: '#7209B7' },  // Purple
    { light: '#EBF3FF', dark: '#3A86FF' },  // Blue
  ];

  // Notch variations - positioned to connect seamlessly at 50% split
  // Left notch: starts at 50% and extends DOWN into dark section
  // Right notch: ends at 50% and extends UP from dark section
  const notchVariations = [
    { left: { w: 32, h: 64, b: '50%' }, right: { w: 31, h: 80, b: '50%' } },
    { left: { w: 34, h: 80, b: '50%' }, right: { w: 37, h: 96, b: '50%' } },
    { left: { w: 36, h: 48, b: '50%' }, right: { w: 33, h: 64, b: '50%' } },
    { left: { w: 34, h: 96, b: '50%' }, right: { w: 32, h: 80, b: '50%' } },
    { left: { w: 36, h: 72, b: '50%' }, right: { w: 28, h: 88, b: '50%' } },
    { left: { w: 32, h: 60, b: '50%' }, right: { w: 27, h: 76, b: '50%' } },
    { left: { w: 28, h: 84, b: '50%' }, right: { w: 36, h: 68, b: '50%' } },
    { left: { w: 40, h: 56, b: '50%' }, right: { w: 33, h: 92, b: '50%' } },
  ];

  // Testimonials with KEasy theme
  const testimonials = [
    {
      name: "Abhishek, Nepal",
      image: "/testimonials/Abhishek.svg",
      quote: "KEasy has changed my life in Korea. I was confused about everything in South Korea, but KEasy guides saved my life."
    },
    {
      name: "Nada, Egypt",
      image: "/testimonials/Nada.svg",
      quote: "Keasy made my life in Korea so much easier. I met new friends and found affordable second-hand items through the marketplace."
    },
    {
      name: "Kevin, Korea",
      image: "/testimonials/Kevin.svg",
      quote: "Being part of KEasy community is a must for foreigners. It helps foreigners communicate and participate  Thank you for this amazing platform!"
    },
     {
      name: "Vedika, India",
      image: "/testimonials/Vedika.svg",
      quote: "I can't imagine my life in Korea without KEasy. It's my go-to platform for everything!"
    },
    {
      name: "Khalil, Egypt",
      image: "/testimonials/Khalil.svg",
      quote: "Keasy helped me meet great people in Korea and discover events I wouldn’t have found on my own. It’s been a huge help for my social life."
    },
    {
      name: "Bhoomika, India",
      image: "/testimonials/Bhoomika.svg",
      quote: "KEasy community support is unmatched. I always get helpful advice from fellow expats here."
    },
    {
      name: "Zakaria, Egypt",
      image: "/testimonials/Zakaria.svg",
      quote: "Keasy helped me meet amazing people and join fun events in Korea. It made settling in much easier."
    },
    {
      name: "Rupesh",
      image: "/testimonials/Rupesh.svg",
      quote: "KEasy understands what expats need. Every feature is thoughtfully designed for our community."
    },
    {
      name: "Vedika, India",
      image: "/testimonials/Vedika.svg",
      quote: "I can't imagine my life in Korea without KEasy. It's my go-to platform for everything!"
    },
    {
      name: "Yoon, Korea",
      image: "/testimonials/Yoon.svg",
      quote: "Keasy brought many new foreign customers to my store. It’s a great platform for connecting local businesses with the foreign community."
    },
    // {
    //   name: "Michael",
    //   image: "/testimonials/AB.SVG",
    //   quote: "I found the perfect match. They understood my background and challenges completely."
    // },
    // {
    //   name: "Jessica",
    //   image: "/testimonials/AB.SVG",
    //   quote: "This changed my perspective on living abroad. I wish I had found KEasy sooner."
    // },
    // {
    //   name: "David",
    //   image: "/testimonials/AB.SVG",
    //   quote: "Finally, a platform that gets it. The connection was instant and the progress has been amazing."
    // },
  ];

  // Duplicate for infinite scroll
  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1917] mb-4"
          >
            What Our Community Members Say
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#5C5850] text-base md:text-lg max-w-2xl mx-auto"
          >
            Real stories from expats who have found support, friendship, and a sense of belonging through KEasy.
          </motion.p>
        </div>
      </div>

      {/* Full Width Scrolling Container */}
      <div className="relative py-8">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        {/* Auto-Scrolling Track */}
        <div className="overflow-hidden px-4">
          <motion.div 
            className="flex gap-5 md:gap-8"
            animate={{
              x: [0, -(320 + 32) * testimonials.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: testimonials.length * 6,
                ease: "linear",
              },
            }}
            style={{
              width: 'fit-content',
            }}
          >
            {allTestimonials.map((testimonial, index) => {
              const colorIndex = index % colors.length;
              const notchIndex = index % notchVariations.length;
              
              return (
                <TestimonialCard
                  key={`testimonial-${index}`}
                  name={testimonial.name}
                  image={testimonial.image}
                  quote={testimonial.quote}
                  lightColor={colors[colorIndex].light}
                  darkColor={colors[colorIndex].dark}
                  notch={notchVariations[notchIndex]}
                />
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* View All Link */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mt-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 text-[#FF6B6B] hover:text-[#E85555] font-semibold transition-colors"
            >
              Read more testimonials
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};




/* =============================================================================
   CTA SECTION - Final Push
   ============================================================================= */

const CTASection = ({ currentUserId }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center max-w-3xl mx-auto"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#FFE66D]/30 rounded-full blur-2xl" />
          
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4ECDC4]/10 text-[#4ECDC4] rounded-full text-sm font-semibold mb-6"
          >
            <span className="w-2 h-2 bg-[#4ECDC4] rounded-full animate-pulse" />
            Join 1,000+ expats already thriving
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1917] mb-6">
            Ready to make Korea
            <br />
            <span className="text-[#FF6B6B]">feel like home?</span>
          </h2>

          <p className="text-xl text-[#7D786F] mb-10 max-w-xl mx-auto">
            Your community is waiting. Join KEasy today and start your journey to a more connected life in Korea.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={currentUserId ? "/community" : "/signup"}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255,107,107,0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="group px-10 py-5 bg-[#FF6B6B] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#FF6B6B]/25 flex items-center gap-3"
              >
                {currentUserId ? "Go to Community" : "Join for Free"}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/guides">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-transparent border-2 border-[#E8E6E1] text-[#3D3A35] rounded-2xl font-semibold text-lg hover:border-[#4ECDC4] hover:text-[#4ECDC4] transition-all"
              >
                Browse Guides
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


/* =============================================================================
   PARTNERSHIPS SECTION - Infinite Auto-Scrolling
   ============================================================================= */

const PartnershipsSection = () => {
  const partners = [
    // { name: "Skala Plus" },
    // { name: "Carrot" },
    // { name: "Facebook" },
    { name: "The Realtor Guy" },
    { name: "Woosong Univesity" },
    { name: "Ws_Phoneshop" },
  ];

  // Duplicate partners for seamless infinite loop
  const allPartners = [...partners, ...partners, ...partners];

  return (
    <section className="py-8 md:py-10 bg-white border-t border-[#E8E6E1] overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        {/* Horizontal Layout: Label on Left, Scrolling Partners on Right */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          
          {/* Left: "Trusted By" Label - Fixed Position */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-[#7D786F] uppercase tracking-wider whitespace-nowrap flex-shrink-0"
          >
            Trusted By
          </motion.p>

          {/* Divider Line (Desktop Only) */}
          <div className="hidden md:block w-px h-6 bg-[#D3D0C9] flex-shrink-0" />

          {/* Right: Auto-Scrolling Partners */}
          <div className="relative flex-1 overflow-hidden">
            {/* Gradient Overlays for Fade Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-[#FDFBF7] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling Track */}
            <motion.div 
              className="flex items-center gap-8 md:gap-12"
              animate={{
                x: [0, -((partners.length) * 150)], // Adjust based on average item width
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: partners.length * 3, // Speed: lower = faster
                  ease: "linear",
                },
              }}
              style={{
                width: 'fit-content',
              }}
            >
              {allPartners.map((partner, index) => (
                <span
                  key={`partner-${index}`}
                  className="text-sm md:text-base font-semibold text-[#9B9590] hover:text-[#FF6B6B] transition-colors duration-300 cursor-default whitespace-nowrap"
                >
                  {partner.name}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};


/* =============================================================================
   FEEDBACK SECTION
   ============================================================================= */

const FeedbackSection = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const feedbackTypes = [
    { id: 'general', label: 'General', icon: '💬' },
    { id: 'bug', label: 'Bug Report', icon: '🐛' },
    { id: 'feature', label: 'Feature', icon: '✨' },
    { id: 'improvement', label: 'Improve', icon: '🚀' }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await supabase.from('feedback').insert([{
        rating,
        feedback_type: feedbackType,
        feedback_text: feedback,
        user_id: currentUserId
      }]);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setFeedback('');
        setFeedbackType('general');
      }, 3000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-10"
        >
          <motion.span 
            variants={fadeInUp}
            className="inline-block px-4 py-2 bg-[#9B59B6]/10 text-[#9B59B6] rounded-full text-sm font-semibold mb-4"
          >
            We Value Your Input
          </motion.span>
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-[#1A1917] mb-4"
          >
            Share Your <span className="text-[#9B59B6]">Feedback</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#7D786F]">
            Help us make KEasy even better for the community
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
              )}

              {/* Feedback Type */}
              <div className="grid grid-cols-4 gap-2">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFeedbackType(type.id)}
                    className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      feedbackType === type.id
                        ? 'bg-[#9B59B6] text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="block text-lg mb-1">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Rating */}
              <div className="text-center">
                <p className="text-sm text-[#7D786F] mb-3">How's your experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'text-[#FFE66D] fill-[#FFE66D]'
                            : 'text-[#E8E6E1]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts with us..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#9B59B6] outline-none transition-all resize-none text-[#3D3A35] placeholder-gray-400"
              />

              <motion.button
                type="submit"
                disabled={!rating || !feedback.trim() || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 bg-[#9B59B6] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="w-16 h-16 bg-[#4ECDC4]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1917] mb-2">Thank You!</h3>
              <p className="text-[#7D786F]">Your feedback helps us improve KEasy</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};


/* =============================================================================
   AI CHATBOT
   ============================================================================= */

const companyInfo = `Hey there! I'm your friendly KEasy chatbot — your digital companion for navigating life in South Korea 🇰🇷. Whether you're an international student, expat, or just a traveller, I'm here to guide you through your new life, help you find communities, and make your experience smoother, easier, and more connected.

KEasy is a modern community platform designed to support international people living in South Korea. We bring together everything you need to live, connect, and thrive abroad — all in one place.

Our platform offers:
- AI-powered assistance for real-time guidance and translation
- Marketplace to buy and sell new or used items safely
- Events & Activities listings to help you explore your city
- Community groups and chats where you can connect with others
- Blog and resources for legal advice, cultural tips, and local insights

KEasy's goal is simple: make life easier for foreigners in South Korea through community, technology, and meaningful support.

Stay connected with us:
- Website: https://www.koreaeasy.org
- Instagram: https://www.instagram.com/keasy_community

At KEasy, we believe in more than just technology — we believe in community. Together, we make Korea feel like home 💙`;

const ChatbotIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] flex items-center justify-center">
    <Sparkles className="w-4 h-4 text-white" />
  </div>
);

const ChatMessage = ({ chat }) => {
  if (chat.hideInChat) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${chat.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {chat.role === 'model' && <ChatbotIcon />}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        chat.role === 'user'
          ? 'bg-[#FF6B6B] text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{chat.text}</p>
      </div>
      {chat.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-[#4ECDC4] flex items-center justify-center text-white">
          <FiUser className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
};

const AIChatbot = ({ currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([{ hideInChat: true, role: 'model', text: companyInfo }]);
  const chatBodyRef = useRef();
  const navigate = useNavigate();

  const generateBotResponse = async (history) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key missing");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: history.map(({ role, text }) => ({
              role: role === 'user' ? 'user' : 'model',
              parts: [{ text }]
            })),
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
          })
        }
      );

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";

      setChatHistory(prev => [...prev.filter(msg => msg.text !== 'Thinking...'), { role: 'model', text: botResponse }]);
    } catch (error) {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== 'Thinking...'), { role: 'model', text: "I'm having trouble responding. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    const newMessage = { role: 'user', text: message.trim() };
    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Thinking...' }]);
      generateBotResponse([...chatHistory, newMessage]);
    }, 500);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleToggle = () => {
    if (currentUserId) {
      setIsOpen(!isOpen);
      if (isOpen) setChatHistory([{ hideInChat: true, role: 'model', text: companyInfo }]);
    } else {
      alert("Please sign in to use the AI Chatbot.");
      navigate('/signin');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white rounded-full shadow-lg shadow-[#FF6B6B]/30"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline font-semibold">KEasy AI</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 bg-white rounded-3xl shadow-2xl overflow-hidden md:bottom-24 md:right-6 md:w-[380px] md:h-[550px] inset-4 md:inset-auto flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChatbotIcon />
                  <div>
                    <h3 className="font-semibold">KEasy AI</h3>
                    <p className="text-xs text-white/80">Always here to help</p>
                  </div>
                </div>
                <button onClick={handleToggle} className="p-2 hover:bg-white/20 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4">
                <div className="flex gap-3 mb-4">
                  <ChatbotIcon />
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-gray-800">Hey there! 👋 How can I help you today?</p>
                  </div>
                </div>
                {chatHistory.map((chat, i) => <ChatMessage key={i} chat={chat} />)}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-full outline-none text-sm"
                    disabled={isLoading}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};


/* =============================================================================
   MAIN HOME COMPONENT
   ============================================================================= */

export default function Home() {
  const marketplaceRef = useRef(null);
  const guidesRef = useRef(null);
  const [guides, setGuides] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [marketplaceItems, setMarketplaceItems] = useState([]);

  const features = [
    { title: 'Marketplace', description: 'Buy, sell, or give away items within the expat community.', icon: LuShoppingBag, href: '/marketplace' },
    { title: 'Events', description: 'Discover local events, meetups, and activities for expats.', icon: LuCalendar, href: '/events' },
    { title: 'Community', description: 'Join groups and connect with other expats.', icon: LuUsers, href: '/community' },
    { title: 'Nearby Places', description: 'Find expat-friendly locations and services in your area.', icon: LuMapPin, href: '/nearby' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: user } = await supabase.auth.getUser();
      setCurrentUserId(user?.user?.id || null);

      const { data: guidesData } = await supabase.from('guide').select('id, created_at, name, description, img_url, created_by, like').limit(8);
      setGuides(guidesData || []);

      const { data: marketData } = await supabase.from('marketplace').select('*').eq("verified", true).eq('available', true).limit(20);
      setMarketplaceItems(marketData || []);
    };
    fetchData();
  }, []);

  const handleToggleLike = async (item) => {
    if (!currentUserId) return alert("Please log in to like items.");
    let favourites = item.favourites?.favourites || [];
    const updatedFavourites = favourites.includes(currentUserId)
      ? favourites.filter((id) => id !== currentUserId)
      : [...favourites, currentUserId];

    await supabase.from("marketplace").update({ favourites: { favourites: updatedFavourites } }).eq("id", item.id);
    setMarketplaceItems(prev => prev.map(it => it.id === item.id ? { ...it, favourites: { favourites: updatedFavourites } } : it));
  };

  const handleGuideLike = async (guideId) => {
    if (!currentUserId) return alert("Please login to like guides");
    setGuides(prev => prev.map(guide => {
      if (guide.id !== guideId) return guide;
      const currentLikes = guide.like || {};
      const newLikes = currentLikes[currentUserId] === true
        ? { ...currentLikes, [currentUserId]: false }
        : { ...currentLikes, [currentUserId]: true };
      supabase.from('guide').update({ like: newLikes }).eq('id', guideId);
      return { ...guide, like: newLikes };
    }));
  };

  useEffect(() => {
    const addScroll = (ref) => {
      const el = ref.current;
      if (!el) return;
      const onWheel = (e) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: 'smooth' });
      };
      el.addEventListener('wheel', onWheel);
      return () => el.removeEventListener('wheel', onWheel);
    };
    const c1 = addScroll(marketplaceRef);
    const c2 = addScroll(guidesRef);
    return () => { c1?.(); c2?.(); };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
       <FloatingBubblesSection guides={guides} />
      <ServicesSection features={features} />
           {/* <GuidesSection guides={guides} currentUserId={currentUserId} onGuideLike={handleGuideLike} guidesRef={guidesRef} />
      <MarketplaceSection items={marketplaceItems} currentUserId={currentUserId} onToggleLike={handleToggleLike} marketplaceRef={marketplaceRef} /> */}
      <LocalClassesCTA />
      <TestimonialsSection />
      <CTASection currentUserId={currentUserId} />
      <PartnershipsSection />
      {/* <FeedbackSection /> */}
      <AIChatbot currentUserId={currentUserId} />
    </div>
  );
}