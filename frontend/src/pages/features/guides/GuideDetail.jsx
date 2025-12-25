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
import { BsFileEarmarkPdf } from "react-icons/bs";

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
        // Fetch guide data with view, like, and approved status
        const { data: guideData, error: guideError } = await supabase
          .from("guide")
          .select("id, created_at, name, description, img_url, created_by, content, view, like, approved")
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading guide...</p>
          </div>
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

  // Check if current user is the creator and guide is not approved
  const isCreatorAndNotApproved = user && guide?.created_by === user.id && guide?.approved === false;

  const groupConsecutiveLinkSections = (sections) => {
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
            return; // Don't add to grouped yet
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

  const renderSection = (section, index) => {
    // Handle grouped links
    if (section.type === 'link_group') {
      return (
        <div key={index} className="mb-8">
          <div className="flex flex-col items-center gap-4">
            {/* Preceding text if exists */}
            {section.precedingText && (
              <p className="text-gray-700 leading-relaxed text-lg sm:text-sm lg:text-xl md:text-xl font-sans text-center max-w-3xl">
                {section.precedingText.body}
              </p>
            )}
            
            {/* Links container */}
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
                        className={`flex items-center justify-center gap-2 px-6 py-3 w-48 sm:w-auto bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
                          link.label === "Play Store"
                            ? "hover:border-green-300 hover:bg-green-50"
                            : "hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {link.label === "Play Store" ? (
                          <>
                            <BiLogoPlayStore size={24} className="text-green-600" />
                            <span className="font-semibold text-gray-900 tracking-tight">
                              {link.label}
                            </span>
                          </>
                        ) : (
                          <>
                            <FaAppStoreIos size={24} className="text-blue-600" />
                            <span className="font-semibold text-gray-900 tracking-tight">
                              {link.label}
                            </span>
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

    switch (section.type) {
      case "text":
        return (
          <div key={index} className="mb-6">
            <p className="text-gray-700 leading-relaxed text-lg sm:text-sm lg:text-xl md:text-xl font-sans mt-6">
              {section.body}
            </p>
          </div>
        );

      case "heading":
        return (
          <div key={index} className="mb-6">
            <h2 className="font-bold text-gray-900 text-1xl md:text-2xl lg:text-3xl font-sans mb-4 leading-tight">
              {section.body}
            </h2>
          </div>
        );
        
      case "image":
        return (
          <div key={index} className="mb-8">
            <div className="w-full  overflow-hidden bg-gray-200 flex items-center justify-center">
              {section.url ? (
                <img
                  src={section.url}
                  alt={section.caption || "Guide image"}
                  className="w-full h-full object-cover bg-gray-200"
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
            </div>
          </div>
        );

      case "list":
        const items =
          section.items ||
          section.body
            ?.split(/\n+/)
            .map(line => line.replace(/^•\s*/, "").trim())
            .filter(Boolean);

        return (
          <div key={index} className="mb-6 mx-10">
            <ul className="space-y-0">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-800">
                  <span className="mt-0.5">•</span>
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
              <p className="text-xl italic text-gray-700 leading-relaxed">
                {section.body}
              </p>
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
              <p className="text-gray-800 leading-relaxed pl-11">{section.body}</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Back button */}
        <Link
          to="/guides"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>←</span>
          <span>Back to Guides</span>
        </Link>

        {/* Verification Notice - Only visible to creator when not approved */}
        {isCreatorAndNotApproved && (
          <div className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Verification in Progress
                </h3>
                <p className="text-sm text-amber-800">
                  <span className="inline-block">
                    Your guide is being verified by Keasy
                    <span className="inline-flex ml-1">
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse animation-delay-200">.</span>
                      <span className="animate-pulse animation-delay-400">.</span>
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <article className="rounded-2xl overflow-hidden">
          {/* Thumbnail */}
          {guide.img_url && (
            <div className="w-full aspect-video md:aspect-[21/9] overflow-hidden bg-gray-100">
              <img
                src={guide.img_url}
                alt={guide.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Main image failed to load:', guide.img_url);
                  e.target.parentNode.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Header Section */}
          <div className="px-0 md:px-10 py-auto pt-4">
            {/* Title */}
            <h1 className="font-sans text-1xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {guide.name}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 mb-2">
              {/* Left side info */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">By {author}</span>
                <span className="text-gray-400">•</span>
                <span>{createdDate}</span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">{formatCount(viewsCount)} views</span>
                </div>
              </div>

              {/* Right side like button */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  isLiked
                    ? 'text-red-600'
                    : 'text-gray-700'
                } ${isLiking ? 'scale-95' : 'hover:scale-105'} ${
                  !user ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={!user ? 'Login to like guides' : isLiked ? 'Unlike' : 'Like'}
              >
                {isLiked ? (
                  <IoIosHeart className="w-5 h-5" />
                ) : (
                  <IoIosHeartEmpty className="w-5 h-5" />
                )}
                <span>{formatCount(likesCount)}</span>
              </button>
            </div>

            {/* Description */}
            {guide.description && (
              <p className="mt-6 text-lg md:text-xl text-gray-700 leading-relaxed">
                {guide.description}
              </p>
            )}
          </div>

          {/* Content Sections */}
          <div className="px-0 md:px-10 py-8 md:py-10">
            {guide.content?.sections?.length > 0 ? (
              <div className="prose prose-lg max-w-none">
                {groupConsecutiveLinkSections(guide.content.sections).map((section, idx) => 
                  renderSection(section, idx)
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No content available for this guide.</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {Array.isArray(guide.content?.tags) && guide.content.tags.length > 0 && (
            <div className="px-6 md:px-10 py-6 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {guide.content.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
