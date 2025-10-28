import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from "../../api/supabase-client";

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FiHeart, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

import { LuMessageCircleMore } from "react-icons/lu";
import { RiShoppingBag2Fill } from "react-icons/ri";
import { BiParty } from "react-icons/bi";
import { MdOutlineExplore } from "react-icons/md";

import { X, MessageCircle, Star, Send } from 'lucide-react';

import { motion, AnimatePresence } from "framer-motion";

/* Utility function for placeholder images */
const getPlaceholderImage = (id) =>
  `https://picsum.photos/400/300?random=${id}`;

// Carousel Component
const Carousel = ({ title, children, className = '' }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white md:text-3xl dark:text-white">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors ${
              showLeftArrow ? 'text-black hover:bg-gray-100' : 'cursor-default text-gray-300'
            }`}
          >
            &#8592;
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors ${
              showRightArrow ? 'text-black hover:bg-gray-100' : 'cursor-default text-gray-300'
            }`}
          >
            &#8594;
          </button>
        </div>
      </div>
      <div
        className="flex -mx-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
        ref={scrollContainerRef}
      >
        {children}
      </div>
    </div>
  );
};

// FeatureCard
const FeatureCard = ({ title, description, icon, href, linkText }) => {
  return (
    <Link to={href} className="h-full">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
      >
        <div className="flex items-center gap-4 mb-4 justify-items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-black text-3xl">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-black">{title}</h3>
        </div>
        <p className="text-gray-600 line-clamp-3 flex-grow">{description}</p>
      </motion.div>
    </Link>
  );
};

// HeroCarousel
const HeroCarousel = () => {
  const slides = [
    { id: 1, image: '/hero-seoul-sunset.jpg', heading: 'Welcome to Keasy', description: 'Making life in South Korea easier for foreigners', buttonText1: 'Explore Marketplace', buttonLink1: '/marketplace', buttonText2: 'Find Events', buttonLink2: '/events' },
    { id: 2, image: '/hero-korean-market.jpg', heading: 'Discover Local Stores', description: 'Find the best deals nearby', buttonText1: 'Shop Now', buttonLink1: '/marketplace', buttonText2: 'View Guides', buttonLink2: '/guides' },
    { id: 3, image: '/hero-jeju-coast.jpg', heading: 'Connect with Community', description: 'Meet and share with other expats', buttonText1: 'Join Groups', buttonLink1: '/community', buttonText2: 'Attend Events', buttonLink2: '/events' },
    { id: 4, image: '/hero-gyeongbokgung.jpg', heading: 'Learn & Grow', description: 'Access guides, tips, and resources', buttonText1: 'Read Guides', buttonLink1: '/guides', buttonText2: 'Watch Tutorials', buttonLink2: '/guides' }
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 6000);
    return () => clearInterval(interval);
  }, [current]);

  const nextSlide = () => { setDirection(1); setCurrent((prev) => (prev + 1) % slides.length); };
  const prevSlide = () => { setDirection(-1); setCurrent((prev) => (prev - 1 + slides.length) % slides.length); };

  const variants = { enter: (dir) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (dir) => ({ x: dir < 0 ? 1000 : -1000, opacity: 0 }) };

  return (
    <div className="relative w-full h-[60vh] sm:h-[10vh] md:h-[10vh] min-h-[500px] overflow-hidden rounded-b-3xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div key={slides[current].id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }} className="absolute top-0 left-0 w-full h-full">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slides[current].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-12 lg:px-20 text-left text-white lg:pb-10 pb-0">
            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-5xl font-medium mb-6 drop-shadow-lg text-white"
              >
                {slides[current].heading}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl mb-8 drop-shadow-md text-white"
              >
                {slides[current].description}
              </motion.p>
              {/* <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex flex-wrap justify-left gap-4">
              <Link to={slides[current].buttonLink1} className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-sm text-black rounded-lg font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105">{slides[current].buttonText1}</Link>
              <Link to={slides[current].buttonLink2} className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-black rounded-lg font-medium border border-white/20 hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105">{slides[current].buttonText2}</Link>
            </motion.div> */}
          </div>
        </motion.div>
      </AnimatePresence>
      <motion.div
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-3 right-3 z-20"
        >
          <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            {current + 1} / {slides.length}
          </div>
        </motion.div>


      {/* <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <motion.button key={index} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className={`h-3 w-3 rounded-full transition-all duration-300 ${current === index ? "bg-white shadow-white/50 shadow-lg scale-125" : "bg-white/40 hover:bg-white/60"}`} onClick={() => setCurrent(index)} />
        ))}
      </div> */}
    </div>
  );
};

