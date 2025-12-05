import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from "../../api/supabase-client";

import { FiChevronLeft, FiChevronRight, FiUser } from 'react-icons/fi';
import { FiHeart, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

import { FaRegUser } from "react-icons/fa";

import { LuMessageCircleMore } from "react-icons/lu";
import { RiShoppingBag2Fill } from "react-icons/ri";
import { BiParty } from "react-icons/bi";
import { MdOutlineExplore } from "react-icons/md";

import { X, MessageCircle, Star, Send, Sparkles } from 'lucide-react';

import { motion, AnimatePresence } from "framer-motion";


/* Utility function for placeholder images */
const getPlaceholderImage = (id) =>
  `https://picsum.photos/400/300?random=${id}`;


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


// CoolCarousel Component
const Carousel = ({ slides = [], intervalMs = 4000 }) => {
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
    { id: 'general', label: 'General' },
    { id: 'bug', label: 'Bug Report' },
    { id: 'feature', label: 'Feature Request' },
    { id: 'improvement', label: 'Improvement' }
  ];

  // Simulated user fetch - replace with your actual Supabase call
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
        user_id: currentUserId
      };

      const { error: insertError } = await supabase
        .from('feedback')
        .insert([feedbackData]);

      if (insertError) throw insertError;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setFeedback('');
        setFeedbackType('general');
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

  return (
    <section className="py-20 bg-none">
      {/*  bg-gradient-to-b from-gray-50 to-gray-100 */}
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Share Your Feedback
          </h2>
          <p className="text-lg text-gray-600">
            Your feedback helps us improve Keasy for everyone
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  How would you rate your experience?
                </label>
                <div className="flex gap-3 justify-center">
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
                        className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
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
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* User Status Info */}
              {!currentUserId && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  💡 You're submitting as a guest. Sign in to track your feedback!
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!rating || !feedback.trim() || isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-lg"
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
            </form>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
              >
                <svg
                  className="w-10 h-10 text-green-600"
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
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Thank You!
              </h3>
              <p className="text-lg text-gray-600">
                Your feedback helps us improve Keasy for everyone.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};




// MarketplaceItem with real-time like (kept as you had it)
const MarketplaceItem = ({ item, userId, onToggleLike }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const imageUrl = item?.images?.images?.[0] || "/no-image.png";

  const favouritesList = item.favourites?.favourites || [];
  const likesCount = favouritesList.length;
  // const isLiked = userId && favouritesList.includes(userId);

  // user likes logic

  // user favs state
  const [user_id, setUser_id] = useState(null)
  const [user_favourites, setUserFavourites] = useState([])
  const isLiked = user_id && user_favourites.includes(item.id)

  // load favourites from db
  useEffect(() => {
    const fetchUser = async() => {
      const {data} = await supabase.auth.getUser()
      const uid = data?.user?.id || null;
      setUser_id(uid)

      if(uid){
        const { data:favsData, error:favsError } = await supabase
        .from('profiles')
        .select('favourites_marketplace')
        .eq('user_id', uid)
        .single()

        // Ensure favourites_marketplace is always an array
        const favourites = favsData?.favourites_marketplace;
        setUserFavourites(Array.isArray(favourites) ? favourites : []);
      } else{
        // if no user islogged in, set to empty array
        setUserFavourites([]);
      }
    }
    fetchUser()
  }, [])

  const handleToggleLike = async (item) => {
    if(!user_id) {
      alert('Please sign in to like items!')
      return;
    }

    try{
      const isLiked = user_favourites.includes(item.id);
      const updatedFavourites = isLiked 
        ? user_favourites.filter((id) => id !== item.id)
      : [...user_favourites, item.id];

      setUserFavourites(updatedFavourites); // local update

      const {error} = await supabase
      .from('profiles')
      .update({favourites_marketplace: updatedFavourites})
      .eq('user_id', user_id)

      if(error) throw error;
    }
    catch(err){console.error('Error updating favourites: ', err)}
  }


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
          handleToggleLike(item);
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

const companyInfo = `
Introduction:
Hey there! I'm your friendly Keasy chatbot — your digital companion for navigating life in South Korea 🇰🇷. Whether you're an 
international student, expat, or newcomer, I'm here to guide you through your new life, help you find communities, and make your experience smoother, easier, and more connected.

Details:
Keasy is a modern community platform designed to support international people living in South Korea. We bring together everything you need to 
live, connect, and thrive abroad — all in one place. From local guides and events to a marketplace for buying and selling goods, Keasy makes settling in feel like home.

Our platform offers:
- AI-powered assistance for real-time guidance and translation.
- Marketplace to buy and sell new or used items safely.
- Events & Activities listings to help you explore your city.
- Community groups and chats where you can connect with others.
- Blog and resources for legal advice, cultural tips, and local insights.

Keasy's goal is simple: make life easier for foreigners in South Korea through community, technology, and meaningful support.

Based in Daejeon, South Korea, Keasy was founded by a group of international students who experienced the challenges of living abroad firsthand — and decided to build a solution.

Stay connected with us:
- Website: https://www.koreaeasy.org
- Instagram: https://www.instagram.com/keasy_community

For partnerships, inquiries, or feedback, reach out to us at keasy.contact@gmail.com

At Keasy, we believe in more than just technology — we believe in community. Together, we make Korea feel like home 💙
`;

const ChatbotIcon = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
    <Sparkles className="w-5 h-5 text-white" />
  </div>
);

