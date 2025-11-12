import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase-client";
import { FiUpload, FiX, FiAlertCircle } from "react-icons/fi";

export default function MarketplacePostPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category_id: "",
    brand_id: "",
    stock: "1",
    is_negotiable: false,
    condition: "used",
    seller_contact_type: "message",
    seller_contact: "",
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        navigate("/signin");
        return;
      }
      setUserId(data.user.id);
    };
    checkAuth();
  }, [navigate]);

  // Fetch categories and brands
  useEffect(() => {
    const fetchData = async () => {
      const { data: categoryData } = await supabase
        .from("marketplace_category")
        .select("*")
        .order("name");
      
      const { data: brandData } = await supabase
        .from("marketplace_brand")
        .select("*")
        .order("name");

      setCategories(categoryData || []);
      setBrands(brandData || []);
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Generate contact link based on type and input
  const generateContactLink = (type, contact) => {
    if (!contact || !contact.trim()) return null;
    
    const trimmedContact = contact.trim();
    
    switch(type) {
      case "message":
        // SMS link
        return `sms:${trimmedContact}`;
      
      case "telegram":
        // Telegram username (remove @ if present)
        const telegramUser = trimmedContact.replace(/^@/, '');
        return `https://t.me/${telegramUser}`;
      
      case "whatsapp":
        // WhatsApp number (remove non-digits)
        const whatsappNumber = trimmedContact.replace(/\D/g, '');
        return `https://wa.me/${whatsappNumber}`;
      
      case "instagram":
        // Instagram username (remove @ if present)
        const instaUser = trimmedContact.replace(/^@/, '');
        return `https://instagram.com/${instaUser}`;
      
      case "kakao talk":
        // KakaoTalk ID
        return `https://open.kakao.com/o/${trimmedContact}`;
      
      case "messenger":
        // Facebook Messenger username
        return `https://m.me/${trimmedContact}`;
      
      case "email":
        // Email link
        return `mailto:${trimmedContact}`;
      
      default:
        return null;
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Clear previous error
    setError("");
    
    // Check total image count
    if (files.length + imageFiles.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} exceeds 5MB limit`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join("; "));
      if (validFiles.length === 0) return;
    }

    // Add valid files
    setImageFiles(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setError(""); // Clear error when removing images
  };

  const uploadImages = async (productTitle) => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls = [];
    
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split(".").pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileName = `${userId}/${productTitle}/${timestamp}_${randomStr}.${fileExt}`;
        
        // Upload file
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Failed to upload image ${i + 1}:`, uploadError);
          throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }
      
      return uploadedUrls;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(false);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (formData.title.length > 100) {
        throw new Error("Title must be 100 characters or less");
      }
      if (formData.description.length > 1000) {
        throw new Error("Description must be 1000 characters or less");
      }

      // IMPROVED PRICE VALIDATION
      const priceValue = parseFloat(String(formData.price).replace(/[^\d.]/g, ''));
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Valid price is required");
      }

      if (!formData.category_id) {
        throw new Error("Category is required");
      }
      if (imageFiles.length === 0) {
        throw new Error("At least one image is required");
      }
      if (!formData.seller_contact_type) {
        throw new Error("Contact type is required");
      }
      if (!formData.seller_contact.trim()) {
        throw new Error("Contact information is required");
      }

      // Set loading AFTER validation passes
      setLoading(true);

      // Upload images first with the actual title
      console.log(`Uploading ${imageFiles.length} images...`);
      const imageUrls = await uploadImages(formData.title.trim());
      
      if (imageUrls.length === 0) {
        throw new Error("Failed to upload images");
      }

      console.log("Images uploaded successfully:", imageUrls);

      // Generate contact link
      const contactLink = generateContactLink(formData.seller_contact_type, formData.seller_contact);

      // Prepare marketplace data - match your exact database schema
      const marketplaceData = {
        user_id: userId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: priceValue, // Use cleaned price value
        location: formData.location.trim() || null,
        category_id: parseInt(formData.category_id),
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        stock: parseInt(formData.stock) || 1,
        is_negotiable: formData.is_negotiable,
        condition: formData.condition,
        seller_contact_type: formData.seller_contact_type,
        seller_contact: contactLink,
        images: { images: imageUrls },
        views: 0
      };

      console.log("Inserting marketplace data:", marketplaceData);

      // Insert marketplace item
      const { data, error: insertError } = await supabase
        .from("marketplace")
        .insert(marketplaceData)
        .select()
        .single();

      if (insertError) {
        console.error("Insert error details:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        throw new Error(insertError.message || "Failed to insert listing");
      }

      console.log("Listing created successfully:", data);

      // Update contact link with product information
      const updatedContactLink = (contactLink, productId, productTitle) => {
        if (!contactLink || !contactLink.trim()) return null;

        const trimmedLink = contactLink.trim();
        const encodedMessage = encodeURIComponent(
          `Hello, I am interested in your ${productTitle} listed on the Marketplace. Product Link - https://koreaeasy.org/marketplace/${productId}`
        );

        try {
          const lowerLink = trimmedLink.toLowerCase();

          if (lowerLink.includes("wa.me") || lowerLink.includes("whatsapp.com")) {
            return `${trimmedLink}${trimmedLink.includes("?") ? "&" : "?"}text=${encodedMessage}`;
          }

          if (lowerLink.includes("t.me")) {
            return `${trimmedLink}${trimmedLink.includes("?") ? "&" : "?"}text=${encodedMessage}`;
          }

          if (lowerLink.startsWith("sms:")) {
            return `${trimmedLink}${trimmedLink.includes("?") ? "&" : "?"}body=${encodedMessage}`;
          }

          if (lowerLink.startsWith("mailto:")) {
            return `${trimmedLink}${trimmedLink.includes("?") ? "&" : "?"}body=${encodedMessage}`;
          }

          if (lowerLink.includes("m.me")) {
            return `${trimmedLink}${trimmedLink.includes("?") ? "&" : "?"}text=${encodedMessage}`;
          }

          // Unsupported or no text support
          return trimmedLink;

        } catch (err) {
          console.error("Invalid contact link:", trimmedLink, err);
          return trimmedLink;
        }
      };

    // Update the contact link with product details
    const updatedContact = updatedContactLink(data.seller_contact, data.id, data.title);

    if (updatedContact && updatedContact !== data.seller_contact) {
      const { error: updateError } = await supabase
        .from("marketplace")
        .update({
          seller_contact: updatedContact,
        })
        .eq("id", data.id);

      if (updateError) {
        console.error("Error updating contact link:", updateError);
        // Don't throw - listing is already created
      }
    }

    // Redirect to item page
    navigate(`/marketplace/${data.id}`);

  } catch (err) {
    setError(err.message || "Failed to create listing");
    console.error("Error creating listing:", err);
    
    // Log the current form state for debugging
    console.log("Form state at error:", {
      title: formData.title,
      price: formData.price,
      priceType: typeof formData.price,
      category_id: formData.category_id
    });
  } finally {
    setLoading(false);
  }
};

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Create New Listing
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              {/* <p className="text-red-700 text-sm">{error}</p> */}
              <p className="text-red-700 text-sm">Upload failed. Please review your entries, avoid AI-generated titles, and ensure all fields are filled accurately.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">
                  ({imageFiles.length}/10 images, max 5MB each)
                </span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <FiX size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {imagePreviews.length < 10 && (
                  <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors">
                    <FiUpload className="text-gray-400 mb-2" size={24} />
                    <span className="text-xs text-gray-500 text-center px-2">
                      Add Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={loading || uploadingImages}
                    />
                  </label>
                )}
              </div>

              {imageFiles.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Upload at least one image of your item
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">
                  ({formData.title.length}/100)
                </span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g., iPhone 13 Pro Max 256GB"
                required
                disabled={loading}
              />
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  id="brand_id"
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select brand (optional)</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price, Stock, Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₩) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="100"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  disabled={loading}
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g., Daejeon, Seoul"
                disabled={loading}
              />
            </div>

            {/* Your Contact Information */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Contact Information
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                How should buyers contact you about this item?
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seller_contact_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="seller_contact_type"
                    name="seller_contact_type"
                    value={formData.seller_contact_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                    disabled={loading}
                  >
                    <option value="message">SMS/Message</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="kakao talk">Kakao Talk</option>
                    <option value="messenger">Messenger</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="seller_contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="seller_contact"
                    name="seller_contact"
                    value={formData.seller_contact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder={
                      formData.seller_contact_type === "message" ? "Your phone number" :
                      formData.seller_contact_type === "telegram" ? "Your @username" :
                      formData.seller_contact_type === "whatsapp" ? "Your phone number" :
                      formData.seller_contact_type === "instagram" ? "Your @username" :
                      formData.seller_contact_type === "kakao talk" ? "Your KakaoTalk ID" :
                      formData.seller_contact_type === "messenger" ? "Your username" :
                      "Your email address"
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {formData.seller_contact_type === "message" && "Buyers will be able to message you (no calls)"}
                {formData.seller_contact_type === "telegram" && "Buyers will be able to message you on Telegram"}
                {formData.seller_contact_type === "whatsapp" && "Buyers will be able to message you on WhatsApp (no calls)"}
                {formData.seller_contact_type === "instagram" && "Buyers will be able to message you on Instagram"}
                {formData.seller_contact_type === "kakao talk" && "Buyers will be able to message you on Kakao Talk"}
                {formData.seller_contact_type === "messenger" && "Buyers will be able to message you on Messenger"}
                {formData.seller_contact_type === "email" && "Buyers will be able to email you"}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
                <span className="text-gray-500 font-normal ml-2">
                  ({formData.description.length}/1000)
                </span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={1000}
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                placeholder="Describe your item in detail...&#10;&#10;You can use multiple lines.&#10;Press Enter for new lines."
                disabled={loading}
              />
            </div>

            {/* Negotiable */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_negotiable"
                name="is_negotiable"
                checked={formData.is_negotiable}
                onChange={handleInputChange}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                disabled={loading}
              />
              <label htmlFor="is_negotiable" className="ml-2 text-sm text-gray-700">
                Price is negotiable
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingImages 
                  ? "Uploading images..." 
                  : loading 
                  ? "Creating listing..." 
                  : "Create Listing"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                disabled={loading || uploadingImages}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}