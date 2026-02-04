// @ts-nocheck
"use client";

import { supabase } from '@/lib/supabase/client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// 🔹 Format event date into Year-Month-Day, time with AM/PM (Korean time)
function formatEventDate(dateString) {
  if (!dateString) return 'Invalid date';
  const koreaTime = new Date(dateString);
  const localTime = new Date(
    koreaTime.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
  );

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return localTime.toLocaleString(undefined, options);
}

// 🔹 Calculate countdown between user's current time and event time (real-time)
function getCountdown(dateString) {
  const now = new Date();
  const eventDate = new Date(dateString);
  const diff = eventDate - now;

  if (diff <= 0) return 'Event started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  // Build countdown string dynamically
  let countdown = '';
  if (days > 0) countdown += `${days}d `;
  if (days > 0 || hours > 0) countdown += `${hours}h `;
  if (days > 0 || hours > 0 || minutes > 0) countdown += `${minutes}m `;
  countdown += `${seconds}s`;

  return countdown.trim();
}

// 🔹 Get contact info with branded colors and icons
function getContactInfo(type, link) {
  const contactTypes = {
    telegram: {
      color: 'bg-[#0088cc] hover:bg-[#006699]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-2.146 10.128-2.146 10.128-.161.717-.537.896-1.075.537l-3.583-2.686-1.792 1.792c-.179.179-.358.358-.716.358l.358-3.583 6.628-5.986c.269-.269-.06-.448-.448-.179l-8.152 5.09-3.583-1.075c-.717-.269-.717-.717.179-1.075l13.73-5.269c.537-.179 1.075.179.9 1.075z"/>
        </svg>
      ),
    },
    whatsapp: {
      color: 'bg-[#25D366] hover:bg-[#1EBE57]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    instagram: {
      color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    messenger: {
      color: 'bg-[#0084FF] hover:bg-[#0073E6]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
        </svg>
      ),
    },
    'kakao talk': {
      color: 'bg-[#FEE500] hover:bg-[#F5DC00] text-gray-900',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.678l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222V13.5a.472.472 0 0 0 .944 0v-1.363l.427-.413 1.428 2.033a.472.472 0 1 0 .773-.543l-1.514-2.155zm-2.958 1.924h-1.46V9.297a.472.472 0 0 0-.943 0v4.159c0 .26.21.472.471.472h1.932a.472.472 0 1 0 0-.944zm-5.857-1.092l.696-1.707.638 1.707H9.092zm2.523.488l.002-.016a.469.469 0 0 0-.127-.32l-1.046-2.8a.69.69 0 0 0-.627-.474.696.696 0 0 0-.653.447l-1.661 4.075a.472.472 0 0 0 .874.357l.33-.813h2.07l.299.8a.472.472 0 1 0 .884-.33l-.345-.926zM8.293 9.302a.472.472 0 0 0-.471-.472H4.577a.472.472 0 1 0 0 .944h1.16v3.736a.472.472 0 0 0 .944 0V9.774h1.14c.261 0 .472-.212.472-.472z"/>
        </svg>
      ),
    },
    email: {
      color: 'bg-[#EA4335] hover:bg-[#D93025]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    message: {
      color: 'bg-[#10B981] hover:bg-[#059669]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  };

  const contactType = contactTypes[type] || contactTypes.message;
  
  return {
    icon: contactType.icon,
    color: contactType.color,
    link: link || '#',
  };
}

