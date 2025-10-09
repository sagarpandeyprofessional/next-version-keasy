import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../api/supabase-client";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { motion } from "framer-motion";
import { FiMessageCircle, FiHeart, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { PiPackageLight } from "react-icons/pi";
import { div } from "framer-motion/client";

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

export default function MarketplaceItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState("");
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

        // Seller info
        const { data: userData } = await supabase
          .from("profiles")
          .select("username, phone")
          .eq("user_id", itemData.user_id)
          .single();
        setUsername(userData?.username || "Unknown");
        setPhone(userData?.phone || "");
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

  // Contact Seller (fixed for Safari)
  const handleContactSeller = () => {
    if (!phone) return;
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(
      `Hello, I am interested in your "${item.title}" listed on the Marketplace. Product Link - "https://koreaeasy.org/marketplace/${item.id}"`
    )}`;
    const newWindow = window.open(waLink, "_blank", "noopener,noreferrer");
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

  // 🔹 Dynamic Description Renderer
  const renderDescription = (descriptionObj) => {
    if (!descriptionObj || Object.keys(descriptionObj).length === 0) {
      return <p>No description provided.</p>;
    }

    return Object.entries(descriptionObj).map(([key, value]) => {
      if (!Array.isArray(value)) return null;

      // Format the section title
      const title = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // Switch-based handling for future extensibility
      switch (key) {
        case "specs":
          return (
            <div key={key} className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                {value.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          );

        case "condition":
          return (
            <div key={key} className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                {value.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          );

        case "included_accessories":
          return (
            <div key={key} className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                {value.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          );

        default:
          // fallback for any new keys added in future
          return (
            <div key={key} className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                {value.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          );
      }
    });
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gray-400/30 text-gray-800 p-3 rounded-full text-2xl"
                  >
                    <GrFormPrevious />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-400/30 text-gray-800 p-3 rounded-full text-2xl"
                  >
                    <GrFormNext />
                  </button>
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-gray-200/50 px-3 py-1.5 rounded-full">
                    {item.images.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? "bg-gray-800" : "bg-gray-500"}`}
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
              <div className="w-12 h-12 rounded-full overflow-hidden">
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
          </div>

          {/* Title & Meta */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{item.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{categoryName}</p>
          </div>

          <p className="text-2xl font-semibold mb-4 text-gray-800">{formatCurrency(item.price)}</p>

          {/* Stats */}
          <div className="flex items-center space-x-5 text-gray-600 text-sm mb-6">
            <div className="flex items-center space-x-1">
              <FiMessageCircle /> <span>{item.chat}</span>
            </div>
            <div className="flex items-center space-x-1">
              {isLiked ? <FaHeart className="text-red-500" /> : <FiHeart />}
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiEye /> <span>{item.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <PiPackageLight /> <span>{item.stock}</span>
            </div>
          </div>

          {/* 🔹 Description */}
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Description of Product:</h2>
          <div className="text-gray-700 mb-6 space-y-3">
            {renderDescription(item.description)}
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            {phone ? (
              <button
                className="px-4 py-2 bg-black text-white rounded-md"
                onClick={handleContactSeller}
              >
                Contact Seller
              </button>
            ) : (
              <button className="px-4 py-2 bg-gray-400 text-gray-800 rounded-md cursor-not-allowed">
                No Contact Info
              </button>
            )}
            <button
              className={`px-4 py-2 border rounded-md flex items-center gap-2 ${
                isLiked ? "bg-red-500 text-white border-red-500" : "border-black text-gray-800"
              }`}
              onClick={handleFavourite}
            >
              {isLiked ? <FaHeart /> : <FiHeart />}
              {isLiked ? "Saved" : "Save to Favorites"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
