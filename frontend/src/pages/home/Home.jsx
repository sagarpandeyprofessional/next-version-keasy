import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { supabase } from "../../api/supabase-client";

// Buttons imports
import { LuMessageCircleMore } from "react-icons/lu";

import { RiShoppingBag2Fill } from "react-icons/ri"; // ✅ exists
import { BiParty } from "react-icons/bi";            // ✅ exists
import { MdOutlineExplore } from "react-icons/md";

import { motion, AnimatePresence } from "framer-motion";

/* Utility function for placeholder images */
const getPlaceholderImage = (id) =>
  `https://picsum.photos/400/300?random=${id}`;

// Carousel Component
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
        <h2 className="text-2xl font-bold text-white md:text-3xl dark:text-white">{title}</h2>
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

// FeatureCard
const FeatureCard = ({ title, description, icon, href, linkText }) => {
  return (
    <Link to={href}>
      
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-black text-3xl shadow-lg">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-black">{title}</h3>
        </div>
        <p className="text-gray-600 line-clamp-3 flex-grow">{description}</p>
        <Link className="inline-flex items-center gap-2 font-medium text-primary hover:underline text-black mt-4">
              {linkText} →
            </Link>
      </motion.div>

    </Link>
    
  );
};


// GuidesCard
const GuidesCard = ({ id, name, description, img_url, created_by }) => {
  const [author, setAuthor] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!created_by) return;
      const { data, error } = await supabase.from('profiles').select('username').eq('user_id', created_by);
      if (error) console.error(error.message);
      else setAuthor(data?.[0]?.username || 'Unknown Author');
    };
    fetchAuthor();
  }, [created_by]);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div whileHover={{ scale: 1.02, y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link to={`guides/guide/${id}`} className="block h-full">
        <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gray-200">
            <button
              onClick={handleLike}
              className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
            >
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            {img_url ? (
              <img src={img_url} alt={name} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400 text-sm">No image</div>
            )}
          </div>
          <div className="p-4 sm:p-6">
            <div className="mb-2 text-sm text-gray-500">by {author || 'Loading...'}</div>
            <h3 className="mb-3 text-lg font-semibold text-black line-clamp-2">{name}</h3>
            <p className="hidden sm:block mb-4 text-sm text-gray-600 line-clamp-2">{description}</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all duration-300">
              View Guide →
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// HeroCarousel
const HeroCarousel = () => {
  const slides = [
    { id: 1, image: '/hero-seoul-sunset.jpg', heading: 'Welcome to Keasy', description: 'Making life in South Korea easier for foreigners', buttonText1: 'Explore Marketplace', buttonLink1: '/marketplace', buttonText2: 'Find Events', buttonLink2: '/events' },
    { id: 2, image: '/hero-korean-market.jpg', heading: 'Discover Local Stores', description: 'Find the best deals nearby', buttonText1: 'Shop Now', buttonLink1: '/marketplace', buttonText2: 'View Guides', buttonLink2: '/guides' },
    { id: 3, image: '/hero-jeju-coast.jpg', heading: 'Connect with Community', description: 'Meet and share with other expats', buttonText1: 'Join Groups', buttonLink1: '/community', buttonText2: 'Attend Events', buttonLink2: '/events' },
    { id: 4, image: '/hero-gyeongbokgung.jpg', heading: 'Learn & Grow', description: 'Access guides, tips, and resources', buttonText1: 'Read Guides', buttonLink1: '/guides', buttonText2: 'Watch Tutorials', buttonLink2: '/guides' }
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 6000);
    return () => clearInterval(interval);
  }, [current]);

  const nextSlide = () => { setDirection(1); setCurrent((prev) => (prev + 1) % slides.length); };
  const prevSlide = () => { setDirection(-1); setCurrent((prev) => (prev - 1 + slides.length) % slides.length); };

  const variants = { enter: (dir) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (dir) => ({ x: dir < 0 ? 1000 : -1000, opacity: 0 }) };

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden rounded-b-3xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div key={slides[current].id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }} className="absolute top-0 left-0 w-full h-full">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slides[current].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 lg:px-20 text-center text-white">
            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg text-white"
              >
                {slides[current].heading}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl mb-8 drop-shadow-md text-white"
              >
                {slides[current].description}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex flex-wrap justify-center gap-4">
              <Link to={slides[current].buttonLink1} className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-sm text-black rounded-lg font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105">{slides[current].buttonText1}</Link>
              <Link to={slides[current].buttonLink2} className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-black rounded-lg font-medium border border-white/20 hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105">{slides[current].buttonText2}</Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <motion.button key={index} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className={`h-3 w-3 rounded-full transition-all duration-300 ${current === index ? "bg-white shadow-white/50 shadow-lg scale-125" : "bg-white/40 hover:bg-white/60"}`} onClick={() => setCurrent(index)} />
        ))}
      </div>
    </div>
  );
};

// Home Component

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
        .select('id, created_at, name, description, img_url, created_by, category')
        .limit(8);
      if (error) console.error('Error fetching guides:', error.message);
      else setGuides(data || []);
    };
    fetchGuides();
  }, []);

  // Animation variants
  const slideInLeft = { hidden: { opacity: 0, x: -100 }, visible: { opacity: 1, x: 0 } };
  const slideInRight = { hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } };
  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="mb-8 text-center text-2xl sm:text-3xl font-bold"
          >
            Our Features
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInLeft}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Guides Section */}
      <section className=" py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="mb-6 text-2xl md:text-3xl font-bold text-black"
          >
            Explore Guides
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInRight}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <GuidesCard {...guide} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <Link to="/guides" className="inline-block rounded-md bg-black px-6 py-3 text-white font-medium hover:bg-gray-800">
              View More Guides &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-primary/90 py-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
              Ready to Make Korea Feel Like Home?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto text-black">
              Join thousands of expats who've made their Korean adventure easier with Keasy
            </p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Join Our Community
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

