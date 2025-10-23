import { useState, useEffect } from "react";
import { supabase } from "../../../api/supabase-client";
import { useAuth } from "../../../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function EventPost() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);

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

  // Fetch event categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("event_category").select("*");
      if (!error) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Location picker component
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          location_coordinates: { lat: e.latlng.lat, lng: e.latlng.lng },
        });
      },
    });
    return formData.location_coordinates ? (
      <Marker position={[formData.location_coordinates.lat, formData.location_coordinates.lng]} />
    ) : null;
  };

  // Form submission
  // Form submission
  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in to create an event.");
      return;
    }

    // Validation
    if (!formData.category_id || !formData.name || !formData.date) {
      alert("Please fill in all required fields (category, name, and date).");
      return;
    }

    const insertData = {
      user_id: user.id,
      name: formData.name,
      description: formData.description,
      location: formData.location,
      category_id: formData.category_id,
      date: formData.date,
      organizer_contact_type: formData.organizer_contact_type || null,
      organizer_contact_link: formData.organizer_contact || null,
    };

    // Only add location_coord if it exists
    if (formData.location_coordinates) {
      insertData.location_coordinates = formData.location_coordinates;
    }

    console.log("Submitting data:", insertData);

    const { data, error } = await supabase.from("events").insert([insertData]).select();

    if (error) {
      console.error("Insert error:", error);
      alert(`Error creating event: ${error.message}`);
    } else {
      console.log("Success:", data);
      alert("Event created successfully!");
      setFormData({
        category_id: "",
        name: "",
        description: "",
        location: "",
        location_coordinates: null,
        date: "",
        organizer_contact_type: "",
        organizer_contact: "",
      });
      setStep(1);
    }
  };

  // Multi-step form
  return (
    <div className="max-w-xl mx-auto p-4">
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 1: Basic Info</h2>

          <select
            className="border p-2 w-full rounded"
            value={formData.category?.name}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Event name"
            className="border p-2 w-full rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <textarea
            placeholder="Short description"
            className="border p-2 w-full rounded"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <input
            type="text"
            placeholder="Location (address or area)"
            className="border p-2 w-full rounded"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <button
            onClick={() => setStep(2)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 2: Mark Event Location</h2>
          <p className="text-gray-600">Click on the map to set the event’s location.</p>

          <div className="h-72 w-full rounded overflow-hidden border">
            <MapContainer center={[36.35, 127.38]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
          </div>

          <button
            onClick={() => setStep(3)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Next →
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 3: Date and Time</h2>

          <input
            type="datetime-local"
            className="border p-2 w-full rounded"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <button
            onClick={() => setStep(4)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Next →
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 4: Organizer Contact</h2>

          <select
            className="border p-2 w-full rounded"
            value={formData.organizer_contact_type}
            onChange={(e) =>
              setFormData({ ...formData, organizer_contact_type: e.target.value })
            }
          >
            <option value="">Select platform</option>
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="kakao talk">KakaoTalk</option>
            <option value="messenger">Messenger</option>
            <option value="email">Email</option>
          </select>

          <input
            type="text"
            placeholder="Profile link, email, or phone"
            className="border p-2 w-full rounded"
            value={formData.organizer_contact}
            onChange={(e) =>
              setFormData({ ...formData, organizer_contact: e.target.value })
            }
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit Event ✅
          </button>
        </div>
      )}
    </div>
  );
}
