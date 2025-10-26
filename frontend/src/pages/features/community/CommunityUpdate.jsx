import { form } from 'framer-motion/client';
import { supabase } from '../../../api/supabase-client';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CommunityUpdate() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get community ID from URL params
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  
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

  // Check authentication and fetch community data
  useEffect(() => {
    const checkUserAndFetchCommunity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/signin');
        return;
      }
      
      setUser(session.user);

      // Fetch the community data
      const { data: communityData, error } = await supabase
        .from('community')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !communityData) {
        console.error('Error fetching community:', error);
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check if user owns this community
      if (communityData.user_id !== session.user.id) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      // Populate form with existing data
      setFormData({
        name: communityData.name || '',
        description: communityData.description || '',
        category: communityData.category?.toString() || '',
        platforms: communityData.platforms || '',
        members: communityData.members?.toString() || '',
        chat_link: communityData.chat_link || '',
        icon: communityData.icon || ''
      });

      setLoading(false);
    };
    
    checkUserAndFetchCommunity();
  }, [navigate, id]);

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

  const handleSubmit = async (e) => {
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
      .update({
        name: formData.name,
        description: formData.description,
        category: parseInt(formData.category),
        platforms: formData.platforms,
        members: formData.members ? parseInt(formData.members) : null,
        chat_link: formData.chat_link
      })
      .eq('user_id', user.id).eq('id', id) // Extra safety check
      .select();

    setSubmitting(false);

    if (error) {
      console.error('Error updating community:', error);
      alert('Failed to update community. Please try again.');
      return;
    }

    alert('Community updated successfully!');
    navigate('/community');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('community')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    setSubmitting(false);

    if (error) {
      console.error('Error deleting community:', error);
      alert('Failed to delete community. Please try again.');
      return;
    }

    alert('Community deleted successfully!');
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

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Community Not Found</h2>
          <p className="text-red-600 mb-4">The community you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/community')}
            className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Unauthorized</h2>
          <p className="text-yellow-600 mb-4">You don't have permission to edit this community.</p>
          <button
            onClick={() => navigate('/community')}
            className="bg-yellow-600 text-white px-6 py-2 rounded-md font-medium hover:bg-yellow-700 transition-colors"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
        Update Community Group
      </h1>
      <p className="mb-8 text-gray-700">
        Edit your community group information.
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
            Description <span className="text-red-500">*</span>170~180 <span className="text-gray-400 font-normal">({formData.description.length} characters)</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            maxLength="180"
            minLength="170"
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

        {/* Action Buttons */}
        <div className="flex gap-4 mb-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Updating...' : 'Update Community'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="px-6 py-3 rounded-md font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Delete Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="w-full bg-red-500 text-white px-6 py-3 rounded-md font-medium hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Deleting...' : 'Delete Community'}
          </button>
          <p className="mt-2 text-sm text-gray-500 text-center">
            This action cannot be undone.
          </p>
        </div>
      </form>
    </div>
  );
}