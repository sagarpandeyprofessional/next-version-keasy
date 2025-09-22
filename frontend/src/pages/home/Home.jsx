import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { supabase } from "../../api/supabase-client";

/* Utility function for placeholder images */
const getPlaceholderImage = (id, type) =>
  `https://picsum.photos/400/300?random=${id}`; // using Picsum instead of via.placeholder

/* Mock data */
const exploreKoreaData = [
  { id: 1, title: 'Seoul Tower', image: '', description: 'Iconic landmark', location: 'Seoul', href: '#' },
  { id: 2, title: 'Jeju Island', image: '', description: 'Beautiful nature', location: 'Jeju', href: '#' },
];

const festivalData = [
  { id: 1, title: 'Cherry Blossom Festival', image: '', description: 'Spring vibes', date: 'April 1-10', location: 'Seoul', href: '#' },
  { id: 2, title: 'Boryeong Mud Festival', image: '', description: 'Fun mud activities', date: 'July 15-20', location: 'Boryeong', href: '#' },
];

/* Carousel Component */
const Carousel = ({ title, children, className = '' }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black md:text-3xl">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors ${
              showLeftArrow ? 'text-black hover:bg-gray-100' : 'cursor-default text-gray-300'
            }`}
          >
            &#8592;
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors ${
              showRightArrow ? 'text-black hover:bg-gray-100' : 'cursor-default text-gray-300'
            }`}
          >
            &#8594;
          </button>
        </div>
      </div>
      <div
        className="flex -mx-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
        ref={scrollContainerRef}
      >
        {children}
      </div>
    </div>
  );
};

/* ExploreCard Component */
const ExploreCard = ({ id, title, image, description, location, href }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = imageError ? getPlaceholderImage(id, 'explore') : image || getPlaceholderImage(id, 'explore');

  return (
    <div className="snap-start px-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0">
      <div className="h-full overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1">
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center text-sm text-gray-500">{location}</div>
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="mb-4 text-sm text-gray-600">{description}</p>
          <a
            href={href}
            className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Explore
          </a>
        </div>
      </div>
    </div>
  );
};

