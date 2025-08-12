import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// context
// import { AuthProvider } from './context/useAuth'

// components
import Layout from './components/layout/Layout'
import PrivateRoute from './components/layout/PrivateRoute'

// main pages
import Home from './pages/home/Home'
import Login from './pages/auth/login/Login'
import Register from './pages/auth/register/Register'
import Profile from './pages/profile/Profile'
import EditProfile from './pages/profile/EditProfile'

// static pages
import About from './pages/staticPages/about/About'
import Contact from './pages/staticPages/contact/Contact'
import FAQ from './pages/staticPages/faq/FAQ'

// features pages
import Nearby from './pages/features/nearby/Nearby'
import Community from './pages/features/community/Community'
import Blog from './pages/features/blog/Blog'
import Events from './pages/features/events/Events'
import Marketplace from './pages/features/marketplace/Marketplace'
import Post from './pages/features/marketplace/MarketplacePost'
import MyListingPage from './pages/features/marketplace/MyListing'
import MarketplaceItemPage from './pages/features/marketplace/MarketplaceItem'
import MarketplaceItemEdit from './pages/features/marketplace/MarketplaceItemEdit'


function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Main Pages */}
          <Route element={<Layout><Home /></Layout>} path='/' />
          <Route element={<Layout><Login /></Layout>} path='/login' />
          <Route element={<Layout><Register /></Layout>} path='/register' />
          <Route element={<Layout><PrivateRoute><Profile /></PrivateRoute></Layout>} path='/:username' />
          <Route element={<Layout><PrivateRoute><EditProfile /></PrivateRoute></Layout>} path='/edit-profile' />
          {/* Static Pages */}
          <Route element={<Layout><About /></Layout>} path='/about' />
          <Route element={<Layout><Contact /></Layout>} path='/contact' />
          <Route element={<Layout><FAQ /></Layout>} path='/faq' />
          {/* Features Pages */}
          <Route element={<Layout><Nearby /></Layout>} path='/nearby' />
          
          <Route element={<Layout><Community /></Layout>} path='/community' />

          <Route element={<Layout><Blog /></Layout>} path='/blog' />

          <Route element={<Layout><Events /></Layout>} path='/events' />

          <Route element={<Layout><Marketplace /></Layout>} path='/marketplace' />
          <Route element={<Layout><Post /></Layout>} path='/marketplace/post' />
          <Route element={<Layout><MyListingPage /></Layout>} path='/marketplace/my' />
          <Route element={<Layout><MarketplaceItemPage /></Layout>} path='/marketplace/1' />
          <Route element={<Layout><MarketplaceItemEdit /></Layout>} path='/marketplace/1/edit' />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
