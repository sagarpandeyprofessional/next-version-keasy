import { useState, useEffect } from "react";
import { supabase } from "../../../api/supabase-client";
import { useAuth } from "../../../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const SOUTH_KOREA_CITIES = [
  "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Ulsan",
  "Sejong", "Suwon", "Yongin", "Goyang", "Seongnam", "Bucheon", "Cheongju",
  "Ansan", "Jeonju", "Cheonan", "Anyang", "Pohang", "Changwon", "Gimhae",
  "Jeju City", "Seogwipo", "Paju", "Uijeongbu", "Pyeongtaek", "Siheung",
  "Hwaseong", "Namyangju", "Gimpo", "Gunpo", "Icheon", "Yangju", "Osan",
  "Gwangmyeong", "Hanam", "Wonju", "Chuncheon", "Gangneung", "Sokcho",
  "Gyeongju", "Gumi", "Andong", "Yeongju", "Gimcheon", "Sangju", "Muan",
  "Mokpo", "Yeosu", "Suncheon", "Gwangyang", "Naju", "Iksan", "Gunsan",
  "Jinju", "Tongyeong", "Sacheon", "Geoje", "Yangsan", "Miryang"
].sort();

export default function EventPost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [userLocation, setUserLocation] = useState(null);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    location: "",
    location_coordinates: null,
    date: "",
    organizer_contact_type: "",
    organizer_contact: "",
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      alert("Please sign in to create an event");
      navigate("/signin");
    }
  }, [user, navigate]);

  // Fetch event categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("event_category").select("*");
      if (!error) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied or unavailable");
          // Default to Daejeon if location access is denied
          setUserLocation({ lat: 36.35, lng: 127.38 });
        }
      );
    } else {
      setUserLocation({ lat: 36.35, lng: 127.38 });
    }
  }, []);

  // Location picker component
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          location_coordinates: { lat: e.latlng.lat, lng: e.latlng.lng },
        });
        setErrors({ ...errors, location_coordinates: null });
      },
    });
    return formData.location_coordinates ? (
      <Marker position={[formData.location_coordinates.lat, formData.location_coordinates.lng]} />
    ) : null;
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.category_id) {
      newErrors.category_id = "Please select an event category";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Event name must be 50 characters or less";
    }
    
    if (formData.description.length > 100) {
      newErrors.description = "Description must be 100 characters or less";
    }
    
    if (!formData.location) {
      newErrors.location = "Please select a city";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.location_coordinates) {
      newErrors.location_coordinates = "Please click on the map to mark the event location";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = "Please select a date and time for the event";
    } else {
      const selectedDate = new Date(formData.date);
      const now = new Date();
      
      if (selectedDate <= now) {
        newErrors.date = "Event date must be in the future";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    
    if (!formData.organizer_contact_type) {
      newErrors.organizer_contact_type = "Please select a contact method";
    }
    
    if (!formData.organizer_contact.trim()) {
      newErrors.organizer_contact = "Contact information is required";
    } else {
      const contact = formData.organizer_contact.trim();
      const type = formData.organizer_contact_type;
      
      if (type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact)) {
          newErrors.organizer_contact = "Please enter a valid email address (e.g., name@example.com)";
        }
      } else if (type === "message") {
        const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
        if (!phoneRegex.test(contact)) {
          newErrors.organizer_contact = "Please enter a valid phone number";
        }
      } else {
        // For social media platforms, check for username format
        if (contact.length < 3) {
          newErrors.organizer_contact = "Username must be at least 3 characters long";
        } else if (contact.length > 50) {
          newErrors.organizer_contact = "Username is too long";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate contact link based on platform
  const generateContactLink = (type, contact) => {
    const cleanContact = contact.trim().replace('@', '');
    
    switch (type) {
      case "telegram":
        return `https://t.me/${cleanContact}`;
      case "whatsapp":
        return `https://wa.me/${cleanContact.replace(/[^0-9]/g, '')}`;
      case "instagram":
        return `https://instagram.com/${cleanContact}`;
      case "kakao talk":
        return contact; // KakaoTalk doesn't have direct web links
      case "messenger":
        return `https://m.me/${cleanContact}`;
      case "email":
        return `mailto:${contact}`;
      case "message":
        return `tel:${contact.replace(/[^0-9+]/g, '')}`;
      default:
        return contact;
    }
  };

  // Handle step navigation
  const handleNext = (currentStep) => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Show first error in alert
      const firstError = Object.values(errors)[0];
      if (firstError) alert(firstError);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in to create an event. Please sign in and try again.");
      navigate("/signin");
      return;
    }

    if (!validateStep4()) {
      const firstError = Object.values(errors)[0];
      if (firstError) alert(firstError);
      return;
    }

    setIsSubmitting(true);

    const contactLink = generateContactLink(
      formData.organizer_contact_type,
      formData.organizer_contact
    );

    const insertData = {
      user_id: user.id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      location: formData.location,
      category_id: formData.category_id,
      date: formData.date,
      organizer_contact_type: formData.organizer_contact_type,
      organizer_contact_link: contactLink,
      location_coordinates: formData.location_coordinates,
    };

    const { data, error } = await supabase.from("events").insert([insertData]).select();

    if (error) {
      console.error("Insert error:", error);
      alert(`We couldn't create your event right now. ${error.message}. Please try again.`);
      setIsSubmitting(false);
    } else {
      alert("🎉 Your event has been created successfully!");
      // Navigate to events page after short delay
      setTimeout(() => {
        navigate("/events");
      }, 500);
    }
  };

  // Progress indicator
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= num
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {num}
            </div>
            {num < 4 && (
              <div
                className={`w-16 h-1 mx-1 transition-all ${
                  step > num ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-center mt-4 text-gray-600 font-medium">
        Step {step} of 4
      </p>
    </div>
  );

  // Show loading while checking auth
  if (!user || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-700 font-semibold text-lg">Creating your event...</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Event</h1>
            <p className="text-gray-600">Share your event with the community</p>
          </div>

          {/* Progress Indicator */}
          <StepIndicator />

          {/* Form Container */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Category *
                  </label>
                  <select
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      errors.category_id ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData({ ...formData, category_id: e.target.value });
                      setErrors({ ...errors, category_id: null });
                    }}
                  >
                    <option value="">Choose a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Name * <span className="text-gray-400 font-normal">({formData.name.length}/50)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Music Festival"
                    maxLength={50}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      errors.name ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: null });
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-gray-400 font-normal">({formData.description.length}/100)</span>
                  </label>
                  <textarea
                    placeholder="Brief description of your event"
                    maxLength={100}
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none ${
                      errors.description ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setErrors({ ...errors, description: null });
                    }}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      errors.location ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      setErrors({ ...errors, location: null });
                    }}
                  >
                    <option value="">Select a city</option>
                    {SOUTH_KOREA_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>

                <button
                  onClick={() => handleNext(1)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
                >
                  Next Step →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Mark Event Location</h2>
                <p className="text-gray-600 mb-4">
                  Click anywhere on the map to mark the exact location of your event
                </p>

                <div className="rounded-2xl overflow-hidden border-4 border-gray-100 shadow-lg">
                  <div style={{ height: "400px", width: "100%" }}>
                    <MapContainer
                      center={[userLocation.lat, userLocation.lng]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker />
                    </MapContainer>
                  </div>
                </div>

                {formData.location_coordinates && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="text-green-800 font-medium">✓ Location marked successfully!</p>
                  </div>
                )}

                {errors.location_coordinates && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-red-800 font-medium">{errors.location_coordinates}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-4 rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleNext(2)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Date and Time</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      errors.date ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      setErrors({ ...errors, date: null });
                    }}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    Select a date and time in the future
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-4 rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleNext(3)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Method *
                  </label>
                  <select
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      errors.organizer_contact_type ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.organizer_contact_type}
                    onChange={(e) => {
                      setFormData({ ...formData, organizer_contact_type: e.target.value, organizer_contact: "" });
                      setErrors({ ...errors, organizer_contact_type: null, organizer_contact: null });
                    }}
                  >
                    <option value="">Select contact platform</option>
                    <option value="message">Phone/SMS</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="kakao talk">KakaoTalk</option>
                    <option value="messenger">Messenger</option>
                    <option value="email">Email</option>
                  </select>
                  {errors.organizer_contact_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.organizer_contact_type}</p>
                  )}
                </div>

                {formData.organizer_contact_type && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {formData.organizer_contact_type === "email"
                        ? "Email Address *"
                        : formData.organizer_contact_type === "message"
                        ? "Phone Number *"
                        : "Username *"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        formData.organizer_contact_type === "email"
                          ? "your.email@example.com"
                          : formData.organizer_contact_type === "message"
                          ? "+82 10-1234-5678"
                          : formData.organizer_contact_type === "telegram"
                          ? "your_username"
                          : "username"
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                        errors.organizer_contact ? "border-red-500" : "border-gray-200"
                      }`}
                      value={formData.organizer_contact}
                      onChange={(e) => {
                        setFormData({ ...formData, organizer_contact: e.target.value });
                        setErrors({ ...errors, organizer_contact: null });
                      }}
                    />
                    {errors.organizer_contact && (
                      <p className="text-red-500 text-sm mt-1">{errors.organizer_contact}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      {formData.organizer_contact_type === "email"
                        ? "Enter a valid email address"
                        : formData.organizer_contact_type === "message"
                        ? "Enter your phone number with country code"
                        : "Enter your username without @ symbol"}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-4 rounded-xl transition-all"
                    disabled={isSubmitting}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-4 rounded-xl transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating..." : "Create Event ✅"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}