/**
 * @file Guides.jsx
 * @description Master-Detail (List-Detail) interface for browsing and viewing guides.
 * 
 * This component provides a responsive two-pane layout on desktop/tablet where users
 * can browse a scrollable list of guide cards on the left and view detailed content
 * on the right. On mobile, it switches to a full-screen detail view pattern.
 * 
 * Key Features:
 * - Two-pane split layout (30-35% list / 65-70% detail) on desktop
 * - Category filter pills for filtering guides
 * - Search functionality for filtering by title/description
 * - Sign-in gating: Non-authenticated users see 30% of content with CTA
 * - Smooth transitions and animations using Framer Motion
 * - Fully responsive with mobile-first approach
 * 
 * @requires react
 * @requires react-router
 * @requires framer-motion
 * @requires react-icons
 * @requires lucide-react
 * @requires supabase-client
 * 
 * @author Sagar Pandey
 * @version 2.0.0
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { supabase } from "../../../api/supabase-client";
// NOTE: This import path assumes the file is at: src/pages/features/guides/Guides.jsx
// and supabase-client.js is at: src/api/supabase-client.js
import { Link } from 'react-router';
import { IoEyeOutline, IoSearchOutline, IoCloseCircle, IoArrowBack } from "react-icons/io5";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { BiLogoPlayStore } from "react-icons/bi";
import { FaAppStoreIos, FaInstagram } from "react-icons/fa6";
import { MdOutlinePlace, MdOutlineTipsAndUpdates } from "react-icons/md";
import { BsFileEarmarkPdf } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { LockKeyholeOpen, LockKeyhole, BookOpen, Share2, Bookmark, ChevronRight } from "lucide-react";

/* ============================================================================
   UTILITY FUNCTIONS
   ============================================================================ */

/**
 * Generates a placeholder image URL using Picsum Photos service.
 * Used as a fallback when a guide doesn't have an image.
 * 
 * @param {string|number} id - Unique identifier to generate consistent random image
 * @returns {string} URL to a placeholder image
 * 
 * @example
 * const imageUrl = getPlaceholderImage(123);
 * // Returns: "https://picsum.photos/400/300?random=123"
 */
const getPlaceholderImage = (id) =>
  `https://picsum.photos/400/300?random=${id || Math.floor(Math.random() * 1000)}`;

/**
 * Formats large numbers into human-readable format with K/M suffixes.
 * 
 * @param {number} count - The number to format
 * @returns {string} Formatted string (e.g., "1.2K", "3.5M")
 * 
 * @example
 * formatCount(1500);    // Returns: "1.5K"
 * formatCount(2500000); // Returns: "2.5M"
 * formatCount(500);     // Returns: "500"
 */
const formatCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

/**
 * Truncates text to a specified percentage of its total length.
 * Used for showing partial content to non-authenticated users.
 * 
 * @param {string} text - The full text to truncate
 * @param {number} percentage - Percentage of text to show (0-100)
 * @returns {string} Truncated text ending with ellipsis if truncated
 * 
 * @example
 * truncateToPercentage("Hello World", 50); // Returns: "Hello..."
 */
const truncateToPercentage = (text, percentage) => {
  if (!text) return '';
  const cutoffIndex = Math.floor(text.length * (percentage / 100));
  if (cutoffIndex >= text.length) return text;
  // Find the last space before cutoff to avoid cutting words
  const lastSpace = text.lastIndexOf(' ', cutoffIndex);
  const finalIndex = lastSpace > 0 ? lastSpace : cutoffIndex;
  return text.substring(0, finalIndex) + '...';
};

/* ============================================================================
   ANIMATION VARIANTS
   These define the animation configurations for Framer Motion components
   ============================================================================ */

/**
 * Animation variants for the detail panel content.
 * Creates a smooth fade and slide effect when content changes.
 */
const detailPanelVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

/**
 * Animation variants for list items.
 * Creates a staggered fade-in effect for the guide cards.
 */
const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

/**
 * Animation variants for the mobile detail view overlay.
 * Creates a slide-up effect when opening detail view on mobile.
 */
const mobileDetailVariants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    y: "100%",
    transition: { duration: 0.2 }
  }
};

/* ============================================================================
   MAIN COMPONENT: Guides
   ============================================================================ */

