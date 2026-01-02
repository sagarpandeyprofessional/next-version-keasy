import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const [activeSection, setActiveSection] = useState(null);

  const sidebarItems = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'membership-plans', label: 'Membership & Plans' },
    { id: 'payments-billing', label: 'Payments & Billing' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'communities-events', label: 'Communities & Events' },
    { id: 'professional-services', label: 'Professional Services' },
    { id: 'business-accounts', label: 'Business Accounts' },
    { id: 'account-support', label: 'Account & Support' },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">FAQ</h1>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Find answers to frequently asked questions about Keasy
                </p>
                <nav className="space-y-1">
                  {sidebarItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-sm hover:bg-blue-50 ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white shadow-sm rounded-lg p-6 lg:p-8">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 mb-6">
                  Find answers to common questions about <strong>Keasy (Korea Easy)</strong>, operated by Montem Flumen Inc. Our mission is to make living, working, and connecting in South Korea easier for everyone—students, foreigners, locals, and small businesses.
                </p>

                {/* Getting Started */}
                <section id="getting-started" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Getting Started</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">What is Keasy?</h3>
                  <p className="text-gray-700 mb-4">
                    Keasy (Korea Easy), operated by Montem Flumen Inc., is a comprehensive local community platform connecting people, businesses, and opportunities in South Korea. Find jobs, buy and sell in the marketplace, join communities, attend events, discover professional services, and connect with your local community all in one place.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do I create an account?</h3>
                  <p className="text-gray-700 mb-2">Creating an account is simple and free:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 mb-2 ml-4">
                    <li>Click <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link> in the navigation</li>
                    <li>Enter your email and create a secure password</li>
                    <li>Verify your email address</li>
                    <li>Choose a unique username</li>
                    <li>Complete your profile and you're ready to go!</li>
                  </ol>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Users must be at least 14 years old to create an account (Korean Youth Protection Act). Users under 19 require parental consent for certain transactions.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Is Keasy really free?</h3>
                  <p className="text-gray-700 mb-4">
                    Yes! Keasy offers a free plan for all users with access to core features including marketplace, community participation, job applications, and basic events. Premium plans unlock additional features for creators, professionals, and businesses. <Link to="/pricing" className="text-blue-600 hover:underline">View pricing →</Link>
                  </p>
                </section>

                {/* Membership & Plans */}
                <section id="membership-plans" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Membership & Plans</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">What membership tiers are available?</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                    <li><strong className="text-green-600">Free ($0):</strong> For everyone - buy & sell in marketplace, join communities, apply for jobs, and use basic Keasy AI</li>
                    <li><strong className="text-purple-600">Creator ($7.99/year):</strong> For active users - more listings, unlimited events, community management, and enhanced Keasy AI</li>
                    <li><strong className="text-indigo-600">Professional ($15.99/year):</strong> For freelancers - professional profile, service listings, bookings, portfolio, reviews, and professional-level AI</li>
                    <li><strong className="text-amber-600">Business ($39.99/year):</strong> For local businesses - everything above plus business profile, managed website, admin dashboard, and job posting</li>
                  </ul>
                  <p className="text-gray-700 mb-4">
                    <Link to="/pricing" className="text-blue-600 hover:underline font-medium">Compare all plans in detail →</Link>
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Can I upgrade or downgrade my plan?</h3>
                  <p className="text-gray-700 mb-4">
                    Yes! You can upgrade your plan anytime and changes take effect immediately. When downgrading, changes apply at the end of your current billing cycle. Access <Link to="/settings" className="text-blue-600 hover:underline">Settings</Link> to manage your subscription.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Do you offer annual discounts?</h3>
                  <p className="text-gray-700 mb-4">
                    Absolutely! Save up to 20% by paying annually. For example, Creator is only $7.99/year (save $23.98), Professional is $15.99/year (save $47.98), and Business is $39.99/year (save $119.98).
                  </p>
                </section>

                {/* Payments & Billing */}
                <section id="payments-billing" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Payments & Billing</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">What payment methods do you accept?</h3>
                  <p className="text-gray-700 mb-4">
                    We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and local payment methods through our secure payment processor Toss Payments. All transactions are encrypted and PCI-compliant.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Can I cancel my subscription?</h3>
                  <p className="text-gray-700 mb-4">
                    Yes, you can cancel anytime from your <Link to="/settings" className="text-blue-600 hover:underline">account settings</Link>. You'll retain access to paid features until the end of your current billing period. No refunds are provided for partial months or years.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">What are add-ons?</h3>
                  <p className="text-gray-700 mb-2">Add-ons are optional premium features available for Professional and Business members:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
                    <li>Promote Listings ($4.99/mo) - Boost marketplace visibility</li>
                    <li>Promote Services ($4.99/mo) - Feature your services prominently</li>
                    <li>Featured Jobs ($9.99/mo) - Get more qualified applicants</li>
                    <li>Sponsored Events ($7.99/mo) - Maximize event attendance</li>
                    <li>Brand Advertising ($14.99/mo) - Platform-wide banner ads</li>
                  </ul>
                </section>

                {/* Marketplace */}
                <section id="marketplace" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Marketplace</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do I create a marketplace listing?</h3>
                  <p className="text-gray-700 mb-4">
                    Go to <Link to="/marketplace" className="text-blue-600 hover:underline">Marketplace</Link>, click "Post Listing", add clear photos (minimum 3, up to 10), detailed description, price, and location. Identity verification required for sellers. <Link to="/marketplace_policy" className="text-blue-600 hover:underline">View marketplace policies →</Link>
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How many listings can I have?</h3>
                  <p className="text-gray-700 mb-4">
                    Free: 5 listings | Creator: 20 listings | Professional: 50 listings | Business: Unlimited listings. Maximum 3 direct transaction listings per day. One item per post (duplicate listings prohibited).
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Is it safe to buy and sell on Keasy?</h3>
                  <p className="text-gray-700 mb-4">
                    We prioritize safety with identity verification, secure messaging, and community guidelines. KoreaEasy operates as a communications sales intermediary (통신판매중개자). Always meet in public places, inspect items before purchase, and report suspicious activity. <Link to="/marketplace_policy" className="text-blue-600 hover:underline">Read safety guidelines →</Link>
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">What items can I sell?</h3>
                  <p className="text-gray-700 mb-4">
                    You can sell used goods, electronics, furniture, books, and more. Prohibited items include counterfeit goods, weapons, drugs, alcohol, tobacco, and items requiring licenses. See our <Link to="/marketplace_policy" className="text-blue-600 hover:underline">complete prohibited items list</Link>.
                  </p>
                </section>

                {/* Jobs */}
                <section id="jobs" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Jobs</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do I apply for jobs?</h3>
                  <p className="text-gray-700 mb-4">
                    Browse <Link to="/jobs" className="text-blue-600 hover:underline">job listings</Link>, click on any position to view details, and click "Apply". You can track your applications in <Link to="/jobs/applied" className="text-blue-600 hover:underline">Applied Jobs</Link>.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Can I post job openings?</h3>
                  <p className="text-gray-700 mb-4">
                    Yes! Business members can post unlimited jobs. First, <Link to="/company/register" className="text-blue-600 hover:underline">register your company</Link>, then go to <Link to="/jobs/new" className="text-blue-600 hover:underline">Post a Job</Link> to create your listing. Track applications in your <Link to="/company/profile" className="text-blue-600 hover:underline">company dashboard</Link>.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do saved jobs work?</h3>
                  <p className="text-gray-700 mb-4">
                    Click the bookmark icon on any job to save it for later. Access your saved jobs anytime from <Link to="/jobs/saved" className="text-blue-600 hover:underline">Saved Jobs</Link> page.
                  </p>
                </section>

                {/* Communities & Events */}
                <section id="communities-events" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Communities & Events</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do I join a community?</h3>
                  <p className="text-gray-700 mb-4">
                    Visit <Link to="/community" className="text-blue-600 hover:underline">Communities</Link>, browse available communities, and click "Join" on any community that interests you. All users can join unlimited communities for free.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Can I create my own community?</h3>
                  <p className="text-gray-700 mb-4">
                    Creator, Professional, and Business members can create and manage unlimited communities. Free users can participate but cannot create communities. <Link to="/pricing" className="text-blue-600 hover:underline">Upgrade to Creator →</Link>
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do events work?</h3>
                  <p className="text-gray-700 mb-4">
                    Discover local <Link to="/events" className="text-blue-600 hover:underline">events</Link> happening in your area. Free users can join events and create basic events. Creator+ members can create unlimited events with advanced features.
                  </p>
                </section>

                {/* Professional Services */}
                <section id="professional-services" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Professional Services</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">What is a Professional profile?</h3>
                  <p className="text-gray-700 mb-4">
                    Professional members get a dedicated profile to showcase services, portfolio, reviews, and accept bookings. Perfect for freelancers, consultants, and service providers. <Link to="/connect" className="text-blue-600 hover:underline">Explore professionals →</Link>
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How does the booking system work?</h3>
                  <p className="text-gray-700 mb-4">
                    Professional and Business members can accept bookings directly. Set your availability, services, and pricing. Clients book through your profile and you manage everything from your dashboard.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Can clients leave reviews?</h3>
                  <p className="text-gray-700 mb-4">
                    Yes! After completing a service, clients can leave ratings and reviews on your Professional profile. Build trust and credibility with authentic client feedback.
                  </p>
                </section>

                {/* Business Accounts */}
                <section id="business-accounts" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Business Accounts</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do I register my business?</h3>
                  <p className="text-gray-700 mb-4">
                    Upgrade to a Business plan, then <Link to="/company/register" className="text-blue-600 hover:underline">register your company</Link>. Provide business details and required documents. Approval typically takes 1-2 business days.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">What's included in the managed website?</h3>
                  <p className="text-gray-700 mb-4">
                    Your managed Keasy website includes a custom subdomain (yourbusiness.keasy.com), branded pages, integrated booking system, contact forms, and analytics. Fully mobile-responsive and SEO-optimized.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Can I add team members?</h3>
                  <p className="text-gray-700 mb-4">
                    Business members can add unlimited team members with customizable roles and permissions. Delegate tasks like managing job postings, bookings, or marketplace listings.
                  </p>
                </section>

                {/* Account & Support */}
                <section id="account-support" className="mb-8 scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Account & Support</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">I forgot my password. What do I do?</h3>
                  <p className="text-gray-700 mb-4">
                    Click <Link to="/signin" className="text-blue-600 hover:underline">Sign In</Link>, then "Forgot Password". Enter your email and we'll send reset instructions. The link is valid for 24 hours.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Can I change my username?</h3>
                  <p className="text-gray-700 mb-4">
                    Yes, usernames can be changed once every 30 days from <Link to="/settings" className="text-blue-600 hover:underline">Settings</Link>. Note that changing your username updates your profile URL.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do I contact support?</h3>
                  <p className="text-gray-700 mb-4">
                    Visit our <Link to="/contact" className="text-blue-600 hover:underline">Contact page</Link> or email us at <a href="mailto:support@koreaeasy.org" className="text-blue-600 hover:underline">support@koreaeasy.org</a>. We typically respond within 24 hours. Business members receive priority support.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">How do I delete my account?</h3>
                  <p className="text-gray-700 mb-4">
                    Go to <Link to="/settings" className="text-blue-600 hover:underline">Settings</Link> → Account → Delete Account. Warning: This is permanent and cannot be undone. All data, listings, and posts will be removed.
                  </p>
                </section>

                {/* Still Have Questions - Softer Gradient */}
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-8 lg:p-12 text-center shadow-xl mb-6">
                  <h3 className="text-white text-2xl lg:text-3xl font-bold mb-4">Still Have Questions?</h3>
                  <p className="text-white/95 text-base lg:text-lg mb-8 max-w-2xl mx-auto">
                    Can't find what you're looking for? Our support team is here to help you succeed on Keasy.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <Link
                      to="/contact"
                      className="inline-block bg-white text-blue-600 font-bold py-3 px-8 lg:py-4 lg:px-10 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Contact Support
                    </Link>
                    <Link
                      to="/about"
                      className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 lg:py-4 lg:px-10 rounded-full hover:bg-white/10 transition-all duration-300"
                    >
                      Learn More About Us
                    </Link>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
                    <Link to="/terms_of_service" className="hover:text-white hover:underline">Terms of Service</Link>
                    <span>•</span>
                    <Link to="/privacy_policy" className="hover:text-white hover:underline">Privacy Policy</Link>
                    <span>•</span>
                    <Link to="/marketplace_policy" className="hover:text-white hover:underline">Marketplace Policy</Link>
                  </div>
                </div>

                {/* Follow us on Instagram - Simple Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm lg:text-base">
                      <strong>Follow us on Instagram!</strong> Stay connected with local events, success stories, and platform updates.
                    </p>
                  </div>
                  <a
                    href="https://www.instagram.com/keasy___/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>@keasy___</span>
                  </a>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FAQPage;