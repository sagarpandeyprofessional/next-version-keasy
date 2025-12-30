/**
 * @file EmptyState.jsx
 * @description Empty state component displayed when no jobs match the current filters.
 * 
 * Shows different messages based on context:
 * - No search results
 * - No jobs in category
 * - No jobs available at all
 * - No saved jobs
 * - No applied jobs
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Bookmark, 
  FileCheck,
  FolderOpen,
  Plus
} from 'lucide-react';


/**
 * EmptyState Component
 * 
 * Displays a friendly empty state message with an icon and optional action button.
 * Adapts its content based on the type of empty state.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.type - Type of empty state: 'search', 'category', 'all', 'saved', 'applied'
 * @param {string} props.searchQuery - Current search query (for 'search' type)
 * @param {string} props.categoryName - Current category name (for 'category' type)
 * @param {boolean} props.isEmployer - Whether user is a verified employer (shows create button)
 * @param {string} props.lang - Language code ('en' or 'ko')
 * 
 * @returns {JSX.Element} The empty state component
 * 
 * @example
 * <EmptyState 
 *   type="search" 
 *   searchQuery="developer"
 *   lang="en"
 * />
 */
const EmptyState = ({
  type = 'all',
  searchQuery = '',
  categoryName = '',
  isEmployer = false,
  lang = 'en'
}) => {
  
  /**
   * Get the icon component based on type
   */
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-12 h-12 text-gray-400" />;
      case 'saved':
        return <Bookmark className="w-12 h-12 text-gray-400" />;
      case 'applied':
        return <FileCheck className="w-12 h-12 text-gray-400" />;
      case 'category':
        return <FolderOpen className="w-12 h-12 text-gray-400" />;
      default:
        return <Briefcase className="w-12 h-12 text-gray-400" />;
    }
  };

  /**
   * Get the title and description based on type and language
   */
  const getContent = () => {
    const content = {
      search: {
        en: {
          title: 'No jobs found',
          description: `No jobs match your search "${searchQuery}". Try different keywords or clear your search.`
        },
        ko: {
          title: '검색 결과 없음',
          description: `"${searchQuery}"에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.`
        }
      },
      category: {
        en: {
          title: 'No jobs in this category',
          description: `There are no jobs in ${categoryName || 'this category'} right now. Check back later or browse other categories.`
        },
        ko: {
          title: '이 카테고리에 채용공고가 없습니다',
          description: `${categoryName || '이 카테고리'}에 현재 채용공고가 없습니다. 나중에 다시 확인하거나 다른 카테고리를 둘러보세요.`
        }
      },
      saved: {
        en: {
          title: 'No saved jobs',
          description: 'You haven\'t saved any jobs yet. Browse jobs and click the bookmark icon to save them for later.'
        },
        ko: {
          title: '저장된 채용공고 없음',
          description: '아직 저장한 채용공고가 없습니다. 채용공고를 둘러보고 북마크 아이콘을 클릭하여 저장하세요.'
        }
      },
      applied: {
        en: {
          title: 'No applications yet',
          description: 'You haven\'t applied to any jobs yet. Browse jobs and click Apply to get started.'
        },
        ko: {
          title: '아직 지원한 채용공고가 없습니다',
          description: '아직 지원한 채용공고가 없습니다. 채용공고를 둘러보고 지원하기를 클릭하세요.'
        }
      },
      all: {
        en: {
          title: 'No jobs available',
          description: 'There are no job listings available at the moment. Check back soon for new opportunities!'
        },
        ko: {
          title: '채용공고 없음',
          description: '현재 등록된 채용공고가 없습니다. 곧 새로운 기회가 올라올 예정입니다!'
        }
      }
    };

    return content[type]?.[lang] || content.all[lang];
  };

  /**
   * Get the action button based on type
   */
  const getAction = () => {
    switch (type) {
      case 'search':
      case 'category':
        return {
          label: lang === 'ko' ? '모든 채용공고 보기' : 'View all jobs',
          to: '/jobs'
        };
      case 'saved':
      case 'applied':
        return {
          label: lang === 'ko' ? '채용공고 둘러보기' : 'Browse jobs',
          to: '/jobs'
        };
      default:
        if (isEmployer) {
          return {
            label: lang === 'ko' ? '채용공고 등록하기' : 'Post a job',
            to: '/jobs/new',
            icon: Plus
          };
        }
        return null;
    }
  };

  const { title, description } = getContent();
  const action = getAction();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon Container */}
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        {getIcon()}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 max-w-md mb-6">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-2 px-6 py-3 
                     bg-blue-600 text-white rounded-lg font-medium
                     hover:bg-blue-700 transition-colors duration-200
                     shadow-md hover:shadow-lg"
        >
          {action.icon && <action.icon className="w-5 h-5" />}
          {action.label}
        </Link>
      )}
    </motion.div>
  );
};


/**
 * NoResultsInline Component
 * 
 * A smaller, inline version of empty state for use within sections.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {string} props.lang - Language code
 * 
 * @returns {JSX.Element} Inline empty state
 */
export const NoResultsInline = ({ message, lang = 'en' }) => {
  const defaultMessage = lang === 'ko' 
    ? '결과가 없습니다' 
    : 'No results found';

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Search className="w-8 h-8 text-gray-300 mb-2" />
      <p className="text-gray-500 text-sm">
        {message || defaultMessage}
      </p>
    </div>
  );
};


/**
 * ErrorState Component
 * 
 * Displays an error state with retry option.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message
 * @param {Function} props.onRetry - Callback for retry button
 * @param {string} props.lang - Language code
 * 
 * @returns {JSX.Element} Error state component
 */
export const ErrorState = ({ error, onRetry, lang = 'en' }) => {
  const content = {
    en: {
      title: 'Something went wrong',
      retry: 'Try again'
    },
    ko: {
      title: '문제가 발생했습니다',
      retry: '다시 시도'
    }
  };

  const t = content[lang] || content.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <svg 
          className="w-12 h-12 text-red-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {t.title}
      </h3>

      <p className="text-gray-500 max-w-md mb-6">
        {error || 'An unexpected error occurred. Please try again.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 
                     bg-blue-600 text-white rounded-lg font-medium
                     hover:bg-blue-700 transition-colors duration-200"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          {t.retry}
        </button>
      )}
    </motion.div>
  );
};


export default EmptyState;
