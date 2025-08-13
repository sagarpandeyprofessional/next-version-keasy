import React, { useState } from 'react';
import styles from './Nearby.module.css';

export default function Nearby() {
  const [activeTab, setActiveTab] = useState('places');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'restaurants', name: 'Restaurants' },
    { id: 'cafes', name: 'Cafes' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'services', name: 'Services' },
  ];

  const places = [
    {
      id: 1,
      name: 'Seoul Global Center',
      category: 'services',
      address: '38 Jong-ro, Jongno-gu, Seoul',
      description:
        'Offers administrative support, consulting services, and Korean language classes for foreigners.',
      rating: 4.8,
      website: 'https://global.seoul.go.kr',
    },
    {
      id: 2,
      name: 'Foreign Food Market',
      category: 'shopping',
      address: 'Itaewon-dong, Yongsan-gu, Seoul',
      description: 'Specialty grocery store with imported products from around the world.',
      rating: 4.5,
      website: 'https://example.com',
    },
    {
      id: 3,
      name: 'International Clinic',
      category: 'services',
      address: '737 Hannam-dong, Yongsan-gu, Seoul',
      description: 'Medical facility with English-speaking doctors and staff for expats.',
      rating: 4.7,
      website: 'https://example.com',
    },
    {
      id: 4,
      name: 'English Bookstore',
      category: 'shopping',
      address: 'Itaewon-ro, Yongsan-gu, Seoul',
      description: 'Wide selection of books in English and other foreign languages.',
      rating: 4.6,
      website: 'https://example.com',
    },
    {
      id: 5,
      name: 'Expat-Friendly Cafe',
      category: 'cafes',
      address: 'Hangangno 3-ga, Yongsan-gu, Seoul',
      description: 'Popular cafe with English menus and staff that speak multiple languages.',
      rating: 4.4,
      website: 'https://example.com',
    },
    {
      id: 6,
      name: 'International Restaurant',
      category: 'restaurants',
      address: 'Samseong-dong, Gangnam-gu, Seoul',
      description: 'Restaurant offering authentic cuisines from around the world.',
      rating: 4.3,
      website: 'https://example.com',
    },
  ];

  const guides = [
    {
      id: 1,
      title: 'Navigating Public Transportation in Seoul',
      author: 'John Smith',
      excerpt: "A comprehensive guide to using Seoul's subway, bus, and taxi systems efficiently.",
      readTime: '10 min read',
    },
    {
      id: 2,
      title: 'Best Areas for Expat Housing in Korea',
      author: 'Emma Lee',
      excerpt: 'Find the perfect neighborhood based on your preferences, budget, and lifestyle.',
      readTime: '15 min read',
    },
    {
      id: 3,
      title: 'Banking for Foreigners in Korea',
      author: 'Michael Park',
      excerpt: 'Everything you need to know about opening bank accounts and managing finances in Korea.',
      readTime: '12 min read',
    },
    {
      id: 4,
      title: 'Essential Korean Apps for Expats',
      author: 'Sarah Kim',
      excerpt: 'Must-have mobile applications that will make your life in Korea much easier.',
      readTime: '8 min read',
    },
  ];

  const filteredPlaces =
    activeCategory === 'all' ? places : places.filter((place) => place.category === activeCategory);

  return (
    <div className={`container py-5 ${styles.nearbyContainer}`}>
      <h1 className="mb-4 display-4">Nearby Places & Guides</h1>
      <p className="mb-4 lead text-muted">Discover useful locations and resources for foreigners in Korea.</p>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'places' ? 'active' : ''}`}
            type="button"
            role="tab"
            onClick={() => setActiveTab('places')}
          >
            <i className="bi bi-geo-alt-fill me-2"></i> Nearby Places
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'guides' ? 'active' : ''}`}
            type="button"
            role="tab"
            onClick={() => setActiveTab('guides')}
          >
            <i className="bi bi-book-fill me-2"></i> Local Guides
          </button>
        </li>
      </ul>

      {activeTab === 'places' && (
        <>
          {/* Category Filter */}
          <div className="mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`btn btn-sm me-2 mb-2 ${
                  activeCategory === category.id ? 'btn-primary' : 'btn-outline-secondary'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Places Grid */}
          <div className="row">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place) => (
                <div key={place.id} className="col-md-6 col-lg-4 mb-4">
                  <div className={`card h-100 ${styles.placeCard}`}>
                    <div className={`card-header d-flex justify-content-between align-items-center ${styles.cardHeader}`}>
                      <h5 className="card-title mb-0">{place.name}</h5>
                      <span className={`badge bg-primary ${styles.ratingBadge}`}>
                        <i className="bi bi-star-fill me-1"></i> {place.rating}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className="text-muted small mb-1">
                        {categories.find((c) => c.id === place.category)?.name}
                      </p>
                      <p className="card-text">{place.description}</p>
                      <p className="text-muted small d-flex align-items-center">
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        {place.address}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          Visit Website
                        </a>
                        <button className="btn btn-sm btn-primary">View Map</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p className="text-muted">No places found in this category. Check back later!</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'guides' && (
        <div className="row">
          {guides.map((guide) => (
            <div key={guide.id} className="col-md-6 mb-4">
              <div className={`card ${styles.guideCard}`}>
                <div className="card-body">
                  <h5 className="card-title">{guide.title}</h5>
                  <p className="text-muted small mb-2">
                    By {guide.author} &bull; {guide.readTime}
                  </p>
                  <p className="card-text">{guide.excerpt}</p>
                  <button className="btn btn-link p-0 text-primary">Read full guide &rarr;</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}