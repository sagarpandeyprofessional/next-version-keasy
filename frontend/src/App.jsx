// lib
import { Routes, Route } from 'react-router-dom'

// hooks for google analytics
import useAnalytics from "./hooks/useAnalytics";

// context
import { AuthProvider } from './context/AuthContext'

// components
import Layout from './components/layout/Layout'

// pages
import Home from './pages/home/Home'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import UsernameRegistration from './pages/auth/UsernameRegister'
import Profile from './pages/profile/Profile'
import EditProfile from './pages/profile/EditProfile'

// static pages
import AboutUs from './pages/static/about/About'
import Contact from './pages/static/contact/Contact'
import FAQPage from './pages/static/faq/FAQ'
import Error404Page from './pages/static/notFound/NotFound';
import PrivacyPolicy from './pages/static/policies/PrivacyPolicy'
import TermsOfService from './pages/static/policies/TermsOfService'
import MarketplacePolicy from './pages/static/policies/MarketplacePolicy'

//features pages
import Nearby from './pages/features/nearby/Nearby'
import Community from './pages/features/community/Community'
import CommunityPost from './pages/features/community/CommunityPost'
import CommunityUpdate from './pages/features/community/CommunityUpdate'
import Blog from './pages/features/blog/Blog'

import Talent from './pages/features/talent/Talent'
import TalentDetail from './pages/features/talent/TalentDetail'
import TalentPost from './pages/features/talent/TalentPost'
import TalentEdit from './pages/features/talent/TalentEdit'

import Events from './pages/features/events/Events'
import EventPost from './pages/features/events/EventPost';
import EventUpdate from './pages/features/events/EventUpdate';
import MapComponent from './pages/features/events/EventPost'

import Marketplace from './pages/features/marketplace/Marketplace'
import MarketplaceItem from './pages/features/marketplace/MarketplaceItem'
import MarketplaceEditPage from './pages/features/marketplace/MarketplaceItemEdit'
import MarketplacePostPage from './pages/features/marketplace/MarketplacePost'
import MyListingsPage from './pages/features/marketplace/MyListings'
import SettingsPage from './pages/Settings'

import GuideDetail from './pages/features/guides/GuideDetail'
import Guides from './pages/features/guides/Guides'
import GuideEdit from './pages/features/guides/GuideEdit'
import GuideEditor from './pages/features/guides/GuidePost';
import GuideApproval from './pages/features/guides/pages/admin/GuideApproval';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Connect from './pages/features/connect/Connect';
import ProfessionalEdit from './pages/features/connect/Professional/ProfessionalEdit';
import ProfessionalNew from './pages/features/connect/Professional/ProfessionalNew';

// Toss Payment Pages
import { BrandpayCheckoutPage } from "./pages/toss/brandpay/BrandpayCheckout";
import { FailPage } from "./pages/toss/Fail";
import { PaymentBillingPage } from "./pages/toss/payment/PaymentBilling";
import { PaymentCheckoutPage } from "./pages/toss/payment/PaymentCheckout";
import { PaymentSuccessPage } from "./pages/toss/payment/PaymentSuccess";
import { BrandpaySuccessPage } from "./pages/toss/brandpay/BrandpaySuccess";
import { WidgetCheckoutPage } from "./pages/toss/widget/WidgetCheckout";
import { WidgetSuccessPage } from "./pages/toss/widget/WidgetSuccess";

