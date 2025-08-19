import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { profile, user, signOut, loading } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => {
    if (!loading) setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out from navbar:', error);
    }
  };

  const getUserDisplayName = () => (profile?.username ? `@${profile.username}` : 'User');
  const getUserInitials = () => (profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'U');
  const isAuthenticated = user !== null && !loading;

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-black dark:text-white">keasy</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex md:space-x-8">
            <Link to="/" className="font-medium text-black hover:underline dark:text-white">Home</Link>
            <Link to="/marketplace" className="font-medium text-black hover:underline dark:text-white">Marketplace</Link>
            <Link to="/events" className="font-medium text-black hover:underline dark:text-white">Events</Link>
            <Link to="/blog" className="font-medium text-black hover:underline dark:text-white">Blog</Link>
            <Link to="/community" className="font-medium text-black hover:underline dark:text-white">Community</Link>
            <Link to="/nearby" className="font-medium text-black hover:underline dark:text-white">Nearby</Link>
          </nav>

          {/* Auth / User Menu (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-black dark:border-gray-600 dark:text-white">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white"></div>
                <span>Verifying...</span>
              </div>
            ) : isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                >
                  {profile?.pfp_url ? (
                    <div className="relative h-6 w-6 overflow-hidden rounded-full">
                      <img
                        src={profile.pfp_url}
                        alt={getUserDisplayName()}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.className =
                            'flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:bg-gray-700';
                          e.currentTarget.parentElement.textContent = getUserInitials();
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:bg-gray-700">
                      {getUserInitials()}
                    </div>
                  )}
                  <span>{getUserDisplayName()}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-900 dark:ring-gray-700 z-50">
                    <Link
                      to={`/profile/${profile?.username || 'user'}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/marketplace/my"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="rounded-md px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
            >
              <span className="sr-only">Open Main Menu</span>
              {!isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2">
            <div className="space-y-1 px-2 pt-2 pb-3">
              <Link to="/" className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline dark:text-white dark:hover:bg-gray-800">Home</Link>
              <Link to="/marketplace" className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline dark:text-white dark:hover:bg-gray-800">Marketplace</Link>
              <Link to="/events" className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline dark:text-white dark:hover:bg-gray-800">Events</Link>
              <Link to="/blog" className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline dark:text-white dark:hover:bg-gray-800">Blog</Link>
              <Link to="/community" className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline dark:text-white dark:hover:bg-gray-800">Community</Link>
              <Link to="/nearby" className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline dark:text-white dark:hover:bg-gray-800">Nearby</Link>

              {/* Mobile Auth */}
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                    >
                      {profile?.pfp_url ? (
                        <div className="relative h-6 w-6 overflow-hidden rounded-full">
                          <img src={profile.pfp_url} alt={getUserDisplayName()} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:bg-gray-700">{getUserInitials()}</div>
                      )}
                      <span>{getUserDisplayName()}</span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-900 dark:ring-gray-700 z-50">
                        <Link
                          to={`/profile/${profile?.username || 'user'}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/marketplace/my"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                        >
                          My Listings
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/signin" className="block rounded-md px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">Sign in</Link>
                    <Link to="/signup" className="block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;