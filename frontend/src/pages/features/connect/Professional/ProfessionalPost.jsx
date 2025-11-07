import React, { useState, useEffect } from 'react';
import { Camera, Upload, MapPin, Briefcase, Link, FileText, X, Check, Video } from 'lucide-react';
import { supabase } from '../../../../api/supabase-client';
import { useAuth } from '../../../../context/AuthContext';

// Emoji picker data
const STYLE_EMOJIS = ['💼', '🎯', '🚀', '💡', '⭐', '🔥', '✨', '🎨', '📈', '🏆', '💪', '🌟'];

// Contact types from the image
const CONTACT_TYPES = [
  { value: 'message', label: 'Message', prefix: '' },
  { value: 'telegram', label: 'Telegram', prefix: 'https://t.me/' },
  { value: 'whatsapp', label: 'WhatsApp', prefix: 'https://wa.me/' },
  { value: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/' },
  { value: 'kakao_talk', label: 'Kakao Talk', prefix: '' },
  { value: 'messenger', label: 'Messenger', prefix: 'https://m.me/' },
  { value: 'email', label: 'Email', prefix: 'mailto:' }
];

const ProfessionalPostPage = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    quote: '',
    role: '',
    industry: 'real_estate',
    bio: '',
    location: { lat: null, lng: null, address: '' },
    experience: '',
    contact_type: 'email',
    contact_url: '',
    style_emoji: '💼',
    style_text: '',
    img_url: null,
    video_url: '',
    banner_url: null,
    socials: {
      instagram_username: '',
      tiktok_username: '',
      facebook_username: '',
      website_url: ''
    },
    business_data_url: []
  });

  const [industries, setIndustries] = useState(['real_estate']);

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(user.id);
  const [uploadType, setUploadType] = useState('video'); // 'video' or 'banner'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [imgPreview, setImgPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [videoId, setVideoId] = useState(null);

  // Get user's location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: prev.location.address
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Validate image dimensions
  const validateImageDimensions = (file, expectedRatio) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ width: img.width, height: img.height });
      };
    });
  };

  // Upload file to Supabase storage
  const uploadFile = async (file, bucket, path) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImgPreview(previewUrl);

    const dimensions = await validateImageDimensions(file, 3 / 4);
    
    // Check if image is close to 3:4 ratio (allow 10% tolerance)
    const ratio = dimensions.width / dimensions.height;
    if (Math.abs(ratio - 0.75) > 0.075) {
      setErrors(prev => ({ ...prev, img_url: `Image should be in 3:4 ratio (e.g., 600x800, 900x1200). Current: ${dimensions.width}x${dimensions.height}` }));
      // Don't return - keep the preview but show warning
    } else {
      setErrors(prev => ({ ...prev, img_url: null }));
    }

    if (!userId) {
      setErrors(prev => ({ ...prev, img_url: 'Please log in to upload images' }));
      return;
    }

    try {
      const url = await uploadFile(
        file,
        'connect_professional_img',
        `${userId}/img_${Date.now()}.${file.name.split('.').pop()}`
      );
      setFormData(prev => ({ ...prev, img_url: url }));
    } catch (error) {
      setErrors(prev => ({ ...prev, img_url: 'Failed to upload image' }));
    }
  };

  // Handle banner image upload
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setBannerPreview(previewUrl);

    const dimensions = await validateImageDimensions(file, 16 / 9);
    
    // Check if banner is 1920x1080 or proportional
    if (dimensions.width !== 1920 || dimensions.height !== 1080) {
      setErrors(prev => ({ ...prev, banner_url: `Banner should be 1920x1080 resolution. Current: ${dimensions.width}x${dimensions.height}` }));
      // Don't return - keep the preview but show warning
    } else {
      setErrors(prev => ({ ...prev, banner_url: null }));
    }

    if (!userId) {
      setErrors(prev => ({ ...prev, banner_url: 'Please log in to upload banners' }));
      return;
    }

    try {
      const url = await uploadFile(
        file,
        'connect_professional_banner',
        `${userId}/banner_${Date.now()}.${file.name.split('.').pop()}`
      );
      setFormData(prev => ({ ...prev, banner_url: url }));
    } catch (error) {
      setErrors(prev => ({ ...prev, banner_url: 'Failed to upload banner' }));
    }
  };

  // Handle business document upload
  const handleBusinessDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !userId) return;

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadFile(
          file,
          'connect_professional_business',
          `${userId}/${file.name}`
        );
        uploadedUrls.push({ name: file.name, url });
      }
      setFormData(prev => ({
        ...prev,
        business_data_url: [...prev.business_data_url, ...uploadedUrls]
      }));
    } catch (error) {
      setErrors(prev => ({ ...prev, business_data_url: 'Failed to upload documents' }));
    }
  };

  // Generate contact URL based on contact type
  const generateContactUrl = (type, value) => {
    const contactType = CONTACT_TYPES.find(ct => ct.value === type);
    if (!contactType) return value;
    return `${contactType.prefix}${value}`;
  };

  // Generate social links
  const generateSocialLinks = (socials) => {
    const links = {};
    if (socials.instagram_username) {
      links.instagram = `https://instagram.com/${socials.instagram_username}`;
    }
    if (socials.tiktok_username) {
      links.tiktok = `https://tiktok.com/@${socials.tiktok_username}`;
    }
    if (socials.facebook_username) {
      links.facebook = `https://facebook.com/${socials.facebook_username}`;
    }
    if (socials.website_url) {
      links.website = socials.website_url;
    }
    return links;
  };

  // Validate YouTube URL and extract video ID
  const extractYouTubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const isValidYouTubeUrl = (url) => {
    return extractYouTubeId(url) !== null;
  };

  // Handle video URL change
  const handleVideoUrlChange = (url) => {
    setFormData(prev => ({ ...prev, video_url: url }));
    const id = extractYouTubeId(url);
    setVideoId(id);
    if (url && !id) {
      setErrors(prev => ({ ...prev, video_url: 'Invalid YouTube URL' }));
    } else {
      setErrors(prev => ({ ...prev, video_url: null }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (formData.full_name.length > 100) newErrors.full_name = 'Full name must be 100 characters or less';
    if (formData.quote.length > 150) newErrors.quote = 'Quote must be 150 characters or less';
    if (uploadType === 'video' && formData.video_url && !isValidYouTubeUrl(formData.video_url)) {
      newErrors.video_url = 'Please enter a valid YouTube URL';
    }
    if (!formData.contact_url.trim()) newErrors.contact_url = 'Contact information is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for submission
      const submissionData = {
        user_id: userId,
        full_name: formData.full_name,
        quote: formData.quote,
        role: formData.role,
        industry: formData.industry,
        bio: formData.bio,
        location: formData.location,
        experience: parseInt(formData.experience) || null,
        contact_type: formData.contact_type,
        contact_url: generateContactUrl(formData.contact_type, formData.contact_url),
        img_url: formData.img_url,
        video_url: uploadType === 'video' ? formData.video_url : null,
        banner_url: uploadType === 'banner' ? formData.banner_url : null,
        style: {
          emoji: formData.style_emoji,
          text: formData.style_text
        },
        socials: generateSocialLinks(formData.socials),
        business_data_url: formData.business_data_url,
        verified: false,
        show: true,
        created_at: new Date().toISOString()
      };

      // Submit to Supabase
      const { data, error } = await supabase
        .from('connect_professional')
        .insert([submissionData])
        .select();

      if (error) throw error;

      alert('Professional profile created successfully!');
      
      // Reset form
      setFormData({
        full_name: '',
        quote: '',
        role: '',
        industry: 'real_estate',
        bio: '',
        location: { lat: null, lng: null, address: '' },
        experience: '',
        contact_type: 'email',
        contact_url: '',
        style_emoji: '💼',
        style_text: '',
        img_url: null,
        video_url: '',
        banner_url: null,
        socials: {
          instagram_username: '',
          tiktok_username: '',
          facebook_username: '',
          website_url: ''
        },
        business_data_url: []
      });
      setImgPreview(null);
      setBannerPreview(null);
      setVideoId(null);
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Professional Profile</h1>
          <p className="text-gray-600 mb-8">Share your expertise and connect with opportunities</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Camera className="inline w-4 h-4 mr-2" />
                Profile Image (3:4 ratio)
              </label>
              <div className="flex flex-col gap-4">
                {imgPreview && (
                  <div className="relative w-48 h-64">
                    <img 
                      src={imgPreview} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover rounded-lg shadow-lg" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImgPreview(null);
                        setFormData(prev => ({ ...prev, img_url: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition w-fit">
                  <Upload className="w-4 h-4" />
                  {imgPreview ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.img_url && <p className="text-red-500 text-sm">{errors.img_url}</p>}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              <p className="text-xs text-gray-500">{formData.full_name.length}/100</p>
              {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name}</p>}
            </div>

            {/* Style with Emoji */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Professional Style
              </label>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-12 h-12 text-2xl border-2 border-gray-300 rounded-lg hover:border-blue-500 transition flex items-center justify-center"
                  >
                    {formData.style_emoji}
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-14 left-0 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-2 grid grid-cols-6 gap-1 z-10">
                      {STYLE_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, style_emoji: emoji }));
                            setShowEmojiPicker(false);
                          }}
                          className="w-10 h-10 text-xl hover:bg-blue-100 rounded transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.style_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, style_text: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Collaborative, Innovative, Strategic"
                />
              </div>
            </div>

            {/* Quote */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Professional Quote
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
                maxLength={150}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your professional motto or vision"
              />
              <p className="text-xs text-gray-500">{formData.quote.length}/150</p>
              {errors.quote && <p className="text-red-500 text-sm">{errors.quote}</p>}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Briefcase className="inline w-4 h-4 mr-2" />
                Professional Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Real Estate Agent, Property Manager, Broker"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>
                    {ind.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Professional Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about your professional background and expertise"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <MapPin className="inline w-4 h-4 mr-2" />
                Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your location"
                />
                <button
                  type="button"
                  onClick={getLocation}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Get Location
                </button>
              </div>
              {formData.location.lat && (
                <p className="text-xs text-gray-600">
                  Coordinates: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                </p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter years of experience"
              />
            </div>

            {/* Contact Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Contact Information <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.contact_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_type: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CONTACT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formData.contact_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_url: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.contact_type === 'email' ? 'your@email.com' : 'username or number'}
                />
              </div>
              {errors.contact_url && <p className="text-red-500 text-sm">{errors.contact_url}</p>}
            </div>

            {/* Video or Banner Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Video className="inline w-4 h-4 mr-2" />
                Media Content
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="video"
                    checked={uploadType === 'video'}
                    onChange={(e) => {
                      setUploadType(e.target.value);
                      setBannerPreview(null);
                      setFormData(prev => ({ ...prev, banner_url: null }));
                    }}
                    className="w-4 h-4"
                  />
                  <span>YouTube Video</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="banner"
                    checked={uploadType === 'banner'}
                    onChange={(e) => {
                      setUploadType(e.target.value);
                      setVideoId(null);
                      setFormData(prev => ({ ...prev, video_url: '' }));
                    }}
                    className="w-4 h-4"
                  />
                  <span>Banner Image (1920x1080)</span>
                </label>
              </div>

              {uploadType === 'video' ? (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {videoId && (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {errors.video_url && <p className="text-red-500 text-sm">{errors.video_url}</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {bannerPreview && (
                    <div className="relative w-full">
                      <img 
                        src={bannerPreview} 
                        alt="Banner Preview" 
                        className="w-full h-64 object-cover rounded-lg shadow-lg" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerPreview(null);
                          setFormData(prev => ({ ...prev, banner_url: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition w-fit">
                    <Upload className="w-4 h-4" />
                    {bannerPreview ? 'Change Banner' : 'Upload Banner'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                  {errors.banner_url && <p className="text-red-500 text-sm">{errors.banner_url}</p>}
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Link className="inline w-4 h-4 mr-2" />
                Social Media
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.socials.instagram_username}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socials: { ...prev.socials, instagram_username: e.target.value }
                  }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Instagram username"
                />
                <input
                  type="text"
                  value={formData.socials.tiktok_username}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socials: { ...prev.socials, tiktok_username: e.target.value }
                  }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="TikTok username"
                />
                <input
                  type="text"
                  value={formData.socials.facebook_username}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socials: { ...prev.socials, facebook_username: e.target.value }
                  }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Facebook username"
                />
                <input
                  type="url"
                  value={formData.socials.website_url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socials: { ...prev.socials, website_url: e.target.value }
                  }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Website URL"
                />
              </div>
            </div>

            {/* Business Documents */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <FileText className="inline w-4 h-4 mr-2" />
                Business Documents
              </label>
              <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition w-fit">
                <Upload className="w-4 h-4" />
                Upload Documents
                <input
                  type="file"
                  multiple
                  onChange={handleBusinessDocUpload}
                  className="hidden"
                />
              </label>
              {formData.business_data_url.length > 0 && (
                <div className="space-y-1 mt-2">
                  {formData.business_data_url.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                      <Check className="w-4 h-4 text-green-600" />
                      {doc.name}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          business_data_url: prev.business_data_url.filter((_, i) => i !== idx)
                        }))}
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.business_data_url && <p className="text-red-500 text-sm">{errors.business_data_url}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !userId}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Professional Profile'}
            </button>

            {!userId && (
              <p className="text-center text-red-500 text-sm">Please log in to create a profile</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPostPage;