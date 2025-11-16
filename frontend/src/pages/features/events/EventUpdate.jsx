import { useState, useEffect } from "react";
import { supabase } from "../../../api/supabase-client";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

export default function EventUpdate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [eventOwner, setEventOwner] = useState(null);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    location: "",
    location_coordinates: "",
    date: "",
    organizer_contact_type: "",
    organizer_contact: "",
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      alert("Please sign in to update an event");
      navigate("/signin");
    }
  }, [user, navigate]);

  // Fetch event data and categories
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        alert("Event ID is missing");
        navigate("/events");
        return;
      }

      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("event_category")
          .select("*");
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (eventError) throw eventError;

        if (!eventData) {
          alert("Event not found");
          navigate("/events");
          return;
        }

        // Check if user owns this event
        if (eventData.user_id !== user?.id) {
          alert("You don't have permission to edit this event");
          navigate("/events");
          return;
        }

        setEventOwner(eventData.user_id);

        // Extract username from contact link
        const extractContact = (link, type) => {
          if (!link) return "";
          
          switch (type) {
            case "telegram":
              return link.replace("https://t.me/", "");
            case "whatsapp":
              return link.replace("https://wa.me/", "");
            case "instagram":
              return link.replace("https://instagram.com/", "");
            case "messenger":
              return link.replace("https://m.me/", "");
            case "email":
              return link.replace("mailto:", "");
            case "message":
              return link.replace("tel:", "");
            default:
              return link;
          }
        };

        // Populate form with existing data
        setFormData({
          category_id: eventData.category_id || "",
          name: eventData.name || "",
          description: eventData.description || "",
          location: eventData.location || "",
          location_coordinates: eventData.location_coordinates || "",
          date: eventData.date ? new Date(eventData.date).toISOString().slice(0, 16) : "",
          organizer_contact_type: eventData.organizer_contact_type || "",
          organizer_contact: extractContact(eventData.organizer_contact_link, eventData.organizer_contact_type),
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(`Failed to load event: ${error.message}`);
        navigate("/events");
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, user, navigate]);

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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.location.trim()) {
      newErrors.location = "Please enter the location name/address";
    }
    
    if (!formData.location_coordinates.trim()) {
      newErrors.location_coordinates = "Please enter the Naver Maps link";
    } else {
      try {
        const url = new URL(formData.location_coordinates);
        const host = url.hostname;
        const isValidNaver = host.endsWith("naver.com") || host.endsWith("naver.me");
        
        if (!isValidNaver) {
          newErrors.location_coordinates = "Please enter a valid Naver Maps link";
        }
      } catch {
        newErrors.location_coordinates = "Please enter a valid URL";
      }
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
      
      // Check if user added @ symbol
      if ((type === "telegram" || type === "instagram" || type === "messenger") && contact.startsWith("@")) {
        newErrors.organizer_contact = "Please remove the @ symbol from your username";
      } else if (type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact)) {
          newErrors.organizer_contact = "Please enter a valid email address (e.g., name@example.com)";
        }
      } else if (type === "message") {
        const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
        if (!phoneRegex.test(contact)) {
          newErrors.organizer_contact = "Please enter a valid phone number";
        }
      } else if (type === "whatsapp") {
        const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
        if (!phoneRegex.test(contact)) {
          newErrors.organizer_contact = "Please enter a valid phone number with country code";
        }
      } else {
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
    const cleanContact = contact.trim().replace(/^@+/, ''); // Remove @ from beginning
    
    switch (type) {
      case "telegram":
        return `https://t.me/${cleanContact}`;
      case "whatsapp":
        const phoneNumber = cleanContact.replace(/[^0-9+]/g, '');
        return `https://wa.me/${phoneNumber}`;
      case "instagram":
        return `https://instagram.com/${cleanContact}`;
      case "messenger":
        return `https://m.me/${cleanContact}`;
      case "email":
        return `mailto:${contact}`;
      case "message":
        const tel = contact.replace(/[^0-9+]/g, '');
        return `tel:${tel}`;
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
      const firstError = Object.values(errors)[0];
      if (firstError) alert(firstError);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in to update an event. Please sign in and try again.");
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

    const updateData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      category_id: formData.category_id,
      date: formData.date,
      organizer_contact_type: formData.organizer_contact_type,
      organizer_contact_link: contactLink,
      location_coordinates: formData.location_coordinates.trim(),
    };

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select();

    if (error) {
      console.error("Update error:", error);
      alert(`We couldn't update your event right now. ${error.message}. Please try again.`);
      setIsSubmitting(false);
    } else {
      alert("✅ Your event has been updated successfully!");
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading event...</p>
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
            <p className="mt-4 text-gray-700 font-semibold text-lg">Updating your event...</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Update Event</h1>
            <p className="text-gray-600">Modify your event details</p>
          </div>

          <StepIndicator />

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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Location</h2>
                <p className="text-gray-600 mb-4">
                  Enter the location name and Naver Maps link for your event
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location Name/Address *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Gangnam Station Exit 10, Seoul"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      errors.location ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      setErrors({ ...errors, location: null });
                    }}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    Enter a clear location name or address
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Naver Maps Link *
                  </label>
                  <input
                    type="url"
                    placeholder="https://map.naver.com/..."
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      errors.location_coordinates ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.location_coordinates}
                    onChange={(e) => {
                      setFormData({ ...formData, location_coordinates: e.target.value });
                      setErrors({ ...errors, location_coordinates: null });
                    }}
                  />
                  {errors.location_coordinates && (
                    <p className="text-red-500 text-sm mt-1">{errors.location_coordinates}</p>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-blue-800 text-sm font-medium mb-2">📍 How to get Naver Maps link:</p>
                    <ol className="text-blue-700 text-sm space-y-1 ml-4 list-decimal">
                      <li>Open Naver Maps (map.naver.com)</li>
                      <li>Search for your event location</li>
                      <li>Click "Share" button</li>
                      <li>Copy the URL and paste it here</li>
                    </ol>
                  </div>
                </div>

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
                        : formData.organizer_contact_type === "whatsapp"
                        ? "WhatsApp Number *"
                        : "Username *"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        formData.organizer_contact_type === "email"
                          ? "your.email@example.com"
                          : formData.organizer_contact_type === "message"
                          ? "+82 10-1234-5678"
                          : formData.organizer_contact_type === "whatsapp"
                          ? "+82 10-1234-5678"
                          : formData.organizer_contact_type === "telegram"
                          ? "your_username"
                          : formData.organizer_contact_type === "instagram"
                          ? "jjayleenee"
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
                    
                    {/* Preview of generated link */}
                    {formData.organizer_contact && !errors.organizer_contact && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm font-medium mb-1">Generated Link:</p>
                        <p className="text-green-700 text-sm break-all">
                          {generateContactLink(formData.organizer_contact_type, formData.organizer_contact)}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-gray-500 text-sm mt-2">
                      {formData.organizer_contact_type === "email"
                        ? "Enter a valid email address"
                        : formData.organizer_contact_type === "message"
                        ? "Enter your phone number with country code"
                        : formData.organizer_contact_type === "whatsapp"
                        ? "Enter your WhatsApp number with country code"
                        : "Enter your username without the @ symbol"}
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
                    {isSubmitting ? "Updating..." : "Update Event ✅"}
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