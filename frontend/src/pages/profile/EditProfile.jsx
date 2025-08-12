import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, update_user } from '../../api/endpoints';
import styles from './styles/EditProfile.module.css'; // your CSS module

const EditProfile = () => {
  // Grab user data from localStorage
  const storage = JSON.parse(localStorage.getItem('userData'));

  // Controlled inputs state
  const [username, setUsername] = useState(storage ? storage.username : '');
  const [email, setEmail] = useState(storage ? storage.email : '');
  const [firstName, setFirstName] = useState(storage ? storage.first_name : '');
  const [lastName, setLastName] = useState(storage ? storage.last_name : '');
  const [bio, setBio] = useState(storage ? storage.bio : '');
  const [profileImage, setProfileImage] = useState(null);

  const navigate = useNavigate();

  // Handle form submission (profile update)
  const handleUpdate = async () => {
    try {
      await update_user({
        username,
        profile_image: profileImage,
        email,
        first_name: firstName,
        last_name: lastName,
        bio,
      });

      // Update localStorage for persistence
      localStorage.setItem(
        'userData',
        JSON.stringify({ username, email, first_name: firstName, last_name: lastName, bio })
      );

      alert('Successfully updated details');
      navigate(`/${username}`);
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating details');
    }
  };

  return (
    <div className={`container ${styles.settingsContainer} pt-5`}>
      <h1 className="mb-4">Settings</h1>

      <form>
        {/* Profile Picture Upload */}
        <div className="mb-3">
          <label htmlFor="profileImage" className="form-label">
            Profile Picture
          </label>
          <input
            type="file"
            className="form-control"
            id="profileImage"
            onChange={(e) => setProfileImage(e.target.files[0])}
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
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
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
            rows="3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
          ></textarea>
        </div>

        <button
          type="button"
          className="btn btn-primary w-100 mb-3"
          onClick={handleUpdate}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