// Jobs Feature
import Jobs from './pages/features/jobs/pages/Jobs';
import JobDetail from './pages/features/jobs/pages/JobDetail';
import JobPost from './pages/features/jobs/pages/JobPost';
import JobEdit from './pages/features/jobs/pages/JobEdit';
import SavedJobs from './pages/features/jobs/pages/SavedJobs';
import AppliedJobs from './pages/features/jobs/pages/AppliedJobs';
import CompanyRegister from './pages/features/jobs/pages/CompanyRegister';
import CompanyProfile from './pages/features/jobs/pages/CompanyProfile';
// import JobApproval from './pages/features/jobs/pages/admin/JobApproval';
// import CompanyApproval from './pages/features/jobs/pages/admin/CompanyApproval';
import JobApproval from './pages/features/jobs/pages/admin/JobApproval';
import CompanyApproval from './pages/features/jobs/pages/admin/CompanyApproval';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSignIn from './pages/admin/AdminSignIn';

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

        {/* All routes now just use Layout - Layout handles all auth/username logic */}
        <Route element={<Layout><Home/></Layout>} path="/" />
        <Route element={<Layout><SignIn/></Layout>} path="/signin" />
        <Route element={<Layout><SignUp/></Layout>} path="/signup" />
        <Route element={<Layout><UsernameRegistration/></Layout>} path="/username-registration" />
        <Route element={<Layout><Profile/></Layout>} path="/profile/:username" />
        <Route element={<Layout><EditProfile/></Layout>} path="/edit-profile" />
        
        {/* Static Pages */}
        <Route element={<Layout><AboutUs/></Layout>} path="/about" />
        <Route element={<Layout><Contact/></Layout>} path="/contact" />
        <Route element={<Layout><FAQPage/></Layout>} path="/faq" />
        <Route element={<Layout><Error404Page/></Layout>} path="*" />

        {/* Policies */}
        <Route element={<Layout><PrivacyPolicy /></Layout>} path='/privacy_policy' />
        <Route element={<Layout><TermsOfService /></Layout>} path='/terms_of_service' />
        <Route element={<Layout><MarketplacePolicy /></Layout>} path='/marketplace_policy' />
        
        {/* Features Pages */}
        <Route element={<Layout><Blog/></Layout>} path="/blog" />
        <Route element={<Layout><Nearby/></Layout>} path="/nearby" />

        <Route element={<Layout><Guides/></Layout>} path="/guides" />
        <Route element={<Layout><GuideDetail/></Layout>} path="/guides/guide/:id" />
        <Route element={<Layout><GuideEdit/></Layout>} path="/guides/edit/:id" />
        <Route element={<Layout><GuideEditor/></Layout>} path="/guides/new" />
        
        <Route element={<Layout><Community/></Layout>} path="/community" />
        <Route element={<Layout><CommunityPost/></Layout>} path="/community/new" />
        <Route element={<Layout><CommunityUpdate/></Layout>} path="/community/edit/:id" />

        <Route element={<Layout><Connect /></Layout>} path='/connect' />
        <Route element={<Layout><ProfessionalEdit /></Layout>} path='/connect/professional/edit' />
        <Route element={<Layout><ProfessionalNew /></Layout>} path='/connect/professional/new' />

        
        {/* Jobs Feature */}
        <Route element={<Layout><Jobs/></Layout>} path='/jobs'/>
        <Route element={<Layout><JobDetail/></Layout>} path='/jobs/job/:id'/>
        <Route element={<Layout><JobPost/></Layout>} path='/jobs/new'/>
        <Route element={<Layout><JobEdit/></Layout>} path='/jobs/edit/:id'/>
        <Route element={<Layout><SavedJobs/></Layout>} path='/jobs/saved'/>
        <Route element={<Layout><AppliedJobs/></Layout>} path='/jobs/applied'/>
        <Route element={<Layout><CompanyRegister/></Layout>} path='/company/register'/>
        <Route element={<Layout><CompanyProfile/></Layout>} path='/company/profile'/>
        <Route element={<AdminSignIn/>} path='/admin/signin'/>
        <Route element={<Layout><AdminDashboard/></Layout>} path='/admin'/>
        <Route element={<Layout><JobApproval/></Layout>} path='/admin/jobs'/>
        <Route element={<Layout><CompanyApproval/></Layout>} path='/admin/companies'/>
        <Route element={<Layout><GuideApproval/></Layout>} path='/admin/guides'/>

        <Route element={<Layout><Talent /></Layout>} path='/talents' />
        <Route element={<Layout><TalentDetail /></Layout>} path='/talents/:id' />
        <Route element={<Layout><TalentPost /></Layout>} path='/talents/new' />
        <Route element={<Layout><TalentEdit /></Layout>} path='/talents/edit/:id' />

        <Route element={<Layout><Events /></Layout>} path='/events' />
        <Route element={<Layout><MapComponent /></Layout>} path='/events/new' />
        <Route path="/events/edit/:id" element={<EventUpdate />} />

        <Route element={<Layout><Marketplace /></Layout>} path='/marketplace' />
        <Route element={<Layout><MarketplaceItem /></Layout>} path='/marketplace/:id' />
        <Route element={<Layout><MarketplaceEditPage /></Layout>} path='/marketplace/edit/:id'/> 
        <Route element={<Layout><MarketplacePostPage /></Layout>} path='/marketplace/post' />
        <Route element={<Layout><MyListingsPage /></Layout>} path='/marketplace/my' />
        <Route element={<Layout><SettingsPage/></Layout>} path='/settings'/>
        <Route element={<LoadingComp />} path='/loading' />

        {/* Toss Payment Routes */}
        <Route
          path="/toss"
          element={
            <Layout>
              <WidgetCheckoutPage />
            </Layout>
          }
        />

        {/* Widget Routes */}
        <Route
          path="/toss/widget/checkout"
          element={
            <Layout>
              <WidgetCheckoutPage />
            </Layout>
          }
        />
        <Route
          path="/toss/widget/success"
          element={
            <Layout>
              <WidgetSuccessPage />
            </Layout>
          }
        />

        {/* Payment Routes */}
        <Route
          path="/toss/payment/checkout"
          element={
            <Layout>
              <PaymentCheckoutPage />
            </Layout>
          }
        />
        <Route
          path="/toss/payment/billing"
          element={
            <Layout>
              <PaymentBillingPage />
            </Layout>
          }
        />
        <Route
          path="/toss/payment/success"
          element={
            <Layout>
              <PaymentSuccessPage />
            </Layout>
          }
        />

        {/* BrandPay Routes */}
        <Route
          path="/toss/brandpay/checkout"
          element={
            <Layout>
              <BrandpayCheckoutPage />
            </Layout>
          }
        />
        <Route
          path="/toss/brandpay/success"
          element={
            <Layout>
              <BrandpaySuccessPage />
            </Layout>
          }
        />

        {/* Fail Page */}
        <Route
          path="/toss/fail"
          element={
            <Layout>
              <FailPage />
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App

const LoadingComp = () => {
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

