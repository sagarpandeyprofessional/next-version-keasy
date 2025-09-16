import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Mock data for categories and locations
const categories = ["Electronics", "Furniture", "Books", "Clothing", "Home Appliances"];
const locations = ["Seoul", "Busan", "Incheon", "Daegu"];

export default function PostMarketplaceItem() {
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "new",
    location: "",
    image_url: "",
  });
  const [errors, setErrors] = useState({});

  // Mock authentication check
  const [user, setUser] = useState({ name: "Demo User" });
  const [authLoading, setAuthLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) newErrors.price = "Price must be a positive number";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.condition) newErrors.condition = "Condition is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (formData.image_url && !isValidURL(formData.image_url)) newErrors.image_url = "Please enter a valid URL";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setFormError(null);

      console.log("Posting listing (mock):", formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate API

      // Redirect to marketplace after success
      navigate("/marketplace");
    } catch (error) {
      setFormError("Failed to post listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth loading state
  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center h-96">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-300">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">Post a New Listing</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Fill out the form below to create a new marketplace listing.</p>
        </div>

        {formError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-200">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 dark:bg-gray-800 dark:text-white`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 dark:bg-gray-800 dark:text-white`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price (KRW) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.price ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 dark:bg-gray-800 dark:text-white`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.category ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 dark:bg-gray-800 dark:text-white`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Condition <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center space-x-2">
                <input type="radio" name="condition" value="new" checked={formData.condition === "new"} onChange={handleChange} />
                <span>New</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="condition" value="second-hand" checked={formData.condition === "second-hand"} onChange={handleChange} />
                <span>Second-hand</span>
              </label>
            </div>
            {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.location ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 dark:bg-gray-800 dark:text-white`}
            >
              <option value="">Select a location</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image URL (optional)
            </label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={`mt-1 block w-full rounded-md border ${errors.image_url ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 dark:bg-gray-800 dark:text-white`}
            />
            {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link to="/marketplace" className="px-4 py-2 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-white">Cancel</Link>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-black text-white rounded-md dark:bg-white dark:text-black">
              {isSubmitting ? "Posting..." : "Post Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}