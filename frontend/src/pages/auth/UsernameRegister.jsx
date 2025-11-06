import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase-client";

// Username validation - same as your existing rules
const usernameRules = (username) => /^[a-z0-9._]*$/.test(username);

const UsernameRegistration = () => {
  const { session, profile, refreshSession } = useAuth(); // Use refreshSession instead of createOrUpdateProfile
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Username availability states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  // Check if user already has a username - redirect if they do
  useEffect(() => {
    if (profile?.username) {
      navigate("/");
    }
  }, [profile, navigate]);

  // Debounce username availability check
  useEffect(() => {
    if (!username) {
      setIsUsernameAvailable(null);
      return;
    }

    if (!usernameRules(username)) {
      setIsUsernameAvailable(false);
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
        setIsUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase();
    if (usernameRules(value) || value === "") {
      setUsername(value);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!username) {
      setError("Username is required.");
      setIsLoading(false);
      return;
    }

    if (!usernameRules(username)) {
      setError("Username can only contain lowercase letters, numbers, underscores, and periods.");
      setIsLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }

    if (username.length > 30) {
      setError("Username must be less than 30 characters long.");
      setIsLoading(false);
      return;
    }

    if (isUsernameAvailable === false) {
      setError("This username is already taken.");
      setIsLoading(false);
      return;
    }

    try {
      // Create/update profile with ONLY username and user_id
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          user_id: session.user.id,
          username: username
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh the session to update the profile in context
      await refreshSession();

      // Success! Redirect to home
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error creating profile:", err);
      setError(`Failed to create profile: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="bg-white rounded-t-lg px-6 py-8 shadow-lg">
          <div className="text-center mb-6">
            {/* User Avatar */}
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-black flex items-center justify-center">
              
                <img
                  src="https://ltfgerwmkbyxfaebxucc.supabase.co/storage/v1/object/public/app_bucket/pfp_logo.jpg"
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover"
                />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome{session.user.user_metadata?.full_name ? `, ${session.user.user_metadata.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-gray-600 text-sm">
              To complete your profile, please choose a unique username
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="your_username"
                  className="block w-full pl-8 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-black"
                />
              </div>
              
              {/* Username Rules */}
              <div className="mt-1 text-xs text-gray-500 space-y-1">
                <p>• Only lowercase letters, numbers, underscores (_), and periods (.)</p>
                <p>• Between 3-30 characters</p>
                <p>• Must be unique</p>
              </div>

              {/* Username Availability Status */}
              {username && (
                <div className="mt-2">
                  {isCheckingUsername && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                      <span className="text-xs text-gray-500">Checking availability...</span>
                    </div>
                  )}
                  {!isCheckingUsername && !usernameRules(username) && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-600 font-medium">
                        Invalid username format
                      </span>
                    </div>
                  )}
                  {!isCheckingUsername && usernameRules(username) && isUsernameAvailable === true && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-600 font-medium">
                        Username is available
                      </span>
                    </div>
                  )}
                  {!isCheckingUsername && usernameRules(username) && isUsernameAvailable === false && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-600 font-medium">
                        Username is already taken
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isCheckingUsername || !isUsernameAvailable || !username}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Profile...
                </div>
              ) : (
                "Complete Setup"
              )}
            </button>
          </form>
        </div>

        {/* Info Footer */}
        <div className="bg-gray-50 rounded-b-lg px-6 py-4 shadow-lg">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">
              Your username will be used for your public profile URL
            </p>
            <p className="text-xs text-gray-500">
              Signed in as: <span className="font-medium">{session.user.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameRegistration;