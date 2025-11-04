import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase-client";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";

// Password & email rules
const passwordRules = (password) => {
  const minLength = /.{8,}/;
  const upper = /[A-Z]/;
  const lower = /[a-z]/;
  const number = /[0-9]/;
  const special = /[^A-Za-z0-9]/;
  const noSpace = /^\S*$/;

  return (
    minLength.test(password) &&
    upper.test(password) &&
    lower.test(password) &&
    number.test(password) &&
    special.test(password) &&
    noSpace.test(password)
  );
};

const emailRules = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const noSpace = /^\S*$/;
  return regex.test(email) && noSpace.test(email);
};

// Username validation
const usernameRules = (username) => /^[a-z0-9._]*$/.test(username);

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Username availability states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  // Confirm password live check
  const [passwordMatch, setPasswordMatch] = useState(null);

  // Show/hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debounce check username availability
  useEffect(() => {
    if (!username) {
      setIsUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .single();

        if (error && error.code !== "PGRST116") console.error(error);

        setIsUsernameAvailable(!data);
      } catch (err) {
        console.error("Error checking username:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Live password match check
  useEffect(() => {
    if (!confirmPassword) {
      setPasswordMatch(null);
      return;
    }
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (usernameRules(value)) setUsername(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!usernameRules(username)) {
      return setError(
        "Username can only contain lowercase letters, numbers, underscores, and periods."
      );
    }
    if (!emailRules(email)) {
      return setError("Please enter a valid email without spaces.");
    }
    if (!passwordRules(password)) {
      return setError(
        "Password must be 8+ chars, include uppercase, lowercase, number, special char, and no spaces."
      );
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (isUsernameAvailable === false) {
      return setError("This username is already taken.");
    }

    try {
      await signUp({ username, email, password });
      alert(`Account created! A confirmation email has been sent to ${email}`);
      navigate("/signin");
    } catch (err) {
      setError(err.message);
    }
  };

 const handleGoogleLogin = async (e) => {
  e.preventDefault(); // Prevent form submission
  setError(""); // Clear any existing errors
  
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        // Note: Google OAuth handles both sign-in and sign-up automatically
        // If user doesn't exist, Supabase creates them
        // If user exists, they get signed in
      }
    });
    
    if (error) {
      setError(`Google signup failed: ${error.message}`);
    }
  } catch (err) {
    setError(`Google signup error: ${err.message}`);
  }
};
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left column - Image */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative h-full w-full max-w-md overflow-hidden rounded-lg">
            <img
              src="https://flexible.img.hani.co.kr/flexible/normal/800/503/imgdb/original/2024/0110/2317048732994007.jpg"
              alt="Authentication illustration"
              className="object-cover w-full h-full"
              loading="eager"
            />
          </div>
        </div>

        {/* Right column - Sign up form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Create an account
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Google OAuth Button - OUTSIDE the form */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or create account with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Username can contain only underscore("_"), dot("."), numbers and small letters
                </p>
                {username && (
                  <div className="mt-1">
                    {isCheckingUsername && (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                        <span className="text-xs text-gray-500">Checking availability...</span>
                      </div>
                    )}
                    {!isCheckingUsername && isUsernameAvailable === true && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-green-600 font-medium">
                          Username is available
                        </span>
                      </div>
                    )}
                    {!isCheckingUsername && isUsernameAvailable === false && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-600 font-medium">
                          Username is already taken
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-8 text-gray-600 hover:text-black"
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  Must contain 8+ characters, uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-8 text-gray-600 hover:text-black"
                >
                  {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>

                {confirmPassword && (
                  <div className="mt-1">
                    {passwordMatch === true && (
                      <span className="text-xs text-green-600 font-medium">✅ Passwords match</span>
                    )}
                    {passwordMatch === false && (
                      <span className="text-xs text-red-600 font-medium">❌ Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCheckingUsername || isUsernameAvailable === false}
              >
                {isCheckingUsername ? "Checking..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-black hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;