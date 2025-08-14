import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles/SignUp.module.css';
import { supabase } from '../../api/supabase-client';

const SignUp = () => {
  //  Username state
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // Existing states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

  const navigate = useNavigate();

  // Real-time username availability check (debounced)
  useEffect(() => {
    // If username is empty, reset availability status
    if (!username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    // Wait 500ms after last keystroke before checking DB
    const delayDebounce = setTimeout(async () => {
      // Query the "profiles" table for a matching username
      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("username", username.trim())
        .maybeSingle();

      if (error) {
        console.error(error);
        setUsernameAvailable(null);
        return;
      }

      // If no data found => username is available
      setUsernameAvailable(!data);
    }, 500);

    // Cleanup timeout if user types again before 500ms
    return () => clearTimeout(delayDebounce);
  }, [username]);

  // Existing: Real-time password validation
  useEffect(() => {
    if (password && password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
    } else {
      setPasswordError("");
    }
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    // Username availability check
    if (!usernameAvailable) {
      alert("Username is already taken.");
      return;
    }

    // Password validation
    if (passwordError || !passwordMatch) {
      alert("Please fix password issues before signing up!");
      return;
    }

    // 1 Create the Auth account in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error signing up: ", error.message);
      return;
    }

    // 2️ Insert user details into your public.users table
    const authUser = data.user; // This comes from Supabase Auth
    if (authUser) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          username: username.trim(),
          email: email.trim(), // store email in your table too
          first_name: null,
          last_name: null,
          pfp_url: null,
        },
      ]);

      if (insertError) {
        console.error("Error inserting user into public.users:", insertError.message);
        return;
      }
    }

    localStorage.setItem("username", username);

    // 3️ Redirect after successful registration
    alert("Check your Email for Verification!")
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
          <form className="w-100" style={{ maxWidth: 400 }} noValidate onSubmit={handleRegister}>
            <h2 className="mb-4">Create an account</h2>

            {/* Username input */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                required
                onChange={(e) => setUsername(e.target.value)}
                className={`form-control ${styles.input}`}
              />
              {/* Show real-time username check messages */}
              {username && usernameAvailable === false && (
                <p className="text-danger mt-1">Username is already taken</p>
              )}
              {username && usernameAvailable === true && (
                <p className="text-success mt-1">Username is available</p>
              )}
            </div>

            {/* Existing Email input */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
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
                required
                onChange={(e) => setPassword(e.target.value)}
                className={`form-control ${styles.input}`}
              />
              <small className="form-text text-muted">
                Password must be at least 8 characters long.
              </small>
              {passwordError && <p className="text-danger mt-1">{passwordError}</p>}
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
              {!passwordMatch && confirmPassword && (
                <p className="text-danger mt-1">Passwords do not match</p>
              )}
              {passwordMatch && confirmPassword && !passwordError && (
                <p className="text-success mt-1">Passwords match!</p>
              )}
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
