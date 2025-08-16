// lib
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// css
import './App.css'

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
import Post from './pages/features/marketplace/MarketplacePost'
import MyListingPage from './pages/features/marketplace/MyListing'
import MarketplaceItemPage from './pages/features/marketplace/MarketplaceItem'
import MarketplaceItemEdit from './pages/features/marketplace/MarketplaceItemEdit'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
           {/* Main Pages */}
          <Route element={<Layout><SignIn/></Layout>} path="/signin" />
          <Route element={<Layout><SignUp/></Layout>} path="/signup" />
          <Route element={<Layout><Home/></Layout>} path="/" />
          <Route element={<Layout><PrivateRoute><Profile/></PrivateRoute></Layout>} path="/profile/:username" />
          <Route element={<Layout><PrivateRoute><EditProfile/></PrivateRoute></Layout>} path="/edit-profile" />

          {/* Static Pages */}
          <Route element={<Layout><About/></Layout>} path="/about" />
          <Route element={<Layout><Contact/></Layout>} path="/contact" />
          <Route element={<Layout><FAQ/></Layout>} path="/faq" />
          
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
      </Router>
    </AuthProvider>
  )
}

export default App