const ChatMessage = ({ chat }) => {
  const renderFormattedText = (text) => {
    // Split text into lines
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Skip empty lines but preserve spacing
      if (line.trim() === '') {
        return <br key={lineIndex} />;
      }

      // Handle bullet points (•, -, *, numbered lists)
      const bulletMatch = line.match(/^(\s*)([-•*]|\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        const [, indent, bullet, content] = bulletMatch;
        return (
          <div key={lineIndex} className="flex gap-2 my-1" style={{ marginLeft: `${indent.length * 8}px` }}>
            <span className="flex-shrink-0 font-medium">{bullet}</span>
            <span>{formatInlineText(content)}</span>
          </div>
        );
      }

      // Handle headers (lines that end with :)
      if (line.match(/^[^:]+:$/)) {
        return (
          <div key={lineIndex} className="font-semibold mt-2 mb-1">
            {formatInlineText(line)}
          </div>
        );
      }

      // Regular paragraph
      return (
        <div key={lineIndex} className="my-1">
          {formatInlineText(line)}
        </div>
      );
    });
  };

 // Format inline text (bold, italic, links, inline code only)
  const formatInlineText = (text) => {
    // Split by inline code, bold, italic, and URLs (NO multiline code blocks here)
    const parts = text.split(/(`[^`\n]+`|\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|\*[^*\n]+\*|https?:\/\/[^\s]+)/g);
    
    return parts.map((part, index) => {
      if (!part) return null;

      // Inline code (`code`) - single line only
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={index} className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold + Italic (***text***)
      if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
        return (
          <strong key={index} className="font-bold italic">
            {part.slice(3, -3)}
          </strong>
        );
      }

      // Bold (**text**)
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic (*text*)
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={index} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }

      // URLs
      if (part.match(/^https?:\/\/[^\s]+$/)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {part}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  if (chat.hideInChat) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${chat.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {chat.role === 'model' && <ChatbotIcon />}
      
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        chat.role === 'user' 
          ? 'bg-blue-600 text-white rounded-br-sm' 
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}>
        <div className="text-sm leading-relaxed">
          {chat.role === 'model' ? renderFormattedText(chat.text) : chat.text}
        </div>
      </div>

      {chat.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          <FiUser/>
        </div>
      )}
    </motion.div>
  );
};

const ChatForm = ({ onSubmit, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const userMessage = message.trim();
    if (!userMessage || isLoading) return;
    
    onSubmit(userMessage);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex gap-2 items-center w-full">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2.5 bg-none border-none rounded-full outline-none text-gray-800 placeholder-gray-500 text-base md:text-sm"
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading}
        className="flex-shrink-0  w-10 h-10 my-1 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

const AIChatbot = ({currentUserId}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: 'model',
      text: companyInfo
    }
  ]);
  const chatBodyRef = useRef();
  const navigate = useNavigate();

  // Generate AI response using Gemini API
  const generateBotResponse = async (history) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Gemini API key is missing");
      }

      // Format history for Gemini API
      const formattedHistory = history.map(({ role, text }) => ({
        role: role === 'user' ? 'user' : 'model',
        parts: [{ text }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: formattedHistory,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                         "I apologize, but I couldn't generate a response. Please try again.";

      setChatHistory(prev => [
        ...prev.filter(msg => msg.text !== 'Thinking...'),
        { role: 'model', text: botResponse }
      ]);
    } catch (error) {
      console.error('Error generating bot response:', error);
      setChatHistory(prev => [
        ...prev.filter(msg => msg.text !== 'Thinking...'),
        { role: 'model', text: "I apologize, but I'm having trouble responding right now. Please check your internet connection and try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (userMessage) => {
    const newMessage = { role: 'user', text: userMessage };
    setChatHistory(prev => [...prev, newMessage]);
    
    setIsLoading(true);
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Thinking...' }]);
      
      generateBotResponse([
        ...chatHistory,
        newMessage,
        { role: 'user', text: `Using the details provided above if needed, please address this query: ${userMessage}` }
      ]);
    }, 600);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory]);

  const handlePopUp = () => {
    if(currentUserId){
      if(isOpen == true) {
        setIsOpen(false)
        setChatHistory([])
      }
      else setIsOpen(true);
    }
    else {
      alert("Please sign in to use the AI Chatbot.");
      navigate('/signin')
    };
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePopUp}
        className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
      >
        <Sparkles className="w-5 h-5 text-white" />
        <span className="hidden sm:inline font-medium">keasy AI</span>
      </motion.button>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Chat Container */}
            <motion.div
              initial={{ 
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              animate={{ 
                opacity: 0.95,
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              className="fixed z-50 bg-white rounded-3xl shadow-2xl overflow-hidden
                md:bottom-24 md:right-6 md:w-[400px] md:h-[600px]
                inset-4 md:inset-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChatbotIcon />
                  <div>
                    <h3 className="font-semibold text-lg text-white">keasy AI</h3>
                    <p className="text-xs text-blue-100">Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={handlePopUp}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Body */}
              <div
                ref={chatBodyRef}
                className="flex-1 overflow-y-auto p-4 bg-white"
                style={{ height: 'calc(100% - 130px)' }}
              >
                {/* Welcome Message */}
                <div className="flex gap-3 mb-4">
                  <ChatbotIcon />
                  <div className="max-w-[80%] bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3">
                    <p className="text-sm leading-relaxed">
                      Hey there 👋<br/>
                      How can I help you today?
                    </p>
                  </div>
                </div>

                {/* Chat History */}
                {chatHistory.map((chat, index) => (
                  <ChatMessage key={index} chat={chat} />
                ))}
              </div>

              {/* Chat Footer */}
              <div className="py-3 pt-1 px-1 bg-white border-t border-gray-200">
                <ChatForm onSubmit={handleSendMessage} isLoading={isLoading} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
      const { data, error } = await supabase.from('marketplace').select('*').eq("verified", true).eq('available', true).limit(20);
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
      <Carousel slides={slides} className='mx-2'/>

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

      <FeedbackSection />

      
      <AIChatbot currentUserId={currentUserId}/>
    </div>
  );
}

