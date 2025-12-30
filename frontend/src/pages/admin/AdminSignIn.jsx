import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash, FaGoogle } from "react-icons/fa";
import { supabase } from "../../api/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiLock, FiMail, FiShield } from "react-icons/fi";
import { isSuperadmin } from "../../utils/adminUtils";

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

const AdminSignIn = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in and is superadmin
  useEffect(() => {
    const checkSuperadmin = async () => {
      if (user) {
        const isAdmin = await isSuperadmin(user);
        if (isAdmin) {
          navigate("/admin");
        } else {
          setError("Access denied. Only superadmins can access admin panel.");
          // Sign out non-superadmins
          await supabase.auth.signOut();
        }
      }
    };
    checkSuperadmin();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!emailRules(email)) {
      setIsLoading(false);
      return setError("Please enter a valid email without spaces.");
    }

    if (!passwordRules(password)) {
      setIsLoading(false);
      return setError("Password cannot contain spaces.");
    }

    try {
      await signIn({ email, password });
      // Check will happen in useEffect after user state updates
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) {
        setError(`Google login failed: ${error.message}`);
        setIsLoading(false);
      }
    } catch (err) {
      setError(`Google login error: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full mb-4"
          >
            <FiShield className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-400">
              Admin Access Only
            </span>
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-3">
            Admin Sign In
          </h2>
          <p className="text-gray-400">
            Superadmin access required
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-900/50 border border-red-700 rounded-xl"
            >
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google OAuth Button */}
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 bg-gray-800 border-2 border-gray-600 rounded-xl py-4 px-6 text-gray-300 font-semibold hover:border-red-500 hover:text-red-400 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FaGoogle className="w-5 h-5 text-red-500" />
              <span>Sign in with Google</span>
            </>
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-gray-900 text-gray-400 text-sm font-medium">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-300 mb-2"
            >
              Email address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 pr-4 py-3 w-full rounded-xl border-2 border-gray-600 bg-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 text-white placeholder-gray-500"
                placeholder="Enter your admin email"
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-300 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-12 py-3 w-full rounded-xl border-2 border-gray-600 bg-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 text-white placeholder-gray-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors"
              >
                {showPassword ? (
                  <FaRegEye className="w-4 h-4" />
                ) : (
                  <FaRegEyeSlash className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
              <span>Sign in as Superadmin</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Back to main site */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-400"
        >
          Not an admin?{" "}
          <Link
            to="/"
            className="font-semibold text-red-400 hover:text-red-300 hover:underline transition-colors"
          >
            Back to main site
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default AdminSignIn;
