import React, { useEffect, useState, useRef } from 'react';
import { supabase } from "../../../api/supabase-client";
import { Link } from 'react-router';
import { IoEyeOutline } from "react-icons/io5";
import { IoIosHeart } from "react-icons/io";
import { IoIosHeartEmpty } from "react-icons/io";

const getPlaceholderImage = (id) =>
  `https://picsum.photos/400/300?random=${id || Math.floor(Math.random() * 1000)}`;

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [user, setUser] = useState(null);

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
        .from('category')
        .select('*');

      if (TagsError) {
        console.error('Error fetching categories:', TagsError.message);
        setLoading(false);
      } else {
        const allOption = { name: 'All' };
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
      const { data, error } = await supabase
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
        `);

      if (error) {
        console.error('Error fetching guides:', error.message);
        setLoading(false);
      } else {
        setGuides(data || []);
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

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
    // This should work for both logged-in and non-logged-in users
    try {
      const guide = guides.find(g => g.id === guideId);
      const currentViews = parseInt(guide.view || 0);
      const newViews = currentViews + 1;

      // Update view count in database - no user authentication required for views
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

  const filteredGuides =
    activeCategory === 'All'
      ? guides
      : guides.filter((guide) => guide.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="py-16">
        <div className="container mx-auto px-4">
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
                className="flex"
                onLike={() => handleLike(guide.id)}
                onView={() => handleViewGuide(guide.id)}
                user={user}
              />
            ))}
          </ExploreSection>
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
  return (
    <div className={className}>
      {/* Categories filter buttons */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id || category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category.name
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Title */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black md:text-3xl">{title}</h2>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {children}
      </div>
    </div>
  );
};

/* ExploreCard Component */
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
    <div className="snap-start px-4 flex-shrink-0 w-full sm:w-72 md:w-80">
      <div className="h-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          {/* Show image only if img_url exists */}
          {img_url ? (
            <img
              src={img_url}
              alt={name || 'Guide image'}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            /* No image placeholder */
            <div className="flex items-center justify-center h-full bg-gray-200">
              <div className="text-gray-400 text-sm">No image</div>
            </div>
          )}
          
          {/* Overlay with stats - no background */}
          <div className="absolute inset-0 transition-all duration-300">
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {/* Like button */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
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

            {/* Bottom stats */}
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

        <div className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              by {author || 'Loading...'}
            </div>
            {/* Small stats for mobile/when not hovering */}
            <div className="flex items-center gap-3 text-gray-500 sm:hidden">
              <div className="flex items-center gap-1">
                <IoEyeOutline className="w-3 h-3" />
                <span className="text-xs">{formatCount(viewsCount)}</span>
              </div>
              <div className="flex items-center gap-1">
                <IoIosHeart className="w-3 h-3" />
                <span className="text-xs">{formatCount(likesCount)}</span>
              </div>
            </div>
          </div>
          
          <h3 className="mb-2 text-lg font-semibold text-black line-clamp-2">
            {name || 'Untitled Guide'}
          </h3>
          <p className="mb-4 text-sm text-gray-600 line-clamp-3">
            {description || 'No description available.'}
          </p>
          
          <Link
            to={`guide/${id}`}
            onClick={handleCardClick}
            className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Read full guide &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Guides;