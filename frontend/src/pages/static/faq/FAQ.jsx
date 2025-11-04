import React, { useState, useEffect } from 'react';

const FAQPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const sidebarItems = [
    { id: 'company-policies', label: 'Company Policies' },
    { id: 'payment-options', label: 'Payment Options' },
    { id: 'terms-conditions', label: 'Terms & Conditions' },
    { id: 'positioning', label: 'Positioning' },
    { id: 'efficient', label: 'Efficient' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'mind-procedure', label: 'Mind Procedure' },
    { id: 'delivery-job', label: 'Delivery Job' },
    { id: 'marketplace', label: 'Marketplace' },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 lg:mb-8">FAQ</h1>
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Successful brands get into the mind slowly.<br />
                    A blurb in a magazine. A mention in a newspaper. A comment from a friend. A display in a retail
                  </p>
                  <nav className="space-y-2">
                    {sidebarItems.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 text-sm lg:text-base hover:bg-white hover:shadow-sm transform hover:translate-x-1 ${
                          activeSection === item.id
                            ? 'bg-white text-blue-600 font-semibold shadow-sm'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeInLeft 0.5s ease-out forwards',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-12 lg:space-y-16">
            {/* Company Policies Section */}
            <section
              id="company-policies"
              className="animate-on-scroll opacity-0 transition-all duration-700"
              style={{
                opacity: isVisible['company-policies'] ? 1 : 0,
                transform: isVisible['company-policies'] ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              <div className="mb-4">
                <span className="text-orange-500 text-xs lg:text-sm font-semibold tracking-wider uppercase">
                  Company Policies
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                You Can Learn About Company Policies Gide, Some Rules, and Useful Info
              </h2>
              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                The company policies guide is useful information for clients. You can learn about company rules regarding payment methods, shipping, support, etc. If you have questions you can always study this guide to find necessary answers for you, or use a contact form.
              </p>
            </section>

            {/* Payment Options Section */}
            <section
              id="payment-options"
              className="animate-on-scroll opacity-0 transition-all duration-700"
              style={{
                opacity: isVisible['payment-options'] ? 1 : 0,
                transform: isVisible['payment-options'] ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              <div className="mb-4">
                <span className="text-orange-500 text-xs lg:text-sm font-semibold tracking-wider uppercase">
                  Payment Options
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                Do You Want To Know More About Payment Options? Here Is All You Need to Know
              </h2>
              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                If you need to know more about payment options. You can use your PayPal account to make a purchase. You need to know the email address to make a payment. You can also use your credit card to make a purchase. You can make a payment anywhere you want.
              </p>
            </section>

            {/* Terms & Conditions Section */}
            <section
              id="terms-conditions"
              className="animate-on-scroll opacity-0 transition-all duration-700"
              style={{
                opacity: isVisible['terms-conditions'] ? 1 : 0,
                transform: isVisible['terms-conditions'] ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              <div className="mb-4">
                <span className="text-orange-500 text-xs lg:text-sm font-semibold tracking-wider uppercase">
                  Terms & Conditions
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                The Terms of this Agreement Concerns Everyone Who Has Access to the Website
              </h2>
              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                Everyone who has access to the website need to be aware of these terms. You need to maintain your rights and obligations. Some guidelines facilitate the use of this wonderful website. Learning these guidelines can have some benefits.
              </p>
            </section>

            {/* Delivery Job Section */}
            <section
              id="delivery-job"
              className="animate-on-scroll opacity-0 transition-all duration-700"
              style={{
                opacity: isVisible['delivery-job'] ? 1 : 0,
                transform: isVisible['delivery-job'] ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              <div className="mb-4">
                <span className="text-orange-500 text-xs lg:text-sm font-semibold tracking-wider uppercase">
                  Delivery Job
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                Learn More About the Delivery Job We Provide. This Can Be Useful Information
              </h2>
              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                Delivery is an important part of our daily routine. The key to success is the right timing. We pay attention to the speed, but what is most important, we care about the quality of our job. We can assure you that your order will be delivered in time.
              </p>
            </section>

            {/* About Us Section with Images */}
            <section
              id="positioning"
              className="animate-on-scroll opacity-0 transition-all duration-700"
              style={{
                opacity: isVisible['positioning'] ? 1 : 0,
                transform: isVisible['positioning'] ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12">
                <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                    alt="Team collaboration"
                    className="w-full h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <p className="text-white font-semibold text-lg">Building Communities</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <img
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop"
                    alt="Team working together"
                    className="w-full h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <p className="text-white font-semibold text-lg">Innovation & Growth</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Instagram CTA */}
            <section className="mt-12 lg:mt-16">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 lg:p-12 text-center shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-full shadow-lg animate-bounce flex items-center justify-center">
                    <img
                      src="/team/insta/icon.jpg"
                      alt="Instagram"
                      className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover"
                    />
                  </div>

                </div>
                <h3 className="text-white text-2xl lg:text-3xl font-bold mb-4">Follow Us on Instagram</h3>
                <p className="text-white/90 text-base lg:text-lg mb-8">
                  Join our community and stay updated with the latest news and updates
                </p>
                <a
                  href="https://www.instagram.com/keasy_community/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-pink-600 font-bold py-3 px-8 lg:py-4 lg:px-10 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                >
                  Follow Now
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FAQPage;