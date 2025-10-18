import { supabase } from '../../../api/supabase-client';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Events() {
  const [categories, setCategories] = useState([{ id: 0, name: 'All' }]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [events, setEvents] = useState([]);
  const scrollContainerRef = useRef(null);

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data: CategoriesData, error: CategoriesError } = await supabase
        .from('event_category')
        .select('*');
      if (CategoriesError) {
        console.error('Error fetching event categories:', CategoriesError);
        return;
      } else {
        setCategories([{ id: 0, name: 'All' }, ...CategoriesData]);
      }
    };

    fetchCategories();
  }, []);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const { data: EventsData, error: EventsError } = await supabase
        .from('events')
        .select('*');
      if (EventsError) {
        console.error('Error fetching events:', EventsError);
        return;
      } else {
        setEvents(EventsData || []);
      }
    };
    fetchEvents();
  }, []);

  // Category filter logic
  const filteredEvents =
    activeCategory === 0
      ? events
      : events.filter((event) => event.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
        Events
      </h1>
      <p className="mb-8 text-xl text-gray-700">
        Discover local events, meetups, and activities for expats in Korea.
      </p>

      {/* Scrollable Categories Filter */}
      <div className="relative mb-8">
        {/* Scroll buttons (visible only on md+) */}
        <button
          onClick={scrollLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <span className="text-gray-600">‹</span>
        </button>
        <button
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <span className="text-gray-600">›</span>
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:px-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
                  {categories.find((c) => c.id === event.category)?.name || event.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4 flex flex-wrap gap-6">
                <div className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="text-gray-700">{event.description}</p>
              <div className="mt-4">
                <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="rounded-lg bg-white p-6 text-center">
            <p className="text-gray-700">No events found in this category. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
