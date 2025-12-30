import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase-client";
import { FiHeart, FiEye, FiSearch, FiPlus } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
// =========================
// Helpers
// =========================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
};

// MarketplaceItem component
const MarketplaceItem = ({ item, userId, onToggleLike, isMobile, user_favourites }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const imageUrl = item?.images?.images?.[0] || "/no-image.png";
  const isLiked = user_favourites.includes(item.id);
  const discountPercent = Number(item.discount_percent) || 0;
  const hasDiscount = discountPercent > 0;
  const basePrice = Number(item.price) || 0;
  const discountedPrice = hasDiscount
    ? Math.max(Math.round(basePrice * (1 - discountPercent / 100)), 0)
    : basePrice;
  const offerLabel = item.special_offer_label;

  const handleCardClick = async () => {
    try {
      await supabase
        .from("marketplace")
        .update({ views: (item.views || 0) + 1 })
        .eq("id", item.id);
      navigate(`/marketplace/${item.id}`);
    } catch (err) {
      console.error("Error incrementing view count:", err);
      navigate(`/marketplace/${item.id}`);
    }
  };

  const conditionStyles = {
    new: { label: "New", color: "bg-black" },
    used: { label: "Used", color: "bg-gray-700" },
  };

  // Mobile horizontal layout
  if (isMobile) {
    return (
      <div
        onClick={handleCardClick}
        className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all active:scale-[0.98] flex h-[120px]"
      >
        {/* Left Image */}
        <div className="relative w-[120px] flex-shrink-0 bg-gray-50 flex justify-center items-center">
          <img
            src={imageUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-black line-clamp-1 mb-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <span>{item.category_name}</span>
              <span>•</span>
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${
                  conditionStyles[item.condition]?.color || "bg-gray-700"
                }`}
              >
                {conditionStyles[item.condition]?.label || "Unknown"}
              </span>
              {offerLabel && (
                <span className="inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-100 border border-amber-200">
                  {offerLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasDiscount ? (
                <div className="flex items-baseline gap-2">
                  <p className="text-base font-bold text-black">
                    {formatCurrency(discountedPrice)}
                  </p>
                  <span className="text-xs text-gray-400 line-through">
                    {formatCurrency(basePrice)}
                  </span>
                  <span className="text-xs font-semibold text-red-600">-{discountPercent}%</span>
                </div>
              ) : (
                <p className="text-base font-bold text-black">
                  {formatCurrency(basePrice)}
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(item);
              }}
              className="flex items-center gap-1 px-2 b-4"
            >
              {isLiked ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FiHeart className="text-gray-600 text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop vertical layout
  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1"
    >
      <div className="relative w-full h-48 bg-white flex justify-center items-center">
        <img
          src={imageUrl}
          alt={item.title}
          onError={() => setImageError(true)}
          className="max-h-full w-auto object-contain"
        />

        {/* Condition Label */}
        <div
          className={`absolute top-0 left-0 m-2 rounded-full px-2 py-1 text-xs font-semibold text-white ${
            conditionStyles[item.condition]?.color || "bg-gray-700"
          }`}
        >
          {conditionStyles[item.condition]?.label || "Unknown"}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(item);
          }}
          className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/10 px-2 py-2 shadow-sm hover:bg-white/30"
        >
          {isLiked ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FiHeart className="text-gray-700 text-lg" />
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-medium text-black">{item.category_name}</p>
          <p className="text-xs text-gray-500">{item.location}</p>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-black">{item.title}</h3>

        {/* <div className="mb-2 flex items-center gap-1 text-gray-800 text-sm">
          <FiEye />
          <span>{item.views || 0}</span>
        </div> */}

        {offerLabel && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200">
              {offerLabel}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-black">{formatCurrency(discountedPrice)}</p>
              <span className="text-xs text-gray-400 line-through">{formatCurrency(basePrice)}</span>
              <span className="text-xs font-semibold text-red-600">-{discountPercent}%</span>
            </div>
          ) : (
            <p className="font-bold text-black">{formatCurrency(basePrice)}</p>
          )}
          <Link
            to={`/marketplace/${item.id}`}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await supabase
                  .from("marketplace")
                  .update({ views: (item.views || 0) + 1 })
                  .eq("id", item.id);
              } catch (err) {
                console.error("Error incrementing view:", err);
              }
            }}
            className="text-sm font-medium text-black hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// =========================
// SearchBar component
// =========================
const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full md:w-1/2 mb-6">
      <FiSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
      <input
        type="text"
        placeholder="Search listings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-black focus:border-black focus:ring-black"
      />
    </div>
  );
};

// =========================
// FilterSidebar component
// =========================
const FilterSidebar = ({
  filters,
  setFilters,
  categories,
  brands,
  onApplyFilters,
  onClear,
  isMobile = false,
  onClose,
}) => {
  const handleCategoryChange = (e) =>
    setFilters((prev) => ({ ...prev, category_id: e.target.value }));

  const handleBrandChange = (e) =>
    setFilters((prev) => ({ ...prev, brand_id: e.target.value }));

  const handleConditionChange = (condition) => {
    setFilters((prev) => {
      const isSelected = prev.condition.includes(condition);
      const newConditions = isSelected
        ? prev.condition.filter((c) => c !== condition)
        : [...prev.condition, condition];
      return { ...prev, condition: newConditions };
    });
  };

  const handleMinPriceChange = (e) =>
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        min: e.target.value ? parseInt(e.target.value) : null,
      },
    }));

  const handleMaxPriceChange = (e) =>
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        max: e.target.value ? parseInt(e.target.value) : null,
      },
    }));

  const handleLocationChange = (e) =>
    setFilters((prev) => ({ ...prev, location: e.target.value }));

  return (
    <div className={`bg-white p-4 ${isMobile ? "rounded-lg shadow-lg" : ""}`}>
      {isMobile && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">Filters</h3>
          <button onClick={onClose} className="text-black text-2xl">
            &times;
          </button>
        </div>
      )}

      {/* Category */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-black">Category</label>
        <select
          value={filters.category_id}
          onChange={handleCategoryChange}
          className="w-full rounded-md border border-gray-300 p-2 text-black"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      {/* <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-black">Brand</label>
        <select
          value={filters.brand_id}
          onChange={handleBrandChange}
          className="w-full rounded-md border border-gray-300 p-2 text-black"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div> */}

      {/* Condition */}
      <div className="mb-6">
        <p className="mb-2 block text-sm font-medium text-black">Condition</p>
        <div className="space-y-2">
          {["new","used"].map((cond) => (
            <label key={cond} className="flex items-center text-black">
              <input
                type="checkbox"
                checked={filters.condition.includes(cond)}
                onChange={() => handleConditionChange(cond)}
                className="mr-2 h-4 w-4"
              />
              {cond
                .split("_")
                .map((s) => s[0].toUpperCase() + s.slice(1))
                .join(" ")}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <p className="mb-2 block text-sm font-medium text-black">Price Range (₩)</p>
        <div className="flex space-x-2">
          <input
            type="number"
            value={filters.priceRange.min ?? ""}
            onChange={handleMinPriceChange}
            placeholder="Min"
            className="w-full rounded-md border border-gray-300 p-2 text-black"
          />
          <span className="flex items-center text-gray-500">-</span>
          <input
            type="number"
            value={filters.priceRange.max ?? ""}
            onChange={handleMaxPriceChange}
            placeholder="Max"
            className="w-full rounded-md border border-gray-300 p-2 text-black"
          />
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-black">Location</label>
        <select
          value={filters.location}
          onChange={handleLocationChange}
          className="w-full rounded-md border border-gray-300 p-2 text-black"
        >
          <option value="">All Locations</option>
          {[
            "Seoul",
            "Busan",
            "Incheon",
            "Daegu",
            "Daejeon",
            "Gwangju",
            "Suwon",
            "Ulsan",
            "Jeju",
            "Gyeonggi-do",
          ].map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={onApplyFilters}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Apply Filters
        </button>
        <button
          onClick={onClear}
          className="w-full rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

// =========================
// MarketplacePage Component
// =========================
export default function Marketplace() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [user_favourites, setUserFavourites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    category_id: "",
    brand_id: "",
    condition: [],
    priceRange: { min: null, max: null },
    location: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    category_id: "",
    brand_id: "",
    condition: [],
    priceRange: { min: null, max: null },
    location: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Load user
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

      // Ensure favourites_marketplace is always an array
      const favourites = profile?.favourites_marketplace;
      setUserFavourites(Array.isArray(favourites) ? favourites : []);
    } else {
      // If no user is logged in, set to empty array
      setUserFavourites([]);
    }
  };
  fetchUser();
}, []);


  // Load categories, brands, and items (only verified items)
  useEffect(() => {
    const fetchData = async () => {
      const [catRes, brandRes, itemsRes] = await Promise.all([
        supabase.from("marketplace_category").select("id,name"),
        supabase.from("marketplace_brand").select("id,name"),
        supabase.from("marketplace").select("*").eq("verified", true).eq('available', true),
      ]);

      if (!catRes.error) setCategories(catRes.data || []);
      if (!brandRes.error) setBrands(brandRes.data || []);

      if (!itemsRes.error) {
        const categoryMap = Object.fromEntries(
          (catRes.data || []).map((c) => [c.id, c.name])
        );
        const brandMap = Object.fromEntries(
          (brandRes.data || []).map((b) => [b.id, b.name])
        );

        const itemsWithNames = itemsRes.data.map((item) => ({
          ...item,
          category_name: categoryMap[item.category_id] || "",
          brand_name: brandMap[item.brand_id] || "",
        }));

        // 🔀 Shuffle items randomly before setting state
        const shuffled = itemsWithNames
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);

        setAllItems(shuffled);
        setItems(shuffled);
      }
    };
    fetchData();
  }, []);

  // Apply filters (called when button is clicked)
  const applyFiltersManually = useCallback(() => {
    setAppliedFilters({ ...filters });
    if (isMobile) setIsFilterDrawerOpen(false);
  }, [filters, isMobile]);

  // Filter items based on applied filters and search term
  useEffect(() => {
    let filtered = [...allItems];

    // Apply filters
    if (appliedFilters.category_id)
      filtered = filtered.filter(
        (item) => item.category_id === parseInt(appliedFilters.category_id)
      );

    if (appliedFilters.brand_id)
      filtered = filtered.filter(
        (item) => item.brand_id === parseInt(appliedFilters.brand_id)
      );

    if (appliedFilters.condition.length > 0)
      filtered = filtered.filter((item) => appliedFilters.condition.includes(item.condition));

    if (appliedFilters.priceRange.min !== null)
      filtered = filtered.filter((item) => item.price >= appliedFilters.priceRange.min);

    if (appliedFilters.priceRange.max !== null)
      filtered = filtered.filter((item) => item.price <= appliedFilters.priceRange.max);

    if (appliedFilters.location)
      filtered = filtered.filter((item) => item.location === appliedFilters.location);

    // Apply search term (real-time)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          JSON.stringify(item.description || "").toLowerCase().includes(term)
      );
    }

    setItems(filtered);
  }, [appliedFilters, allItems, searchTerm]);

  // Handle like
  const handleToggleLike = async (item) => {
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



  // Clear filters
  const handleClearFilters = () => {
    const emptyFilters = {
      category_id: "",
      brand_id: "",
      condition: [],
      priceRange: { min: null, max: null },
      location: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchTerm("");
  };

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black md:text-4xl">Marketplace</h1>
            <p className="mt-2 text-lg text-gray-600">
              Buy, sell, or give away items within the community.
            </p>
          </div>
          {/* Desktop List Product Button */}
          <button
            onClick={() => navigate("/marketplace/post")}
            className="hidden md:flex items-center gap-2 mt-4 md:mt-0 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
          >
            <FiPlus className="text-lg" />
            List a Product
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between mb-6">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {isMobile && (
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="flex items-center justify-center rounded-lg bg-white border border-gray-300 px-4 py-2 text-base font-medium text-black hover:bg-gray-100 active:scale-95 translate-y-[-12.5px]"
            >
              <CiFilter className="text-xl mr-1" />
              Filter
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="hidden md:block md:w-1/4 md:pr-8">
            <h2 className="mb-4 text-xl font-semibold text-black">Filters</h2>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              brands={brands}
              onApplyFilters={applyFiltersManually}
              onClear={handleClearFilters}
            />
          </div>

          {/* Mobile drawer */}
          {isMobile && isFilterDrawerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="w-full max-w-md bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  brands={brands}
                  isMobile
                  onApplyFilters={applyFiltersManually}
                  onClear={handleClearFilters}
                  onClose={() => setIsFilterDrawerOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Items Grid */}
          <div className="w-full md:w-3/4">
            {items.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-gray-200">
                <p className="text-lg text-gray-500">No items match your search or filters</p>
                <button onClick={handleClearFilters} className="mt-4 text-black underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <MarketplaceItem
                    user_favourites = {user_favourites}
                    isMobile={isMobile}
                    key={item.id}
                    item={item}
                    userId={userId}
                    onToggleLike={handleToggleLike}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Add Button */}
      {isMobile && (
        <button
          onClick={() => navigate("/marketplace/post")}
          className="sm:hidden fixed bottom-18 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
      >
          <FiPlus className="text-2xl" />
        </button>
      )}
    </div>
  );
}
