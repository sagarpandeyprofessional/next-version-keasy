import { supabase } from '../../../api/supabase-client';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Community() {
  const [categories, setCategories] = useState([{ id: 0, name: 'All' }]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [communities, setCommunities] = useState([]);
  const scrollContainerRef = useRef(null);

  // Scroll controls
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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('community_category').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      if (data) {
        setCategories([{ id: 0, name: 'All' }, ...data]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch community groups
  useEffect(() => {
    const fetchCommunities = async () => {
      const { data, error } = await supabase.from('community').select('*');
      if (error) {
        console.error('Error fetching communities:', error);
        return;
      }
      setCommunities(data || []);
    };
    fetchCommunities();
  }, []);

  // Filter logic
  const filteredCommunities =
    activeCategory === 0
      ? communities
      : communities.filter((group) => group.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">Community</h1>
      <p className="mb-8 text-xl text-gray-700">
        Connect with other foreigners in Korea through these KakaoTalk community groups.
      </p>

      {/* Scrollable Category Filter */}
      <div className="relative mb-8">
        {/* Scroll buttons (desktop only) */}
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

      {/* Community Groups Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCommunities.map((group) => (
          <div key={group.id} className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="mb-4 text-gray-700">{group.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {group.members && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span>{group.members} members</span>
                  </div>
                )}
                {group.platform && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{group.platform}</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                {group.chat_link?.startsWith('http') ? (
                  <a
                    href={group.chat_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-md bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-600"
                  >
                    Join Group
                  </a>
                ) : (
                  <Link
                    to={group.chat_link || '#'}
                    className="block w-full rounded-md bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-600"
                  >
                    Join Group
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredCommunities.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No groups found for this category.
          </div>
        )}
      </div>
    </div>
  );
}
