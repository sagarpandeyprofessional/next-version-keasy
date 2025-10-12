import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase-client";
import { FiHeart, FiEye, FiSearch } from "react-icons/fi";
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

// =========================
// MarketplaceItem component
// =========================
const MarketplaceItem = ({ item, userId, onToggleLike }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const imageUrl = item?.images?.images?.[0] || "/no-image.png";

  const favouritesList = item.favourites?.favourites || [];
  const likesCount = favouritesList.length;
  const isLiked = userId && favouritesList.includes(userId);

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
    like_new: { label: "Like New", color: "bg-blue-600" },
    used: { label: "Used", color: "bg-gray-700" },
    refurbished: { label: "Refurbished", color: "bg-green-600" },
    damaged: { label: "Damaged", color: "bg-red-700" },
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1"
    >
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-48 bg-white flex justify-center items-center">
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
          className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 shadow-sm hover:bg-white/30"
        >
          {isLiked ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FiHeart className="text-gray-700 text-lg" />
          )}
          <span className="text-xs text-gray-700">{likesCount}</span>
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-medium text-black">{item.category_name}</p>
          <p className="text-xs text-gray-500">{item.location}</p>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-black">{item.title}</h3>

        <div className="mb-2 flex items-center gap-1 text-gray-800 text-sm">
          <FiEye />
          <span>{item.views || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-bold text-black">{formatCurrency(item.price)}</p>
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
// SearchBar component (NEW)
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
          <button onClick={onClose} className="text-black">
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
      <div className="mb-6">
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
      </div>

      {/* Condition */}
      <div className="mb-6">
        <p className="mb-2 block text-sm font-medium text-black">Condition</p>
        <div className="space-y-2">
          {["new", "like_new", "used", "refurbished", "damaged"].map((cond) => (
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
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
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
      setUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  // Load categories, brands, and items
  useEffect(() => {
    const fetchData = async () => {
      const [catRes, brandRes, itemsRes] = await Promise.all([
        supabase.from("marketplace_category").select("id,name"),
        supabase.from("marketplace_brand").select("id,name"),
        supabase.from("marketplace").select("*"),
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

        setAllItems(itemsWithNames);
        setItems(itemsWithNames);
      }
    };
    fetchData();
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...allItems];

    // Category, brand, etc
    if (filters.category_id)
      filtered = filtered.filter(
        (item) => item.category_id === parseInt(filters.category_id)
      );

    if (filters.brand_id)
      filtered = filtered.filter(
        (item) => item.brand_id === parseInt(filters.brand_id)
      );

    if (filters.condition.length > 0)
      filtered = filtered.filter((item) => filters.condition.includes(item.condition));

    if (filters.priceRange.min !== null)
      filtered = filtered.filter((item) => item.price >= filters.priceRange.min);

    if (filters.priceRange.max !== null)
      filtered = filtered.filter((item) => item.price <= filters.priceRange.max);

    if (filters.location)
      filtered = filtered.filter((item) => item.location === filters.location);

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          JSON.stringify(item.description || "").toLowerCase().includes(term)
      );
    }

    setItems(filtered);
    if (isMobile) setIsFilterDrawerOpen(false);
  }, [filters, allItems, searchTerm, isMobile]);

  // Real-time search (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, applyFilters]);

  // Handle like
  const handleToggleLike = async (item) => {
    if (!userId) {
      alert("Please log in to like items.");
      return;
    }

    let favourites = item.favourites?.favourites || [];
    if (!Array.isArray(favourites)) favourites = [];

    const updatedFavourites = favourites.includes(userId)
      ? favourites.filter((id) => id !== userId)
      : [...favourites, userId];

    try {
      setAllItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, favourites: { favourites: updatedFavourites } } : it
        )
      );
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, favourites: { favourites: updatedFavourites } } : it
        )
      );

      await supabase
        .from("marketplace")
        .update({ favourites: { favourites: updatedFavourites } })
        .eq("id", item.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      category_id: "",
      brand_id: "",
      condition: [],
      priceRange: { min: null, max: null },
      location: "",
    });
    setSearchTerm("");
    setItems(allItems);
  };

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black md:text-4xl">Marketplace</h1>
              <p className="mt-2 text-lg text-gray-600">
                Buy, sell, or give away items within the community.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between mb-6">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {isMobile && (
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-base font-medium text-black hover:bg-gray-100 active:scale-95"
            >
              <CiFilter className="text-xl mr-1" />
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
              onApplyFilters={applyFilters}
              onClear={handleClearFilters}
            />
          </div>

          {/* Mobile drawer */}
          {isMobile && isFilterDrawerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md backdrop-blur-md bg-white/70 rounded-lg shadow-lg">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  brands={brands}
                  isMobile
                  onApplyFilters={applyFilters}
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item) => (
                  <MarketplaceItem
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
    </div>
  );
}
