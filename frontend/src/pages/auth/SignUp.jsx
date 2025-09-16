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

  // 👇 debounce check username availability
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
        "❌ Username can only contain lowercase letters, numbers, underscores, and periods."
      );
    }
    if (!emailRules(email)) {
      return setError("❌ Please enter a valid email without spaces.");
    }
    if (!passwordRules(password)) {
      return setError(
        "❌ Password must be 8+ chars, include uppercase, lowercase, number, special char, and no spaces."
      );
    }
    if (password !== confirmPassword) {
      return setError("❌ Passwords do not match.");
    }
    if (isUsernameAvailable === false) {
      return setError("❌ This username is already taken.");
    }

    try {
      await signUp({ username, email, password });
      alert(`✅ Account created! A confirmation email has been sent to ${email}`);
      navigate("/signin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Right Form */}
        <div className="flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-4"
            noValidate
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              Create an account
            </h2>

            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
              />
              <p className="my-1 text-xs text-gray-500">
                Username can contain only underscore("_"), dot("."), numbers and
                small letters!
              </p>
              {username && (
                <p className="mt-1 text-xs">
                  {isCheckingUsername && (
                    <span className="text-gray-500">⏳ Checking...</span>
                  )}
                  {!isCheckingUsername &&
                    isUsernameAvailable === true && (
                      <span className="text-green-600">
                        ✅ Username is available
                      </span>
                    )}
                  {!isCheckingUsername &&
                    isUsernameAvailable === false && (
                      <span className="text-red-600">
                        ❌ Username is already taken
                      </span>
                    )}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
              />
            </div>

            {/* Password */}
            {/* <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-600 hover:text-black"
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div> */}

            {/* Confirm Password */}
            {/* <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-600 hover:text-black"
              >
                {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>

              {confirmPassword && (
                <p className="mt-1 text-xs">
                  {passwordMatch === true && (
                    <span className="text-green-600">✅ Passwords match</span>
                  )}
                  {passwordMatch === false && (
                    <span className="text-red-600">
                      ❌ Passwords do not match
                    </span>
                  )}
                </p>
              )}
            </div> */}
            {/* Password */}
<div className="relative">
  <label
    htmlFor="password"
    className="block text-sm font-medium text-gray-700"
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
    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
  />
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-9 text-gray-600 hover:text-black"
  >
    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
  </button>
</div>

{/* Confirm Password */}
<div className="relative">
  <label
    htmlFor="confirmPassword"
    className="block text-sm font-medium text-gray-700"
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
    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
  />
  <button
    type="button"
    onClick={() => setShowConfirmPassword((prev) => !prev)}
    className="absolute right-3 top-9 text-gray-600 hover:text-black"
  >
    {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
  </button>

  {confirmPassword && (
    <p className="mt-1 text-xs">
      {passwordMatch === true && (
        <span className="text-green-600">✅ Passwords match</span>
      )}
      {passwordMatch === false && (
        <span className="text-red-600">❌ Passwords do not match</span>
      )}
    </p>
  )}
</div>


            <button
              type="submit"
              className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
              disabled={isCheckingUsername}
            >
              Sign up
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-black hover:underline "
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* Left Illustration */}
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
      </div>
    </div>
  );
};

export default SignUp;
