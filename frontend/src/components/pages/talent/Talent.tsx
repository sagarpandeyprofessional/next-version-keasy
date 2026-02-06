// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FiHeart, FiSearch, FiPlus, FiMapPin, FiDollarSign } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

// =========================
// Helpers
// =========================
const formatPrice = (price) => {
  if (!price || price === 0) return "Free";
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(price);
};

// =========================
// TalentCard component
// =========================
const TalentCard = ({ talent, userId, onToggleLike }) => {
  const router = useRouter();
  const profileImage = talent.profile_img || "/default-avatar.png";

  const favouritesList = talent.favourites || [];
  const likesCount = Array.isArray(favouritesList) ? favouritesList.length : 0;
  const isLiked = userId && Array.isArray(favouritesList) && favouritesList.includes(userId);

  const handleCardClick = () => {
    router.push(`/talents/${talent.id}`);
  };

  const typeStyles = {
    service_provider: { label: "Service Provider", color: "bg-blue-600" },
    business: { label: "Business", color: "bg-green-600" },
    freelancer: { label: "Freelancer", color: "bg-purple-600" },
  };

  const categories = Array.isArray(talent.category) ? talent.category : [];
  const skills = Array.isArray(talent.skills) ? talent.skills : [];

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1"
    >
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-48 bg-gray-100 flex justify-center items-center">
        <img
          src={profileImage}
          alt={talent.name}
          className="w-full h-full object-cover"
        />

        {/* Type Label */}
        <div
          className={`absolute top-0 left-0 m-2 rounded-full px-2 py-1 text-xs font-semibold text-white ${
            typeStyles[talent.type]?.color || "bg-gray-700"
          }`}
        >
          {typeStyles[talent.type]?.label || "Unknown"}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(talent);
          }}
          className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 shadow-sm hover:bg-white/30"
        >
          {isLiked ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FiHeart className="text-white text-lg" />
          )}
          <span className="text-xs text-white">{likesCount}</span>
        </button>
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-black">{talent.name}</h3>

        <div className="mb-2 flex items-center gap-1 text-gray-600 text-sm">
          <FiDollarSign />
          <span>{formatPrice(talent.pricing)}</span>
        </div>

        {categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {categories.slice(0, 2).map((cat, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {cat}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="text-xs text-gray-500">+{categories.length - 2}</span>
            )}
          </div>
        )}

        {talent.about && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {talent.about}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <FiMapPin />
            <span>
              {talent.location?.city || talent.location?.country || "Location not set"}
            </span>
          </div>
          <Link
            href={`/talents/${talent.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-black hover:underline"
          >
            View Profile
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
        placeholder="Search by name, category, or skill..."
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
  onApplyFilters,
  onClear,
  isMobile = false,
  onClose,
}) => {
  const allCategories = [
    "Real Estate",
    "Web Developer",
    "Graphic Designer",
    "Tutor",
    "Photographer",
    "Writer",
    "Consultant",
    "Marketing",
    "Other"
  ];

  const allLanguages = [
    "English",
    "Korean",
    "Chinese",
    "Japanese",
    "Spanish",
    "French",
    "German",
    "Other"
  ];

  const handleTypeChange = (type) => {
    setFilters((prev) => {
      const isSelected = prev.types.includes(type);
      const newTypes = isSelected
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types: newTypes };
    });
  };

  const handleCategoryChange = (category) => {
    setFilters((prev) => {
      const isSelected = prev.categories.includes(category);
      const newCategories = isSelected
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleLanguageChange = (language) => {
    setFilters((prev) => {
      const isSelected = prev.languages.includes(language);
      const newLanguages = isSelected
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language];
      return { ...prev, languages: newLanguages };
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

      {/* Type */}
      <div className="mb-6">
        <p className="mb-2 block text-sm font-medium text-black">Provider Type</p>
        <div className="space-y-2">
          {["service_provider", "business", "freelancer"].map((type) => (
            <label key={type} className="flex items-center text-black">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => handleTypeChange(type)}
                className="mr-2 h-4 w-4"
              />
              {type.split("_").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ")}
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <p className="mb-2 block text-sm font-medium text-black">Categories</p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {allCategories.map((cat) => (
            <label key={cat} className="flex items-center text-black">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
                className="mr-2 h-4 w-4"
              />
              {cat}
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

      {/* Languages */}
      <div className="mb-6">
        <p className="mb-2 block text-sm font-medium text-black">Languages</p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {allLanguages.map((lang) => (
            <label key={lang} className="flex items-center text-black">
              <input
                type="checkbox"
                checked={filters.languages.includes(lang)}
                onChange={() => handleLanguageChange(lang)}
                className="mr-2 h-4 w-4"
              />
              {lang}
            </label>
          ))}
        </div>
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
// Talents Component
// =========================
type TalentProps = {
  embedded?: boolean;
};

export default function Talent({ embedded = false }: TalentProps) {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [filters, setFilters] = useState({
    types: [],
    categories: [],
    languages: [],
    priceRange: { min: null, max: null },
  });
  const [appliedFilters, setAppliedFilters] = useState({
    types: [],
    categories: [],
    languages: [],
    priceRange: { min: null, max: null },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [allTalents, setAllTalents] = useState([]);
  const [talents, setTalents] = useState([]);
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

  // Load talents
  useEffect(() => {
    const fetchTalents = async () => {
      const { data, error } = await supabase.from("talent").select("*");

      if (!error && data) {
        setAllTalents(data);
        setTalents(data);
      }
    };
    fetchTalents();
  }, []);

  // Apply filters
  const applyFiltersManually = useCallback(() => {
    setAppliedFilters({ ...filters });
    if (isMobile) setIsFilterDrawerOpen(false);
  }, [filters, isMobile]);

  // Filter talents based on applied filters and search term
  useEffect(() => {
    let filtered = [...allTalents];

    // Apply type filter
    if (appliedFilters.types.length > 0) {
      filtered = filtered.filter((t) => appliedFilters.types.includes(t.type));
    }

    // Apply category filter
    if (appliedFilters.categories.length > 0) {
      filtered = filtered.filter((t) => {
        const talentCategories = Array.isArray(t.category) ? t.category : [];
        return appliedFilters.categories.some((cat) => talentCategories.includes(cat));
      });
    }

    // Apply language filter
    if (appliedFilters.languages.length > 0) {
      filtered = filtered.filter((t) => {
        const talentLanguages = Array.isArray(t.languages) ? t.languages : [];
        return appliedFilters.languages.some((lang) => talentLanguages.includes(lang));
      });
    }

    // Apply price range
    if (appliedFilters.priceRange.min !== null) {
      filtered = filtered.filter((t) => (t.pricing || 0) >= appliedFilters.priceRange.min);
    }

    if (appliedFilters.priceRange.max !== null) {
      filtered = filtered.filter((t) => (t.pricing || 0) <= appliedFilters.priceRange.max);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((t) => {
        const nameMatch = t.name?.toLowerCase().includes(term);
        const categoryMatch = Array.isArray(t.category) && t.category.some((c) => c.toLowerCase().includes(term));
        const skillMatch = Array.isArray(t.skills) && t.skills.some((s) => s.toLowerCase().includes(term));
        return nameMatch || categoryMatch || skillMatch;
      });
    }

    setTalents(filtered);
  }, [appliedFilters, allTalents, searchTerm]);

  // Handle like
  const handleToggleLike = async (talent) => {
    if (!userId) {
      alert("Please log in to like profiles.");
      return;
    }

    let favourites = Array.isArray(talent.favourites) ? talent.favourites : [];

    const updatedFavourites = favourites.includes(userId)
      ? favourites.filter((id) => id !== userId)
      : [...favourites, userId];

    try {
      setAllTalents((prev) =>
        prev.map((t) =>
          t.id === talent.id ? { ...t, favourites: updatedFavourites } : t
        )
      );
      setTalents((prev) =>
        prev.map((t) =>
          t.id === talent.id ? { ...t, favourites: updatedFavourites } : t
        )
      );

      await supabase
        .from("talent")
        .update({ favourites: updatedFavourites })
        .eq("id", talent.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    const emptyFilters = {
      types: [],
      categories: [],
      languages: [],
      priceRange: { min: null, max: null },
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
    <div className={embedded ? "" : "min-h-screen bg-white"}>
      <div className={embedded ? "w-full" : "container mx-auto px-4 py-12"}>
        {/* Header */}
        {!embedded && (
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black md:text-4xl">Talents</h1>
              <p className="mt-2 text-lg text-gray-600">
                Find professionals and service providers in the community.
              </p>
            </div>
            {/* Desktop Button */}
            <button
              onClick={() => router.push("/talents/new")}
              className="hidden md:flex items-center gap-2 mt-4 md:mt-0 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
            >
              <FiPlus className="text-lg" />
              Become Talent
            </button>
          </div>
        )}

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
                  isMobile
                  onApplyFilters={applyFiltersManually}
                  onClear={handleClearFilters}
                  onClose={() => setIsFilterDrawerOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Talents Grid */}
          <div className="w-full md:w-3/4">
            {talents.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-gray-200">
                <p className="text-lg text-gray-500">No talents match your search or filters</p>
                <button onClick={handleClearFilters} className="mt-4 text-black underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {talents.map((talent) => (
                  <TalentCard
                    key={talent.id}
                    talent={talent}
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
      {isMobile && !embedded && (
        <button
          onClick={() => router.push("/talents/new")}
          className="fixed bottom-18 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-800 active:scale-95 transition-all z-40"
        >
          <FiPlus className="text-2xl" />
        </button>
      )}
    </div>
  );
}
