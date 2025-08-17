import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../api/supabase-client";
import { useNavigate } from "react-router-dom";
import styles from './styles/EditProfile.module.css'

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
  const fileExt = file.name.split('.').pop();
  const filePath = `${profile.user_id}/profile_${timestamp}.${fileExt}`;

  // Delete old image if exists
  if (profile.pfp_url) {
    try {
      const oldPath = profile.pfp_url.split("/").slice(-2).join("/"); // extract user_id/filename
      await supabase.storage.from("pfp").remove([oldPath]);
    } catch (err) {
      console.log("Old image deletion error (maybe file didn't exist):", err.message);
    }
  }

  // Upload new image
  const { error: uploadError } = await supabase.storage.from("pfp").upload(filePath, file);
  if (uploadError) throw uploadError;

  // Get public URL
  const { data, error: urlError } = supabase.storage.from("pfp").getPublicUrl(filePath);
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
      navigate("/profile");
    } catch (err) {
      alert(err.message);
    }
  };

  if (!formData || !profile) return <p>Loading...</p>;

  return (
    <div className={`container ${styles.settingsContainer} pt-5`}>
  <h1 className="mb-4">Settings</h1>

  <form onSubmit={handleSubmit}>
    {/* Profile Picture Upload */}
    <div className="mb-3">
      <label htmlFor="profileImage" className="form-label">
        Profile Picture
      </label>
      <input
        type="file"
        className="form-control"
        id="profileImage"
        onChange={(e) => setFile(e.target.files[0])}
      />
    </div>

    {/* Username */}
    <div className="mb-3">
      <label htmlFor="username" className="form-label">
        Username
      </label>
      <input
        type="text"
        className="form-control"
        id="username"
        name="username"   // ✅ added
        value={formData.username || ""}
        onChange={handleChange}
        placeholder="Enter your username"
      />
    </div>
    
    {/* First Name */}
    <div className="mb-3">
      <label htmlFor="firstName" className="form-label">
        First Name
      </label>
      <input
        type="text"
        className="form-control"
        id="firstName"
        name="first_name"   // ✅ added
        value={formData.first_name || ""}
        onChange={handleChange}
        placeholder="First Name"
      />
    </div>

    {/* Last Name */}
    <div className="mb-3">
      <label htmlFor="lastName" className="form-label">
        Last Name
      </label>
      <input
        type="text"
        className="form-control"
        id="lastName"
        name="last_name"   // ✅ added
        value={formData.last_name || ""}
        onChange={handleChange}
        placeholder="Last Name"
      />
    </div>

    {/* Bio */}
    <div className="mb-3">
      <label htmlFor="bio" className="form-label">
        Bio
      </label>
      <textarea
        className="form-control"
        id="bio"
        name="bio"   // ✅ added
        rows="3"
        value={formData.bio || ""}
        onChange={handleChange}
        placeholder="Tell us about yourself"
      ></textarea>
    </div>

    {/* Gender */}
    <div className="mb-3">
      <label htmlFor="gender" className="form-label">
        Gender
      </label>
      <input
        type="text"
        className="form-control"
        id="gender"
        name="gender"   // ✅ added
        value={formData.gender || ""}
        onChange={handleChange}
        placeholder="Gender"
      />
    </div>

    <button
      type="submit"
      className="btn btn-primary w-100 mb-3"
    >
      Save Changes
    </button>
  </form>
</div>

  )
}

export default EditProfile