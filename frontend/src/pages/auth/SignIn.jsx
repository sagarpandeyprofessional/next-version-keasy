// src/pages/SignIn.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

// Email & password validation
const emailRules = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const noSpace = /^\S*$/;
  return regex.test(email) && noSpace.test(email);
};

const passwordRules = (password) => {
  const noSpace = /^\S*$/;
  return noSpace.test(password); // only no spaces
};

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailRules(email)) {
      return setError("❌ Please enter a valid email without spaces.");
    }

    if (!passwordRules(password)) {
      return setError("❌ Password cannot contain spaces.");
    }

    try {
      await signIn({ email, password });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left column - Image */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative h-full w-full max-w-md overflow-hidden rounded-lg">
            <img
              src="https://ltfgerwmkbyxfaebxucc.supabase.co/storage/v1/object/public/app_bucket/IMG_3637.JPEG"
              alt="Authentication illustration"
              className="object-cover w-full h-full"
              loading="eager"
            />
          </div>
        </div>

        {/* Right column - Sign in form */}
        <div className="flex items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4" noValidate>
            <h2 className="text-2xl font-semibold text-gray-900">
              Sign in to your account
            </h2>

            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Sign in
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-black hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
