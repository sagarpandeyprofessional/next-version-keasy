// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FiHeart, FiEdit, FiMail, FiPhone, FiGlobe, FiMapPin, FiDollarSign, FiFileText } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: import("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: import("leaflet/dist/images/marker-icon.png"),
  shadowUrl: import("leaflet/dist/images/marker-shadow.png"),
});

const formatPrice = (price) => {
  if (!price || price === 0) return "Free";
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(price);
};

const daysAgo = (dateString) => {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
};

export default function TalentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  // Fetch talent data
  useEffect(() => {
    const fetchTalent = async () => {
      try {
        setIsLoading(true);

        const { data: talentData, error: talentError } = await supabase
          .from("talent")
          .select("*")
          .eq("id", parseInt(id))
          .single();

        if (talentError) throw talentError;
        setTalent(talentData);

        // Fetch username
        const { data: userData } = await supabase
          .from("profiles")
          .select("username")
          .eq("user_id", talentData.user_id)
          .single();
        setUsername(userData?.username || "Unknown");
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTalent();
  }, [id]);

  if (isLoading) return <p className="text-center py-20 text-gray-800">Loading...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!talent) return <p className="text-center py-20 text-gray-800">No profile found.</p>;

  // Toggle Favourite
  const handleFavourite = async () => {
    if (!userId) {
      alert("Please log in to save favorites.");
      return;
    }

    let favourites = Array.isArray(talent.favourites) ? talent.favourites : [];

    const updatedFavourites = favourites.includes(userId)
      ? favourites.filter((id) => id !== userId)
      : [...favourites, userId];

    await supabase
      .from("talent")
      .update({ favourites: updatedFavourites })
      .eq("id", talent.id);

    setTalent((prev) => ({
      ...prev,
      favourites: updatedFavourites,
    }));
  };

  const favouritesList = Array.isArray(talent.favourites) ? talent.favourites : [];
  const likesCount = favouritesList.length;
  const isLiked = userId && favouritesList.includes(userId);

  const typeStyles = {
    service_provider: { label: "Service Provider", color: "bg-blue-600" },
    business: { label: "Business", color: "bg-green-600" },
    freelancer: { label: "Freelancer", color: "bg-purple-600" },
  };

  const categories = Array.isArray(talent.category) ? talent.category : [];
  const skills = Array.isArray(talent.skills) ? talent.skills : [];
  const languages = Array.isArray(talent.languages) ? talent.languages : [];

  const position = talent.location?.latitude && talent.location?.longitude
    ? [talent.location.latitude, talent.location.longitude]
    : [36.3504, 127.3845];

  // Contact handlers
  const handleEmail = () => {
    if (talent.email) {
      window.open(`mailto:${talent.email}`, "_blank");
    }
  };

  const handlePhone = () => {
    if (talent.phone) {
      window.open(`tel:${talent.phone}`, "_blank");
    }
  };

  const handleMessage = () => {
    if (talent.phone) {
      window.open(`sms:${talent.phone}`, "_blank");
    }
  };

  const handleWebsite = () => {
    if (talent.website) {
      window.open(talent.website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/talents" className="mb-6 inline-flex items-center text-gray-800 hover:underline">
        ← Back to Talents
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Image */}
        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={talent.profile_img || "/default-avatar.png"}
            alt={talent.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Details */}
        <div>
          {/* User Info & Edit Button */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <div className="flex items-center space-x-3">
              <div>
                <Link href={`/profile/${username}`} className="font-semibold text-gray-800 hover:underline">
                  {username}
                </Link>
                <p className="text-sm text-gray-500">{talent.created_at ? daysAgo(talent.created_at) : ""}</p>
              </div>
            </div>

            {/* Edit Button - Show only if owner */}
            {userId === talent.user_id && (
              <>
                <button
                  onClick={() => router.push(`/talents/edit/${id}`)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <FiEdit />
                  Edit Profile
                </button>

                <button
                  onClick={() => router.push(`/talents/edit/${id}`)}
                  className="sm:hidden p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Edit profile"
                >
                  <FiEdit size={20} />
                </button>
              </>
            )}
          </div>

          {/* Name & Type */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{talent.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${
                  typeStyles[talent.type]?.color || "bg-gray-700"
                }`}
              >
                {typeStyles[talent.type]?.label || "Unknown"}
              </span>
            </div>
          </div>

          {/* About */}
          {talent.about && (
            <p className="text-gray-700 mb-4 text-lg">{talent.about}</p>
          )}

          {/* Pricing */}
          <div className="flex items-center gap-2 text-2xl font-semibold text-gray-800 mb-4">
            <FiDollarSign />
            {formatPrice(talent.pricing)}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-3 text-gray-600 text-sm mb-6">
            <div className="flex items-center space-x-1">
              {isLiked ? <FaHeart className="text-red-500" /> : <FiHeart />}
              <span>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</span>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {talent.email && (
              <button
                onClick={handleEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <FiMail />
                Email
              </button>
            )}
            {talent.phone && (
              <>
                <button
                  onClick={handlePhone}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <FiPhone />
                  Call
                </button>
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <FiPhone />
                  Text
                </button>
              </>
            )}
            {talent.website && (
              <button
                onClick={handleWebsite}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <FiGlobe />
                Website
              </button>
            )}
            <button
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors ${
                isLiked
                  ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                  : "border-black text-gray-800 hover:bg-gray-50"
              }`}
              onClick={handleFavourite}
            >
              {isLiked ? <FaHeart /> : <FiHeart />}
              {isLiked ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {talent.description && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Description</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{talent.description}</p>
          </div>
        </div>
      )}

      {/* Location Map */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
          <FiMapPin />
          Location
        </h2>
        <div className="rounded-lg overflow-hidden shadow-md">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={position} />
          </MapContainer>
        </div>
      </div>

      {/* Portfolio */}
      {talent.portfolio && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <FiFileText />
            Portfolio
          </h2>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <a
              href={talent.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <FiFileText />
              View Portfolio PDF
            </a>
          </div>
          
          {/* Optional: Embed PDF viewer */}
          <div className="mt-4">
            <iframe
              src={talent.portfolio}
              className="w-full h-[600px] border border-gray-300 rounded-lg"
              title="Portfolio PDF"
            />
          </div>
        </div>
      )}
    </div>
  );
}
