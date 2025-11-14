import React, { useEffect, useState, useRef } from 'react';
import { supabase } from "../../../api/supabase-client";
import { Link } from 'react-router';
import { IoEyeOutline } from "react-icons/io5";
import { IoIosHeart } from "react-icons/io";
import { IoIosHeartEmpty } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

import { LockKeyholeOpen,LockKeyhole  } from "lucide-react";

const getPlaceholderImage = (id) =>
  `https://picsum.photos/400/300?random=${id || Math.floor(Math.random() * 1000)}`;

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All'); // Changed to 'All' string
  const [user, setUser] = useState(null);
  const [lockActive, setLockActive] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data: TagsData, error: TagsError } = await supabase
        .from('guide_category')
        .select('*');

      if (TagsError) {
        console.error('Error fetching categories:', TagsError.message);
        setLoading(false);
      } else {
        // Create 'All' option with consistent structure
        const allOption = { id: 'All', name: 'All' };
        const categoriesWithAll = [allOption, ...TagsData];
        setCategories(categoriesWithAll);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch guides with likes and views
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      
      let query = supabase
        .from('guide')
        .select(`
          id, 
          created_at, 
          name, 
          description, 
          img_url, 
          created_by, 
          category,
          view,
          like
        `)
        .eq('approved', true);

      // Filter by category if not 'All'
      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching guides:', error.message);
        setLoading(false);
      } else {
        // if(user === null){
        //   setGuides(data.slice(0,10))
        //   setLoading(false);
        // }else{
        // setGuides(data || []);
        // setLoading(false);
        // }
        setGuides(data || []);
        setLoading(false);
      }
    };
    fetchGuides();
  }, [activeCategory, user]);

  const handleLike = async (guideId) => {
    if (!user) {
      alert('Please login to like guides');
      return;
    }

    const guide = guides.find(g => g.id === guideId);
    const currentLikes = guide.like || {};
    const userId = user.id;
    const isCurrentlyLiked = currentLikes[userId] === true;
    
    try {
      let newLikes;
      if (isCurrentlyLiked) {
        // Remove user's like
        newLikes = { ...currentLikes };
        delete newLikes[userId];
      } else {
        // Add user's like
        newLikes = { ...currentLikes, [userId]: true };
      }

      // Update in database
      const { error } = await supabase
        .from('guide')
        .update({ like: newLikes })
        .eq('id', guideId);

      if (error) {
        console.error('Error updating like:', error);
        return;
      }

      // Update local state
      setGuides(prev => prev.map(guide => 
        guide.id === guideId 
          ? { ...guide, like: newLikes }
          : guide
      ));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleViewGuide = async (guideId) => {
    try {
      const guide = guides.find(g => g.id === guideId);
      const currentViews = parseInt(guide.view || 0);
      const newViews = currentViews + 1;

      const { error } = await supabase
        .from('guide')
        .update({ view: newViews })
        .eq('id', guideId);

      if (error) {
        console.error('Error updating views:', error);
        return;
      }

      setGuides(prev => prev.map(guide => 
        guide.id === guideId 
          ? { ...guide, view: newViews }
          : guide
      ));
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  // Fixed filtering logic
  const filteredGuides =
    activeCategory === 'All'
      ? guides
      : guides.filter((guide) => guide.category === activeCategory);

  return (
    <div className="">
      <section className="pb-16 pt-6">
        <div className="">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 ml-4">Guides</h1>
                <p className="text-gray-600 ml-4">Discover and explore helpful guides from our community</p>
              </div>
              
               {/* Create Guide Button - Desktop Only */}
              <Link
                to={user ? "/guides/new" : "/signin"}
                className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                Create Guide
              </Link>
            </div>
          </div>

          {/* Floating Action Button - Mobile Only */}
          <Link
            to={user ? "/guides/new" : "/signin"}
            className="sm:hidden fixed bottom-18 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
      >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 4v16m8-8H4" 
              />
            </svg>
          </Link>

          <ExploreSection
            title="Explore Guides"
            setActiveCategory={setActiveCategory}
            activeCategory={activeCategory}
            loading={loading}
            categories={categories}
          >
            {filteredGuides.map((guide) => (
              <ExploreCard
                key={guide.id} 
                {...guide} 
                onLike={() => handleLike(guide.id)}
                onView={() => handleViewGuide(guide.id)}
                user={user}
              />
            ))}
          </ExploreSection>

          {/* {user === null && (<>
            <section className="py-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="container mx-auto px-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  Join 
                  <span className='text-blue-600'> keasy </span>
                   for
                   <span className='text-emerald-500'> Full Access!</span>
                </h2>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                  Become part of Korea’s most supportive expats
                  <br/>
                  from Community for Community.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full items-center">
                 <Link
                  to="signin"
                  onClick={(e) => {
                    e.preventDefault();
                    setLockActive(true);
                    setTimeout(() => {
                      window.location.href = '/signin';
                    }, 500);
                  }}
                  className={`
                    inline-flex items-center justify-center gap-2 px-8 py-4 
                    bg-white text-black border border-gray-300 rounded-xl font-semibold 
                    shadow-lg transition-all duration-500
                    ${lockActive ? "scale-125 rotate-12 shadow-2xl" : "hover:scale-105 hover:shadow-2xl"}
                  `}
                >
                  <motion.span
                    className="relative"
                    initial={false}
                    animate={{
                      rotate: lockActive ? [0, -10, 10, -10, 0] : 0,
                      scale: lockActive ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    <span
                      className={`
                        transition-all duration-300 flex gap-2
                        ${lockActive ? "opacity-0 scale-0 absolute" : "opacity-100 scale-100"}
                      `}
                    >
                      <LockKeyhole />
                      Unlock
                    </span>

                    <span
                      className={`
                        transition-all duration-300 flex gap-2
                        ${lockActive ? "opacity-100 scale-100" : "opacity-0 scale-0 absolute"}
                      `}
                    >
                      <LockKeyholeOpen />
                    </span>
                  </motion.span>
                </Link>
                </div>
              </motion.div>
            </section>
          </>)} */}
        </div>
      </section>
    </div>
  );
};

const ExploreSection = ({
  title,
  children,
  className = "",
  setActiveCategory,
  activeCategory,
  categories,
}) => {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className={className}>
      {/* Categories filter buttons - Horizontal scrollable */}
      <div className="mb-8 relative">
        {/* Scroll buttons for desktop */}
        <button
          onClick={scrollLeft}
          className="hidden md:flex absolute left-[-40px] top-1/3  -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <span className="text-gray-600">‹</span>
        </button>
        <button
          onClick={scrollRight}
          className="hidden md:flex absolute right-[-20px] top-1/3 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <span className="text-gray-600">›</span>
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-scroll scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <button
              key={category.id || category.name}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid - Different layouts for mobile and desktop */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
        {children}
      </div>
    </div>
  );
};

/* ExploreCard Component with Separate Mobile and Desktop Layouts */
const ExploreCard = ({ 
  id, 
  name, 
  description, 
  img_url, 
  created_by, 
  category, 
  view = 0,
  like = {},
  onLike,
  onView,
  user
}) => {
  const [author, setAuthor] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  // Check if current user has liked this guide
  const isLiked = user && like && like[user.id] === true;
  
  // Count total likes
  const likesCount = like ? Object.keys(like).filter(key => like[key] === true).length : 0;
  
  // Convert view to number
  const viewsCount = parseInt(view) || 0;

  // Fetch author
  useEffect(() => {
    const fetchAuthor = async () => {
      if (!created_by) return;
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', created_by);

      if (userError) {
        console.error('Error fetching author:', userError.message);
      } else if (userData && userData.length > 0) {
        setAuthor(userData[0].username);
      } else {
        setAuthor('Unknown Author');
      }
    };

    fetchAuthor();
  }, [created_by]);

  const handleImageError = (e) => {
    console.error('Image failed to load:', img_url);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking) return;
    
    if (!user) {
      alert('Please login to like guides');
      return;
    }
    
    setIsLiking(true);
    await onLike();
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleCardClick = () => {
    console.log('View clicked for guide:', id);
    onView();
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <div className="w-full">
      <Link
        to={`guide/${id}`}
        onClick={handleCardClick}
        className="block h-full"
      >
        {/* MOBILE VIEW - Horizontal Layout */}
        <div className="my-2 mx-2 sm:hidden h-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl group cursor-pointer flex">
          {/* Mobile Image - Left side */}
          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-200">
            {img_url ? (
              <img
                src={img_url}
                alt={name || 'Guide image'}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <div className="text-gray-400 text-xs">No image</div>
              </div>
            )}
          </div>

          {/* Mobile Content - Right side */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            {/* Title + Description */}
            <div>
              <h3 className="text-sm font-semibold text-black line-clamp-2 mb-1">
                {name || 'Untitled Guide'}
              </h3>

              {description && (
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {description}
                </p>
              )}
            </div>

            {/* Author + Stats + Actions */}
            <div className="mt-1 flex flex-col gap-1">
              {/* Author + stats */}
              <div className="flex items-center justify-between text-xs text-blue-400">
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">by {author || 'Loading...'}</span>

                  <div className="flex items-center gap-1 text-gray-500">
                    <IoEyeOutline className="w-3 h-3" />
                    <span>{formatCount(viewsCount)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <IoIosHeart className="w-3 h-3" />
                    <span>{formatCount(likesCount)}</span>
                  </div>

                  <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`relative z-10 p-1 rounded-full transition-all duration-300 ${
                    isLiked
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-red-500'
                  } ${isLiking ? 'scale-110' : ''} ${!user ? 'opacity-75' : 'hover:scale-110'}`}
                  title={!user ? 'Login to like guides' : (isLiked ? 'Unlike' : 'Like')}
                >
                  {isLiked ? (
                    <IoIosHeart className="w-4 h-4" />
                  ) : (
                    <IoIosHeartEmpty className="w-4 h-4" />
                  )}
                </button>
                </div>
              </div>

              {/* Read + Like button row */}
              <div className="flex items-center justify-between mt-1">
                {/* <div className="inline-block rounded-md bg-black px-2 py-1 text-xs font-medium text-white group-hover:bg-gray-800 transition-colors">
                  Read &rarr;
                </div> */}

                
              </div>
            </div>
          </div>
        </div>



        {/* DESKTOP VIEW - Vertical Layout */}
        <div className="hidden sm:flex h-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group cursor-pointer flex-col">
          {/* Desktop Image - Top */}
          <div className="relative w-full h-48 overflow-hidden bg-gray-200">
            {img_url ? (
              <img
                src={img_url}
                alt={name || 'Guide image'}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <div className="text-gray-400 text-sm">No image</div>
              </div>
            )}
            
            {/* Desktop overlay with stats */}
            <div className="absolute inset-0 transition-all duration-300">
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`relative z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                    isLiked 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-white/80 hover:bg-white text-gray-700 hover:text-red-500'
                  } ${isLiking ? 'scale-110' : ''} ${!user ? 'opacity-75' : 'hover:scale-110'}`}
                  title={!user ? 'Login to like guides' : (isLiked ? 'Unlike' : 'Like')}
                >
                  {isLiked ? (
                    <IoIosHeart className="w-4 h-4" />
                  ) : (
                    <IoIosHeartEmpty className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                    <IoEyeOutline className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatCount(viewsCount)}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                    <IoIosHeart className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatCount(likesCount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content - Bottom */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-black line-clamp-2 mb-2">
                {name || 'Untitled Guide'}
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-3">
                {description || 'No description available.'}
              </p>
            </div>
            
            <div className="mt-2">
              <div className="text-sm text-gray-500 truncate mb-2">
                by {author || 'Loading...'}
              </div>
              
              <div className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white group-hover:bg-gray-800 transition-colors">
                Read full guide &rarr;
              </div>
            </div>
          </div>
        </div>
      </Link>

      

            </div>
  );
};

export default Guides;