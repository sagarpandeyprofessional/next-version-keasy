import { useState } from 'react';

export default function Events() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'cultural', name: 'Cultural' },
    { id: 'social', name: 'Social' },
    { id: 'language', name: 'Language Exchange' },
    { id: 'outdoor', name: 'Outdoor' },
    { id: 'food', name: 'Food & Drinks' },
  ];
  
  // Placeholder events data
  const events = [
    {
      id: 1,
      title: 'Korean Language Exchange',
      date: '2023-06-15',
      time: '18:00 - 20:00',
      location: 'Gangnam, Seoul',
      category: 'language',
      description: 'Practice Korean with native speakers in a relaxed café environment.',
    },
    {
      id: 2,
      title: 'Hiking Bukhansan',
      date: '2023-06-18',
      time: '09:00 - 14:00',
      location: 'Bukhansan National Park',
      category: 'outdoor',
      description: 'Join us for a day hike at one of Seoul\'s most beautiful mountains.',
    },
    {
      id: 3,
      title: 'Traditional Tea Ceremony',
      date: '2023-06-20',
      time: '15:00 - 17:00',
      location: 'Insadong',
      category: 'cultural',
      description: 'Learn about Korean tea culture and participate in a traditional ceremony.',
    },
    {
      id: 4,
      title: 'Expat Networking Night',
      date: '2023-06-25',
      time: '19:00 - 22:00',
      location: 'Itaewon',
      category: 'social',
      description: 'Network with other professionals living and working in Korea.',
    },
    {
      id: 5,
      title: 'Korean Street Food Tour',
      date: '2023-06-30',
      time: '18:00 - 21:00',
      location: 'Myeongdong',
      category: 'food',
      description: 'Explore the delicious world of Korean street food with a local guide.',
    },
  ];
  
  const filteredEvents = activeFilter === 'all' 
    ? events 
    : events.filter(event => event.category === activeFilter);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">Events</h1>
      <p className="mb-8 text-xl text-gray-700 dark:text-gray-300">Discover local events, meetups, and activities for expats in Korea.</p>
      
      {/* Filter Categories */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveFilter(category.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === category.id
                ? 'bg-primary-600 text-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Events List */}
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                  {categories.find(c => c.id === event.category)?.name || event.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4 flex flex-wrap gap-6">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
              <div className="mt-4">
                <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-700 dark:text-gray-300">No events found in this category. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
} 