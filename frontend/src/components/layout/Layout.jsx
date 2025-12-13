import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ComingSoonOverlay from './Upcoming';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../api/supabase-client';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();

  // Define routes where the feature is upcoming
  const upcomingRoutes = ['/blog', '/nearby', `/profile/id`, '/marketplace/my', '/settings',  '/blog/', '/nearby/'];
  const showUpcoming = upcomingRoutes.includes(location.pathname);

  // Routes that don't require authentication at all
  const publicRoutes = [
    '/privacy_policy',
    '/privacy_policy/',
    '/terms_of_service',
    '/terms_of_service/',
    '/signin', 
    '/signup', 
    '/about', 
    '/faq',
    '/blog',
    '/nearby',
    '/guides',
    '/community',
    '/events',
    '/marketplace',
    '/',
    '/connect',
    '/connect/'
  ];

  // Routes that allow partial access (can see guide/marketplace details without auth)
  const publicGuideRoutes = location.pathname.startsWith('/guides/guide/');
  const publicMarketplaceRoutes = location.pathname.startsWith('/marketplace/') && 
    location.pathname !== '/marketplace/post' && 
    !location.pathname.includes('/edit') && 
    location.pathname !== '/marketplace/my';

  // Check if current route is completely public (no auth needed)
  const isPublicRoute = publicRoutes.includes(location.pathname) || publicGuideRoutes || publicMarketplaceRoutes;

  // FIXED: Only username registration page should be accessible for authenticated users without username
  const isUsernameRegistrationPage = location.pathname === '/username-registration';

  useEffect(() => {
    // Don't do anything while loading
    if (loading) return;

    // CASE 1: Not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
      navigate('/signin');
      return;
    }

    // CASE 2: Authenticated but no username/profile
    if (session && (!profile || !profile.username)) {
      // If NOT on username registration page, redirect there
      if (!isUsernameRegistrationPage) {
        navigate('/username-registration');
        return;
      }
      // If already on username registration page, let them stay
    }

    // CASE 3: On username registration but already has username
    if (isUsernameRegistrationPage && session && profile?.username) {
      navigate('/');
      return;
    }

  }, [session, profile, loading, location.pathname, navigate, isPublicRoute, isUsernameRegistrationPage]);

  // Show loading while checking auth state
  if (loading) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div className="flex flex-col items-center">
        {/* SVG spinner */}
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>

        {/* Text animation */}
        <span className="mt-3 text-blue-700 font-semibold text-lg animate-pulse">
          keasy
        </span>
      </div>
    </div>
  );
}


  const isHome = location.pathname === '/';

  return (
  <div className="flex min-h-screen flex-col">
      <Navbar />
      <Sidebar />

      <div className={`relative flex-grow ${isHome ? '' : 'lg:flex lg:justify-center'}`}>
  <div className={`w-full ${!isHome ? 'md:w-4/5' : ''} mx-auto ${isHome ? 'px-0' : 'px-1'} pb-20 lg:pb-0 ${showUpcoming ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
    {children}
  </div>
  {showUpcoming && <ComingSoonOverlay />}
</div>


      <Footer />
    </div>
  );
};

export default Layout;