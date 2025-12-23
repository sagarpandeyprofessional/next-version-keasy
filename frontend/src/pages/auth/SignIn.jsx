// src/pages/SignIn.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash, FaGoogle } from "react-icons/fa";
import { supabase } from "../../api/supabase-client";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";


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

// Floating Particles Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-[#FF6B6B]/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Parallax effect
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -25]);


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
      navigate("/");
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
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) {
        setError(`Google login failed: ${error.message}`);
        setIsLoading(false);
      }
    } catch (err) {
      setError(`Google login error: ${err.message}`);
      setIsLoading(false);
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FDFBF7] via-[#FFFAF0] to-[#F0F8FF] p-4">
      <div className="grid w-full max-w-7xl grid-cols-1 gap-0 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left column - Premium Image Section */}
        <div className="hidden lg:flex relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/20 to-[#4ECDC4]/20 backdrop-blur-sm z-10" />
          <div className="relative w-full h-full min-h-[600px] overflow-hidden">
            <motion.img
              src="https://ltfgerwmkbyxfaebxucc.supabase.co/storage/v1/object/public/app_bucket/IMG_3637.JPEG"
              alt="Welcome to KEasy Community"
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
                <h2 className="text-white/90 text-2xl font-bold mb-2">Welcome to keasy</h2>
                <p className="text-white/90">Your community for making Korea feel like home</p>
              </motion.div>
            </div>
          </div>
        </div>


        {/* Right column - Premium Sign in form */}
        <div className="flex items-center justify-center bg-white p-8 lg:p-12 relative">
          {/* 3D Card Effect Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B6B]/5 via-transparent to-[#4ECDC4]/5 rounded-3xl" />

          <motion.div
            className="w-full max-w-md space-y-6 relative z-10"
            initial={{ opacity: 0, x: 20, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            // whileHover={{ rotateY: 2 }}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px"
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B]/10 rounded-full mb-4"
              >
                <span className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-pulse" />
                <span className="text-sm font-medium text-[#FF6B6B]">Welcome Back</span>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-[#1A1917] mb-3">
                Sign in to your account
              </h2>
              <p className="text-[#7D786F]">Access your KEasy community and resources</p>
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
              onClick={handleGoogleLogin}
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
                  <span>Sign in with Google</span>
                </>
              )}
            </motion.button>


            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-[#7D786F] text-sm font-medium">Or continue with email</span>
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
                <label htmlFor="email" className="block text-sm font-semibold text-[#3D3A35] mb-2">
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
                    className="pl-11 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 bg-white focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none transition-all duration-300 text-[#3D3A35] placeholder-gray-400"
                    placeholder="Enter your email"
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
                <label htmlFor="password" className="block text-sm font-semibold text-[#3D3A35] mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7D786F] w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-12 py-3 w-full rounded-xl border-2 border-gray-200 bg-white focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none transition-all duration-300 text-[#3D3A35] placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7D786F] hover:text-[#FF6B6B] transition-colors"
                  >
                    {showPassword ? <FaRegEye className="w-4 h-4" /> : <FaRegEyeSlash className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>


              {/* Terms and Privacy Policy Notice */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-[#7D786F] text-center"
              >
                By clicking on Sign in, you agree to keasy's{" "}
                <a href="/terms_of_service" className="text-[#FF6B6B] hover:underline font-medium">
                  Terms of Service
                </a>
                . To learn more about how keasy collects, uses, and protects your personal data, please see our{" "}
                <a href="/privacy_policy" className="text-[#FF6B6B] hover:underline font-medium">
                  Privacy Policy
                </a>
                .
              </motion.p>


              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8A8A] hover:from-[#E85555] hover:to-[#FF6B6B] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>


            {/* Sign Up Link */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center text-sm text-[#7D786F]"
            >
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="font-semibold text-[#4ECDC4] hover:text-[#3DBDB5] hover:underline transition-colors"
              >
                Create account
              </Link>
            </motion.p>

            {/* Forgot Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <Link 
                to="/forgot-password" 
                className="text-sm text-[#7D786F] hover:text-[#FF6B6B] hover:underline transition-colors"
              >
                Forgot your password?
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};


export default SignIn;