// CoolCarousel Component
const CoolCarousel = ({ slides = [], intervalMs = 4000 }) => {
  const containerRef = useRef(null);
  const teleportTimeoutRef = useRef(null);

  // 1) Build a track with clones at both ends: [last, ...slides, first]
  const track = useMemo(() => {
    if (slides.length <= 1) return slides;
    const first = slides[0];
    const last = slides[slides.length - 1];
    return [last, ...slides, first];
  }, [slides]);

  const realCount = slides.length;
  const hasLoop = realCount > 1;

  // 2) Start on index 1 (the first real slide)
  const [index, setIndex] = useState(hasLoop ? 1 : 0);

  // 3) Utility: scroll to a slide, optionally smooth
  const scrollToIndex = (i, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    const slideEl = el.children[i];
    if (!slideEl) return;

    const scrollLeft =
      slideEl.offsetLeft -
      el.offsetLeft -
      (el.clientWidth - slideEl.clientWidth) / 2;

    el.scrollTo({ left: scrollLeft, behavior: smooth ? "smooth" : "auto" });
  };

  // 4) On mount / when slides change, position at the first real slide
  useEffect(() => {
    if (!hasLoop) {
      scrollToIndex(0, false);
      setIndex(0);
      return;
    }
    // Reset to first real
    setIndex(1);
    // Use a frame to ensure DOM is ready
    const id = requestAnimationFrame(() => scrollToIndex(1, false));
    return () => cancelAnimationFrame(id);
  }, [hasLoop, realCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // 5) Auto-advance forward forever
  useEffect(() => {
    if (!hasLoop) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        scrollToIndex(next, true);

        if (next === realCount + 1) {
          // clear any previous pending teleport
          if (teleportTimeoutRef.current) {
            clearTimeout(teleportTimeoutRef.current);
          }
          teleportTimeoutRef.current = setTimeout(() => {
            scrollToIndex(1, false);
            setIndex(1);
            teleportTimeoutRef.current = null;
          }, 350);
        }
        return next;
      });
    }, intervalMs);

    return () => {
      clearInterval(id);
      if (teleportTimeoutRef.current) {
        clearTimeout(teleportTimeoutRef.current);
        teleportTimeoutRef.current = null;
      }
    };
  }, [hasLoop, realCount, intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps

  // 6) If user manually scrolls to clones, fix position seamlessly
  useEffect(() => {
    if (!hasLoop) return;
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Find the closest child to the container's center
        const center = el.scrollLeft + el.clientWidth / 2;
        let nearest = 0;
        let nearestDist = Infinity;

        for (let i = 0; i < el.children.length; i++) {
          const child = el.children[i];
          const childCenter =
            child.offsetLeft - el.offsetLeft + child.clientWidth / 2;
          const d = Math.abs(childCenter - center);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = i;
          }
        }

        // Handle clone boundaries
        if (nearest === 0) {
          // leading clone -> jump to last real
          scrollToIndex(realCount, false);
          setIndex(realCount);
        } else if (nearest === realCount + 1) {
          // trailing clone -> jump to first real
          scrollToIndex(1, false);
          setIndex(1);
        } else {
          setIndex(nearest);
        }
        ticking = false;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasLoop, realCount]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!realCount) return null;

  return (
    <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 scrollbar-hide rounded-b-3xl overflow-hidden relative mx-2"
      >
        {track.map((slide, i) => (
          <div
            key={`${slide?.id ?? `idx-${i}`}-${i}`}
            className="flex-none w-[90vw] sm:w-[80vw] h-[45vh] relative rounded-b-3xl overflow-hidden snap-center shadow-md"
          >
            <motion.div
              layout
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={slide.image}
                alt={slide.heading ?? 'slide image'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute text-white p-6 bottom-6 left-6">
                <h3 className="text-4xl md:text-5xl lg:text-5xl font-medium mb-6 drop-shadow-lg text-white">
                  {slide.heading}
                </h3>
                <p className="text-lg md:text-xl mb-8 drop-shadow-md text-white opacity-90">
                  {slide.description}
                </p>

                <Link to={slide.buttonLink1} className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-sm text-black rounded-lg font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 mr-4">{slide.buttonText1}</Link> 
              </div>
            </motion.div>
          </div>
        ))}
      </div>

  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
};

// GuidesCard Component
const GuidesCard = ({ id, name, description, img_url, created_by, like = {}, onLike, currentUserId }) => {
  const [author, setAuthor] = useState("Unknown");

  // isLiked is calculated every render based on current props
  const isLiked = currentUserId && like[currentUserId] === true;

  // Count total likes (filtering true values only)
  const likesCount = Object.values(like || {}).filter(val => val === true).length;

  // Fetch the guide's author username once
  useEffect(() => {
    const fetchAuthor = async () => {
      if (!created_by) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", created_by)
        .single();
      if (error) console.error(error.message);
      else setAuthor(data?.username || "Unknown");
    };
    fetchAuthor();
  }, [created_by]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Call the parent handler to update state + Supabase
    if (!currentUserId) {
      alert("Please login to like guides");
      return;
    }
    onLike(); 
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    // Wrap entire card in Link for navigation
        <Link to={`/guides/guide/${id}`} className="block">
        <div className="relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1">
            {/* Like button */}
            <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLike();
            }}
            className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                isLiked ? 'bg-red-500 text-white shadow-lg' : 'bg-white/80 hover:bg-white text-gray-700 hover:text-red-500'
            }`}
            title={!currentUserId ? 'Login to like guides' : isLiked ? 'Unlike' : 'Like'}
            >
            {isLiked ? <FaHeart className="w-4 h-4" /> : <FiHeart className="w-4 h-4" />}
            </button>

            <div className="relative w-full h-[250px] sm:h-[300px] md:h-48 flex justify-center items-center bg-white">
            {img_url ? (
                <img src={img_url} alt={name} className="object-cover w-full h-full" />
            ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
                No Image
                </div>
            )}
            </div>

            <div className="p-4">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>By {author}</span>
            </div>
            <h3 className="mb-1 text-base font-medium text-black line-clamp-1">{name}</h3>
            <p className="mb-3 text-sm text-gray-600 line-clamp-2">{description || "No description available."}</p>
            <div className="mt-2 text-xs text-gray-500">{formatCount(likesCount)} likes</div>
            </div>
        </div>
        </Link>

  );
};

const FeedbackCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const feedbackTypes = [
    { id: 'general', label: 'General' },
    { id: 'bug', label: 'Bug Report' },
    { id: 'feature', label: 'Feature Request' },
    { id: 'improvement', label: 'Improvement' }
  ];

  // Get current user on mount
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
      const feedbackData = {
        rating,
        feedback_type: feedbackType,
        feedback_text: feedback,
        user_id: currentUserId // Will be null if not logged in
      };

      const { error: insertError } = await supabase
        .from('feedback')
        .insert([feedbackData]);

      if (insertError) throw insertError;

      setIsSubmitted(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setFeedback('');
        setFeedbackType('general');
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-2 z-50 flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">Feedback</span>
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {!isSubmitted ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Share Your Feedback</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Feedback Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        What's this about?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {feedbackTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFeedbackType(type.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              feedbackType === type.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        How would you rate your experience?
                      </label>
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                                star <= (hoveredRating || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tell us more
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your thoughts, suggestions, or report issues..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* User Status Info */}
                    {!currentUserId && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                        💡 You're submitting as a guest. Sign in to track your feedback!
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!rating || !feedback.trim() || isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Success Message */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
                  >
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600">
                    Your feedback helps us improve Keasy for everyone.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};





// MarketplaceItem with real-time like (kept as you had it)
const MarketplaceItem = ({ item, userId, onToggleLike }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const imageUrl = item?.images?.images?.[0] || "/no-image.png";

  const favouritesList = item.favourites?.favourites || [];
  const likesCount = favouritesList.length;
  const isLiked = userId && favouritesList.includes(userId);

  const handleCardClick = async () => {
    try {
      await supabase.from("marketplace").update({ views: (item.views || 0) + 1 }).eq("id", item.id);
      navigate(`/marketplace/${item.id}`);
    } catch (err) {
      console.error(err);
      navigate(`/marketplace/${item.id}`);
    }
  };

  const conditionStyles = {
    new: { label: "New", color: "bg-black" },
    like_new: { label: "Like New", color: "bg-blue-600" },
    used: { label: "Used", color: "bg-gray-700" },
    refurbished: { label: "Refurbished", color: "bg-green-600" },
    damaged: { label: "Damaged", color: "bg-red-700" },
  };

  return (
    <div 
      onClick={handleCardClick} 
      className="relative cursor-pointer rounded-xl bg-white shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Like button on top-right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!userId) return alert("Please log in to like");
          onToggleLike(item);
        }}
        className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
          isLiked ? 'bg-red-500 text-white shadow-lg' : 'bg-white/80 hover:bg-white text-gray-700 hover:text-red-500'
        }`}
        title={!userId ? 'Login to like' : isLiked ? 'Unlike' : 'Like'}
      >
        {isLiked ? <FaHeart className="w-4 h-4" /> : <FiHeart className="w-4 h-4" />}
      </button>

      <div className="relative w-full h-[220px] sm:h-[250px] md:h-48 flex justify-center items-center bg-white">
        <img 
          src={imageError ? "/no-image.png" : imageUrl} 
          onError={() => setImageError(true)} 
          alt={item.title} 
          className="object-contain max-h-full w-auto"
        />
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${conditionStyles[item.condition]?.color || "bg-gray-700"}`}>
          {conditionStyles[item.condition]?.label || "Unknown"}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>{item.location}</span>
        </div>
        <h3 className="text-base font-medium text-black mb-2 line-clamp-1">{item.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FiEye />
              <span>{item.views || 0}</span>
            </div>
          </div>
          <p className="font-bold">{new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(item.price)}</p>
        </div>
        <Link to={`/marketplace/${item.id}`} onClick={(e) => e.stopPropagation()} className="text-sm font-medium text-black hover:underline">
          View Details
        </Link>
      </div>

    </div>
  );
};



export default function Home() {
  const marketplaceRef = useRef(null);

  const [guides, setGuides] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const guidesRef = useRef(null);
  const [marketplaceItems, setMarketplaceItems] = useState([]);

  const features = [
    { title: 'Marketplace', description: 'Buy, sell, or give away items within the expat community.', icon: <RiShoppingBag2Fill />, href: '/marketplace', linkText: 'Visit Marketplace' },
    { title: 'Events', description: 'Discover local events, meetups, and activities for expats.', icon: <BiParty />, href: '/events', linkText: 'Find Events' },
    { title: 'Community', description: 'Join groups and connect with other expats.', icon: <LuMessageCircleMore />, href: '/community', linkText: 'Join Community' },
    { title: 'Nearby Places', description: 'Find expat-friendly locations and services in your area.', icon: <MdOutlineExplore />, href: '/nearby', linkText: 'Discover Nearby' },
  ];

  const slides = [
    { id: 1, image: '/hero-seoul-sunset.jpg', heading: 'Welcome to Keasy', description: 'Making life in South Korea easier for foreigners', buttonText1: 'Explore Marketplace', buttonLink1: '/marketplace', buttonText2: 'Find Events', buttonLink2: '/events' },
    { id: 2, image: '/hero-korean-market.jpg', heading: 'Discover Local Stores', description: 'Find the best deals nearby', buttonText1: 'Shop Now', buttonLink1: '/marketplace', buttonText2: 'View Guides', buttonLink2: '/guides' },
    { id: 3, image: '/hero-jeju-coast.jpg', heading: 'Connect with Community', description: 'Meet and share with other expats', buttonText1: 'Join Groups', buttonLink1: '/community', buttonText2: 'Attend Events', buttonLink2: '/events' },
    { id: 4, image: '/hero-gyeongbokgung.jpg', heading: 'Learn & Grow', description: 'Access guides, tips, and resources', buttonText1: 'Read Guides', buttonLink1: '/guides', buttonText2: 'Watch Tutorials', buttonLink2: '/guides' },
    { id: 5, image: '/delivery.jpg', heading: 'Foreign Order', description: 'Learn how to get PCC code', buttonText1: 'Read Guides', buttonLink1: '/guides/guide/50', buttonText2: 'Watch Tutorials', buttonLink2: '/guides/guide/1' },
  ];

  useEffect(() => {
    const fetchMarketplaceItems = async () => {
      const { data, error } = await supabase.from('marketplace').select('*').limit(20);
      if (error) console.error(error);
      else setMarketplaceItems(data || []);
    };
    fetchMarketplaceItems();
  }, []);

   // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  // Fetch guides
    useEffect(() => {
        const fetchGuides = async () => {
        const { data, error } = await supabase
            .from('guide')
            .select('id, created_at, name, description, img_url, created_by, like')
            .limit(8);
        if (error) console.error(error.message);
        else setGuides(data || []);
        };
        fetchGuides();
    }, []);

const handleToggleLike = async (item) => {
    if (!currentUserId) {
      alert("Please log in to like items.");
      return;
    }

    let favourites = item.favourites?.favourites || [];
    if (!Array.isArray(favourites)) favourites = [];

    const updatedFavourites = favourites.includes(currentUserId)
      ? favourites.filter((id) => id !== currentUserId)
      : [...favourites, currentUserId];

    try {
      await supabase.from("marketplace").update({ favourites: { favourites: updatedFavourites } }).eq("id", item.id);
      setMarketplaceItems(prev =>
        prev.map(it =>
          it.id === item.id ? { ...it, favourites: { favourites: updatedFavourites } } : it
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

// Handler for liking a guide
  const handleGuideLike = async (guideId) => {
    if (!currentUserId) {
      alert("Please login to like guides");
      return;
    }

    // Optimistic update: update local state immediately
    setGuides(prevGuides =>
      prevGuides.map(guide => {
        if (guide.id !== guideId) return guide;

        const currentLikes = guide.like || {};
        const isCurrentlyLiked = currentLikes[currentUserId] === true;

        const newLikes = isCurrentlyLiked
          ? { ...currentLikes, [currentUserId]: false } // mark false instead of delete
          : { ...currentLikes, [currentUserId]: true };

        // Fire-and-forget Supabase update
        supabase.from('guide').update({ like: newLikes }).eq('id', guideId)
          .then(({ error }) => { if (error) console.error(error.message); });

        return { ...guide, like: newLikes }; // update state immediately
      })
    );
  };

  // Enable mouse wheel scroll for both carousels
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
    const cleanupMarket = addScroll(marketplaceRef);
    const cleanupGuides = addScroll(guidesRef);
    return () => {
      cleanupMarket?.();
      cleanupGuides?.();
    };
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

  return (
    <div>
      {/* Hero Carousel */}
      <CoolCarousel slides={slides} className='mx-2'/>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="mb-4 text-center text-2xl sm:text-3xl font-bold "
          >
            What We Provide
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className=" mb-8 text-center text-xl text-black"
          >
            Feel at home, meet friends, & grow with real support!!!
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Keasy Section — only visible if user is not signed in */}
{!currentUserId && (
  <section className="py-20 bg-gradient-to-b from-gray-50 to-white text-center">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="container mx-auto px-6"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
        Join Keasy Today
      </h2>
      <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
        Become part of Korea’s most supportive expat community — connect, share, and explore together.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/signup"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:bg-blue-950 transition-all duration-300"
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black border border-gray-300 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          Sign In
        </Link>
      </div>
    </motion.div>
  </section>
)}


       {/* Guides Carousel */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-2xl md:text-3xl font-bold text-black">
            Explore Guides
          </h2>

          <div
            ref={guidesRef}
            className="flex flex-nowrap gap-4 pb-4 snap-x snap-mandatory overflow-x-auto scrollbar-hide"
          >
            {guides.map((guide) => (
              <div key={guide.id} className="flex-none w-[300px] sm:w-[280px] md:w-[260px] snap-start">
                <GuidesCard
                  {...guide}
                  currentUserId={currentUserId}
                  onLike={() => handleGuideLike(guide.id)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              to="/guides"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              View More Guides
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-2xl md:text-3xl font-bold text-black">Explore Marketplace</h2>

          <div
            ref={marketplaceRef}
            className="flex gap-4 pb-4 snap-x snap-mandatory overflow-x-auto scrollbar-hide cursor-grab touch-pan-x"
            onMouseDown={(e) => {
              const slider = marketplaceRef.current;
              slider.isDown = true;
              slider.startX = e.pageX - slider.offsetLeft;
              slider.scrollLeftStart = slider.scrollLeft;
              slider.classList.add("cursor-grabbing");
            }}
            onMouseLeave={() => {
              const slider = marketplaceRef.current;
              slider.isDown = false;
              slider.classList.remove("cursor-grabbing");
            }}
            onMouseUp={() => {
              const slider = marketplaceRef.current;
              slider.isDown = false;
              slider.classList.remove("cursor-grabbing");
            }}
            onMouseMove={(e) => {
              const slider = marketplaceRef.current;
              if (!slider.isDown) return;
              e.preventDefault();
              const x = e.pageX - slider.startX;
              slider.scrollLeft = slider.scrollLeftStart - x * 1.5;
            }}
          >
            {marketplaceItems.map((item) => (
              <div key={item.id} className="flex-none w-[300px] sm:w-[280px] md:w-[260px] snap-start">
                <MarketplaceItem item={item} userId={currentUserId} onToggleLike={handleToggleLike} />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="relative bg-primary/90 py-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
              Ready to Make Korea Feel Like Home?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto text-black">
              Join thousands of expats who've made their Korean adventure easier with Keasy
            </p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Join Our Community →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      
      <FeedbackCard />
    </div>
  );
}

