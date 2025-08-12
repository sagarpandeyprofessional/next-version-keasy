import React, { useState } from 'react';
import { categories, locations } from './marketplaceData';
import { FaCamera, FaTimes } from 'react-icons/fa';
import styles from './styles/MarketplacePost.module.css';

const MarketplacePost = ({ onPostSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'new',
    category: '',
    location: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onPostSubmit) {
      onPostSubmit(formData);
    }
  };

  return (
    <div className={`container ${styles.postContainer}`}>
      <h2 className="mb-4">Create New Listing</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        
        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            placeholder="Enter product title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            rows="3"
            placeholder="Describe your item"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Price */}
        <div className="mb-3">
          <label className="form-label">Price (₩)</label>
          <input
            type="number"
            name="price"
            className="form-control"
            placeholder="Enter price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        {/* Condition */}
        <div className="mb-3">
          <label className="form-label">Condition</label>
          <select
            name="condition"
            className="form-select"
            value={formData.condition}
            onChange={handleChange}
          >
            <option value="new">New</option>
            <option value="second-hand">Second-hand</option>
          </select>
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="mb-3">
          <label className="form-label">Location</label>
          <select
            name="location"
            className="form-select"
            value={formData.location}
            onChange={handleChange}
            required
          >
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div className="mb-3">
          <label className="form-label">Upload Image</label>
          {!formData.image ? (
            <label className={`${styles.uploadBox} border p-3 d-flex flex-column align-items-center justify-content-center`} style={{ cursor: 'pointer' }}>
              <FaCamera size={30} className="mb-2" />
              <span>Click to upload</span>
              <input
                type="file"
                name="image"
                className="d-none"
                accept="image/*"
                onChange={handleChange}
              />
            </label>
          ) : (
            <div className={styles.imagePreview}>
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                className="img-fluid rounded mb-2"
              />
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRemoveImage}>
                <FaTimes /> Remove
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="text-end">
          <button type="submit" className="btn btn-primary px-4">
            Post Listing
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarketplacePost;
