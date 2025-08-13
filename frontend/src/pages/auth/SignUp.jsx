import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles/SignUp.module.css';
import { supabase } from '../../api/supabase-client';

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

  const navigate = useNavigate();

  // Real-time password validation
  useEffect(() => {
    if (password && password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
    } else {
      setPasswordError("");
    }

    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Prevent submission if validation fails
    if (passwordError || !passwordMatch) {
      alert("Please fix password issues before signing up!");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error signing up: ", error.message);
      return;
    }

    // Redirect or show success
    navigate("/dashboard"); // example redirect
  };

  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center p-3">
      <div className="row w-100 max-w-1000 mx-auto">
        {/* Left Image */}
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

            <button type="submit" className="btn btn-dark w-100 mt-3">
              Sign up
            </button>

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
