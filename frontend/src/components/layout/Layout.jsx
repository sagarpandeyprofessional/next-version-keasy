import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ComingSoonOverlay from './Upcoming';

const Layout = ({ children }) => {
  const location = useLocation();

  // Define routes where the feature is upcoming
  const upcomingRoutes = ['/blog', '/nearby', '/community', '/events', '/marketplace', '/marketplace/post', '/marketplace/my', 'settings']; // add routes you want to block
  const showUpcoming = upcomingRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="relative flex-grow">
        {/* Blur content if needed */}
        <div className={`${showUpcoming ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
          {children}
        </div>

        {/* Overlay text if needed */}
        {showUpcoming && <ComingSoonOverlay />}
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
