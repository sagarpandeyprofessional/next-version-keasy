import { form } from 'framer-motion/client';
import { supabase } from '../../../api/supabase-client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommunityPost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    platforms: '',
    members: '',
    chat_link: '',
    icon: ''
  });

  const platformOptions = [
    'telegram',
    'whats app',
    'instagram',
    'facebook',
    'kakao talk',
    'messenger'
  ];

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/signin');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };
    
    checkUser();
  }, [navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('community_category').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      setCategories(data || []);
    };
    
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {``
    e.preventDefault();
    
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    if (!formData.platforms) {
      alert('Please select a platform');
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from('community')
      .insert([{
        name: formData.name,
        description: formData.description,
        category: parseInt(formData.category),
        platforms: formData.platforms,
        members: formData.members ? parseInt(formData.members) : null,
        chat_link: formData.chat_link,
        user_id: user.id
      }])
      .select();

    setSubmitting(false);

    if (error) {
      console.error('Error creating community:', error);
      alert('Failed to create community. Please try again.');
      return;
    }

    alert('Community created successfully!');
    navigate('/community');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
        Create Community Group
      </h1>
      <p className="mb-8 text-gray-700">
        Share your community group with other foreigners in Korea.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Group Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter group name"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your community group"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div className="mb-6">
          <label htmlFor="platforms" className="block text-sm font-medium text-gray-700 mb-2">
            Platform <span className="text-red-500">*</span>
          </label>
          <select
            id="platforms"
            name="platforms"
            required
            value={formData.platforms}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a platform</option>
            {platformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        {/* Members */}
        <div className="mb-6">
          <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Members (optional)
          </label>
          <input
            type="number"
            id="members"
            name="members"
            min="0"
            value={formData.members}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter approximate member count"
          />
        </div>

        {/* Chat Link */}
        <div className="mb-6">
          <label htmlFor="chat_link" className="block text-sm font-medium text-gray-700 mb-2">
            Group Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="chat_link"
            name="chat_link"
            required
            value={formData.chat_link}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the invite link for your group
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Community'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="px-6 py-3 rounded-md font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}