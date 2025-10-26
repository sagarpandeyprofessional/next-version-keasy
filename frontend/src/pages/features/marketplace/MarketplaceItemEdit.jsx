import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../api/supabase-client";
import { FiUpload, FiX, FiAlertCircle, FiTrash2 } from "react-icons/fi";

export default function MarketplaceEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [itemLoading, setItemLoading] = useState(true);

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

  // Check authentication and ownership
  useEffect(() => {
    const checkAuthAndOwnership = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        navigate("/signin");
        return;
      }
      setUserId(userData.user.id);

      // Fetch item and verify ownership
      const { data: itemData, error: itemError } = await supabase
        .from("marketplace")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (itemError || !itemData) {
        setError("Item not found");
        setItemLoading(false);
        return;
      }

      // Check if user owns this item
      if (itemData.user_id !== userData.user.id) {
        setError("You don't have permission to edit this item");
        setIsOwner(false);
        setItemLoading(false);
        return;
      }

      setIsOwner(true);
      
      // Populate form with existing data
      setFormData({
        title: itemData.title || "",
        description: itemData.description || "",
        price: itemData.price?.toString() || "",
        location: itemData.location || "",
        category_id: itemData.category_id?.toString() || "",
        brand_id: itemData.brand_id?.toString() || "",
        stock: itemData.stock?.toString() || "1",
        is_negotiable: itemData.is_negotiable || false,
        condition: itemData.condition || "used",
        seller_contact_type: itemData.seller_contact_type || "message",
        seller_contact: extractContactFromLink(itemData.seller_contact, itemData.seller_contact_type),
      });

      // Set existing images
      if (itemData.images?.images) {
        setExistingImages(itemData.images.images);
      }

      setItemLoading(false);
    };

    checkAuthAndOwnership();
  }, [navigate, id]);

  // Extract original contact info from link
  const extractContactFromLink = (link, type) => {
    if (!link) return "";
    
    try {
      switch(type) {
        case "message":
          return link.replace("sms:", "");
        case "telegram":
          return link.replace("https://t.me/", "");
        case "whatsapp":
          return link.replace("https://wa.me/", "");
        case "instagram":
          return link.replace("https://instagram.com/", "");
        case "kakao talk":
          return link.replace("https://open.kakao.com/o/", "");
        case "messenger":
          return link.replace("https://m.me/", "");
        case "email":
          return link.replace("mailto:", "");
        default:
          return link;
      }
    } catch {
      return link;
    }
  };

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

  const generateContactLink = (type, contact) => {
    if (!contact || !contact.trim()) return null;
    
    const trimmedContact = contact.trim();
    
    switch(type) {
      case "message":
        return `sms:${trimmedContact}`;
      case "telegram":
        const telegramUser = trimmedContact.replace(/^@/, '');
        return `https://t.me/${telegramUser}`;
      case "whatsapp":
        const whatsappNumber = trimmedContact.replace(/\D/g, '');
        return `https://wa.me/${whatsappNumber}`;
      case "instagram":
        const instaUser = trimmedContact.replace(/^@/, '');
        return `https://instagram.com/${instaUser}`;
      case "kakao talk":
        return `https://open.kakao.com/o/${trimmedContact}`;
      case "messenger":
        return `https://m.me/${trimmedContact}`;
      case "email":
        return `mailto:${trimmedContact}`;
      default:
        return null;
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    setError("");
    
    const totalImages = existingImages.length + imageFiles.length + files.length;
    if (totalImages > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

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

    setImageFiles(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setError("");
  };

  const removeExistingImage = (imageUrl) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
    setImagesToDelete(prev => [...prev, imageUrl]);
    setError("");
  };

  const deleteImagesFromStorage = async (imageUrls) => {
    for (const url of imageUrls) {
      try {
        // Extract file path from URL
        const urlParts = url.split('/products/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0]; // Remove query params if any
          await supabase.storage.from("products").remove([filePath]);
        }
      } catch (err) {
        console.error("Failed to delete image:", err);
      }
    }
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
    setLoading(true);

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
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error("Valid price is required");
      }
      if (!formData.category_id) {
        throw new Error("Category is required");
      }
      
      const totalImages = existingImages.length + imageFiles.length;
      if (totalImages === 0) {
        throw new Error("At least one image is required");
      }
      
      if (!formData.seller_contact_type) {
        throw new Error("Contact type is required");
      }
      if (!formData.seller_contact.trim()) {
        throw new Error("Contact information is required");
      }

      // Upload new images with the actual title
      const newImageUrls = await uploadImages(formData.title.trim());
      
      // Combine existing and new images
      const allImageUrls = [...existingImages, ...newImageUrls];

      // Generate contact link
      const contactLink = generateContactLink(formData.seller_contact_type, formData.seller_contact);

      // Update marketplace item
      const { error: updateError } = await supabase
        .from("marketplace")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          location: formData.location.trim() || null,
          category_id: parseInt(formData.category_id),
          brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
          stock: parseInt(formData.stock),
          is_negotiable: formData.is_negotiable,
          condition: formData.condition,
          seller_contact_type: formData.seller_contact_type,
          seller_contact: contactLink,
          images: { images: allImageUrls },
        })
        .eq("id", parseInt(id));

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(updateError.message || "Failed to update listing");
      }

      // Delete removed images from storage
      if (imagesToDelete.length > 0) {
        await deleteImagesFromStorage(imagesToDelete);
      }

      // Redirect to item page
      navigate(`/marketplace/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update listing");
      console.error("Error updating listing:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      // Delete all images from storage
      const allImages = [...existingImages, ...imagesToDelete];
      await deleteImagesFromStorage(allImages);

      // Delete the listing
      const { error: deleteError } = await supabase
        .from("marketplace")
        .delete()
        .eq("id", parseInt(id));

      if (deleteError) throw deleteError;

      navigate("/marketplace");
    } catch (err) {
      setError(err.message || "Failed to delete listing");
      console.error("Error deleting listing:", err);
    } finally {
      setLoading(false);
    }
  };

  if (itemLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading item...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Unauthorized"}</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Edit Listing
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">
                  ({existingImages.length + imageFiles.length}/10 images, max 5MB each)
                </span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {/* Existing Images */}
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                    <img 
                      src={imageUrl} 
                      alt={`Existing ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageUrl)}
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

                {/* New Images */}
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border-2 border-green-500">
                    <img 
                      src={preview} 
                      alt={`New ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove new image"
                    >
                      <FiX size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      NEW
                    </div>
                  </div>
                ))}
                
                {(existingImages.length + imagePreviews.length) < 10 && (
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
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingImages 
                  ? "Uploading images..." 
                  : loading 
                  ? "Updating..." 
                  : "Update Listing"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/marketplace/${id}`)}
                disabled={loading || uploadingImages}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || uploadingImages}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}