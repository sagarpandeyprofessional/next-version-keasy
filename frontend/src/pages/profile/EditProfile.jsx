import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../api/supabase-client";
import { useNavigate } from "react-router-dom";
import { User, Upload, Save, X } from "lucide-react";

const EditProfile = () => {
  const { session, profile, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load profile data and check ownership
  useEffect(() => {
    if (!session) {
      navigate("/signin");
      return;
    }

    if (!profile) {
      return;
    }

    if (session.user.id !== profile.user_id) {
      alert(`You are not ${profile.username}. You cannot edit this profile.`);
      navigate("/");
      return;
    }

    setFormData({ ...profile });
    if (profile.pfp_url) {
      setPreviewUrl(profile.pfp_url);
    }
  }, [session, profile, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(profile?.pfp_url || null);
  };

  // Handle profile picture upload
  const handleUpload = async () => {
    if (!file) return formData.pfp_url || null;

    // Generate a unique filename to prevent browser caching issues
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const filePath = `${profile.user_id}/profile_${timestamp}.${fileExt}`;

    // Delete old image if exists
    if (profile.pfp_url) {
      try {
        const oldPath = profile.pfp_url.split("/").slice(-2).join("/"); // extract user_id/filename
        await supabase.storage.from("pfp").remove([oldPath]);
      } catch (err) {
        console.log(
          "Old image deletion error (maybe file didn't exist):",
          err.message
        );
      }
    }

    // Upload new image
    const { error: uploadError } = await supabase
      .storage.from("pfp")
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    // Get public URL
    const { data, error: urlError } = supabase.storage
      .from("pfp")
      .getPublicUrl(filePath);
    if (urlError) throw urlError;

    return data?.publicUrl || data?.url || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pfp_url = await handleUpload();

      // Update profile table
      await supabase
        .from("profiles")
        .update({ ...formData, pfp_url })
        .eq("user_id", profile.user_id);

      // Refresh context
      await fetchUserProfile(profile.user_id);
      alert("Profile updated!");
      navigate(`/profile/${formData.username}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state when not logged in
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Loading state while profile loads
  if (!formData || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center pb-6 border-b border-gray-200">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                  {previewUrl || formData.pfp_url ? (
                    <img
                      src={previewUrl || formData.pfp_url}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                {file && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <label
                htmlFor="profileImage"
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </label>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (Max 5MB)</p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Username */}
              <div className="sm:col-span-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  disabled
                  value={formData.username || ""}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition"
                />
              </div>

              {/* Gender */}
              <div className="sm:col-span-2">
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <input
                  type="text"
                  id="gender"
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  placeholder="Gender"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition"
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 transition"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio?.length || 0} characters
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Cancel Button */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate(`/profile/${formData.username}`)}
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;