import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase-client";
import { FiHeart, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

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
      // Increment view count
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

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1 dark:bg-gray-900"
    >
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-48 bg-white flex justify-center items-center">
        <img
          src={imageUrl}
          alt={item.title}
          onError={() => setImageError(true)}
          className="max-h-full w-auto object-contain"
        />
        <div
          className={`absolute top-0 left-0 m-2 rounded-full px-2 py-1 text-xs font-semibold text-white ${
            item.condition === "new" ? "bg-black" : "bg-gray-700"
          }`}
        >
          {item.condition === "new" ? "New" : "Used"}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-medium text-black dark:text-white">
            {item.category_name}
          </p>
          <p className="text-xs text-gray-500">{item.location}</p>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
          {item.title}
        </h3>

        <div className="mb-2 flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(item);
              }}
              className="flex items-center gap-1 hover:text-red-500 transition"
            >
              {isLiked ? <FaHeart className="text-red-500" /> : <FiHeart />}
              <span>{likesCount}</span>
            </button>
            <div className="flex items-center gap-1">
              <FiEye />
              <span>{item.views || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-bold text-black dark:text-white">
            {formatCurrency(item.price)}
          </p>
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
            className="text-sm font-medium text-black hover:underline dark:text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// =========================
// FilterSidebar component
// =========================
const FilterSidebar = ({ filters, setFilters, categories, isMobile = false, onClose }) => {
  const handleSearchChange = (e) =>
    setFilters((prev) => ({ ...prev, search: e.target.value }));

  const handleCategoryChange = (e) =>
    setFilters((prev) => ({ ...prev, category_id: e.target.value }));

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

  const handleClear = () =>
    setFilters({
      search: "",
      category_id: "",
      condition: [],
      priceRange: { min: null, max: null },
      location: "",
    });

  return (
    <div
      className={`bg-white p-4 dark:bg-gray-900 ${
        isMobile ? "rounded-lg shadow-lg" : ""
      }`}
    >
      {isMobile && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Filters
          </h3>
          <button onClick={onClose} className="text-black dark:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
          Search
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search listings..."
          className="w-full rounded-md border border-gray-300 p-2 text-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
          Category
        </label>
        <select
          value={filters.category_id}
          onChange={handleCategoryChange}
          className="w-full rounded-md border border-gray-300 p-2 text-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <p className="mb-2 block text-sm font-medium text-black dark:text-white">
          Condition
        </p>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.condition.includes("new")}
              onChange={() => handleConditionChange("new")}
              className="mr-2 h-4 w-4"
            />
            New
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.condition.includes("second-hand")}
              onChange={() => handleConditionChange("second-hand")}
              className="mr-2 h-4 w-4"
            />
            Second-hand
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <p className="mb-2 block text-sm font-medium text-black dark:text-white">
          Price Range (₩)
        </p>
        <div className="flex space-x-2">
          <input
            type="number"
            value={filters.priceRange.min ?? ""}
            onChange={handleMinPriceChange}
            placeholder="Min"
            className="w-full rounded-md border border-gray-300 p-2 text-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <span className="flex items-center text-gray-500">-</span>
          <input
            type="number"
            value={filters.priceRange.max ?? ""}
            onChange={handleMaxPriceChange}
            placeholder="Max"
            className="w-full rounded-md border border-gray-300 p-2 text-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
          Location
        </label>
        <select
          value={filters.location}
          onChange={handleLocationChange}
          className="w-full rounded-md border border-gray-300 p-2 text-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Locations</option>
          <option value="Seoul">Seoul</option>
          <option value="Busan">Busan</option>
          <option value="Incheon">Incheon</option>
          <option value="Daegu">Daegu</option>
          <option value="Daejeon">Daejeon</option>
          <option value="Gwangju">Gwangju</option>
          <option value="Suwon">Suwon</option>
          <option value="Ulsan">Ulsan</option>
          <option value="Jeju">Jeju</option>
          <option value="Gyeonggi-do">Gyeonggi-do</option>
        </select>
      </div>

      <button
        onClick={() =>
          setFilters({
            search: "",
            category_id: "",
            condition: [],
            priceRange: { min: null, max: null },
            location: "",
          })
        }
        className="w-full rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-white dark:bg-black dark:text-white dark:hover:bg-gray-800"
      >
        Clear Filters
      </button>
    </div>
  );
};

// =========================
// MarketplacePage Component
// =========================
export default function Marketplace() {
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    condition: [],
    priceRange: { min: null, max: null },
    location: "",
  });
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase.from("marketplace_category").select("id,name");
    if (error) console.error(error);
    else setCategories(data || []);
  };

  // Fetch items
  const fetchItems = async () => {
    const { data, error } = await supabase.from("marketplace").select("*");
    if (error) console.error(error);
    else setAllItems(data || []);
  };

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...allItems];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          JSON.stringify(item.description || "")
            .toLowerCase()
            .includes(term)
      );
    }

    if (filters.category_id)
      filtered = filtered.filter(
        (item) => item.category_id === parseInt(filters.category_id)
      );

    if (filters.condition.length > 0)
      filtered = filtered.filter((item) =>
        filters.condition.includes(item.condition)
      );

    if (filters.priceRange.min !== null)
      filtered = filtered.filter((item) => item.price >= filters.priceRange.min);

    if (filters.priceRange.max !== null)
      filtered = filtered.filter((item) => item.price <= filters.priceRange.max);

    if (filters.location)
      filtered = filtered.filter((item) => item.location === filters.location);

    const filteredWithCategoryName = filtered.map((item) => {
      const cat = categories.find((c) => c.id === item.category_id);
      return { ...item, category_name: cat ? cat.name : "" };
    });

    setItems(filteredWithCategoryName);
  }, [filters, allItems, categories]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle Like
  const handleToggleLike = async (item) => {
    if (!userId) {
      alert("Please log in to like items.");
      return;
    }

    let favourites = item.favourites?.favourites || [];
    if (!Array.isArray(favourites)) favourites = [];

    let updatedFavourites = favourites.includes(userId)
      ? favourites.filter((id) => id !== userId)
      : [...favourites, userId];

    try {
      await supabase
        .from("marketplace")
        .update({ favourites: { favourites: updatedFavourites } })
        .eq("id", item.id);

      setAllItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, favourites: { favourites: updatedFavourites } } : it
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white md:text-4xl">
              Marketplace
            </h1>
            <p className="mt-2 text-xl text-gray-600 dark:text-gray-300">
              Buy, sell, or give away items within the community.
            </p>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black border border-black dark:bg-black dark:text-white dark:border-white"
            >
              Filters
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="hidden md:block md:w-1/4 md:pr-8">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Filters
            </h2>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              categories={categories}
            />
          </div>

          {/* Mobile drawer */}
          {isMobile && isFilterDrawerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="w-full max-w-md">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  isMobile
                  onClose={() => setIsFilterDrawerOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Items Grid */}
          <div className="w-full md:w-3/4">
            {items.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  No items match your filters
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      category_id: "",
                      condition: [],
                      priceRange: { min: null, max: null },
                      location: "",
                    })
                  }
                  className="mt-4 text-black underline dark:text-white"
                >
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
