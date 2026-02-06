"use client";

import { useEffect, useState } from "react";

const Error404Page = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // reserved for future use

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920&h=1080&fit=crop"
            alt="Desert camping scene"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div
          className={`relative z-10 text-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="mb-6 animate-bounce">
            <h2 className="text-blue-500 text-xl sm:text-2xl lg:text-3xl font-bold mb-4 tracking-wide">
              OOPS!
            </h2>
          </div>
          
          <h1 className="text-red-400 text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Something's Missing
          </h1>
          
          <p className="text-red-400 text-base sm:text-lg lg:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Unfortunately, we cannot find the page you are<br className="hidden sm:block" />
            looking for. Though, we tried...
          </p>
          
          <a
            href="/"
            className="inline-block bg-transparent border-2 border-blue-500 text-blue-500 font-semibold py-3 px-8 sm:py-4 sm:px-12 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl uppercase tracking-wider text-sm sm:text-base"
          >
            Take Me Away
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white opacity-75"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default Error404Page;
