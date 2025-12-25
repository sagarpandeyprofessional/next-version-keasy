// src/pages/SignUp.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase-client";
import { FaRegEyeSlash, FaRegEye, FaGoogle, FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiLock, FiMail, FiUser, FiCheckCircle } from "react-icons/fi";

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

// Password strength checker
const getPasswordStrength = (password) => {
  const checks = {
    minLength: /.{8,}/.test(password),
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  if (score <= 2) return { strength: "weak", color: "#EF4444", width: "33%" };
  if (score <= 4) return { strength: "medium", color: "#F59E0B", width: "66%" };
  return { strength: "strong", color: "#10B981", width: "100%" };
};

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

  const [isLoading, setIsLoading] = useState(false);

  // Password strength
  const passwordStrength = password ? getPasswordStrength(password) : null;

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
    setIsLoading(true);

    if (!usernameRules(username)) {
      setIsLoading(false);
      return setError(
        "Username can only contain lowercase letters, numbers, underscores, and periods."
      );
    }
    if (!emailRules(email)) {
      setIsLoading(false);
      return setError("Please enter a valid email without spaces.");
    }
    if (!passwordRules(password)) {
      setIsLoading(false);
      return setError(
        "Password must be 8+ chars, include uppercase, lowercase, number, special char, and no spaces."
      );
    }
    if (password !== confirmPassword) {
      setIsLoading(false);
      return setError("Passwords do not match.");
    }
    if (isUsernameAvailable === false) {
      setIsLoading(false);
      return setError("This username is already taken.");
    }

    try {
      await signUp({ username, email, password });
      alert(`Account created! A confirmation email has been sent to ${email}`);
      navigate("/signin");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        setError(`Google signup failed: ${error.message}`);
        setIsLoading(false);
      }
    } catch (err) {
      setError(`Google signup error: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FDFBF7] via-[#FFFAF0] to-[#F0F8FF] p-4">
      <div className="grid w-full max-w-7xl grid-cols-1 gap-0 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left column - Premium Image Section */}
        <div className="hidden lg:flex relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4ECDC4]/20 to-[#FFE66D]/20 backdrop-blur-sm z-10" />
          <div className="relative w-full h-full min-h-[700px] overflow-hidden">
            <motion.img
              src="https://flexible.img.hani.co.kr/flexible/normal/800/503/imgdb/original/2024/0110/2317048732994007.jpg"
              alt="Join KEasy Community"
              className="object-cover w-full h-full"
              loading="eager"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
            />
            {/* Overlay Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20 flex items-end p-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white"
              >
                {/* kept incoming changes */}
                <h2 className="text-white/90 text-2xl font-bold mb-2">
                  Join KEasy Community
                </h2>
                <p className="text-white/90">
                  Connect with expats and make Korea feel like home
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right column - Premium Sign up form */}
        <div className="flex items-center justify-center bg-white p-8 lg:p-12 relative overflow-y-auto max-h-screen">
          {/* 3D Card Effect Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4ECDC4]/5 via-transparent to-[#FFE66D]/5 rounded-3xl" />

          <motion.div
            className="w-full max-w-md space-y-5 relative z-10"
            initial={{ opacity: 0, x: 20, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4ECDC4]/10 rounded-full mb-4"
              >
                <span className="w-2 h-2 bg-[#4ECDC4] rounded-full animate-pulse" />
                <span className="text-sm font-medium text-[#4ECDC4]">
                  Join Us Today
                </span>
              </motion.div>

              <h2 className="text-3xl font-bold text-[#1A1917] mb-3">
                Create your account
              </h2>
              <p className="text-[#7D786F]">
                Start your journey with KEasy community
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-2xl"
                >
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google OAuth Button */}
            <motion.button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-4 px-6 text-[#3D3A35] font-semibold hover:border-[#4285F4] hover:text-[#4285F4] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaGoogle className="w-5 h-5 text-[#4285F4]" />
                  <span>Sign up with Google</span>
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-[#7D786F] text-sm font-medium">
                  Or create with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Username */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-[#3D3A35] mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7D786F] w-4 h-4" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={handleUsernameChange}
                    className="pl-11 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 bg-white focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20 outline-none transition-all duration-300 text-[#3D3A35] placeholder-gray-400"
                    placeholder="Choose a username"
                  />
                  {username && !isCheckingUsername && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {isUsernameAvailable === true && (
                        <FiCheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {isUsernameAvailable === false && (
                        <FaTimes className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#7D786F]">
                  Lowercase letters, numbers, underscore, and period only
                </p>
                {username && isCheckingUsername && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 border-2 border-[#4ECDC4] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[#7D786F]">
                      Checking availability...
                    </span>
                  </div>
                )}
                {username && !isCheckingUsername && isUsernameAvailable === true && (
                  <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                    <FaCheck className="w-3 h-3" /> Username is available
                  </p>
                )}
                {username &&
                  !isCheckingUsername &&
                  isUsernameAvailable === false && (
                    <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                      <FaTimes className="w-3 h-3" /> Username is already taken
                    </p>
                  )}
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#3D3A35] mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7D786F] w-4 h-4" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 bg-white focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20 outline-none transition-all duration-300 text-[#3D3A35] placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#3D3A35] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7D786F] w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-12 py-3 w-full rounded-xl border-2 border-gray-200 bg-white focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20 outline-none transition-all duration-300 text-[#3D3A35] placeholder-gray-400"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7D786F] hover:text-[#4ECDC4] transition-colors"
                  >
                    {showPassword ? (
                      <FaRegEye className="w-4 h-4" />
                    ) : (
                      <FaRegEyeSlash className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {password && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#7D786F]">
                        Password strength:
                      </span>
                      <span
                        className="text-xs font-medium capitalize"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: passwordStrength.width }}
                        transition={{ duration: 0.3 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: passwordStrength.color }}
                      />
                    </div>
                  </div>
                )}
                <p className="mt-2 text-xs text-[#7D786F]">
                  8+ characters, uppercase, lowercase, number, special character
                </p>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-[#3D3A35] mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7D786F] w-4 h-4" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-12 py-3 w-full rounded-xl border-2 border-gray-200 bg-white focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20 outline-none transition-all duration-300 text-[#3D3A35] placeholder-gray-400"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7D786F] hover:text-[#4ECDC4] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <FaRegEye className="w-4 h-4" />
                    ) : (
                      <FaRegEyeSlash className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="mt-2">
                    {passwordMatch === true && (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <FaCheck className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                    {passwordMatch === false && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <FaTimes className="w-3 h-3" /> Passwords do not match
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Terms and Privacy Policy Notice */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-[#7D786F] text-center"
              >
                By clicking Sign up, you agree to keasy&apos;s{" "}
                <a
                  href="/terms_of_service"
                  className="text-[#4ECDC4] hover:underline font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy_policy"
                  className="text-[#4ECDC4] hover:underline font-medium"
                >
                  Privacy Policy
                </a>
                .
              </motion.p>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading || isCheckingUsername || isUsernameAvailable === false}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#4ECDC4] to-[#7EDDD6] hover:from-[#3DBDB5] hover:to-[#4ECDC4] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-[#7D786F]"
            >
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold text-[#FF6B6B] hover:text-[#E85555] hover:underline transition-colors"
              >
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
