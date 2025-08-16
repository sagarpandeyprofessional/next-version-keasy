// src/pages/SignUp.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styles from './styles/SignUp.module.css'

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp({ username, email, password });
      alert("Account created! Please sign in.");
      navigate("/signin");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center p-3">
      <div className="row w-100 max-w-1000 mx-auto">

        {/* Left Illustration Image */}
        <div className="d-none d-md-flex col-md-6 justify-content-center align-items-center">
          <div className="overflow-hidden rounded" style={{ maxWidth: 400, maxHeight: 400 }}>
            <img
              src="/images/auth-illustration.jpg"
              alt="Authentication illustration"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="eager"
            />
          </div>
        </div>

        {/* Right Form */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
          <form className="w-100" style={{ maxWidth: 400 }} noValidate onSubmit={handleSubmit}>
            <h2 className="mb-4">Create an account</h2>

            {/* Username input */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                className={`form-control ${styles.input}`}
              />
              {/* Show real-time username check messages */}
              {/* {username && usernameAvailable === false && (
                <p className="text-danger mt-1">Username is already taken</p>
              )}
              {username && usernameAvailable === true && (
                <p className="text-success mt-1">Username is available</p>
              )} */}
            </div>

            {/* Existing Email input */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className={`form-control ${styles.input}`}
              />
            </div>

            {/* Existing Password input */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className={`form-control ${styles.input}`}
              />
              <small className="form-text text-muted">
                Password must be at least 8 characters long.
              </small>
              {/* {passwordError && <p className="text-danger mt-1">{passwordError}</p>} */}
            </div>

            {/* Existing Confirm Password input */}
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`form-control ${styles.input}`}
              />
              {/* {!passwordMatch && confirmPassword && (
                <p className="text-danger mt-1">Passwords do not match</p>
              )}
              {passwordMatch && confirmPassword && !passwordError && (
                <p className="text-success mt-1">Passwords match!</p>
              )} */}
            </div>

            {/* Submit button */}
            <button type="submit" className="btn btn-dark w-100 mt-3">
              Sign up
            </button>

            {/* Already have account link */}
            <div className="mt-3 text-center">
              <p>
                Already have an account?{' '}
                <Link to="/sign-in" className={styles.loginLink}>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
};

export default SignUp;