/**
 * Guides Component - Master-Detail Interface for Guide Browsing
 * 
 * This is the main container component that orchestrates:
 * - Fetching guides and categories from Supabase
 * - Managing user authentication state
 * - Handling filtering, search, and selection
 * - Coordinating like/view interactions
 * 
 * @component
 * @returns {JSX.Element} The complete Guides interface
 */
const Guides = () => {
  // Debug log to confirm component is rendering
  console.log('Guides component rendering...');
  
  /* --------------------------------------------------------------------------
     STATE MANAGEMENT
     -------------------------------------------------------------------------- */
  
  // Data states - stores fetched data from Supabase
  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // UI states - controls loading, filtering, and selection
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  
  // Auth states - tracks user authentication
  const [user, setUser] = useState(null);
  
  // Animation states
  const [lockActive, setLockActive] = useState(false);
  
  // Error state for debugging
  const [error, setError] = useState(null);

  /* --------------------------------------------------------------------------
     DATA FETCHING EFFECTS
     -------------------------------------------------------------------------- */

  /**
   * Fetches the current authenticated user on component mount.
   * This determines what content the user can access.
   */
  useEffect(() => {
    console.log('Fetching user...');
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('User fetched:', user ? 'logged in' : 'not logged in');
        setUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.message);
      }
    };
    getUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Fetches guide categories from Supabase.
   * Adds an "All" option at the beginning for showing all guides.
   */
  useEffect(() => {
    console.log('Fetching categories...');
    const fetchCategories = async () => {
      try {
        const { data: TagsData, error: TagsError } = await supabase
          .from('guide_category')
          .select('*');

        if (TagsError) {
          console.error('Error fetching categories:', TagsError.message);
          setError(TagsError.message);
          setLoading(false);
        } else {
          console.log('Categories fetched:', TagsData?.length || 0);
          // Prepend 'All' option for showing all guides
          const allOption = { id: 'All', name: 'All' };
          const categoriesWithAll = [allOption, ...(TagsData || [])];
          setCategories(categoriesWithAll);
          setLoading(false);
        }
      } catch (err) {
        console.error('Categories fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  /**
   * Fetches guides from Supabase based on active category filter.
   * Only fetches approved guides to ensure quality content.
   */
  useEffect(() => {
    console.log('Fetching guides for category:', activeCategory);
    const fetchGuides = async () => {
      setLoading(true);
      
      try {
        // Build query for approved guides with all necessary fields including content JSONB
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
            like,
            content
          `)
          .eq('approved', true);

        // Apply category filter if not showing all
        if (activeCategory !== 'All') {
          query = query.eq('category', activeCategory);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching guides:', fetchError.message);
          setError(fetchError.message);
          setLoading(false);
        } else {
          console.log('Guides fetched:', data?.length || 0);
          setGuides(data || []);
          // Auto-select first guide on desktop if none selected
          if (data && data.length > 0 && !selectedGuide) {
            setSelectedGuide(data[0]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Guides fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchGuides();
  }, [activeCategory, user]);

  /* --------------------------------------------------------------------------
     MEMOIZED VALUES
     These are computed values that only recalculate when dependencies change
     -------------------------------------------------------------------------- */

  /**
   * Filters guides based on active category and search query.
   * Uses memoization to prevent unnecessary recalculations.
   */
  const filteredGuides = useMemo(() => {
    let result = guides;
    
    // Apply category filter
    if (activeCategory !== 'All') {
      result = result.filter((guide) => guide.category === activeCategory);
    }
    
    // Apply search filter (case-insensitive search on name and description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((guide) => 
        guide.name?.toLowerCase().includes(query) ||
        guide.description?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [guides, activeCategory, searchQuery]);

  /**
   * Gets the category name for a given category ID.
   * Used to display category badges on cards.
   */
  const getCategoryName = useCallback((categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  }, [categories]);

  /* --------------------------------------------------------------------------
     EVENT HANDLERS
     -------------------------------------------------------------------------- */

  /**
   * Handles liking/unliking a guide.
   * Requires user authentication. Updates both database and local state.
   * 
   * @param {string} guideId - The ID of the guide to like/unlike
   */
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

      // Update in Supabase database
      const { error } = await supabase
        .from('guide')
        .update({ like: newLikes })
        .eq('id', guideId);

      if (error) {
        console.error('Error updating like:', error);
        return;
      }

      // Update local state for immediate UI feedback
      setGuides(prev => prev.map(guide => 
        guide.id === guideId 
          ? { ...guide, like: newLikes }
          : guide
      ));
      
      // Update selected guide if it's the one being liked
      if (selectedGuide?.id === guideId) {
        setSelectedGuide(prev => ({ ...prev, like: newLikes }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  /**
   * Handles incrementing the view count for a guide.
   * Called when a guide is selected/opened.
   * 
   * @param {string} guideId - The ID of the guide being viewed
   */
  const handleViewGuide = async (guideId) => {
    try {
      const guide = guides.find(g => g.id === guideId);
      const currentViews = parseInt(guide.view || 0);
      const newViews = currentViews + 1;

      // Update view count in database
      const { error } = await supabase
        .from('guide')
        .update({ view: newViews })
        .eq('id', guideId);

      if (error) {
        console.error('Error updating views:', error);
        return;
      }

      // Update local state
      setGuides(prev => prev.map(guide => 
        guide.id === guideId 
          ? { ...guide, view: newViews }
          : guide
      ));
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  /**
   * Handles selecting a guide from the list.
   * On desktop: Updates the detail panel
   * On mobile: Opens the full-screen detail view
   * 
   * @param {Object} guide - The guide object that was selected
   */
  const handleSelectGuide = (guide) => {
    setSelectedGuide(guide);
    handleViewGuide(guide.id);
    
    // On mobile, show the detail view as overlay
    if (window.innerWidth < 1024) {
      setShowMobileDetail(true);
    }
  };

  /**
   * Handles closing the mobile detail view.
   * Returns to the list view on mobile devices.
   */
  const handleCloseMobileDetail = () => {
    setShowMobileDetail(false);
  };

  /**
   * Clears the search query input.
   */
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  /* --------------------------------------------------------------------------
     RENDER
     -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Display for Debugging */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* ====================================================================
          HEADER SECTION
          Contains title, description, and create guide button
          ==================================================================== */}
      <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title and Create Button Row */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Guides
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Discover and explore helpful guides from our community
              </p>
            </div>
            
            {/* Create Guide Button - Desktop Only */}
            <Link
              to={user ? "/guides/new" : "/signin"}
              className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
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

          {/* Search and Filter Controls */}
          <div className="pb-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search guides by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                aria-label="Search guides"
              />
              {/* Clear search button */}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <IoCloseCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT AREA
          Two-pane layout on desktop, single column on mobile
          ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          /* Loading State */
          <LoadingState />
        ) : filteredGuides.length === 0 ? (
          /* Empty State */
          <EmptyState searchQuery={searchQuery} activeCategory={activeCategory} />
        ) : (
          /* Main Two-Pane Layout */
          <div className="lg:flex lg:gap-6 lg:h-[calc(100vh-220px)]">
            
            {/* ----------------------------------------------------------------
                LEFT PANE: Guide List (30-35% width on desktop)
                ---------------------------------------------------------------- */}
            <div className="lg:w-[35%] lg:min-w-[320px] lg:max-w-[420px] lg:overflow-y-auto lg:pr-2 custom-scrollbar">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredGuides.map((guide, index) => (
                    <motion.div
                      key={guide.id}
                      custom={index}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      layout
                    >
                      <GuideListCard
                        guide={guide}
                        isSelected={selectedGuide?.id === guide.id}
                        onSelect={() => handleSelectGuide(guide)}
                        onLike={() => handleLike(guide.id)}
                        user={user}
                        getCategoryName={getCategoryName}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Results count indicator */}
              <p className="text-sm text-gray-500 text-center mt-4 pb-4">
                Showing {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* ----------------------------------------------------------------
                RIGHT PANE: Guide Detail (65-70% width on desktop)
                Hidden on mobile - shown as overlay instead
                ---------------------------------------------------------------- */}
            <div className="hidden lg:block lg:flex-1 lg:overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {selectedGuide ? (
                  <motion.div
                    key={selectedGuide.id}
                    variants={detailPanelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <GuideDetailPanel
                      guide={selectedGuide}
                      user={user}
                      onLike={() => handleLike(selectedGuide.id)}
                      getCategoryName={getCategoryName}
                      setLockActive={setLockActive}
                      lockActive={lockActive}
                    />
                  </motion.div>
                ) : (
                  /* No guide selected state */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-gray-500"
                  >
                    <BookOpen className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg">Select a guide to view details</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          MOBILE DETAIL VIEW OVERLAY
          Full-screen overlay that slides up when a guide is selected on mobile
          ==================================================================== */}
      <AnimatePresence>
        {showMobileDetail && selectedGuide && (
          <motion.div
            variants={mobileDetailVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-white lg:hidden overflow-y-auto"
          >
            {/* Mobile Detail Header with Back Button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
              <button
                onClick={handleCloseMobileDetail}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back to list"
              >
                <IoArrowBack className="w-6 h-6 text-gray-700" />
              </button>
              <h2 className="font-semibold text-gray-900 truncate flex-1">
                {selectedGuide.name}
              </h2>
            </div>
            
            {/* Mobile Detail Content */}
            <div className="px-4 pb-20">
              <GuideDetailPanel
                guide={selectedGuide}
                user={user}
                onLike={() => handleLike(selectedGuide.id)}
                getCategoryName={getCategoryName}
                setLockActive={setLockActive}
                lockActive={lockActive}
                isMobile={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          FLOATING ACTION BUTTON - Mobile Only
          Fixed button for creating new guides
          ==================================================================== */}
      <Link
        to={user ? "/guides/new" : "/signin"}
        className="sm:hidden fixed bottom-20 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
        aria-label="Create new guide"
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

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        /* List styling for rendered HTML content */
        .prose ul, .prose ol {
          margin: 0.75rem 0 !important;
          padding-left: 1.5rem !important;
        }
        .prose ul {
          list-style-type: disc !important;
        }
        .prose ol {
          list-style-type: decimal !important;
        }
        .prose li {
          display: list-item !important;
          margin: 0.375rem 0 !important;
        }
        .prose ul > li::marker {
          color: #374151;
        }
        .prose ol > li::marker {
          color: #374151;
          font-weight: 500;
        }
        .prose ul ul {
          list-style-type: circle !important;
        }
        .prose ul ul ul {
          list-style-type: square !important;
        }
      `}</style>
    </div>
  );
};

/* ============================================================================
   COMPONENT: CategoryFilter
   Horizontal scrollable category filter pills
   ============================================================================ */

/**
 * CategoryFilter Component
 * 
 * Renders a horizontally scrollable list of category filter buttons.
 * Includes left/right scroll buttons on desktop for easier navigation.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.categories - Array of category objects with id and name
 * @param {string} props.activeCategory - Currently selected category ID
 * @param {Function} props.setActiveCategory - Callback to update selected category
 */
const CategoryFilter = ({ categories, activeCategory, setActiveCategory }) => {
  const scrollContainerRef = useRef(null);

  /**
   * Scrolls the category container left by 200px
   */
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  /**
   * Scrolls the category container right by 200px
   */
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Left scroll button - Desktop only */}
      <button
        onClick={scrollLeft}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        aria-label="Scroll categories left"
      >
        <span className="text-gray-600 text-lg">‹</span>
      </button>
      
      {/* Right scroll button - Desktop only */}
      <button
        onClick={scrollRight}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        aria-label="Scroll categories right"
      >
        <span className="text-gray-600 text-lg">›</span>
      </button>

      {/* Scrollable category pills container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="tablist"
        aria-label="Guide categories"
      >
        {categories.map((category) => (
          <button
            key={category.id || category.name}
            onClick={() => setActiveCategory(category.id)}
            role="tab"
            aria-selected={activeCategory === category.id}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeCategory === category.id
                ? "bg-gray-900 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   COMPONENT: GuideListCard
   Compact card for the left-pane guide list
   ============================================================================ */

/**
 * GuideListCard Component
 * 
 * A compact card component designed for the list pane of the master-detail layout.
 * Displays essential guide information in a horizontal layout.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.guide - The guide data object
 * @param {boolean} props.isSelected - Whether this card is currently selected
 * @param {Function} props.onSelect - Callback when card is clicked
 * @param {Function} props.onLike - Callback when like button is clicked
 * @param {Object} props.user - Current authenticated user object
 * @param {Function} props.getCategoryName - Function to get category display name
 */
const GuideListCard = ({ 
  guide, 
  isSelected, 
  onSelect, 
  onLike, 
  user,
  getCategoryName 
}) => {
  const [author, setAuthor] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  // Destructure guide properties for easier access
  const { id, name, description, img_url, created_by, category, view = 0, like = {} } = guide;

  // Calculate engagement metrics
  const isLiked = user && like && like[user.id] === true;
  const likesCount = like ? Object.keys(like).filter(key => like[key] === true).length : 0;
  const viewsCount = parseInt(view) || 0;

  /**
   * Fetches the author's username from the profiles table.
   * Runs when the created_by field changes.
   */
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

  /**
   * Handles the like button click.
   * Prevents event propagation to avoid triggering card selection.
   */
  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking) return;
    
    setIsLiking(true);
    await onLike();
    setTimeout(() => setIsLiking(false), 300);
  };

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      className={`
        relative flex gap-3 p-3 rounded-xl bg-white cursor-pointer
        transition-all duration-200 border-2
        ${isSelected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-100' 
          : 'border-transparent shadow-md hover:shadow-lg hover:border-gray-200'
        }
      `}
    >
      {/* Guide Image/Thumbnail */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {img_url ? (
          <img
            src={img_url}
            alt={name || 'Guide thumbnail'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
       
      </div>

      {/* Guide Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug">
            {name || 'Untitled Guide'}
          </h3>
        </div>

         {/* Category Badge - Positioned on image */}
        {category && (
          <span className='text-xs font-medium line-clamp-1 text-gray-900'>
           {getCategoryName(category)}
          </span>
        )}

        {/* Author and Stats Row */}
        <div className="flex items-center justify-between mt-2">
          {/* Author */}
          <span className="text-xs text-blue-500 truncate max-w-[100px]">
            by {author || 'Loading...'}
          </span>

          {/* Engagement Stats */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {/* Views */}
            <div className="flex items-center gap-1">
              <IoEyeOutline className="w-3.5 h-3.5" />
              <span>{formatCount(viewsCount)}</span>
            </div>
            
            {/* Likes */}
            <div className="flex items-center gap-1">
              <IoIosHeart className="w-3.5 h-3.5" />
              <span>{formatCount(likesCount)}</span>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLikeClick}
              disabled={isLiking}
              className={`
                p-1.5 rounded-full transition-all duration-200
                ${isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500'
                }
                ${isLiking ? 'scale-110' : 'hover:scale-110'}
              `}
              aria-label={isLiked ? 'Unlike this guide' : 'Like this guide'}
            >
              {isLiked ? (
                <IoIosHeart className="w-4 h-4" />
              ) : (
                <IoIosHeartEmpty className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Selected Indicator Arrow */}
      {isSelected && (
        <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-blue-500 rotate-45" />
      )}
    </div>
  );
};

/* ============================================================================
   COMPONENT: GuideDetailPanel
   Full guide details for the right pane
   ============================================================================ */

/**
 * GuideDetailPanel Component
 * 
 * Displays guide details in the right pane.
 * - Non-authenticated users: See 30% of description with sign-in CTA
 * - Authenticated users: See full guide content from JSONB automatically
 * 
 * @component
 */
const GuideDetailPanel = ({ 
  guide, 
  user, 
  onLike, 
  getCategoryName,
  setLockActive,
  lockActive,
  isMobile = false
}) => {
  const [author, setAuthor] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  // Destructure guide properties - content is now included from the main fetch
  const { id, name, description, img_url, created_by, category, view = 0, like = {}, created_at, content } = guide;

  // Calculate engagement metrics
  const isLiked = user && like && like[user.id] === true;
  const likesCount = like ? Object.keys(like).filter(key => like[key] === true).length : 0;
  const viewsCount = parseInt(view) || 0;

  // For non-logged-in users, show truncated description
  const truncatedDescription = truncateToPercentage(description, 30);

  /**
   * Find the first image in the guide content sections
   * This will be used as the cover image
   */
  const getFirstContentImage = () => {
    const sections = content?.sections || [];
    const firstImageSection = sections.find(section => section.type === 'image' && section.url);
    return firstImageSection?.url || null;
  };

  /**
   * Get the index of the first image section (to skip it in content rendering)
   */
  const getFirstImageIndex = () => {
    const sections = content?.sections || [];
    return sections.findIndex(section => section.type === 'image' && section.url);
  };

  // Get the cover image (first image from content, fallback to img_url)
  const coverImageUrl = getFirstContentImage() || img_url;
  const firstImageIndex = getFirstImageIndex();

  /**
   * Helper function to check if content contains HTML tags
   */
  const isHTMLContent = (text) => {
    if (!text) return false;
    return /<[a-z][\s\S]*>/i.test(text);
  };

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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle like click
  const handleLikeClick = async (e) => {
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

  /**
   * Handles sharing the guide using the Web Share API or clipboard fallback
   */
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/guides/guide/${id}`;
    const shareData = {
      title: name || 'Check out this guide',
      text: description ? description.substring(0, 100) + '...' : 'Check out this helpful guide!',
      url: shareUrl,
    };

    try {
      // Check if Web Share API is supported (mostly mobile browsers)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled or error occurred
      if (err.name !== 'AbortError') {
        // Fallback to clipboard if share failed
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        } catch (clipboardErr) {
          console.error('Failed to copy:', clipboardErr);
          alert('Unable to share. Please copy this link: ' + shareUrl);
        }
      }
    }
  };

  /* --------------------------------------------------------------------------
     CONTENT SECTION RENDERING FUNCTIONS
     These functions render the different section types from the JSONB content
     -------------------------------------------------------------------------- */

  /**
   * Groups consecutive link sections together for better layout
   */
  const groupConsecutiveLinkSections = (sections) => {
    if (!sections) return [];
    
    const grouped = [];
    let linkGroup = [];
    let precedingText = null;
    
    sections.forEach((section, index) => {
      const isLinkType = ['links', 'app_links', 'pdf_links', 'social_links'].includes(section.type);
      
      if (isLinkType) {
        linkGroup.push(section);
      } else {
        if (linkGroup.length > 0) {
          grouped.push({ 
            type: 'link_group', 
            sections: linkGroup,
            precedingText: precedingText 
          });
          linkGroup = [];
          precedingText = null;
        }
        
        // Check if this is a text section that might precede links
        if (section.type === 'text' && index < sections.length - 1) {
          const nextSection = sections[index + 1];
          const isNextLinkType = ['links', 'app_links', 'pdf_links', 'social_links'].includes(nextSection?.type);
          
          if (isNextLinkType) {
            precedingText = section;
            return;
          }
        }
        
        grouped.push(section);
      }
    });
    
    // Don't forget remaining link group
    if (linkGroup.length > 0) {
      grouped.push({ 
        type: 'link_group', 
        sections: linkGroup,
        precedingText: precedingText 
      });
    }
    
    return grouped;
  };

  /**
   * Renders a single content section based on its type
   */
  const renderSection = (section, index) => {
    // Handle grouped links
    if (section.type === 'link_group') {
      return (
        <div key={index} className="mb-8">
          <div className="flex flex-col items-center gap-4">
            {section.precedingText && (
              isHTMLContent(section.precedingText.body) ? (
                <div 
                  className="text-gray-700 leading-relaxed text-lg font-sans text-center max-w-3xl prose prose-lg"
                  dangerouslySetInnerHTML={{ __html: section.precedingText.body }}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-lg font-sans text-center max-w-3xl">
                  {section.precedingText.body}
                </p>
              )
            )}
            
            <div className="flex flex-wrap gap-3 justify-center items-center">
              {section.sections.map((linkSection, idx) => {
                switch (linkSection.type) {
                  case "links":
                    return linkSection.items?.map((link, linkIdx) => (
                      <Link
                        key={`links-${idx}-${linkIdx}`}
                        to={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                      >
                        <MdOutlinePlace size={22} className="text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{link.name}</span>
                      </Link>
                    ));
                    
                  case "app_links":
                    return linkSection.items?.map((link, linkIdx) => (
                      <Link
                        key={`app-${idx}-${linkIdx}`}
                        to={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
                          link.label === "Play Store"
                            ? "hover:border-green-300 hover:bg-green-50"
                            : "hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {link.label === "Play Store" ? (
                          <>
                            <BiLogoPlayStore size={24} className="text-green-600" />
                            <span className="font-semibold text-gray-900">{link.label}</span>
                          </>
                        ) : (
                          <>
                            <FaAppStoreIos size={24} className="text-blue-600" />
                            <span className="font-semibold text-gray-900">{link.label}</span>
                          </>
                        )}
                      </Link>
                    ));
                    
                  case "pdf_links":
                    return linkSection.items?.map((link, linkIdx) => (
                      <Link
                        key={`pdf-${idx}-${linkIdx}`}
                        to={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all"
                      >
                        <BsFileEarmarkPdf size={22} className="text-red-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{link.label}</span>
                      </Link>
                    ));
                    
                  case "social_links":
                    return linkSection.items?.map((social_link, linkIdx) => (
                      <Link
                        key={`social-${idx}-${linkIdx}`}
                        to={social_link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-pink-300 transition-all"
                      >
                        <FaInstagram size={24} className="text-pink-600" />
                        <span className="font-medium text-gray-900">{social_link.name}</span>
                      </Link>
                    ));
                    
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </div>
      );
    }

    // Handle individual section types
    switch (section.type) {
      case "text":
        return (
          <div key={index} className="mb-6">
            {isHTMLContent(section.body) ? (
              <div 
                className="text-gray-700 leading-relaxed text-lg font-sans prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed text-lg font-sans">
                {section.body}
              </p>
            )}
          </div>
        );

      case "heading":
        return (
          <div key={index} className="mb-6 mt-8">
            {isHTMLContent(section.body) ? (
              <div 
                className="font-bold text-gray-900 font-sans leading-tight prose prose-lg max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-xl prose-p:font-bold"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            ) : (
              <h2 className="font-bold text-gray-900 text-xl md:text-2xl font-sans leading-tight">
                {section.body}
              </h2>
            )}
          </div>
        );
        
      case "image":
        return (
          <div key={index} className="mb-8">
            <div className="w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
              {section.url ? (
                <img
                  src={section.url}
                  alt={section.caption || "Guide image"}
                  className="w-full h-full object-cover bg-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">Image not available</span>
                </div>
              )}
            </div>
            {section.caption && (
              <p className="text-sm text-gray-500 text-center mt-2">{section.caption}</p>
            )}
          </div>
        );

      case "list":
        const items = section.items ||
          section.body?.split(/\n+/)
            .map(line => line.replace(/^•\s*/, "").trim())
            .filter(Boolean);

        return (
          <div key={index} className="mb-6">
            <ul className="space-y-2">
              {items?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-800">
                  <span className="mt-1">•</span>
                  <span className="text-lg leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "quote":
        return (
          <div key={index} className="mb-8">
            <blockquote className="border-l-4 border-gray-300 pl-6 py-2">
              {isHTMLContent(section.body) ? (
                <div 
                  className="text-xl italic text-gray-700 leading-relaxed prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              ) : (
                <p className="text-xl italic text-gray-700 leading-relaxed">
                  {section.body}
                </p>
              )}
            </blockquote>
          </div>
        );

      case "delimiter":
        return (
          <div key={index} className="flex justify-center py-6 mb-6">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
          </div>
        );

      case "tip":
        return (
          <div key={index} className="mb-8">
            <div className="rounded-xl border-l-4 border-yellow-400 bg-yellow-50 p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <MdOutlineTipsAndUpdates size={28} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-lg font-bold text-gray-900">Tip</h3>
              </div>
              {isHTMLContent(section.body) ? (
                <div 
                  className="text-gray-800 leading-relaxed pl-11 prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              ) : (
                <p className="text-gray-800 leading-relaxed pl-11">{section.body}</p>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  /* --------------------------------------------------------------------------
     RENDER
     -------------------------------------------------------------------------- */

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${isMobile ? '' : 'h-full'}`}>
      {/* Large Cover Image - Uses first content image, falls back to thumbnail */}
      <div className="relative w-full h-64 sm:h-80 lg:h-72 xl:h-80 overflow-hidden bg-gray-100">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={name || 'Guide cover image'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
            <BookOpen className="w-20 h-20 text-gray-300" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Badge on Image */}
        {category && (
          <span className="absolute top-4 left-4 px-3 py-1.5 text-sm font-semibold bg-white/95 backdrop-blur-sm text-gray-800 rounded-full shadow-lg">
            {getCategoryName(category)}
          </span>
        )}

        {/* Stats Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
              <IoEyeOutline className="w-4 h-4" />
              <span className="text-sm font-medium">{formatCount(viewsCount)} views</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
              <IoIosHeart className="w-4 h-4" />
              <span className="text-sm font-medium">{formatCount(likesCount)} likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {name || 'Untitled Guide'}
        </h2>

        {/* Meta Info Row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
          <span className="text-blue-600 font-medium">
            by {author || 'Loading...'}
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>{formatDate(created_at)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <button
            onClick={handleLikeClick}
            disabled={isLiking}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
              ${isLiked 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              ${isLiking ? 'scale-105' : ''}
            `}
          >
            {isLiked ? <IoIosHeart className="w-5 h-5" /> : <IoIosHeartEmpty className="w-5 h-5" />}
            {isLiked ? 'Liked' : 'Like'}
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            <Bookmark className="w-5 h-5" />
            Save
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* CONTENT DISPLAY - Different for logged in vs logged out users */}
        
        {/* NON-LOGGED IN USERS: Show truncated description + sign-in gate */}
        {!user && (
          <>
            <div className="prose prose-gray max-w-none mb-6">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                {truncatedDescription || 'No description available.'}
              </p>
            </div>

            {/* Sign-in Gate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
                  <LockKeyhole className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Sign in to read the full guide
                </h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You're viewing a preview. Create a free account to unlock the complete guide with all details.
                </p>
                
                <Link
                  to="/signin"
                  onClick={(e) => {
                    e.preventDefault();
                    setLockActive(true);
                    setTimeout(() => {
                      window.location.href = '/signin';
                    }, 500);
                  }}
                  className={`
                    inline-flex items-center justify-center gap-2 px-8 py-4 
                    bg-gray-900 text-white rounded-xl font-semibold 
                    shadow-lg transition-all duration-500
                    ${lockActive ? "scale-110 shadow-2xl" : "hover:scale-105 hover:shadow-2xl hover:bg-gray-800"}
                  `}
                >
                  <motion.span
                    className="relative flex items-center gap-2"
                    initial={false}
                    animate={{
                      rotate: lockActive ? [0, -10, 10, -10, 0] : 0,
                      scale: lockActive ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <AnimatePresence mode="wait">
                      {lockActive ? (
                        <motion.span
                          key="unlocked"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <LockKeyholeOpen className="w-5 h-5" />
                          Unlocking...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="locked"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <LockKeyhole className="w-5 h-5" />
                          Unlock Full Guide
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </>
        )}

        {/* LOGGED IN USERS: Show full guide content */}
        {user && (
          <>
            <div className="prose prose-gray max-w-none">
              {/* Full Description */}
              {description && (
                <p className="text-gray-700 leading-relaxed text-lg mb-8">
                  {description}
                </p>
              )}

              {/* Content Sections from JSONB */}
              {content?.sections?.length > 0 ? (
                <div>
                  {groupConsecutiveLinkSections(
                    // Filter out the first image since it's used as cover
                    content.sections.filter((section, idx) => {
                      if (idx === firstImageIndex && section.type === 'image') {
                        return false;
                      }
                      return true;
                    })
                  ).map((section, idx) => 
                    renderSection(section, idx)
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No additional content available.</p>
              )}

              {/* Tags */}
              {Array.isArray(content?.tags) && content.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};


/* ============================================================================
   COMPONENT: LoadingState
   Skeleton loading UI while data is being fetched
   ============================================================================ */

/**
 * LoadingState Component
 * 
 * Displays animated skeleton placeholders while guides are loading.
 * Mimics the layout of the actual content for a smooth loading experience.
 * 
 * @component
 */
const LoadingState = () => {
  return (
    <div className="lg:flex lg:gap-6">
      {/* Left Pane Skeletons */}
      <div className="lg:w-[35%] lg:min-w-[320px] lg:max-w-[420px] space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl bg-white shadow-md animate-pulse">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="flex gap-2 mt-auto pt-2">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Pane Skeleton - Desktop only */}
      <div className="hidden lg:block lg:flex-1">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="w-full h-72 bg-gray-200" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="flex gap-3 pt-4">
              <div className="h-10 bg-gray-200 rounded w-24" />
              <div className="h-10 bg-gray-200 rounded w-24" />
              <div className="h-10 bg-gray-200 rounded w-24" />
            </div>
            <div className="space-y-2 pt-6">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   COMPONENT: EmptyState
   Displayed when no guides match the current filters
   ============================================================================ */

/**
 * EmptyState Component
 * 
 * Displayed when no guides are found, either due to search/filter
 * results being empty or no guides existing at all.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query
 * @param {string} props.activeCategory - Currently selected category
 */
const EmptyState = ({ searchQuery, activeCategory }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <BookOpen className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No guides found
      </h3>
      <p className="text-gray-500 max-w-md">
        {searchQuery 
          ? `No guides match your search "${searchQuery}".`
          : activeCategory !== 'All'
            ? `No guides found in this category.`
            : `There are no guides available yet. Be the first to create one!`
        }
      </p>
    </motion.div>
  );
};

/* ============================================================================
   EXPORT
   ============================================================================ */

export default Guides;