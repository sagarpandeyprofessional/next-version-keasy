import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { supabase } from "../../api/supabase-client";

const Profile = () => {
  const { username: usernameFromUrl } = useParams();
  const [userExist, setUserExist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", usernameFromUrl)
        .single();

      if (error) setUserExist(false);
      else setUserExist(true);

      setLoading(false);
    };

    if (usernameFromUrl) checkUser();
  }, [usernameFromUrl]);

  const [activeTab, setActiveTab] = useState("posts");

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;
  if (!userExist) return <p className="text-center mt-12 text-red-500">User not found</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <ProfileHeader usernameFromUrl={usernameFromUrl} />

      {/* Tabs */}
      <div className="flex justify-center mt-8 border-b border-gray-300 dark:border-gray-700">
        {["posts", "reels"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px font-medium ${
              activeTab === tab
                ? "border-b-2 border-black dark:border-white text-black dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "posts" ? (
          <UserPosts usernameFromUrl={usernameFromUrl} />
        ) : (
          <UserReels usernameFromUrl={usernameFromUrl} />
        )}
      </div>
    </div>
  );
};

const ProfileHeader = ({ usernameFromUrl }) => {
  const [profile, setProfile] = useState(null);
  const [isOurProfile, setIsOurProfile] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, first_name, last_name, pfp_url, bio")
        .eq("username", usernameFromUrl)
        .single();

      if (!error) setProfile(data);
    };
    getProfile();

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();
  }, [usernameFromUrl]);

  useEffect(() => {
    if (session?.user?.id && profile?.user_id) {
      setIsOurProfile(session.user.id === profile.user_id);
    }
  }, [session, profile]);

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
      {/* Avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
        {profile?.pfp_url ? (
          <img
            src={profile.pfp_url}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-2xl font-bold text-gray-500 dark:text-gray-300">
            {profile?.username?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>

      {/* User Info */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold">@{usernameFromUrl}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {profile?.first_name} {profile?.last_name}
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{profile?.bio}</p>

        {isOurProfile && (
          <div className="mt-4">
            <Link
              to="/edit-profile/"
              className="inline-block px-4 py-2 bg-black text-white rounded hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition"
            >
              Edit Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const UserPosts = ({ usernameFromUrl }) => {
  return (
    <div className="space-y-4">
      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm text-gray-700 dark:text-gray-200">
        <p>Posts coming soon for @{usernameFromUrl}...</p>
      </div>
    </div>
  );
};

const UserReels = ({ usernameFromUrl }) => {
  return (
    <div className="space-y-4">
      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm text-gray-700 dark:text-gray-200">
        <p>Reels coming soon for @{usernameFromUrl}...</p>
      </div>
    </div>
  );
};

export default Profile;
