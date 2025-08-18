import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../api/supabase-client";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { session, profile, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);

  // Load profile data and check ownership
  useEffect(() => {
    if (!session || !profile) {
      navigate("/");
    } else if (session.user.id !== profile.user_id) {
      alert("You are not allowed to edit this profile.");
      navigate("/");
    } else {
      setFormData({ ...profile });
    }
  }, [session, profile, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    }
  };

  if (!formData || !profile) return <p className="text-center mt-12">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Picture Upload */}
        <div>
          <label htmlFor="profileImage" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Profile Picture
          </label>
          <input
            type="file"
            id="profileImage"
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0 file:text-sm file:font-semibold
                       file:bg-gray-200 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200
                       hover:file:bg-gray-300 dark:hover:file:bg-gray-600"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username || ""}
            onChange={handleChange}
            placeholder="Enter your username"
            className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="first_name"
            value={formData.first_name || ""}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="last_name"
            value={formData.last_name || ""}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows="3"
            value={formData.bio || ""}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
          ></textarea>
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Gender
          </label>
          <input
            type="text"
            id="gender"
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            placeholder="Gender"
            className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition
          
          "
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
