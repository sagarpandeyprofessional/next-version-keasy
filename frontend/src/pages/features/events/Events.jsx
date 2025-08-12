import React, { useState } from 'react';
import styles from './Events.module.css'; // CSS Module import

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

  const filteredEvents = activeFilter === 'all' ? events : events.filter(e => e.category === activeFilter);

  return (
    <div className={`container py-4 ${styles.container}`}>
      <h1 className="mb-4 display-5">Events</h1>
      <p className="mb-4 lead">Discover local events, meetups, and activities for expats in Korea.</p>

      {/* Filter Buttons */}
      <div className="mb-4 d-flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`btn btn-sm ${
              activeFilter === cat.id ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            aria-pressed={activeFilter === cat.id}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="row gy-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="col-md-6 col-lg-4">
              <div className={`card h-100 ${styles.card}`}>
                <div className={`card-header d-flex justify-content-between align-items-center ${styles.cardHeader}`}>
                  <h5 className="card-title mb-0">{event.title}</h5>
                  <span className={`badge bg-primary ${styles.badge}`}>
                    {categories.find(c => c.id === event.category)?.name || event.category}
                  </span>
                </div>
                <div className="card-body">
                  <ul className={`list-unstyled mb-3 ${styles.infoList}`}>
                    <li><strong>Date:</strong> {event.date}</li>
                    <li><strong>Time:</strong> {event.time}</li>
                    <li><strong>Location:</strong> {event.location}</li>
                  </ul>
                  <p className="card-text">{event.description}</p>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <button className="btn btn-primary btn-sm w-100">View Details</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-secondary text-center" role="alert">
              No events found in this category. Check back later!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
