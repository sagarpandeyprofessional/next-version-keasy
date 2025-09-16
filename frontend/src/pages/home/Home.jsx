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

/* FeatureCard Component */
const FeatureCard = ({ title, description, icon, href, linkText }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-black" >{title}</h3>
      <p className="mb-4 text-gray-600">{description}</p>
      <a href={href} className="font-medium text-blue-600 hover:underline">
        {linkText} &rarr;
      </a>
    </div>
  );
};

/* GuidesCarousel Component */
const GuidesCarousel = ({ title, children, className = "" }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    handleScroll();
  }, [children]);

  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black md:text-3xl">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll("left")}
            disabled={!showLeftArrow}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors ${
              showLeftArrow ? "text-black hover:bg-gray-100" : "cursor-default text-gray-300"
            }`}
          >
            &#8592;
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!showRightArrow}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors ${
              showRightArrow ? "text-black hover:bg-gray-100" : "cursor-default text-gray-300"
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

/* GuidesCard Component */
const GuidesCard = ({ id, name, description, img_url, created_by, category }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = imageError || !img_url ? getPlaceholderImage(category) : img_url;

  const [author, setAuthor] = useState('');

  useEffect(() => {
    const fetchAuthor = async () => {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', created_by);

      if (userError) {
        console.error('Error fetching author:', userError.message);
      } else if (userData && userData.length > 0) {
        setAuthor(userData[0].username);
      }
    };

    fetchAuthor();
  }, [created_by]);

  return (
    <div className="snap-start px-4 flex-shrink-0 w-full sm:w-72 md:w-80">
      <div className="h-full overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1">
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center text-sm text-gray-500">
            by {author}
          </div>
          <h3 className="mb-2 text-lg font-semibold text-black">{name}</h3>
          <p className="mb-4 text-sm text-gray-600">{description}</p>
        </div>
      </div>
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
        .select('id, created_at, name, description, img_url, created_by, category')
        .range(0, 4);

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
      {/* Hero Section */}
      {/* <section className="relative bg-black py-24 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl text-white">Welcome to keasy</h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl">Making life in South Korea easier for foreigners</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="rounded-lg bg-white px-6 py-3 font-medium text-black shadow-md hover:bg-gray-100">
              Explore Marketplace
            </a>
            <a href="#" className="rounded-lg border border-white bg-transparent px-6 py-3 font-medium text-white hover:bg-white/10">
              Find Events
            </a>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-black">Our Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 text-black">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Explore Guides Carousel */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <GuidesCarousel title="Explore Guides">
            {guides.map((guide) => (
              <GuidesCard key={guide.id} {...guide} />
            ))}
          </GuidesCarousel>
          <div className="mt-4 flex justify-center">
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

      {/* Chatbot Button */}
      {/* <div className="fixed bottom-6 right-6 z-50">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg hover:bg-gray-800">
          💬
        </button>
      </div> */}
    </div>
  );
}
