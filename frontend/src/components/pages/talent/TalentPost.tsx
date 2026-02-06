// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FiUpload, FiX, FiAlertCircle, FiMapPin } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: typeof markerIcon2x === "string" ? markerIcon2x : markerIcon2x.src,
  iconUrl: typeof markerIcon === "string" ? markerIcon : markerIcon.src,
  shadowUrl: typeof markerShadow === "string" ? markerShadow : markerShadow.src,
});

// Map component for selecting location
const LocationPicker = ({ position, setPosition }) => {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={position} />
      <MapEvents />
    </MapContainer>
  );
};

export default function TalentsPost() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioFileName, setPortfolioFileName] = useState("");

  const [position, setPosition] = useState([36.3504, 127.3845]); // Default: Daejeon

  const [formData, setFormData] = useState({
    name: "",
    type: "service_provider",
    about: "",
    categories: [],
    skills: [],
    email: "",
    phone: "",
    website: "",
    description: "",
    pricing: "",
    languages: [],
  });

  const [categoryInput, setCategoryInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/signin");
        return;
      }
      setUserId(data.user.id);
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG/PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePortfolioSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");

    if (file.type !== "application/pdf") {
      setError("Portfolio must be a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Portfolio PDF must be less than 10MB");
      return;
    }

    setPortfolioFile(file);
    setPortfolioFileName(file.name);
  };

  const addCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }));
      setCategoryInput("");
    }
  };

  const removeCategory = (cat) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()],
      }));
      setLanguageInput("");
    }
  };

  const removeLanguage = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return null;

    const fileExt = profileImage.name.split(".").pop();
    const fileName = `${userId}/pic_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("pros")
      .upload(fileName, profileImage, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload profile image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from("pros").getPublicUrl(fileName);
    return urlData?.publicUrl || null;
  };

  const uploadPortfolio = async () => {
    if (!portfolioFile) return null;

    const fileName = `${userId}/portfolio_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("pros")
      .upload(fileName, portfolioFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload portfolio: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from("pros").getPublicUrl(fileName);
    return urlData?.publicUrl || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      if (formData.name.length > 100) {
        throw new Error("Name must be 100 characters or less");
      }
      if (formData.description.length > 777) {
        throw new Error("Description must be 777 characters or less");
      }
      if (!profileImage) {
        throw new Error("Profile image is required");
      }
      if (formData.categories.length === 0) {
        throw new Error("At least one category is required");
      }

      console.log("Uploading files...");
      const profileImgUrl = await uploadProfileImage();
      const portfolioUrl = await uploadPortfolio();

      if (!profileImgUrl) {
        throw new Error("Failed to upload profile image");
      }

      console.log("Profile image uploaded:", profileImgUrl);
      if (portfolioUrl) console.log("Portfolio uploaded:", portfolioUrl);

      const talentData = {
        user_id: userId,
        name: formData.name.trim(),
        type: formData.type,
        about: formData.about.trim() || null,
        category: formData.categories,
        skills: formData.skills,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        website: formData.website.trim() || null,
        description: formData.description.trim() || null,
        profile_img: profileImgUrl,
        location: {
          latitude: position[0],
          longitude: position[1],
        },
        portfolio: portfolioUrl,
        pricing: formData.pricing ? parseFloat(formData.pricing) : 0,
        languages: formData.languages,
        favourites: [],
      };

      console.log("Inserting talent data:", talentData);

      const { data, error: insertError } = await supabase
        .from("talent")
        .insert(talentData)
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(insertError.message || "Failed to create talent profile");
      }

      console.log("Talent profile created:", data);
      router.push(`/talents/${data.id}`);
    } catch (err) {
      setError(err.message || "Failed to create profile");
      console.error("Error creating profile:", err);
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
            Create Talent Profile
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">(JPG/PNG, max 5MB)</span>
              </label>
              <div className="flex items-center gap-4">
                {profileImagePreview ? (
                  <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImage(null);
                        setProfileImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100">
                    <FiUpload className="text-gray-400 mb-2" size={24} />
                    <span className="text-xs text-gray-500">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">({formData.name.length}/100)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Your professional name"
                required
                disabled={loading}
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Provider Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="service_provider">Service Provider</option>
                <option value="business">Business</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>

            {/* About */}
            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
                About (Brief summary)
              </label>
              <textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                placeholder="Brief introduction about yourself"
                disabled={loading}
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Real Estate, Web Developer"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategory(cat)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., React, Photoshop, Korean"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="+82 10 1234 5678"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website / Social Link
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="https://yourwebsite.com"
                disabled={loading}
              />
            </div>

            {/* Pricing */}
            <div>
              <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-2">
                Pricing (₩) <span className="text-gray-500 font-normal">(Leave empty for Free)</span>
              </label>
              <input
                type="number"
                id="pricing"
                name="pricing"
                value={formData.pricing}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0"
                min="0"
                disabled={loading}
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., English, Korean"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiMapPin /> Location (Click on map to set)
              </label>
              <LocationPicker position={position} setPosition={setPosition} />
              <p className="text-xs text-gray-500 mt-2">
                Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
              </p>
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio (PDF) <span className="text-gray-500 font-normal">(Optional, max 10MB)</span>
              </label>
              {portfolioFileName ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex-1">{portfolioFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPortfolioFile(null);
                      setPortfolioFileName("");
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
                  <FiUpload className="text-gray-400" />
                  <span className="text-sm text-gray-600">Upload Portfolio PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePortfolioSelect}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
                <span className="text-gray-500 font-normal ml-2">({formData.description.length}/777)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={777}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                placeholder="Describe your services in detail..."
                disabled={loading}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating profile..." : "Create Profile"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/connect?tab=talents")}
                disabled={loading}
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
