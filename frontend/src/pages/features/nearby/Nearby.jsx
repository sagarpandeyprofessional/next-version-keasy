import { useState } from 'react';

export default function Nearby() {
  const [activeTab, setActiveTab] = useState('places');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Placeholder categories
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'restaurants', name: 'Restaurants' },
    { id: 'cafes', name: 'Cafes' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'services', name: 'Services' },
  ];
  
  // Placeholder nearby places data
  const places = [
    {
      id: 1,
      name: 'Seoul Global Center',
      category: 'services',
      address: '38 Jong-ro, Jongno-gu, Seoul',
      description: 'Offers administrative support, consulting services, and Korean language classes for foreigners.',
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
  
  // Placeholder guides data
  const guides = [
    {
      id: 1,
      title: 'Navigating Public Transportation in Seoul',
      author: 'John Smith',
      excerpt: 'A comprehensive guide to using Seoul\'s subway, bus, and taxi systems efficiently.',
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
  
  const filteredPlaces = activeCategory === 'all' 
    ? places 
    : places.filter(place => place.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">Nearby Places & Guides</h1>
      <p className="mb-8 text-xl text-gray-700 dark:text-gray-300">
        Discover useful locations and resources for foreigners in Korea.
      </p>
      
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveTab('places')}
            className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'places'
                ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Nearby Places
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'guides'
                ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Local Guides
          </button>
        </div>
      </div>
      
      {activeTab === 'places' && (
        <>
          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Places Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
                <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{place.name}</h3>
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {place.rating}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {categories.find(c => c.id === place.category)?.name}
                  </p>
                  <p className="mb-4 text-gray-700 dark:text-gray-300">{place.description}</p>
                  <div className="mb-4 flex items-start text-gray-600 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-1 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{place.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Visit Website
                    </a>
                    <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                      View Map
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPlaces.length === 0 && (
              <div className="col-span-full rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-700 dark:text-gray-300">No places found in this category. Check back later!</p>
              </div>
            )}
          </div>
        </>
      )}
      
      {activeTab === 'guides' && (
        <div className="space-y-6">
          {guides.map((guide) => (
            <div key={guide.id} className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{guide.title}</h3>
              <div className="mb-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>By {guide.author}</span>
                <span className="mx-2">•</span>
                <span>{guide.readTime}</span>
              </div>
              <p className="mb-4 text-gray-700 dark:text-gray-300">{guide.excerpt}</p>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Read full guide &rarr;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 