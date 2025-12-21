import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiX, FiUser, FiMenu, FiHome, FiShoppingBag, FiCalendar, FiUsers, FiBookOpen } from "react-icons/fi";
import { UserRoundCheck } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../api/supabase-client";

const SearchModal = ({ isOpen, onClose, searchQuery, setSearchQuery }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchData = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchTerm = `%${searchQuery.toLowerCase()}%`;

        // Search all tables at once and wait for all to complete
        const [marketplaceData, profilesData, communityData, eventsData, guidesData] = await Promise.all([
          // Search Marketplace
          supabase
            .from("marketplace")
            .select("id, title, location")
            .or(`title.ilike.${searchTerm},location.ilike.${searchTerm}`)
            .limit(5)
            .then(response => response)
            .catch(() => ({ data: [], error: null })),
          
          // Search Profiles
          supabase
            .from("profiles")
            .select("id, username, pfp_url")
            .ilike("username", searchTerm)
            .limit(5)
            .then(response => response)
            .catch(() => ({ data: [], error: null })),
          
          // Search Community
          supabase
            .from("community")
            .select("id, name, description")
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5)
            .then(response => response)
            .catch(() => ({ data: [], error: null })),
          
          // Search Events
          supabase
            .from("events")
            .select("id, name, description, location")
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
            .limit(5)
            .then(response => response)
            .catch(() => ({ data: [], error: null })),
          
          // Search Guides
          supabase
            .from("guide")
            .select("id, name, description")
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5)
            .then(response => response)
            .catch(() => ({ data: [], error: null })),
        ]);

        // Combine all results at once after all queries complete
        const allResults = [
          ...(marketplaceData.data || []).map(item => ({
            id: `marketplace-${item.id}`,
            type: "marketplace",
            title: item.title,
            category: "Marketplace",
            data: item
          })),
          ...(profilesData.data || []).map(item => ({
            id: `profile-${item.id}`,
            type: "profile",
            title: item.username,
            category: "Users",
            data: item
          })),
          ...(communityData.data || []).map(item => ({
            id: `community-${item.id}`,
            type: "community",
            title: item.name,
            category: "Community",
            data: item
          })),
          ...(eventsData.data || []).map(item => ({
            id: `event-${item.id}`,
            type: "event",
            title: item.name,
            category: "Events",
            data: item
          })),
          ...(guidesData.data || []).map(item => ({
            id: `guide-${item.id}`,
            type: "guide",
            title: item.name,
            category: "Guides",
            data: item
          })),
        ];

        setResults(allResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search - wait 1 second after user stops typing
    const timeoutId = setTimeout(searchData, 1000);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (result) => {
    // Navigate based on result type
    switch (result.type) {
      case "guide":
        navigate(`/guides/guide/${result.data.id}`);
        break;
      case "event":
        navigate(`/events/`);
        break;
      case "marketplace":
        navigate(`/marketplace/${result.data.id}`);
        break;
      case "profile":
        navigate(`/profile/${result.data.username}`);
        break;
      case "community":
        navigate(`/community/`);
        break;
      default:
        console.log("Clicked:", result);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-blue-600/5 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl mx-4 bg-white/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides, events, marketplace, users, community..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black/80"
              autoFocus
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Searching...</p>
            </div>
          ) : searchQuery && results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {result.type === "profile" && result.data.pfp_url ? (
                      <img 
                        src={result.data.pfp_url} 
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    ) : result.type === "profile" ? (
                      <img
                        src="https://ltfgerwmkbyxfaebxucc.supabase.co/storage/v1/object/public/app_bucket/pfp_logo.jpg"
                        alt="Default Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiSearch className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{result.title}</h3>
                    <p className="text-sm text-gray-500">{result.category}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FiSearch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search...</p>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleUserClick = () => {
    if (user) {
      navigate(`/profile/${profile?.username || "user"}`);
    } else {
      navigate("/signin");
    }
  };

  // Navigation items
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Events", path: "/events" },
    { name: "Community", path: "/community" },
    { name: "Guides", path: "/guides" },
    { name: "Connect", path: "/connect" },
    { name: "Jobs", path: "/jobs" },
    { name: "About", path: "/about" },
  ];

  // Check if current path matches nav item
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items with icons
  const navItemsWithIcons = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Marketplace", path: "/marketplace", icon: FiShoppingBag },
    { name: "Events", path: "/events", icon: FiCalendar },
    { name: "Community", path: "/community", icon: FiUsers },
    { name: "Guides", path: "/guides", icon: FiBookOpen },
    { name: "Connect", path: "/connect", icon: UserRoundCheck },
    { name: "About", path: "/about", icon: FiUser },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden lg:block sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-[3%]">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <div className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                keasy
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side: Search + User */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <FiSearch className="h-5 w-5 text-gray-700" />
              </button>

              {/* User Button */}
              <button
                onClick={handleUserClick}
                className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-200"
                aria-label="User profile"
              >
                {user && profile?.pfp_url ? (
                  <img
                    src={profile.pfp_url}
                    alt={profile.username}
                    className="h-9 w-9 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <FiUser className="h-5 w-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar - Logo + Search Only */}
      <div className="lg:hidden sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-[3%]">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <div className="text-xl font-bold text-blue-600">
                keasy
              </div>
            </Link>

            <div className="flex flex-row">
              {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <FiSearch className="h-5 w-5 text-gray-700" />
            </button>

            {/* User Button */}
              <button
                onClick={handleUserClick}
                className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-200"
                aria-label="User profile"
              >
                {user && profile?.pfp_url ? (
                  <img
                    src={profile.pfp_url}
                    alt={profile.username}
                    className="h-7 w-7 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <FiUser className="h-5 w-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation with Icons */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItemsWithIcons.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all ${
                  active
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          {/* User Icon in Mobile Bottom Nav */}
          <button
            onClick={handleUserClick}
            className="flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all text-gray-600 hover:text-blue-600"
          >
            {user && profile?.pfp_url ? (
              <img
                src={profile.pfp_url}
                alt={profile.username}
                className="h-6 w-6 rounded-full object-cover border-2 border-blue-200"
              />
            ) : (
              <FiUser className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium text-gray-500">
              {user ? "Profile" : "Sign In"}
            </span>
          </button>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery("");
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </>
  );
};

export default Navbar;