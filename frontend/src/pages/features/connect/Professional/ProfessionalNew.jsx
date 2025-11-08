import React, { useState, useEffect } from 'react';
import { Camera, Upload, MapPin, Briefcase, Link, FileText, X, Check, Video, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { supabase } from '../../../../api/supabase-client';
import { useNavigate } from 'react-router';

// Style options with emoji and text combinations
const STYLE_OPTIONS = [
  { emoji: '💼', text: 'Professional' },
  { emoji: '🎯', text: 'Goal-Oriented' },
  { emoji: '🚀', text: 'Innovative' },
  { emoji: '💡', text: 'Creative' },
  { emoji: '⭐', text: 'Excellence-Driven' },
  { emoji: '🔥', text: 'Passionate' },
  { emoji: '✨', text: 'Dynamic' },
  { emoji: '🎨', text: 'Artistic' },
  { emoji: '📈', text: 'Results-Focused' },
  { emoji: '🏆', text: 'Achievement-Oriented' },
  { emoji: '💪', text: 'Determined' },
  { emoji: '🌟', text: 'Exceptional' },
  { emoji: '🤝', text: 'Collaborative' },
  { emoji: '💎', text: 'Premium' },
  { emoji: '🎓', text: 'Expert' },
  { emoji: '⚡', text: 'Energetic' },
  { emoji: '🌱', text: 'Growth-Minded' },
  { emoji: '🔑', text: 'Key Player' }
];

// Contact types
const CONTACT_TYPES = [
  { value: 'message', label: 'Message', prefix: '' },
  { value: 'telegram', label: 'Telegram', prefix: 'https://t.me/' },
  { value: 'whatsapp', label: 'WhatsApp', prefix: 'https://wa.me/' },
  { value: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/' },
  { value: 'kakao_talk', label: 'Kakao Talk', prefix: '' },
  { value: 'messenger', label: 'Messenger', prefix: 'https://m.me/' },
  { value: 'email', label: 'Email', prefix: 'mailto:' }
];

// Industry types
const INDUSTRY_TYPES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'legal', label: 'Legal' },
  { value: 'media', label: 'Media' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' }
];

const ProfessionalNew = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    quote: '',
    role: '',
    industry: 'real_estate',
    bio: '',
    location: { url: '', title: '' },
    experience: '',
    contact_type: 'email',
    contact_url: '',
    selected_styles: [],
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [userId, setUserId] = useState(null);
  const [uploadType, setUploadType] = useState('video');
  const [errors, setErrors] = useState({});
  const [imgPreview, setImgPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [videoId, setVideoId] = useState(null);
  
  // Store old file paths for deletion
  const [oldImgPath, setOldImgPath] = useState(null);
  const [oldBannerPath, setOldBannerPath] = useState(null);
  const navigate = useNavigate();



useEffect(() => {
  if (!user?.id) return;

  setUserId(user.id);

  const checkProfessionalAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('connect_professional')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If there's an error OTHER than "no rows found", log it but don't redirect
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking professional account:', error);
        return;
      }

      // If data exists (user already has a profile), redirect to edit page
      if (data) {
        navigate('/connect/professional/edit');
      }
      
      // If no data and error code is PGRST116, user can proceed to create profile
      // (no action needed, just stay on the page)
      
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  checkProfessionalAccount();
}, [user, navigate]);






  // Handle style selection (max 3)
  const toggleStyleSelection = (style) => {
    setFormData(prev => {
      const isSelected = prev.selected_styles.some(
        s => s.emoji === style.emoji && s.text === style.text
      );
      
      if (isSelected) {
        return {
          ...prev,
          selected_styles: prev.selected_styles.filter(
            s => !(s.emoji === style.emoji && s.text === style.text)
          )
        };
      } else {
        if (prev.selected_styles.length < 3) {
          return {
            ...prev,
            selected_styles: [...prev.selected_styles, style]
          };
        }
        return prev;
      }
    });
  };

  const isStyleSelected = (style) => {
    return formData.selected_styles.some(
      s => s.emoji === style.emoji && s.text === style.text
    );
  };

  // Validate image dimensions — kept as a util but not enforced anymore
  const validateImageDimensions = async (file) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      return await new Promise((resolve) => {
        img.onload = () => {
          const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
          URL.revokeObjectURL(objectUrl);
          resolve(dimensions);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve({ width: 0, height: 0 }); // fallback for invalid files
        };
        img.src = objectUrl;
      });
    } catch {
      return { width: 0, height: 0 };
    }
  };


  // Delete file from Supabase storage
  const deleteFile = async (bucket, path) => {
    if (!path) return;
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
      console.log(`Deleted file from ${bucket}: ${path}`);
    } catch (error) {
      console.error(`Error deleting file from ${bucket}:`, error);
    }
  };

  const safeDeleteFile = async (bucket, path) => {
    if (!path) return;
    try {
      await deleteFile(bucket, path);
    } catch (err) {
      console.warn(`Delete failed for ${bucket}/${path}:`, err.message);
    }
  };

  // Upload file to Supabase storage
  const uploadFile = async (file, bucket, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true, // allow re-uploads with same name
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    return { publicUrl: publicData.publicUrl, path };
  };

  // Handle profile image upload (DIMENSION RESTRICTION REMOVED)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImgPreview(previewUrl);

    // NOTE: dimension validation intentionally not enforced per requirements.
    // const dimensions = await validateImageDimensions(file);

    if (!userId) {
      setErrors(prev => ({ ...prev, img_url: 'Please log in to upload images' }));
      return;
    }

    setErrors(prev => ({ ...prev, img_url: null }));
    setUploadingImage(true);

    try {
      await safeDeleteFile('connect_professional_img', oldImgPath);

      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userId}/${fileName}`;
      const { publicUrl, path } = await uploadFile(file, 'connect_professional_img', filePath);

      setFormData(prev => ({ ...prev, img_url: publicUrl }));
      setOldImgPath(path);

      console.log('✅ Image uploaded:', path);
    } catch (error) {
      console.error('Image upload error:', error.message || error);
      setErrors(prev => ({ ...prev, img_url: 'Failed to upload image' }));
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle banner image upload (DIMENSION RESTRICTION REMOVED)
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setBannerPreview(previewUrl);

    // NOTE: dimension validation intentionally not enforced per requirements.
    // const dimensions = await validateImageDimensions(file);

    if (!userId) {
      setErrors(prev => ({ ...prev, banner_url: 'Please sign in to upload banners' }));
      return;
    }

    setErrors(prev => ({ ...prev, banner_url: null }));
    setUploadingBanner(true);

    try {
      await safeDeleteFile('connect_professional_banner', oldBannerPath);

      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userId}/${fileName}`;
      const { publicUrl, path } = await uploadFile(file, 'connect_professional_banner', filePath);

      setFormData(prev => ({ ...prev, banner_url: publicUrl }));
      setOldBannerPath(path);

      console.log('✅ Banner uploaded:', path);
    } catch (error) {
      console.error('Banner upload error:', error.message || error);
      setErrors(prev => ({ ...prev, banner_url: 'Failed to upload banner' }));
    } finally {
      setUploadingBanner(false);
    }
  };

  // Handle business document upload
  const handleBusinessDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !userId) return;

    setErrors(prev => ({ ...prev, business_data_url: null }));
    const uploadErrors = [];
    const uploadedUrls = [];

    try {
      for (const file of files) {
        try {
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `${userId}/${fileName}`;
          const { publicUrl, path } = await uploadFile(file, 'connect_business_docs', filePath);
          uploadedUrls.push({ name: file.name, url: publicUrl, path });
          console.log('✅ Document uploaded:', path);
        } catch (err) {
          console.error(`Error uploading ${file.name}:`, err.message || err);
          uploadErrors.push(file.name);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          business_data_url: [...(prev.business_data_url || []), ...uploadedUrls],
        }));
      }

      if (uploadErrors.length > 0) {
        setErrors(prev => ({
          ...prev,
          business_data_url: `Failed to upload: ${uploadErrors.join(', ')}`,
        }));
      }
    } catch (error) {
      console.error('Document upload error:', error.message || error);
      setErrors(prev => ({ ...prev, business_data_url: 'Failed to upload documents' }));
    }
  };

  // Generate contact URL
  const generateContactUrl = (type, value) => {
    const contactType = CONTACT_TYPES.find(ct => ct.value === type);
    if (!contactType) return value;
    return `${contactType.prefix}${value}`;
  };

  // Generate social links
  const generateSocialLinks = (socials) => {
    const links = {};
    if (socials.instagram_username) links.instagram = `https://instagram.com/${socials.instagram_username}`;
    if (socials.tiktok_username) links.tiktok = `https://tiktok.com/@${socials.tiktok_username}`;
    if (socials.facebook_username) links.facebook = `https://facebook.com/${socials.facebook_username}`;
    if (socials.website_url) links.website = socials.website_url;
    return links;
  };

  // Extract YouTube ID
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

  // Handle upload type change
  const handleUploadTypeChange = async (type) => {
    setUploadType(type);
    
    // If switching to video, delete banner if exists
    if (type === 'video' && oldBannerPath) {
      await deleteFile('connect_professional_banner', oldBannerPath);
      setBannerPreview(null);
      setOldBannerPath(null);
      setFormData(prev => ({ ...prev, banner_url: null }));
    }
    
    // If switching to banner, clear video URL
    if (type === 'banner') {
      setVideoId(null);
      setFormData(prev => ({ ...prev, video_url: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (formData.full_name.length > 100) newErrors.full_name = 'Full name must be 100 characters or less';
    if (formData.quote.length > 150) newErrors.quote = 'Quote must be 150 characters or less';
    if (formData.selected_styles.length !== 3) newErrors.selected_styles = 'Please select exactly 3 professional styles';
    if (uploadType === 'video' && formData.video_url && !extractYouTubeId(formData.video_url)) {
      newErrors.video_url = 'Please enter a valid YouTube URL';
    }
    if (!formData.contact_url.trim()) newErrors.contact_url = 'Contact information is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
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
        show_type: uploadType,
        style: formData.selected_styles,
        socials: generateSocialLinks(formData.socials),
        business_data_url: formData.business_data_url,
        verified: false,
        show: false
      };

      const { data, error } = await supabase
        .from('connect_professional')
        .insert([submissionData])
        .select();

      if (error) throw error;

      console.log('Profile created:', data);
      alert('Professional profile created successfully!');
      
      // Reset form
      setFormData({
        full_name: '',
        quote: '',
        role: '',
        industry: 'real_estate',
        bio: '',
        location: { url: '', title: '' },
        experience: '',
        contact_type: 'email',
        contact_url: '',
        selected_styles: [],
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
      setOldImgPath(null);
      setOldBannerPath(null);
      setErrors({});
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to create profile: ' + (error.message || error));
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
                      onClick={async () => {
                        if (oldImgPath) {
                          await deleteFile('connect_professional_img', oldImgPath);
                          setOldImgPath(null);
                        }
                        setImgPreview(null);
                        setFormData(prev => ({ ...prev, img_url: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition w-fit disabled:opacity-50">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {imgPreview ? 'Change Image' : 'Upload Image'}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
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

            {/* Professional Styles - Select 3 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Professional Styles <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">
                  (Select exactly 3 that best describe you)
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLE_OPTIONS.map((style, idx) => {
                  const selected = isStyleSelected(style);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleStyleSelection(style)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                        ${selected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                        ${formData.selected_styles.length >= 3 && !selected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      disabled={formData.selected_styles.length >= 3 && !selected}
                    >
                      <span className="text-xl">{style.emoji}</span>
                      <span className="text-sm font-medium">{style.text}</span>
                      {selected && <Check className="w-4 h-4 ml-auto text-blue-600" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Selected:</span>
                <span className={`font-semibold ${formData.selected_styles.length === 3 ? 'text-green-600' : 'text-blue-600'}`}>
                  {formData.selected_styles.length}/3
                </span>
              </div>
              {formData.selected_styles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selected_styles.map((style, idx) => (
                    <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      <span>{style.emoji}</span>
                      <span>{style.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {errors.selected_styles && <p className="text-red-500 text-sm">{errors.selected_styles}</p>}
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
                {INDUSTRY_TYPES.map(ind => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
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
              <div className="grid gap-2">
                <input
                  type="text"
                  value={formData.location.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, title: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Location name (e.g., New York, USA)"
                />
                <input
                  type="url"
                  value={formData.location.url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, url: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Location URL (e.g., Google Maps link)"
                />
              </div>
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
                    onChange={(e) => handleUploadTypeChange(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>YouTube Video</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="banner"
                    checked={uploadType === 'banner'}
                    onChange={(e) => handleUploadTypeChange(e.target.value)}
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
                        onClick={async () => {
                          if (oldBannerPath) {
                            await deleteFile('connect_professional_banner', oldBannerPath);
                            setOldBannerPath(null);
                          }
                          setBannerPreview(null);
                          setFormData(prev => ({ ...prev, banner_url: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition w-fit disabled:opacity-50">
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {bannerPreview ? 'Change Banner' : 'Upload Banner'}
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={uploadingBanner}
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
                        onClick={async () => {
                          if (doc.path) {
                            await deleteFile('connect_professional_business', doc.path);
                          }
                          setFormData(prev => ({
                            ...prev,
                            business_data_url: prev.business_data_url.filter((_, i) => i !== idx)
                          }));
                        }}
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
              disabled={loading || !userId || uploadingImage || uploadingBanner}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Professional Profile'
              )}
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

export default ProfessionalNew;