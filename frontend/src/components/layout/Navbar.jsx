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
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
              <span className="text-xl font-bold text-black">keasy</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex md:space-x-8">
            <Link to="/guides" className="font-medium text-black hover:underline">Guide</Link>
            <Link to="/marketplace" className="font-medium text-black hover:underline">Marketplace</Link>
            <Link to="/events" className="font-medium text-black hover:underline">Events</Link>
            <Link to="/blog" className="font-medium text-black hover:underline">Blog</Link>
            <Link to="/community" className="font-medium text-black hover:underline">Community</Link>
            <Link to="/nearby" className="font-medium text-black hover:underline">Nearby</Link>
          </nav>

          {/* Auth / User Menu (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-black">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black"></div>
                <span>Verifying...</span>
              </div>
            ) : isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100"
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
                            'flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white';
                          e.currentTarget.parentElement.textContent = getUserInitials();
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                      {getUserInitials()}
                    </div>
                  )}
                  <span>{getUserDisplayName()}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <Link
                      to={`/profile/${profile?.username || 'user'}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/marketplace/my"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100"
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
                  className="rounded-md px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
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
              className="inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-gray-100"
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
              <Link to="/guides"  onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline">Guide</Link>
              <Link to="/marketplace"  onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline">Marketplace</Link>
              <Link to="/events"  onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline">Events</Link>
              <Link to="/blog"  onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline">Blog</Link>
              <Link to="/community"  onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline">Community</Link>
              <Link to="/nearby"  onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-100 hover:underline">Nearby</Link>

              {/* Mobile Auth */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100"
                    >
                      {profile?.pfp_url ? (
                        <div className="relative h-6 w-6 overflow-hidden rounded-full">
                          <img src={profile.pfp_url} alt={getUserDisplayName()} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">{getUserInitials()}</div>
                      )}
                      <span>{getUserDisplayName()}</span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <Link
                          to={`/profile/${profile?.username || 'user'}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/marketplace/my"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          My Listings
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/signin"  onClick={() => setIsMenuOpen(false)} className="block rounded-md px-4 py-2 text-sm font-medium text-black hover:bg-gray-100">Sign in</Link>
                    <Link to="/signup"  onClick={() => setIsMenuOpen(false)} className="block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Sign Up</Link>
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
