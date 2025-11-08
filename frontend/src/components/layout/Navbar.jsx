import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../api/supabase-client"; // Adjust the import path as needed

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

  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (user) {
      navigate(`/profile/${profile?.username || "user"}`);
    } else {
      navigate("/signin");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-sm dark:bg-white">
        <div className="container mx-auto px-4 lg:pl-24">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex flex-shrink-0 lg:-ml-18">
              <div className="text-2xl font-bold text-blue-600">
                keasy
              </div>
            </Link>

            {/* Search + User */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg transition-colors"
              >
                <FiSearch className="h-5 w-5 text-blue-600" />
              </button>

              {/* User */}
<button
  onClick={handleUserClick}
  className="flex flex-col items-center justify-center h-12 w-12 rounded-full text-blue-600 hover:bg-blue-50 transition-all duration-200"
>
  {user && profile?.pfp_url ? (
    <img
      src={profile.pfp_url}
      alt={profile.username}
      className="h-10 w-10 rounded-full object-cover border border-blue-200"
    />
  ) : (
    <>
      <FiUser className="h-6 w-6 mb-0.5" />
      {/* <span className="text-[10px] font-medium leading-tight text-gray-600">
        Sign up
      </span> */}
    </>
  )}
</button>

            </div>
          </div>
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