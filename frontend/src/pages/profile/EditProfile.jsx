import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/EditProfile.module.css'; // your CSS module

const EditProfile = () => {
  

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
            value="username"
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
            value="email"
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
            value="firstName"
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
            value="lastName"
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
            value="bio"
            placeholder="Tell us about yourself"
          ></textarea>
        </div>

        <button
          type="button"
          className="btn btn-primary w-100 mb-3"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
