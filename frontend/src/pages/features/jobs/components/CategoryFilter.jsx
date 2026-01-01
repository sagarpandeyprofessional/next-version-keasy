/**
 * @file CategoryFilter.jsx
 * @description Horizontal scrollable category filter pills for filtering jobs.
 * 
 * Features:
 * - Horizontal scroll with fade edges
 * - "All" option to show all jobs
 * - Bilingual support (EN/KO)
 * - Active state highlighting
 * - Smooth scroll behavior
 * 
 * @requires react
 * @requires react-icons
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';


/**
 * CategoryFilter Component
 * 
 * Displays a horizontal scrollable list of category pills for filtering jobs.
 * Includes an "All" option and supports bilingual labels.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.categories - Array of category objects from database
 * @param {string} props.activeCategory - Currently selected category ID
 * @param {Function} props.setActiveCategory - Callback to update active category
 * @param {string} props.lang - Language code ('en' or 'ko') for labels
 * 
 * @returns {JSX.Element} The category filter component
 * 
 * @example
 * <CategoryFilter
 *   categories={categories}
 *   activeCategory={activeCategory}
 *   setActiveCategory={setActiveCategory}
 *   lang="en"
 * />
 */
const CategoryFilter = ({
  categories,
  activeCategory,
  setActiveCategory,
  lang = 'en'
}) => {
  // Ref for the scrollable container
  const scrollContainerRef = useRef(null);
  
  // State for showing/hiding scroll arrows
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  /**
   * Check scroll position and update arrow visibility
   */
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Show left arrow if scrolled past 10px
    setShowLeftArrow(scrollLeft > 10);
    
    // Show right arrow if there's more content to scroll
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  /**
   * Set up scroll event listener and initial check
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    checkScrollPosition();

    // Add scroll listener
    container.addEventListener('scroll', checkScrollPosition);
    
    // Add resize listener to recheck on window resize
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [categories]);

  /**
   * Scroll the container left or right
   * @param {string} direction - 'left' or 'right'
   */
  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  /**
   * Handle category selection
   * @param {string} categoryId - The ID of the selected category
   */
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
  };

  /**
   * Get the display name for a category based on language
   * @param {Object} category - Category object
   * @returns {string} Display name
   */
  const getCategoryName = (category) => {
    if (category.id === 'All') {
      return lang === 'ko' ? '전체' : 'All';
    }
    return lang === 'ko' ? category.name_ko : category.name_en;
  };

  return (
    <div className="relative">
      {/* Left Scroll Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
                     w-8 h-8 flex items-center justify-center
                     bg-white/90 backdrop-blur-sm rounded-full shadow-md
                     text-gray-600 hover:text-gray-900 hover:bg-white
                     transition-all duration-200"
          aria-label="Scroll categories left"
        >
          <IoChevronBack className="w-5 h-5" />
        </button>
      )}

      {/* Left Fade Gradient */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 w-12 
                        bg-gradient-to-r from-gray-50 to-transparent 
                        pointer-events-none z-[5]" />
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1
                   scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* All Option */}
        <button
          onClick={() => handleCategoryClick('All')}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200 whitespace-nowrap
            ${activeCategory === 'All'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
        >
          {lang === 'ko' ? '전체' : 'All'}
        </button>

        {/* Category Pills */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 whitespace-nowrap
              ${activeCategory === category.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* Right Fade Gradient */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 w-12 
                        bg-gradient-to-l from-gray-50 to-transparent 
                        pointer-events-none z-[5]" />
      )}

      {/* Right Scroll Arrow */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
                     w-8 h-8 flex items-center justify-center
                     bg-white/90 backdrop-blur-sm rounded-full shadow-md
                     text-gray-600 hover:text-gray-900 hover:bg-white
                     transition-all duration-200"
          aria-label="Scroll categories right"
        >
          <IoChevronForward className="w-5 h-5" />
        </button>
      )}

      {/* Hide scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryFilter;