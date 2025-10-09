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
  const upcomingRoutes = ['/blog', '/nearby', '/community', '/events', `/profile/id`, '"/edit-profile/', '', '/marketplace/post', '/marketplace/my', `/marketplace/id`, `/marketplace/edit/id`, '/settings', '/about', '/contact', '/faq', '/blog/', '/nearby/', '/community/', '/events/', '', '/profile/id/', '/edit-profile/', '/marketplace/id/', '/marketplace/edit/id/'];
  const showUpcoming = upcomingRoutes.includes(location.pathname);

  // Routes that don't require authentication at all
  const publicRoutes = [
    '/signin', 
    '/signup', 
    '/about', 
    '/contact', 
    '/faq',
    '/blog',
    '/nearby',
    '/guides',
    '/community',
    '/events',
    '/marketplace',
    '/',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Sidebar />

      <div className="relative flex-grow lg:flex lg:justify-center">
  <div className={`w-full md:w-4/5 sm:w-full px-4 ${showUpcoming ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
    {children}
  </div>
  {showUpcoming && <ComingSoonOverlay />}
</div>


      <Footer />
    </div>
  );
};

export default Layout;