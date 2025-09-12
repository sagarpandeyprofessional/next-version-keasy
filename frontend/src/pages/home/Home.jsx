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
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-4 text-gray-600">{description}</p>
      <a href={href} className="font-medium text-blue-600 hover:underline">
        {linkText} &rarr;
      </a>
    </div>
  );
};


const GuidesCarousel = ({
  title,
  children,
  className = ""
}) => {
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

  // Attach scroll listener on mount
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll(); // check arrows on mount
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Recalculate arrow visibility when guides (children) or category change
  useEffect(() => {
    handleScroll();
  }, [children]);

  return (
    <div className={className}>
      {/* Title + Arrows */}
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

      {/* Scroll container */}

      <div
        className="flex -mx-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
        ref={scrollContainerRef}
      >
        {children}
      </div>
    </div>
  );
};

const GuidesCard = ({ id, name, description, img_url, created_by, category }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl =
    imageError || !img_url
      ? getPlaceholderImage(category)
      : img_url;

  const [author, setAuthor] = useState('');

  // Fetch author
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
          <h3 className="mb-2 text-lg font-semibold">{name}</h3>
          <p className="mb-4 text-sm text-gray-600">{description}</p>
          
        </div>
      </div>
    </div>
  );
};

//buttons imports
import { RiShoppingBag2Fill } from "react-icons/ri";
import { BiParty } from "react-icons/bi";
import { LuMessageCircleMore } from "react-icons/lu";
import { MdOutlineExplore } from "react-icons/md";

/* Home Component */
export default function Home() {
  const features = [
    { title: 'Marketplace', description: 'Buy, sell, or give away items within the expat community.', icon: <RiShoppingBag2Fill />, href: '/marketplace', linkText: 'Visit Marketplace' },
    { title: 'Events', description: 'Discover local events, meetups, and activities for expats.', icon: <BiParty />, href: '/events', linkText: 'Find Events' },
    { title: 'Community', description: 'Join groups and connect with other expats.', icon: <LuMessageCircleMore />, href: '/community', linkText: 'Join Community' },
    { title: 'Nearby Places', description: 'Find expat-friendly locations and services in your area.', icon: <MdOutlineExplore />, href: '/nearby', linkText: 'Discover Nearby' },
  ];

  const [guides, setGuides] = useState([]);
  
    // Fetch guides
    useEffect(() => {
      const fetchGuides = async () => {
        const { data, error } = await supabase
          .from('guide')
          .select('id, created_at, name, description, img_url, created_by, category')
          .range(0, 4);;
  
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
      {/* Hero Section */}
      <section className="relative bg-black py-24 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">Welcome to KEasy</h1>
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
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Explore Korea Carousel */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <GuidesCarousel title="Explore Guides">
            {guides.map((guide) => (
              <GuidesCard key={guide.id} {...guide} />
            ))}
          </GuidesCarousel>
          {/* Centered "View More Guides" button directly under the carousel cards */}
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

      {/* Festival Carousel */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <Carousel title="Upcoming Festivals">
            {festivalData.map((item) => (
              <FestivalCard key={item.id} {...item} />
            ))}
          </Carousel>
        </div>
      </section> */}

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
      <div className="fixed bottom-6 right-6 z-50">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg hover:bg-gray-800">
          💬
        </button>
      </div>
    </div>
  );
}