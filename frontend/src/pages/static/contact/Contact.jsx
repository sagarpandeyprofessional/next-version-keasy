import React, { useState, useEffect, use } from 'react';
import { supabase } from '../../../api/supabase-client';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router';

const ContactPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: user ? user.id : null,
    name: '',
    email: '',
    phone_number: '',
    message: ''
  });
  const [isVisible, setIsVisible] = useState({});
  const [focusedField, setFocusedField] = useState(null);

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

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Check if it starts with 82 (country code)
    if (numbers.startsWith('82')) {
      const withoutCountry = numbers.slice(2);
      
      if (withoutCountry.length === 0) {
        return '+82';
      } else if (withoutCountry.length <= 3) {
        return `+82 (${withoutCountry}`;
      } else if (withoutCountry.length <= 7) {
        return `+82 (${withoutCountry.slice(0, 3)}) ${withoutCountry.slice(3)}`;
      } else {
        return `+82 (${withoutCountry.slice(0, 3)}) ${withoutCountry.slice(3, 7)} ${withoutCountry.slice(7, 11)}`;
      }
    }
    
    // Regular formatting for numbers not starting with 82
    if (numbers.length === 0) return '';
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    }
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 7)} ${numbers.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData({
        ...formData,
        phone_number: formatted
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
    supabase.from('contacts').insert([formData]).then(({ data, error }) => {
      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully:', data);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } 
    });
  };

  // const instagramImages = [
  //   'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop',
  //   'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop',
  //   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
  //   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
  //   'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=400&h=400&fit=crop',
  // ];

  if(!user) { 
    alert('You need to be signed in to access the contact page.');
    navigate('/signin');
    return null;
  }
  return (
    <div className="min-h-screen">
      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Contact Form */}
            <div
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 animate-on-scroll opacity-0 transition-all duration-1000"
              id="contact-form"
              style={{
                opacity: isVisible['contact-form'] ? 1 : 0,
                transform: isVisible['contact-form'] ? 'translateX(0)' : 'translateX(-50px)',
              }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                Contact Us
              </h1>
              <p className="text-gray-600 mb-8 text-sm sm:text-base">
                If you have any questions please fill out the form
              </p>

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                      focusedField === 'name'
                        ? 'border-blue-500 shadow-lg shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email and Phone Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                        focusedField === 'email'
                          ? 'border-blue-500 shadow-lg shadow-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone_number}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                        focusedField === 'phone'
                          ? 'border-blue-500 shadow-lg shadow-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="+82 (010) 1234 1234"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    rows="6"
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none resize-none transition-all duration-300 ${
                      focusedField === 'message'
                        ? 'border-blue-500 shadow-lg shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl uppercase tracking-wider text-sm sm:text-base"
                >
                  Send Message
                </button>
              </div>
            </div>

            {/* Image */}
            <div
              className="animate-on-scroll opacity-0 transition-all duration-1000"
              id="contact-image"
              style={{
                opacity: isVisible['contact-image'] ? 1 : 0,
                transform: isVisible['contact-image'] ? 'translateX(0)' : 'translateX(50px)',
              }}
            >
              <div className="relative group rounded-2xl overflow-hidden shadow-2xl h-full min-h-[400px] lg:min-h-[600px]">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop"
                  alt="Beautiful coastal landscape"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-top from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Gallery Section */}
      {/* <section
        className="py-16 sm:py-20 lg:py-24 bg-white animate-on-scroll opacity-0 transition-all duration-1000"
        id="instagram-section"
        style={{
          opacity: isVisible['instagram-section'] ? 1 : 0,
          transform: isVisible['instagram-section'] ? 'translateY(0)' : 'translateY(50px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-12 sm:mb-16">
            Follow us on Instagram
          </h2>

           Image Grid 
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
            {instagramImages.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden aspect-square rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isVisible['instagram-section'] ? 'fadeInUp 0.8s ease-out forwards' : 'none',
                }}
              >
                <img
                  src={image}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                 Hover Overlay 
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-pink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                </div>

                 Like Icon on Hover 
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

           Instagram CTA Button 
          <div className="text-center mt-12 sm:mt-16">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold py-4 px-8 sm:py-5 sm:px-12 rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg group"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow Us on Instagram
            </a>
          </div>
        </div>
      </section> */}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;