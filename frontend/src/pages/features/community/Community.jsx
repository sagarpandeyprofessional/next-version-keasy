import { supabase } from '../../../api/supabase-client';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Community() {
  const [categories, setCategories] = useState([{ id: 0, name: 'All' }]);
  const [activeCategory, setActiveCategory] = useState(0); // store ID (0 = All)
  const [communities, setCommunities] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('community_category').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      if (data) {
        // Add "All" manually
        setCategories([{ id: 0, name: 'All' }, ...data]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch community groups
  useEffect(() => {
    const fetchCommunities = async () => {
      // Include relation (optional) if you’ve set FK in Supabase: `.select('*, community_category(name)')`
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

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Community Groups Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCommunities.map((group) => (
          <div key={group.id} className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                {/* <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  
                  {categories.find((cat) => cat.id === group.category_id)?.name || '—'}
                </span> */}
              </div>
            </div>
            <div className="p-4">
              <p className="mb-4 text-gray-700">{group.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {group.members && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{group.members} members</span>
                  </div>
                )}
                {group.platform && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
