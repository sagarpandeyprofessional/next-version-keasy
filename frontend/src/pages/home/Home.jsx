import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // or replace with your routing Link
import { FaShoppingCart, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import styles from './styles/Home.module.css';

const features = [
  {
    title: 'Marketplace',
    description: 'Buy, sell, or give away items within the expat community.',
    icon: <FaShoppingCart size={40} />,
    href: '/marketplace',
    linkText: 'Visit Marketplace',
  },
  {
    title: 'Events',
    description: 'Discover local events, meetups, and activities for expats.',
    icon: <FaCalendarAlt size={40} />,
    href: '/events',
    linkText: 'Find Events',
  },
  {
    title: 'Community',
    description: 'Join KakaoTalk groups and connect with other expats.',
    icon: <FaUsers size={40} />,
    href: '/community',
    linkText: 'Join Community',
  },
  {
    title: 'Nearby Places',
    description: 'Find expat-friendly locations and services in your area.',
    icon: <FaMapMarkerAlt size={40} />,
    href: '/nearby',
    linkText: 'Discover Nearby',
  },
];

// Mock data placeholders — replace with your actual data
const exploreKoreaData = [
  {
    id: 1,
    title: 'Seoul Tower',
    image: 'https://via.placeholder.com/300x200?text=Seoul+Tower',
    description: 'Iconic landmark with panoramic city views.',
    location: 'Seoul',
    href: '/explore/seoul-tower',
  },
  // add more items...
];

const festivalData = [
  {
    id: 1,
    title: 'Boryeong Mud Festival',
    image: 'https://via.placeholder.com/300x200?text=Mud+Festival',
    description: 'Annual mud festival with fun activities.',
    date: 'July 15-21, 2025',
    location: 'Boryeong',
    href: '/festivals/mud-festival',
  },
  // add more items...
];

// Helper placeholder image fallback
const getPlaceholderImage = (id, type) => `https://via.placeholder.com/300x200?text=${type}+${id}`;

// ----- Carousel Component -----
const Carousel = ({ title, children }) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    onScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', onScroll);
      return () => ref.removeEventListener('scroll', onScroll);
    }
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className={styles.carouselWrapper}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{title}</h2>
        <div>
          <button
            onClick={() => scroll('left')}
            disabled={!showLeft}
            className={`btn btn-outline-secondary me-2 ${!showLeft ? 'disabled' : ''}`}
            aria-label="Scroll left"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRight}
            className={`btn btn-outline-secondary ${!showRight ? 'disabled' : ''}`}
            aria-label="Scroll right"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className={`${styles.carouselContainer} d-flex overflow-auto`}
        tabIndex={0}
        role="region"
        aria-label={`${title} carousel`}
      >
        {children}
      </div>
    </div>
  );
};

// ----- FeatureCard Component -----
const FeatureCard = ({ title, description, icon, href, linkText }) => (
  <div className="card shadow-sm h-100">
    <div className="card-body d-flex flex-column">
      <div className="mb-3 text-primary">{icon}</div>
      <h5 className="card-title">{title}</h5>
      <p className="card-text flex-grow-1">{description}</p>
      <Link to={href} className="mt-auto text-decoration-none fw-semibold text-primary">
        {linkText} &rarr;
      </Link>
    </div>
  </div>
);

// ----- ExploreCard Component -----
const ExploreCard = ({ id, title, image, description, location, href }) => {
  const [imgError, setImgError] = useState(false);
  const imgSrc = imgError ? getPlaceholderImage(id, 'Explore') : image;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 shadow-sm">
        <img
          src={imgSrc}
          alt={title}
          className="card-img-top object-fit-cover"
          style={{ height: '180px' }}
          onError={() => setImgError(true)}
        />
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-center text-muted mb-2">
            <FaMapMarkerAlt className="me-1" />
            <small>{location}</small>
          </div>
          <h5 className="card-title">{title}</h5>
          <p className="card-text flex-grow-1">{description}</p>
          <Link to={href} className="btn btn-primary mt-auto">
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
};

// ----- FestivalCard Component -----
const FestivalCard = ({ id, title, image, description, date, location, href }) => {
  const [imgError, setImgError] = useState(false);
  const imgSrc = imgError ? getPlaceholderImage(id, 'Festival') : image;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 shadow-sm festival-card">
        <div className="position-relative">
          <img
            src={imgSrc}
            alt={title}
            className="card-img-top object-fit-cover"
            style={{ height: '180px' }}
            onError={() => setImgError(true)}
          />
          <span className={`position-absolute top-0 end-0 badge bg-dark m-3 ${styles.upcomingBadge}`}>
            Upcoming
          </span>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{title}</h5>
          <div className="mb-3 text-muted small">
            <div className="d-flex align-items-center mb-1">
              <FaCalendarAlt className="me-2" />
              <span>{date}</span>
            </div>
            <div className="d-flex align-items-center">
              <FaMapMarkerAlt className="me-2" />
              <span>{location}</span>
            </div>
          </div>
          <p className="card-text flex-grow-1">{description}</p>
          <Link to={href} className="btn btn-primary mt-auto">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-dark text-white py-5 text-center position-relative">
        <img
          src="/images/hero-bg.jpg"
          alt="Seoul cityscape"
          className={`${styles.heroImage} position-absolute w-100 h-100`}
          aria-hidden="true"
        />
        <div className="position-relative container py-5">
          <h1 className="display-4 fw-bold mb-3">Welcome to KEasy</h1>
          <p className="lead mb-4">Making life in South Korea easier for foreigners</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/marketplace" className="btn btn-light btn-lg">
              Explore Marketplace
            </Link>
            <Link to="/events" className="btn btn-outline-light btn-lg">
              Find Events
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-5">
        <h2 className="text-center mb-4">Our Features</h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {features.map((feat, idx) => (
            <div key={idx} className="col d-flex">
              <FeatureCard {...feat} />
            </div>
          ))}
        </div>
      </section>

      {/* Explore Korea Carousel */}
      <section className="bg-light py-5">
        <div className="container">
          <Carousel title="Explore Korea">
            {exploreKoreaData.map((item) => (
              <ExploreCard key={item.id} {...item} />
            ))}
          </Carousel>
        </div>
      </section>

      {/* Festival Carousel */}
      <section className="py-5">
        <div className="container">
          <Carousel title="Upcoming Festivals">
            {festivalData.map((item) => (
              <FestivalCard key={item.id} {...item} />
            ))}
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark text-white text-center py-5">
        <div className="container">
          <h2 className="mb-3">Ready to explore South Korea?</h2>
          <p className="mb-4 fs-5">Join our community today and make your life in Korea easier.</p>
          <Link to="/about" className="btn btn-primary btn-lg">
            Learn More
          </Link>
        </div>
      </section>

      {/* Chatbot Button */}
      <button
        className={`btn btn-dark rounded-circle shadow-lg position-fixed ${styles.chatbotButton}`}
        aria-label="Open chatbot"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-message-circle"
          viewBox="0 0 24 24"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-3.05 6.46c-.48.43-1.11.54-1.7.54-2.54 0-6-2.91-6-6.54S13.16 5 15.7 5c1.17 0 2.4.52 3.3 1.43" />
          <path d="M19 9v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7" />
        </svg>
      </button>
    </div>
  );
}
