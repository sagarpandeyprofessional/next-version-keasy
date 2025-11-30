import React, { useEffect, useState, useCallback } from "react";
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
  const [user_favourites, setUserFavourites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userPfp, setUserPfp] = useState("");
  const [chatCount, setChatCount] = useState(0);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
        const { data } = await supabase.auth.getUser();
        const uid = data?.user?.id || null;
        setUserId(uid);
    
        if (uid) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("favourites_marketplace")
            .eq("user_id", uid)
            .single();
    
          setUserFavourites(profile?.favourites_marketplace || []);
        }
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

  // Fetch chat count - count how many profiles have this item.id in their chat_marketplace
  useEffect(() => {
    const checkItemInChats = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("chat_marketplace");
      
      if (profiles) {
        const count = profiles.filter(profile => {
          if (!profile.chat_marketplace) return false;
          // Check if any value in the chat_marketplace object equals this item id
          return Object.values(profile.chat_marketplace).includes(parseInt(id));
        }).length;
        
        setChatCount(count);
      }
    };
    
    checkItemInChats();
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
          alert("Please log in to like items.");
          return;
        }
    
        try {
          const isLiked = user_favourites.includes(item.id);
          const updatedFavourites = isLiked
            ? user_favourites.filter((id) => id !== item.id)
            : [...user_favourites, item.id];
    
          setUserFavourites(updatedFavourites); // ✅ local update
    
          const { error } = await supabase
            .from("profiles")
            .update({ favourites_marketplace: updatedFavourites })
            .eq("user_id", userId);
    
          if (error) throw error;
        } catch (err) {
          console.error("Error updating favourites:", err);
        }
      };

  // Contact Seller - adds to chat_marketplace in profiles table
  const handleContactSeller = async () => {
    if (!item.seller_contact) {
      alert("Contact information not available.");
      return;
    }

    if (!userId) {
      alert("Please log in to contact seller.");
      return;
    }

    try {
      // Get current user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("chat_marketplace")
        .eq("user_id", userId)
        .single();

      // Get current chat_marketplace or initialize as empty object
      const currentChats = profile?.chat_marketplace || {};
      
      // Generate a unique key (you can use timestamp or a combination)
      const chatKey = `chat_${Date.now()}`;
      
      // Add the item id to the chat_marketplace object
      const updatedChats = {
        ...currentChats,
        [chatKey]: parseInt(id)
      };

      // Update the profile with new chat_marketplace
      const { error } = await supabase
        .from("profiles")
        .update({ chat_marketplace: updatedChats })
        .eq("user_id", userId);

      if (error) throw error;

      // Update local chat count
      setChatCount(prev => prev + 1);

      // Open the contact link
      const newWindow = window.open(item.seller_contact, "_blank", "noopener,noreferrer");
      if (newWindow) newWindow.focus();

    } catch (err) {
      console.error("Error updating chat:", err);
    }
  };

  const isLiked = Array.isArray(user_favourites) 
  ? user_favourites.includes(item.id)
  : false;


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
                  onClick={() => navigate(`/marketplace/edit/${id}`)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <FiEdit />
                  Edit Listing
                </button>
                
                {/* Mobile: Icon Only */}
                <button
                  onClick={() => navigate(`/marketplace/edit/${id}`)}
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
              <FiMessageCircle /> <span>{chatCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              {isLiked ? <FaHeart className="text-red-500" /> : <FiHeart />}
             
            </div>
            {/* <div className="flex items-center space-x-1">
              <FiEye /> <span>{item.views || 0}</span>
            </div> */}
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
          <p className="text-sm font-semibold mb-3 text-gray-800 pb-10" >Refund is not available for this Product!</p>

          {/* Contact Information Display */}
          {/* {item.seller_contact_type && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Contact via:</span>
                <span className="font-medium text-gray-800">
                  {getContactTypeName(item.seller_contact_type)}
                </span>
              </div>
            </div>
          )} */}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            
            
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
          {/* Checkout Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors
                        flex items-center justify-center"
              to={`/toss`}
            >
              Purchase Now (Testing, under development)
            </Link>
          </div>

        </div>
      </div>

      <div className="w-full">
          <ItemReview 
            itemId={item.id} 
            userId={userId} 
            setError={setError}
            setIsLoading={setIsLoading}
            itemUserId = {item.user_id}
          />
      </div>
    </div>
  );
}

const ItemReview = ({itemId, userId, setError, setIsLoading, itemUserId}) => {
  const [reviews, setReviews] = useState([]);
  const [isAuthor, setIsAuthor] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewImages, setReviewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // fetching item's reviews
  useEffect(() => {
    const getReviews = async () => {
      const { data, error } = await supabase
        .from("marketplace_reviews")
        .select("*")
        .eq("product_id", itemId)
        .order("created_at", { ascending: false });

      if (error) return setError("Reviews not loaded!");
      setReviews(data || []);

      // Check if current user has already reviewed
      if (userId) {
        const userReview = data?.find(review => review.user_id === userId);
        setHasUserReviewed(!!userReview);
      }

      // Fetch user profiles for all reviewers
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, pfp_url")
          .in("user_id", userIds);

        if (profiles) {
          const profileMap = {};
          profiles.forEach(p => {
            profileMap[p.user_id] = p;
          });
          setUserProfiles(profileMap);
        }
      }
    };

    if (itemId) getReviews();
  }, [itemId, userId]);

  // check user is author
  useEffect(() => {
    setIsAuthor(userId === itemUserId);
  }, [userId, itemUserId]);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + reviewImages.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setReviewImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please log in to submit a review");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls = [];

      // Upload images to Supabase storage
      if (reviewImages.length > 0) {
        for (let i = 0; i < reviewImages.length; i++) {
          const file = reviewImages[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/${itemId}/${Date.now()}_${i}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("marketplace_reviews")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("marketplace_reviews")
            .getPublicUrl(fileName);

          imageUrls.push(urlData.publicUrl);
        }
      }

      // Insert review
      const { data, error } = await supabase
        .from("marketplace_reviews")
        .insert({
          user_id: userId,
          product_id: itemId,
          review: reviewText,
          rating: rating,
          img_urls: imageUrls.length > 0 ? imageUrls : null
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch reviewer profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, username, pfp_url")
        .eq("user_id", userId)
        .single();

      // Add new review to list
      setReviews(prev => [data, ...prev]);
      setUserProfiles(prev => ({
        ...prev,
        [userId]: profile
      }));

      // Reset form
      setReviewText("");
      setRating(0);
      setReviewImages([]);
      setImagePreviews([]);
      setShowReviewForm(false);
      setHasUserReviewed(true);

      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600">
              {averageRating} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {/* Write Review Button */}
        {userId && !isAuthor && !hasUserReviewed && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            {showReviewForm ? "Cancel" : "Write Review"}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && !isAuthor && !hasUserReviewed && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <form onSubmit={handleSubmitReview}>
            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-gray-600">
                  {rating > 0 ? `${rating}/5` : "Select rating"}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                rows="4"
                placeholder="Share your experience with this product..."
                required
              />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Optional, max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="review-images"
                disabled={reviewImages.length >= 5}
              />
              <label
                htmlFor="review-images"
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  reviewImages.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Upload Photos
              </label>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Info Messages */}
      {userId && isAuthor && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          You cannot review your own product.
        </div>
      )}

      {userId && hasUserReviewed && !isAuthor && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          You have already reviewed this product.
        </div>
      )}

      {!userId && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
          Please sign in to write a review.
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No reviews yet</p>
          <p className="text-sm mt-2">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const profile = userProfiles[review.user_id];
            return (
              <div
                key={review.id}
                className="p-6 bg-white border border-gray-200 rounded-lg"
              >
                {/* Reviewer Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={profile?.pfp_url || "/default-avatar.png"}
                        alt={profile?.username || "User"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        to={`/profile/${profile?.username}`}
                        className="font-semibold text-gray-800 hover:underline"
                      >
                        {profile?.username || "Anonymous"}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {daysAgo(review.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                  {review.review}
                </p>

                {/* Review Images */}
                {review.img_urls && review.img_urls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {review.img_urls.map((url, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <img
                          src={url}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}