export default function Events() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([{ id: 0, name: 'All' }]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [events, setEvents] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const scrollContainerRef = useRef(null);

  // 🔹 Scroll buttons
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

  // 🔹 Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('event_category').select('*');
      if (data) {
        setCategories([{ id: 0, name: 'All' }, ...data]);
      }
    };
    fetchCategories();
  }, []);

  // 🔹 Fetch events from Supabase based on active category
  useEffect(() => {
    const fetchEvents = async () => {
      let query = supabase.from('events').select('*');
      
      // Filter by category if not "All"
      if (activeCategory !== 0) {
        query = query.eq('category_id', activeCategory);
      }
      
      // Only fetch events that haven't started yet (date is in the future)
      const now = new Date().toISOString();
      query = query.gte('date', now);
      
      const { data } = await query.order('date', { ascending: true });
      if (data) {
        setEvents(data);
      }
    };
    fetchEvents();
  }, [activeCategory]);

  // 🔹 Update countdowns every second (real-time)
  useEffect(() => {
    const updateCountdowns = () => {
      const updated = {};
      events.forEach((event) => {
        updated[event.id] = getCountdown(event.date);
      });
      setCountdowns(updated);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      alert(`Failed to delete event: ${error.message}`);
    } else {
      alert('Event deleted successfully!');
      // Refresh events list
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const handleCreateEvent = () => {
    if (!user) {
      alert('Please sign in to create an event');
      router.push('/signin');
      return;
    }
    router.push('/events/new');
  };

  return (
    <div className="container mx-auto px-4 py-12 pb-24">
      {/* Header with Create Button on Desktop */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Events
          </h1>
          <p className="mt-2 text-xl text-gray-700">
            Discover local events, meetups, and activities for expats in Korea.
          </p>
        </div>
        
        {/* Desktop Create Button */}
        <button
          onClick={handleCreateEvent}
          className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
          aria-label="Post new event"
        >
          <svg 
            className="w-5 h-5 transition-transform group-hover:rotate-90" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          <span>Post Event</span>
        </button>
      </div>

      {/* 🔹 Scrollable Categories Filter */}
      <div className="relative mb-8">
        <button
          onClick={scrollLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          <span className="text-gray-700 text-xl font-bold">‹</span>
        </button>
        <button
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          <span className="text-gray-700 text-xl font-bold">›</span>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:px-12"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap shadow-md ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 Events Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const contactInfo = getContactInfo(event.organizer_contact_type, event.organizer_contact_link);
          const isOwner = user && event.user_id === user.id;
          
          return (
            <div
              key={event.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 relative"
            >
              {/* Edit & Delete Buttons - Only visible to event creator */}
              {isOwner && (
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <button
                    onClick={() => router.push(`/events/edit/${event.id}`)}
                    className="p-2 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition-all group/edit"
                    title="Edit event"
                  >
                    <svg 
                      className="w-5 h-5 text-gray-600 group-hover/edit:text-blue-600 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-red-50 transition-all group/delete"
                    title="Delete event"
                  >
                    <svg 
                      className="w-5 h-5 text-gray-600 group-hover/delete:text-red-600 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 pr-8">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {categories.find((c) => c.id === event.category_id)?.name || 'Event'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Description - 2 lines max */}
                {event.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Date & Countdown */}
                <div className="flex items-start gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="text-gray-700 font-medium">
                      {formatEventDate(event.date)}
                    </div>
                    <div className="text-blue-600 font-semibold text-xs mt-1 bg-blue-50 rounded-md px-2 py-1 inline-block">
                      {countdowns[event.id] || getCountdown(event.date)}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span className="text-gray-700">{event.location}</span>
                      {event.location_coordinates && (
                        <a
                          href={event.location_coordinates}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 hover:underline"
                        >
                          Open in Naver Maps →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Button with branded colors */}
                <div className="pt-2">
                  <a
                    href={contactInfo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 ${contactInfo.color} text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 w-full`}
                  >
                    {contactInfo.icon}
                    <span className="text-sm">Contact Organizer</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="col-span-full rounded-2xl bg-white border-2 border-dashed border-gray-300 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">No events found</p>
            <p className="text-gray-500">
              No events available in this category. Check back later for updates!
            </p>
          </div>
        )}
      </div>

      {/* 🔹 Fixed Create Event Button - Mobile Only: bottom center, smaller blue circle */}
      <button
        onClick={handleCreateEvent}
        className="sm:hidden fixed bottom-18 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
        aria-label="Create new event"
      >
        <svg 
          className="w-6 h-6 text-white transition-transform group-hover:rotate-90" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M12 4v16m8-8H4" 
          />
        </svg>
      </button>
    </div>
  );
}