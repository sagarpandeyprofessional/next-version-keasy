import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase-client";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { motion } from "framer-motion";
import { FiMessageCircle, FiHeart, FiEye, FiEdit } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { PiPackageLight } from "react-icons/pi";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
};

const daysAgo = (dateString) => {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
};

// Contact type display names
const getContactTypeName = (type) => {
  const names = {
    message: "SMS/Message",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    "kakao talk": "Kakao Talk",
    messenger: "Messenger",
    email: "Email"
  };
  return names[type] || type;
};

export default function MarketplaceItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userPfp, setUserPfp] = useState("");

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);

        const { data: itemData, error: itemError } = await supabase
          .from("marketplace")
          .select("*")
          .eq("id", parseInt(id))
          .single();
        if (itemError) throw itemError;
        setItem(itemData);

        // Increment view count
        await supabase
          .from("marketplace")
          .update({ views: (itemData.views || 0) + 1 })
          .eq("id", itemData.id);

        // Category
        const { data: categoryData } = await supabase
          .from("marketplace_category")
          .select("name")
          .eq("id", itemData.category_id)
          .single();
        setCategoryName(categoryData?.name || "Unknown");

        // Brand (if exists)
        if (itemData.brand_id) {
          const { data: brandData } = await supabase
            .from("marketplace_brand")
            .select("name")
            .eq("id", itemData.brand_id)
            .single();
          setBrandName(brandData?.name || "");
        }

        // Seller info
        const { data: userData } = await supabase
          .from("profiles")
          .select("username")
          .eq("user_id", itemData.user_id)
          .single();
        setUsername(userData?.username || "Unknown");
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Fetch seller profile picture
  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase
        .from("profiles")
        .select("pfp_url")
        .eq("username", username)
        .single();
      setUserPfp(userData?.pfp_url || "");
    };
    if (username) checkUser();
  }, [username]);

  if (isLoading) return <p className="text-center py-20 text-gray-800">Loading...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!item) return <p className="text-center py-20 text-gray-800">No item found.</p>;

  const handlePrev = () => {
    if (!item?.images?.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? item.images.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!item?.images?.images) return;
    setCurrentImageIndex((prev) =>
      prev === item.images.images.length - 1 ? 0 : prev + 1
    );
  };

  // Toggle Favorite
  const handleFavourite = async () => {
    if (!userId) {
      alert("Please log in to save favorites.");
      return;
    }

    let favourites = item.favourites?.favourites || [];
    if (!Array.isArray(favourites)) favourites = [];

    const updatedFavourites = favourites.includes(userId)
      ? favourites.filter((id) => id !== userId)
      : [...favourites, userId];

    await supabase
      .from("marketplace")
      .update({ favourites: { favourites: updatedFavourites } })
      .eq("id", item.id);

    setItem((prev) => ({
      ...prev,
      favourites: { favourites: updatedFavourites },
    }));
  };

  // Contact Seller - now uses the seller_contact link from database
  const handleContactSeller = () => {
    if (!item.seller_contact) {
      alert("Contact information not available.");
      return;
    }

    // Open the contact link (already formatted from upload)
    const newWindow = window.open(item.seller_contact, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.focus();

    // Increment chat count
    supabase
      .from("marketplace")
      .update({ chat: (item.chat || 0) + 1 })
      .eq("id", item.id)
      .catch((err) => console.error(err));
  };

  const favouritesList = item.favourites?.favourites || [];
  const likesCount = favouritesList.length;
  const isLiked = userId && favouritesList.includes(userId);

  // Render description with preserved formatting
  const renderDescription = (description) => {
    if (!description || typeof description !== 'string') {
      return <p className="text-gray-600 italic">No description provided.</p>;
    }

    // Split by newlines and render each line
    const lines = description.split('\n');
    
    return (
      <div className="text-gray-700 space-y-2">
        {lines.map((line, index) => (
          <p key={index} className="whitespace-pre-wrap">
            {line || '\u00A0'} {/* Non-breaking space for empty lines */}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/marketplace" className="mb-6 inline-flex items-center text-gray-800 hover:underline">
        ← Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Carousel */}
        <div className="w-full aspect-square bg-white rounded-lg overflow-hidden relative">
          {item.images?.images?.length > 0 ? (
            <>
              <motion.img
                key={currentImageIndex}
                src={item.images.images[currentImageIndex]}
                alt={item.title}
                className="w-full h-full object-contain"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 50) handlePrev();
                  else if (info.offset.x < -50) handleNext();
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              {item.images.images.length > 1 && (
                <div>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gray-400/30 text-gray-800 p-3 rounded-full text-2xl hover:bg-gray-400/50 transition-colors"
                  >
                    <GrFormPrevious />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-400/30 text-gray-800 p-3 rounded-full text-2xl hover:bg-gray-400/50 transition-colors"
                  >
                    <GrFormNext />
                  </button>
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-gray-200/50 px-3 py-1.5 rounded-full">
                    {item.images.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? "bg-gray-800" : "bg-gray-500"}`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Item Details */}
        <div>
          {/* Seller Profile */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={userPfp || "/default-avatar.png"}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Link to={`/profile/${username}`} className="font-semibold text-gray-800 hover:underline">
                  {username}
                </Link>
                <p className="text-sm text-gray-500">{daysAgo(item.created_at)}</p>
              </div>
            </div>
            
            {/* Edit Button - Show only if owner */}
            {userId === item.user_id && (
              <>
                {/* Desktop: Text Button */}
                <button
                  onClick={() => navigate(`/marketplace/${id}/edit`)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <FiEdit />
                  Edit Listing
                </button>
                
                {/* Mobile: Icon Only */}
                <button
                  onClick={() => navigate(`/marketplace/${id}/edit`)}
                  className="sm:hidden p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Edit listing"
                >
                  <FiEdit size={20} />
                </button>
              </>
            )}
          </div>

          {/* Title & Meta */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{item.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500 text-sm">{categoryName}</p>
              {brandName && (
                <>
                  <span className="text-gray-400">•</span>
                  <p className="text-gray-500 text-sm">{brandName}</p>
                </>
              )}
            </div>
          </div>

          {/* Verification Alert - Show only if not verified */}
          {item.verified === false && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg 
                    className="animate-spin h-5 w-5 text-yellow-600" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                    Waiting for Verification
                  </h3>
                  <p className="text-sm text-yellow-700">
                    This listing is currently under review by Keasy. It will be visible to other users once verified.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <p className="text-2xl font-semibold text-gray-800">{formatCurrency(item.price)}</p>
            {item.is_negotiable && (
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                Negotiable
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-5 text-gray-600 text-sm mb-6">
            <div className="flex items-center space-x-1">
              <FiMessageCircle /> <span>{item.chat || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              {isLiked ? <FaHeart className="text-red-500" /> : <FiHeart />}
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiEye /> <span>{item.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <PiPackageLight /> <span>{item.stock || 0}</span>
            </div>
          </div>

          {/* Condition & Location */}
          <div className="flex gap-4 mb-6 text-sm">
            {item.condition && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium text-gray-800 capitalize">
                  {item.condition.replace(/_/g, ' ')}
                </span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-800">{item.location}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Description</h2>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {renderDescription(item.description)}
          </div>

          {/* Contact Information Display */}
          {item.seller_contact_type && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Contact via:</span>
                <span className="font-medium text-gray-800">
                  {getContactTypeName(item.seller_contact_type)}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Edit button - only show if user owns this item */}
            {userId === item.user_id && (
              <button
                onClick={() => navigate(`/marketplace/edit/${id}/`)}
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Edit Listing
              </button>
            )}
            
            {item.seller_contact ? (
              <button
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                onClick={handleContactSeller}
              >
                Contact Seller via {getContactTypeName(item.seller_contact_type)}
              </button>
            ) : (
              <button className="flex-1 px-4 py-3 bg-gray-400 text-gray-800 rounded-lg cursor-not-allowed">
                No Contact Info
              </button>
            )}
            <button
              className={`px-6 py-3 border rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
                isLiked 
                  ? "bg-red-500 text-white border-red-500 hover:bg-red-600" 
                  : "border-black text-gray-800 hover:bg-gray-50"
              }`}
              onClick={handleFavourite}
            >
              {isLiked ? <FaHeart /> : <FiHeart />}
              <span className="hidden sm:inline">{isLiked ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}