import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'

// context
import { AuthProvider } from './context/AuthContext'

// components
import Layout from './components/layout/Layout'
import PrivateRoute from './components/privateRoute/PrivateRoute'

// main pages
import Home from './pages/home/Home'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Profile from './pages/profile/Profile'
import EditProfile from './pages/profile/EditProfile'

// static Pages
import About from './pages/static/about/About'
import Contact from './pages/static/contact/Contact'
import FAQ from './pages/static/faq/FAQ'

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
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Main Pages */}
          <Route element={<Layout><SignIn/></Layout>} path="/sign-in" />
          <Route element={<Layout><SignUp/></Layout>} path="/sign-up" />
          <Route element={<Layout><Home/></Layout>} path="/" />
          <Route element={<Layout><PrivateRoute><Profile/></PrivateRoute></Layout>} path="/:username" />
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
