import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { supabase } from "../../api/supabase-client";
import { useAuth } from "../../context/AuthContext";

// helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
};


const Profile = () => {
  const { username: usernameFromUrl } = useParams();
  const [userExist, setUserExist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [isMobile, setIsMobile] = useState(false);

   // Responsive
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

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

  const [activeTab, setActiveTab] = useState("products");

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;
  if (!userExist) return <p className="text-center mt-12 text-red-500">User not found</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <ProfileHeader usernameFromUrl={usernameFromUrl} />

      {/* Tabs */}
      <div className="flex justify-center mt-8 border-b border-gray-300">
        {["products", "events", "community", "guides"].map((tab) => (
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
              return <UserCommunities userId={userId} setError={setError} isMobile={isMobile} />;
            case "events":
              return <UserEvents userId={userId} setError={setError} isMobile={isMobile}  />;
            case "guides":
              return <UserGuides userId={userId} setError={setError} isMobile={isMobile}  />;
            case "products":
              return <UserMarketplace userId={userId} setError={setError} isMobile={isMobile}  />;
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

const UserMarketplace = ({userId, setError, isMobile}) => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const getProducts = async() => {
      const {data: listingsData, error: listingsError} = await supabase.from('marketplace').select('*').eq('user_id', userId)
      if(listingsError){
        setError(listingsError)
      }
      else{
        setProducts(listingsData)
      }
    }
    getProducts()
  },[userId])

  return (
    <div className="w-full">
      {products.length === 0 ? (
        <div className="space-y-4">
          <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700">
            <p>List a product to see your uploaded products</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <MarketplaceItem 
              product = {product}
              isMobile = {isMobile}
              setError = {setError}
              key = {product.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const MarketplaceItem = ({product, isMobile, setError}) => {

  const [imageError, setImageError] = useState(false)
  const navigate = useNavigate()
  const imageUrl = product?.images?.images?.[0] || '/no-image.png'

  const conditionStyles = {
    new: {label: 'New', color: 'bg-black'},
    used: {label: 'Used', color: 'bg-gray-700'}
  }

  const handleCardClick = async () => {
    try {
      const navigationLink = `/marketplace/${product.id}`
      navigate(navigationLink)
    }
    catch (err) {
      setError('Error with opening ', navigationLink)
    }
  }

  // Mobile horizontal layout
  if(isMobile){
    return (
      <div onClick={handleCardClick} className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all active:scale-[0.98] flex h-[120px]">
        {/* Left Image */}
                <div className="relative w-[120px] flex-shrink-0 bg-gray-50 flex justify-center items-center">
                  <img
                    src={imageUrl}
                    alt={product.title}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover"
                  />
                </div>
        
                {/* Right Content */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-black line-clamp-1 mb-1">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <span>Location: {product.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${
                          conditionStyles[product.condition]?.color || "bg-gray-700"
                        }`}
                      >
                        {conditionStyles[product.condition]?.label || "Unknown"}
                      </span>
                    </div>
                  </div>
        
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold text-black">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    
                  </div>
                </div>
      </div>
    )
  }

  return (
    <div
          onClick={handleCardClick}
          className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1"
        >
          <div className="relative w-full h-48 bg-white flex justify-center items-center">
            <img
              src={imageUrl}
              alt={product.title}
              onError={() => setImageError(true)}
              className="max-h-full w-auto object-contain"
            />
    
            {/* Condition Label */}
            <div
              className={`absolute top-0 left-0 m-2 rounded-full px-2 py-1 text-xs font-semibold text-white ${
                conditionStyles[product.condition]?.color || "bg-gray-700"
              }`}
            >
              {conditionStyles[product.condition]?.label || "Unknown"}
            </div>
          </div>
    
          <div className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">Location: {product.location}</p>
            </div>
    
            <h3 className="mb-2 text-lg font-semibold text-black">{product.title}</h3>
    
            {/* <div className="mb-2 flex items-center gap-1 text-gray-800 text-sm">
              <FiEye />
              <span>{item.views || 0}</span>
            </div> */}
    
            <div className="flex items-center justify-between">
              <p className="font-bold text-black">{formatCurrency(product.price)}</p>
              <Link
                to={`/marketplace/${product.id}`}
                className="text-sm font-medium text-black hover:underline"
              >
                View Details
              </Link>
            </div>
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
