// lib
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// hooks for google analytics
import useAnalytics from "./hooks/useAnalytics";

// context
import { AuthProvider, useAuth } from './context/AuthContext'

// private route
import PrivateRoute from './components/privateRoute/PrivateRoute'

// components
import Layout from './components/layout/Layout'

// pages
import Home from './pages/home/Home'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Profile from './pages/profile/Profile'
import EditProfile from './pages/profile/EditProfile'

// static pages
import About from './pages/static/about/About'
import Contact from './pages/static/contact/Contact'
import FAQ from './pages/static/faq/FAQ'

//features pages
import Nearby from './pages/features/nearby/Nearby'
import Community from './pages/features/community/Community'
import Blog from './pages/features/blog/Blog'
import Events from './pages/features/events/Events'
import Marketplace from './pages/features/marketplace/Marketplace'
import MarketplaceItem from './pages/features/marketplace/MarketplaceItem'
import EditMarketplaceItemPage from './pages/features/marketplace/MarketplaceItemEdit'
import PostMarketplaceItem from './pages/features/marketplace/MarketplacePost'
import MyListingsPage from './pages/features/marketplace/MyListings'
import SettingsPage from './pages/Settings'
import GuideDetail from './pages/features/guides/GuideDetail'
import Guides from './pages/features/guides/Guides'
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // or 'auto' if you want instant scroll
    });
  }, [pathname]);

  return null;
};

function App() {
  // func for google analytics
  useAnalytics();
  
  return (
    <AuthProvider>
        <ScrollToTop />
          <Routes>
            {/* Main Pages */}
            <Route element={<Layout><Home/></Layout>} path="/" />
            <Route element={<Layout><SignIn/></Layout>} path="/signin" />
            <Route element={<Layout><SignUp/></Layout>} path="/signup" />
            <Route element={<Layout><PrivateRoute><Profile/></PrivateRoute></Layout>} path="/profile/:username" />
            <Route element={<Layout><PrivateRoute><EditProfile/></PrivateRoute></Layout>} path="/edit-profile" />
            
            {/* Static Pages */}
            <Route element={<Layout><About/></Layout>} path="/about" />
            <Route element={<Layout><Contact/></Layout>} path="/contact" />
            <Route element={<Layout><FAQ/></Layout>} path="/faq" />
            
            {/* Features Pages  */}
            <Route element={<Layout><Blog/></Layout>} path="/blog" />
            
            
            <Route element={<Layout><Nearby/></Layout>} path="/nearby" />

            <Route element={<Layout><Guides/></Layout>} path="/guides" />
            <Route element={<Layout><GuideDetail/></Layout>} path="/guides/guide/:id" />
            
            <Route element={<Layout><Community/></Layout>} path="/community" />
            <Route element={<Layout><Events /></Layout>} path='/events' />


            <Route element={<Layout><Marketplace /></Layout>} path='/marketplace' />
            <Route element={<Layout><MarketplaceItem /></Layout>} path='/marketplace/:id' />
            <Route element={<Layout><PrivateRoute><EditMarketplaceItemPage /></PrivateRoute></Layout>} path='/marketplace/edit/:id'/> 
            <Route element={<Layout><PrivateRoute>  <PostMarketplaceItem />  </PrivateRoute></Layout>} path='/marketplace/post' />
            <Route element={<Layout><PrivateRoute><MyListingsPage /></PrivateRoute></Layout>} path='/marketplace/my' />
            <Route element={<Layout><PrivateRoute><SettingsPage/></PrivateRoute></Layout>} path='/settings'/>

          </Routes>
    </AuthProvider>
  )
}

export default App