import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { supabase } from "../../api/supabase-client";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { username: usernameFromUrl } = useParams();
  const [userExist, setUserExist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  // Check User
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

// Fetch User ID
  useEffect(() => {
    const getUser = async() => {
      const {data:userData, error:userError} = await supabase.from('profiles').select('user_id').eq('username', usernameFromUrl);
      if(userError){
        setError(userError.message)
      }
      else{
        setUserId(userData[0].user_id || '')
      }
    }

    getUser();
  }, [usernameFromUrl])

  const [activeTab, setActiveTab] = useState("listings");

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;
  if (!userExist) return <p className="text-center mt-12 text-red-500">User not found</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <ProfileHeader usernameFromUrl={usernameFromUrl} />

      {/* Tabs */}
      <div className="flex justify-center mt-8 border-b border-gray-300">
        {["listings", "events", "community", "guides"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px font-medium ${
              activeTab === tab
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {(() => {
          switch (activeTab) {
            case "community":
              return <UserCommunities userId={userId} setError={setError} />;
            case "events":
              return <UserEvents userId={userId} setError={setError} />;
            case "guides":
              return <UserGuides userId={userId} setError={setError} />;
            case "listings":
              return <UserListings userId={userId} setError={setError} />;
            default:
              return null;
          }
        })()}
      </div>

      
        
        {/* <p>{error}</p> */}
    </div>
  );
};

const ProfileHeader = ({ usernameFromUrl }) => {
  const { signOut } = useAuth(); // AuthContext signOut
  const [profile, setProfile] = useState(null);
  const [isOurProfile, setIsOurProfile] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/"); // redirect to home after logout
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
      {/* Avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {profile?.pfp_url ? (
          <img
            src={profile.pfp_url}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-2xl font-bold text-gray-500">
            {profile?.username?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>

      {/* User Info */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-black">@{usernameFromUrl}</h1>
        <p className="text-gray-600">
          {profile?.first_name} {profile?.last_name}
        </p>
        <p className="mt-2 text-gray-700">{profile?.bio}</p>

        {isOurProfile && (
          <div className="mt-4 gap-x-6 inline-flex">
            <Link
              to="/edit-profile/"
              className="inline-block px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-block px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const UserListings = ({userId, setError}) => {
  const [listings, setListings] = useState([])

  useEffect(() => {
    const getListings = async() => {
      const {data: listingsData, error: listingsError} = await supabase.from('marketplace').select('*').eq('user_id', userId)
      if(listingsError){
        setError(listingsError)
      }
      else{
        setListings(listingsData)
      }
    }
    // getListings()
  },[userId])

  return (
    <div className="space-y-4">
      <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700">
        <p>Upload Product to see your Listings on this page!</p>
      
      </div>
    </div>
  )
}

const UserEvents = ({ userId, setError }) => {
  
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getEvents = async() => {
      const {data:eventData, error:eventError} = await supabase.from('events').select('*').eq('user_id', userId);
      if(eventError){
        setError(eventError);
      }
      else{
        setEvents(eventData);
        console.log(eventData);
      }
    } 
      // getEvents()
  }, [userId])

  return (
    <div className="space-y-4">
      <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700">
        <p>Create an Event to see Events on your page!</p>
      </div>
    </div>
  );
};

const UserCommunities = ({ userId, setError }) => {
  const [community, setCommunity] = useState([])

  useEffect(() => {
    const getCommunity = async() =>{
      const {data: communityData, error: communityError} = await supabase.from('community').select('*').eq('user_id', userId);
      if(communityError){
        setError(communityError)
      }
      else {
        setCommunity(communityData)
      }
    }
    // getCommunity()
  }, [])
  
  return (
    <div className="space-y-4">
      <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700">
        <p>Create community to see your Communities on this page!</p>
      
      </div>
    </div>
  );
};

const UserGuides = ({userId, setError}) => {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    const getGuides = async() => {
      const {data: GuideData, error: GuideError} = await supabase.from('guide').select('*').eq('created_by',userId);
      if(GuideError){
        setError(GuideError)
      }
      else{
        setGuides(GuideData)
      }
    }
    // getGuides()

  }, [userId])

  return(
    <div className="space-y-4">
      <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700">
        <p>Create guide to see your Guides on this page!</p>
      
      </div>
    </div>
  )
}


export default Profile;
