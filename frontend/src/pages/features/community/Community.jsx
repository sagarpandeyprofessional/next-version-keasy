import React, { useState } from 'react';
import styles from './Community.module.css';

export default function Community() {
  const communityGroups = [
    {
      id: 1,
      name: 'Seoul Expats',
      members: '15,000+',
      description:
        'The largest expat group in Seoul. Connect with fellow foreigners, get recommendations, and ask questions about life in the capital.',
      platform: 'KakaoTalk',
      category: 'General',
    },
    {
      id: 2,
      name: 'Busan International Community',
      members: '8,500+',
      description: 'For foreigners living in or visiting Busan. Events, recommendations, and community support.',
      platform: 'KakaoTalk',
      category: 'General',
    },
    {
      id: 3,
      name: 'Korea English Teachers',
      members: '12,000+',
      description: 'A support group for English teachers in Korea. Share teaching resources, job opportunities, and advice.',
      platform: 'KakaoTalk',
      category: 'Professional',
    },
    {
      id: 4,
      name: 'Language Exchange Korea',
      members: '9,700+',
      description:
        'Find language exchange partners to practice Korean with native speakers while helping them with your language.',
      platform: 'KakaoTalk',
      category: 'Language',
    },
    {
      id: 5,
      name: 'Digital Nomads Korea',
      members: '4,200+',
      description:
        'For remote workers and digital nomads based in Korea. Co-working meetups, networking, and professional support.',
      platform: 'KakaoTalk',
      category: 'Professional',
    },
    {
      id: 6,
      name: 'Korea Hiking & Outdoors',
      members: '7,800+',
      description: 'Organize and join hiking trips, camping adventures, and outdoor activities across Korea.',
      platform: 'KakaoTalk',
      category: 'Hobbies',
    },
    {
      id: 7,
      name: 'Foodies in Korea',
      members: '11,500+',
      description:
        'Discover Korean cuisine, restaurant recommendations, and join food-related events and meetups.',
      platform: 'KakaoTalk',
      category: 'Food',
    },
    {
      id: 8,
      name: 'Daegu International Community',
      members: '5,300+',
      description:
        'Connect with foreigners in Daegu. Local events, recommendations, and support for daily life.',
      platform: 'KakaoTalk',
      category: 'General',
    },
  ];

  const categories = ['All', 'General', 'Professional', 'Language', 'Hobbies', 'Food'];

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredGroups =
    activeCategory === 'All'
      ? communityGroups
      : communityGroups.filter((group) => group.category === activeCategory);

  return (
    <div className={`container py-5 ${styles.communityContainer}`}>
      <h1 className="mb-4 display-4">Community</h1>
      <p className="mb-4 lead text-muted">
        Connect with other foreigners in Korea through these KakaoTalk community groups.
      </p>

      {/* Category Filter */}
      <div className="mb-4">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`btn btn-sm me-2 mb-2 ${
              activeCategory === category ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Community Groups Grid */}
      <div className="row">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div key={group.id} className="col-md-6 col-lg-4 mb-4">
              <div className={`card h-100 ${styles.groupCard}`}>
                <div className={`card-header d-flex justify-content-between align-items-center ${styles.cardHeader}`}>
                  <h5 className="card-title mb-0">{group.name}</h5>
                  <span className={`badge bg-primary ${styles.categoryBadge}`}>{group.category}</span>
                </div>
                <div className="card-body d-flex flex-column">
                  <p className="card-text flex-grow-1">{group.description}</p>
                  <div className="d-flex justify-content-between text-muted small mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-people-fill me-1"></i> {group.members} members
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-chat-dots-fill me-1"></i> {group.platform}
                    </div>
                  </div>
                  <button className="btn btn-primary w-100">Join Group</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <p className="text-muted">No groups found in this category. Try another!</p>
          </div>
        )}
      </div>
    </div>
  );
}
