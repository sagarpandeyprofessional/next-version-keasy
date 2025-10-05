import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    setIsSearchOpen(false);
  };

  const handleUserClick = () => {
    if (user) {
      navigate(`/profile/${profile?.username || "user"}`);
    } else {
      navigate("/signin");
    }
  };

  const getUserInitials = () =>
    profile?.username ? profile.username.substring(0, 2).toUpperCase() : "U";

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm dark:bg-white">
      <div className="container mx-auto px-4 lg:pl-24">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="text-2xl font-bold text-blue-600">Keasy</div>
          </Link>

          {/* Search + User */}
          <div className="flex items-center gap-2">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-800" />
                  <input
                    type="text"
                    placeholder="Search guides, events, marketplace..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-black bg-white"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="h-4 w-4 text-gray-800" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiSearch className="h-5 w-5 text-gray-800" />
              </button>
            )}

            {/* User */}
            <button
              onClick={handleUserClick}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {profile?.pfp_url ? (
                <img
                  src={profile.pfp_url}
                  alt={profile.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">{getUserInitials()}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
