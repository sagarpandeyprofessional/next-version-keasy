import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabase-client";
import { BiLogoPlayStore } from "react-icons/bi";
import { FaAppStoreIos } from "react-icons/fa";
import { MdOutlinePlace } from "react-icons/md";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { FaInstagram } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { IoIosHeart } from "react-icons/io";
import { IoIosHeartEmpty } from "react-icons/io";

export default function GuideDetail() {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchGuideAndAuthor = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch guide data with view and like
        const { data: guideData, error: guideError } = await supabase
          .from("guide")
          .select("id, created_at, name, description, img_url, created_by, content, view, like")
          .eq("id", id)
          .single();

        if (guideError) {
          console.error("Error fetching guide:", guideError.message);
          setError("Failed to load guide");
          setLoading(false);
          return;
        }

        setGuide(guideData);

        // Update view count when guide is loaded
        if (guideData) {
          const currentViews = parseInt(guideData.view || 0);
          const newViews = currentViews + 1;

          await supabase
            .from('guide')
            .update({ view: newViews })
            .eq('id', id);

          // Update local state with new view count
          setGuide(prev => ({ ...prev, view: newViews }));
        }

        // Fetch author data if guide has created_by
        if (guideData?.created_by) {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("username")
            .eq("user_id", guideData.created_by)
            .single();

          if (userError) {
            console.error("Error fetching author:", userError.message);
            setAuthor("Unknown Author");
          } else {
            setAuthor(userData?.username || "Unknown Author");
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      }

      setLoading(false);
    };

    if (id) {
      fetchGuideAndAuthor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-64">
          <p className="text-lg text-gray-600">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-lg text-red-500 mb-4">{error}</p>
            <Link
              to="/guides"
              className="text-blue-500 hover:underline"
            >
              ← Back to Guides
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-lg text-red-500 mb-4">Guide not found.</p>
            <Link
              to="/guides"
              className="text-blue-500 hover:underline"
            >
              ← Back to Guides
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const createdDate = new Date(guide.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like guides');
      return;
    }

    if (isLiking) return;

    const currentLikes = guide.like || {};
    const userId = user.id;
    const isCurrentlyLiked = currentLikes[userId] === true;
    
    setIsLiking(true);
    
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
        .eq('id', guide.id);

      if (error) {
        console.error('Error updating like:', error);
        return;
      }

      // Update local state
      setGuide(prev => ({ ...prev, like: newLikes }));
    } catch (error) {
      console.error('Error updating like:', error);
    }
    
    setTimeout(() => setIsLiking(false), 300);
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

  // Check if current user has liked this guide
  const isLiked = user && guide?.like && guide.like[user.id] === true;
  
  // Count total likes
  const likesCount = guide?.like ? Object.keys(guide.like).filter(key => guide.like[key] === true).length : 0;
  
  // Convert view to number
  const viewsCount = parseInt(guide?.view) || 0;

  // Render content sections dynamically
  const renderSection = (section, index) => {
    switch (section.type) {
      case "text":
        return (
          <div key={index} className="mb-8 flex justify-center text-center">
            <p className="py-4 text-lg text-gray-700 max-w-4xl">
              {section.body}
            </p>
          </div>
        );
        
      case "image":
        return (
          <div key={index} className="mb-8 flex justify-center">
            <div className="overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg bg-gray-50 w-full max-w-3xl">
              {section.url ? (
                <img
                  src={section.url}
                  alt={section.caption || "Guide image"}
                  className="w-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    console.error('Section image failed to load:', section.url);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">Image not available</span>
                </div>
              )}
              {section.caption && (
                <p className="mt-2 px-4 py-2 text-center text-sm text-gray-500">
                  {section.caption}
                </p>
              )}
            </div>
          </div>
        );
        
      case "links":
        return (
          <div key={index} className="mb-8">
            <h3 className="mb-4 text-2xl font-semibold text-gray-900 text-center">
              Click below for Address
            </h3>
            <ul className="flex justify-center gap-5 flex-wrap">
              {section.items?.map((link, idx) => (
                <li key={idx} className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black shadow-md hover:bg-gray-100">
                  <Link
                    to={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black flex hover:bg-gray-100 min-w-35 text-center items-center"
                  >
                    <MdOutlinePlace size={30} />
                    <span className="px-3 font-bold text-black">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
        
      case "app_links":
        return (
          <div key={index} className="mb-8">
            <h4 className="mb-6 text-2xl font-semibold text-gray-900 text-center">
              Get the App on
            </h4>
            <ul className="flex justify-center gap-4 flex-wrap">
              {section.items?.map((link, idx) => (
                <li key={idx} className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black shadow-md hover:bg-gray-100">
                  {link.label === "Play Store" && (
                    <Link 
                      to={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#34A853] flex items-center"
                    >
                      <BiLogoPlayStore size={50} />
                      <span className="px-3 font-bold">{link.label}</span>
                    </Link>
                  )}
                  {link.label === "App Store" && (
                    <Link 
                      to={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 flex items-center"
                    >
                      <FaAppStoreIos size={50} />
                      <span className="px-3 font-bold">{link.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
        
      case "tip":
        return (
          <div key={index} className="mb-8 rounded-lg border-l-4 border-r-4 border-gray-800 bg-yellow-50 p-6 max-w-4xl mx-auto">
            <div className="mb-4 flex gap-3 items-center">
              <MdOutlineTipsAndUpdates size={35} className="text-gray-800" />
              <h3 className="text-2xl font-bold text-gray-800">Tip</h3>
            </div>
            <p className="text-lg text-gray-800">{section.body}</p>
          </div>
        );
        
      case "social_links":
        return (
          <div key={index} className="mb-8">
            <h3 className="mb-4 text-2xl font-semibold text-gray-900 text-center">
              Our Instagram Page
            </h3>
            <ul className="flex justify-center gap-5 flex-wrap">
              {section.items?.map((social_link, idx) => (
                <li key={idx} className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black shadow-md hover:bg-gray-100">
                  <Link
                    to={social_link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black flex hover:bg-gray-100 min-w-35 text-center items-center"
                  >
                    <FaInstagram size={30} className="text-pink-500" />
                    <span className="px-3 font-bold text-black">{social_link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back button */}
      <Link
        to="/guides"
        className="mb-6 inline-block text-sm font-medium text-black hover:underline px-3 py-1"
      >
        ← Back to Guides
      </Link>

      {/* Title + Author + Stats */}
      <h1 className="mb-4 text-3xl font-bold text-gray-900 text-center">
        {guide.name}
      </h1>
      <div className="mb-4 text-sm text-gray-500 text-center">
        <span>By {author}</span>
        <span className="mx-2">•</span>
        <span>{createdDate}</span>
      </div>

      {/* View and Like Stats */}
      <div className="mb-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-gray-600">
          <IoEyeOutline className="w-5 h-5" />
          <span className="text-lg font-medium">{formatCount(viewsCount)} views</span>
        </div>
        
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            isLiked 
              ? 'bg-red-500 text-white shadow-lg hover:bg-red-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-red-500'
          } ${isLiking ? 'scale-110' : ''} ${!user ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}`}
          title={!user ? 'Login to like guides' : (isLiked ? 'Unlike' : 'Like')}
        >
          {isLiked ? (
            <IoIosHeart className="w-5 h-5" />
          ) : (
            <IoIosHeartEmpty className="w-5 h-5" />
          )}
          <span className="text-lg font-medium">{formatCount(likesCount)}</span>
        </button>
      </div>

      {/* Main image - Fixed: using img_url instead of image_url */}
      {guide.img_url && (
        <div className="mb-8 flex justify-center">
          <div className="overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg bg-gray-50 w-full max-w-4xl">
            <img
              src={guide.img_url}
              alt={guide.name}
              className="w-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                console.error('Main image failed to load:', guide.img_url);
                e.target.parentNode.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Description */}
      {guide.description && (
        <div className="mb-8 flex justify-center">
          <p className="text-lg text-gray-700 max-w-4xl text-center">
            {guide.description}
          </p>
        </div>
      )}

      {/* Content sections */}
      {guide.content?.sections?.length > 0 ? (
        guide.content.sections.map((section, idx) => renderSection(section, idx))
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No content available for this guide.</p>
        </div>
      )}

      {/* Tags */}
      {Array.isArray(guide.content?.tags) && guide.content.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {guide.content.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}