/* FestivalCard Component */
const FestivalCard = ({ id, title, image, description, date, location, href }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = imageError ? getPlaceholderImage(id, 'festival') : image || getPlaceholderImage(id, 'festival');

  return (
    <div className="snap-start px-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0">
      <div className="h-full overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1">
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-0 right-0 m-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            Upcoming
          </div>
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <div className="mb-3 space-y-1 text-sm text-gray-500">
            <div>{date}</div>
            <div>{location}</div>
          </div>
          <p className="mb-4 text-sm text-gray-600">{description}</p>
          <a
            href={href}
            className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
};

/* FeatureCard Component - Updated for mobile */
const FeatureCard = ({ title, description, icon, href, linkText }) => {
  return (
    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-md">
      {/* Mobile: Icon and title in one line, Desktop: Icon on top */}
      <div className="flex items-center gap-3 sm:block mb-3 sm:mb-4">
        <div className="text-2xl sm:text-3xl flex-shrink-0">{icon}</div>
        <h3 className="text-lg sm:text-xl font-semibold text-black">{title}</h3>
      </div>
      {/* Description - hidden on mobile to save space */}
      <p className="hidden sm:block mb-4 text-gray-600">{description}</p>
      <a href={href} className="font-medium text-blue-600 hover:underline text-sm sm:text-base">
        <span className="sm:hidden">Explore</span>
        <span className="hidden sm:inline">{linkText}</span> &rarr;
      </a>
    </div>
  );
};

/* GuidesCard Component - Updated with clickable container and separate like button */
const GuidesCard = ({ id, name, description, img_url, created_by, category }) => {
  const [imageError, setImageError] = useState(false);
  const [author, setAuthor] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!created_by) return;
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', created_by);

      if (userError) {
        console.error('Error fetching author:', userError.message);
      } else if (userData && userData.length > 0) {
        setAuthor(userData[0].username);
      } else {
        setAuthor('Unknown Author');
      }
    };

    fetchAuthor();
  }, [created_by]);

  const handleImageError = (e) => {
    console.error('Image failed to load:', img_url);
  };

  const handleLike = (e) => {
    e.preventDefault(); // Prevent navigation when clicking like
    e.stopPropagation(); // Stop event bubbling
    setIsLiked(!isLiked);
    // Add your like functionality here
    console.log(`Guide ${id} ${isLiked ? 'unliked' : 'liked'}`);
  };

  return (
    <div className="w-full">
      <Link 
        to={`guides/guide/${id}`}
        className="block h-full"
      >
        <div className="h-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group cursor-pointer">
          <div className="relative h-32 sm:h-48 w-full overflow-hidden bg-gray-200">
            {/* Like button - positioned absolutely to prevent container click */}
            <button
              onClick={handleLike}
              className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 ${
                isLiked 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
            >
              <svg 
                className="w-4 h-4" 
                fill={isLiked ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </button>

            {/* Show image only if img_url exists */}
            {img_url ? (
              <img
                src={img_url}
                alt={name || 'Guide image'}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              /* No image placeholder */
              <div className="flex items-center justify-center h-full bg-gray-200">
                <div className="text-gray-400 text-xs sm:text-sm">No image</div>
              </div>
            )}
          </div>

          <div className="p-2 sm:p-4">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                by {author || 'Loading...'}
              </div>
            </div>
            
            <h3 className="mb-2 text-sm sm:text-lg font-semibold text-black line-clamp-2">
              {name || 'Untitled Guide'}
            </h3>
            
            {/* Hide description on mobile, show on sm and up */}
            <p className="hidden sm:block mb-4 text-sm text-gray-600 line-clamp-3">
              {description || 'No description available.'}
            </p>
            
            {/* Read button - now just for visual indication since whole card is clickable */}
            <div className="inline-block rounded-md bg-black px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-white group-hover:bg-gray-800 transition-colors">
              <span className="hidden sm:inline">Read full guide &rarr;</span>
              <span className="sm:hidden">Read &rarr;</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// Buttons imports
import { RiShoppingBag2Fill } from "react-icons/ri";
import { BiParty } from "react-icons/bi";
import { LuMessageCircleMore } from "react-icons/lu";
import { MdOutlineExplore } from "react-icons/md";

import { motion, AnimatePresence } from "framer-motion";

const HeroCarousel = () => {
  const slides = [
    {
    id: 1,
    image: "https://picsum.photos/id/1018/1600/900",
    heading: "Welcome to Keasy",
    description: "Making life in South Korea easier for foreigners",
    buttonText1: "Explore Marketplace",
    buttonLink1: "/marketplace",
    buttonText2: "Find Events",
    buttonLink2: "/events",
  },
  {
    id: 2,
    image: "https://picsum.photos/id/1025/1600/900",
    heading: "Discover Local Stores",
    description: "Find the best deals nearby",
    buttonText1: "Shop Now",
    buttonLink1: "/marketplace",
    buttonText2: "View Guides",
    buttonLink2: "/guides",
  },
  {
    id: 3,
    image: "https://picsum.photos/id/1037/1600/900",
    heading: "Connect with Community",
    description: "Meet and share with other expats",
    buttonText1: "Join Groups",
    buttonLink1: "/community",
    buttonText2: "Attend Events",
    buttonLink2: "/events",
  },
  {
    id: 4,
    image: "https://picsum.photos/id/1043/1600/900",
    heading: "Learn & Grow",
    description: "Access guides, tips, and resources",
    buttonText1: "Read Guides",
    buttonLink1: "/guides",
    buttonText2: "Watch Tutorials",
    buttonLink2: "/guides",
  },
  {
    id: 5,
    image: "https://picsum.photos/id/1050/1600/900",
    heading: "Your Life Made Easier",
    description: "Simplify everything with Keasy",
    buttonText1: "Get Started",
    buttonLink1: "/guides",
    buttonText2: "Contact Us",
    buttonLink2: "/contact",
  }
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev

  // Auto-slide every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slides[current].id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.x < -100) nextSlide();
            else if (offset.x > 100) prevSlide();
          }}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url(${slides[current].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Black glass overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          

          {/* Slide Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
              {slides[current].heading}
            </h1>
            <p className="text-xl max-w-2xl mb-8">{slides[current].description}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={slides[current].buttonLink1}
                className="rounded-lg bg-white px-6 py-3 font-medium text-black shadow-md hover:bg-gray-100"
              >
                {slides[current].buttonText1}
              </a>
              <a
                href={slides[current].buttonLink2}
                className="rounded-lg border border-white bg-transparent px-6 py-3 font-medium text-white hover:bg-white/10"
              >
                {slides[current].buttonText2}
              </a>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`h-3 w-3 rounded-full transition-all ${
              current === index ? "bg-white scale-125" : "bg-gray-400"
            }`}
            onClick={() => setCurrent(index)}
          ></button>
        ))}
      </div>
    </div>
  );
};

/* Home Component */
export default function Home() {
  const features = [
    { title: 'Marketplace', description: 'Buy, sell, or give away items within the expat community.', icon: <RiShoppingBag2Fill />, href: '/marketplace', linkText: 'Visit Marketplace' },
    { title: 'Events', description: 'Discover local events, meetups, and activities for expats.', icon: <BiParty />, href: '/events', linkText: 'Find Events' },
    { title: 'Community', description: 'Join groups and connect with other expats.', icon: <LuMessageCircleMore />, href: '/community', linkText: 'Join Community' },
    { title: 'Nearby Places', description: 'Find expat-friendly locations and services in your area.', icon: <MdOutlineExplore />, href: '/nearby', linkText: 'Discover Nearby' },
  ];

  const [guides, setGuides] = useState([]);

  useEffect(() => {
    const fetchGuides = async () => {
      const { data, error } = await supabase
        .from('guide')
        .select('id, created_at, name, description, img_url, created_by, category');

      if (error) {
        console.error('Error fetching guides:', error.message);
      } else {
        setGuides(data || []);
      }
    };
    fetchGuides();
  }, []);

  return (
    <div>
      <HeroCarousel />

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 sm:mb-12 text-center text-2xl sm:text-3xl font-bold text-black">Our Features</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4 text-black">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Explore Guides Section - Grid instead of Carousel */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black md:text-3xl">Explore Guides</h2>
          </div>
          
          {/* Cards grid - 2 columns on mobile, responsive on larger screens */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-8">
            {guides.map((guide) => (
              <GuidesCard key={guide.id} {...guide} />
            ))}
          </div>
          
          <div className="flex justify-center">
            <Link
              to={`/guides`}
              className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              View More Guides &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to explore South Korea?</h2>
          <p className="mb-8 text-xl">Join our community today and make your life in Korea easier.</p>
          <a href="#" className="inline-block rounded-md bg-white px-6 py-3 font-medium text-black hover:bg-gray-100">
            Learn More
          </a>
        </div>
      </section>
    </div>
  );
}