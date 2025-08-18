import { useState } from 'react';

export default function Community() {
  const [activeCategory, setActiveCategory] = useState('All');

  const communityGroups = [
    { id: 1, name: 'Seoul Expats', members: '15,000+', description: 'The largest expat group in Seoul. Connect with fellow foreigners, get recommendations, and ask questions about life in the capital.', platform: 'KakaoTalk', category: 'General' },
    { id: 2, name: 'Busan International Community', members: '8,500+', description: 'For foreigners living in or visiting Busan. Events, recommendations, and community support.', platform: 'KakaoTalk', category: 'General' },
    { id: 3, name: 'Korea English Teachers', members: '12,000+', description: 'A support group for English teachers in Korea. Share teaching resources, job opportunities, and advice.', platform: 'KakaoTalk', category: 'Professional' },
    { id: 4, name: 'Language Exchange Korea', members: '9,700+', description: 'Find language exchange partners to practice Korean with native speakers while helping them with your language.', platform: 'KakaoTalk', category: 'Language' },
    { id: 5, name: 'Digital Nomads Korea', members: '4,200+', description: 'For remote workers and digital nomads based in Korea. Co-working meetups, networking, and professional support.', platform: 'KakaoTalk', category: 'Professional' },
    { id: 6, name: 'Korea Hiking & Outdoors', members: '7,800+', description: 'Organize and join hiking trips, camping adventures, and outdoor activities across Korea.', platform: 'KakaoTalk', category: 'Hobbies' },
    { id: 7, name: 'Foodies in Korea', members: '11,500+', description: 'Discover Korean cuisine, restaurant recommendations, and join food-related events and meetups.', platform: 'KakaoTalk', category: 'Food' },
    { id: 8, name: 'Daegu International Community', members: '5,300+', description: 'Connect with foreigners in Daegu. Local events, recommendations, and support for daily life.', platform: 'KakaoTalk', category: 'General' },
  ];

  const categories = ['All', 'General', 'Professional', 'Language', 'Hobbies', 'Food'];

  // Filtered groups
  const filteredGroups = activeCategory === 'All'
    ? communityGroups
    : communityGroups.filter(group => group.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">Community</h1>
      <p className="mb-8 text-xl text-gray-700 dark:text-gray-300">
        Connect with other foreigners in Korea through these KakaoTalk community groups.
      </p>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Community Groups Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map(group => (
          <div key={group.id} className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                  {group.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="mb-4 text-gray-700 dark:text-gray-300">{group.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{group.members} members</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{group.platform}</span>
                </div>
              </div>
              <div className="mt-4">
                <button className="w-full rounded-md bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-700">
                  Join Group
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
