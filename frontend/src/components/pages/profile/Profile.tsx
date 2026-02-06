// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { IoEyeOutline } from "react-icons/io5";
import { IoIosHeart } from "react-icons/io";
import { IoIosHeartEmpty } from "react-icons/io";

// helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
};

  const {user} = useAuth

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
              return <UserEvents userId={userId} setError={setError} isMobile={isMobile}/>;
            case "guides":
              return <UserGuides userId={userId} setError={setError} isMobile={isMobile} />;
            case "products":
              return <UserMarketplace userId={userId} setError={setError} isMobile={isMobile}/>;
            default:
              return null;
          }
        })()}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const ProfileHeader = ({ usernameFromUrl }) => {
  const { signOut } = useAuth(); // AuthContext signOut
  const [profile, setProfile] = useState(null);
  const [isOurProfile, setIsOurProfile] = useState(false);
  const [session, setSession] = useState(null);
  const router = useRouter();

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
    router.push("/"); // redirect to home after logout
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
              href="/edit-profile/"
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

// marketplace component
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
          <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700 text-center">
            <p>No Products Uploaded!</p>
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

// markletplace item component
const MarketplaceItem = ({product, isMobile, setError}) => {

  const [imageError, setImageError] = useState(false)
  const router = useRouter()
  const imageUrl = product?.images?.images?.[0] || '/no-image.png'

  const conditionStyles = {
    new: {label: 'New', color: 'bg-black'},
    used: {label: 'Used', color: 'bg-gray-700'}
  }

  const handleCardClick = async () => {
    try {
      const navigationLink = `/marketplace/${product.id}`
      router.push(navigationLink)
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
    
            <div className="mb-2 flex items-center gap-1 text-gray-800 text-sm">
              <IoEyeOutline />
              <span>{product.views || 0}</span>
            </div>
    
            <div className="flex items-center justify-between">
              <p className="font-bold text-black">{formatCurrency(product.price)}</p>
              <Link
                href={`/marketplace/${product.id}`}
                className="text-sm font-medium text-black hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
  )
}

// Format event date into readable format
function formatEventDate(dateString) {
  if (!dateString) return 'Invalid date';
  const koreaTime = new Date(dateString);
  const localTime = new Date(
    koreaTime.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
  );

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return localTime.toLocaleString(undefined, options);
}

// Get contact info styling
function getContactInfo(type, link) {
  const contactTypes = {
    telegram: {
      color: 'bg-[#0088cc] hover:bg-[#006699]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-2.146 10.128-2.146 10.128-.161.717-.537.896-1.075.537l-3.583-2.686-1.792 1.792c-.179.179-.358.358-.716.358l.358-3.583 6.628-5.986c.269-.269-.06-.448-.448-.179l-8.152 5.09-3.583-1.075c-.717-.269-.717-.717.179-1.075l13.73-5.269c.537-.179 1.075.179.9 1.075z"/>
        </svg>
      ),
    },
    whatsapp: {
      color: 'bg-[#25D366] hover:bg-[#1EBE57]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    instagram: {
      color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    messenger: {
      color: 'bg-[#0084FF] hover:bg-[#0073E6]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
        </svg>
      ),
    },
    'kakao talk': {
      color: 'bg-[#FEE500] hover:bg-[#F5DC00] text-gray-900',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.678l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222V13.5a.472.472 0 0 0 .944 0v-1.363l.427-.413 1.428 2.033a.472.472 0 1 0 .773-.543l-1.514-2.155zm-2.958 1.924h-1.46V9.297a.472.472 0 0 0-.943 0v4.159c0 .26.21.472.471.472h1.932a.472.472 0 1 0 0-.944zm-5.857-1.092l.696-1.707.638 1.707H9.092zm2.523.488l.002-.016a.469.469 0 0 0-.127-.32l-1.046-2.8a.69.69 0 0 0-.627-.474.696.696 0 0 0-.653.447l-1.661 4.075a.472.472 0 0 0 .874.357l.33-.813h2.07l.299.8a.472.472 0 1 0 .884-.33l-.345-.926zM8.293 9.302a.472.472 0 0 0-.471-.472H4.577a.472.472 0 1 0 0 .944h1.16v3.736a.472.472 0 0 0 .944 0V9.774h1.14c.261 0 .472-.212.472-.472z"/>
        </svg>
      ),
    },
    email: {
      color: 'bg-[#EA4335] hover:bg-[#D93025]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    message: {
      color: 'bg-[#10B981] hover:bg-[#059669]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  };

  const contactType = contactTypes[type] || contactTypes.message;
  
  return {
    icon: contactType.icon,
    color: contactType.color,
    link: link || '#',
  };
}


const UserEvents = ({ userId, setError }) => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch categories
      const { data: categoryData } = await supabase
        .from('event_category')
        .select('*');
      
      if (categoryData) {
        const categoryMap = {};
        categoryData.forEach(cat => {
          categoryMap[cat.id] = cat.name;
        });
        setCategories(categoryMap);
      }

      // Fetch user's events
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (eventError) {
        setError(eventError);
      } else {
        setEvents(eventData || []);
      }
      
      setLoading(false);
    };

    if (userId) {
      fetchData();
    }
  }, [userId, setError]);

  if (loading) {
    return (
      <div className="w-full p-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading your events...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {events.length === 0 ? (
        <div className="space-y-4">
          <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-semibold mb-2">No Events Created Yet!</p>
            <p className="text-sm text-gray-500">Start creating events to see them here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              setError={setError}
              userId={userId}
              categoryName={categories[event.category_id]}
              setEvents={setEvents}
              events={events}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event, setError, userId, categoryName, setEvents, events }) => {
  const router = useRouter();
  const contactInfo = getContactInfo(event.organizer_contact_type);
  const [sessionUserId, setSessionUserId] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionUserId(data?.session?.user?.id || null);
    };

    fetchSession();
  }, []);

  const isOwner = sessionUserId && event.user_id === sessionUserId;

  const handleDelete = async () => {
    if (!isOwner) {
      alert('You do not have permission to delete this event.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', event.id)
      .eq('user_id', userId); // Double-check ownership

    if (error) {
      setError(error);
      alert(`Failed to delete event: ${error.message}`);
    } else {
      alert('Event deleted successfully!');
      // Remove from local state
      setEvents(events.filter(e => e.id !== event.id));
    }
  };

  const handleEdit = () => {
    if (!isOwner) {
      alert('You do not have permission to edit this event.');
      return;
    }
    router.push(`/events/edit/${event.id}`);
  };

  // Check if event has passed
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 relative">
      {/* Edit & Delete Buttons - Only visible if user is owner */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition-all group/edit"
            title="Edit event"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover/edit:text-blue-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-red-50 transition-all group/delete"
            title="Delete event"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover/delete:text-red-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Past Event Badge */}
      {isPastEvent && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full shadow-md">
            Past Event
          </span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 pr-12">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {event.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {categoryName || 'Event'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Description */}
        {event.description && (
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Date */}
        <div className="flex items-start gap-2 text-sm">
          <svg
            className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div className="flex-1">
            <div className="text-gray-700 font-medium">
              {formatEventDate(event.date)}
            </div>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-2 text-sm">
            <svg
              className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="flex-1">
              <span className="text-gray-700">{event.location}</span>
              {event.location_coordinates && (
                <a
                  href={event.location_coordinates}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 hover:underline"
                >
                  Open in Naver Maps →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="pt-2">
          <div className={`flex items-center justify-center gap-2 ${contactInfo.color} text-white font-semibold px-4 py-2.5 rounded-xl shadow-md`}>
            <span>{contactInfo.icon}</span>
            <span className="text-sm">
              {event.organizer_contact_type || 'Contact'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// communities component
const UserCommunities = ({ userId, setError }) => {
  const [communities, setCommunities] = useState([])

  useEffect(() => {
    const getCommunity = async() =>{
      const {data: communityData, error: communityError} = await supabase.from('community').select('*').eq('user_id', userId);
      if(communityError){
        setError(communityError)
      }
      else {
        setCommunities(communityData)
      }
    }
    getCommunity()
  }, [userId])
  
  return (
    <div className="w-full">
      {communities.length === 0 ? (
        <div className="space-y-4">
          <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700 text-center">
            <p>No Communities Uploaded!</p>
          </div>
        </div>
        ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => ( 
            <CommunityCard 
              key={community.id}
              community = {community}
              setError = {setError}
              userId={userId}
            />
            ))}
        </div>
        )}
    </div>
  );
};

const CommunityCard = ({community, setError, userId}) => {
  const [sessionUserId, setSessionUserId] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionUserId(data?.session?.user?.id || null);
    };

    fetchSession();
  }, []);

  const isOwner = sessionUserId && community.user_id === sessionUserId;

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
          {isOwner && (
            <Link
              href={`/community/edit/${community.id}`}
              className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="Edit community"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="mb-4 text-gray-700">{community.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {community.members && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>{community.members} members</span>
            </div>
          )}
          {community.platforms && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{community.platforms}</span>
            </div>
          )}
          </div>
          <div className="mt-4">
            {community.chat_link?.startsWith('http') ? (
              <a
                href={community.chat_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-md bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-600"
              >
                Join Group
              </a>
            ) : (
              <Link
                href={community.chat_link || '#'}
                className="block w-full rounded-md bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-600"
              >
                Join Group
              </Link>
            )}
          </div>
        </div>
    </div>
  )
}

// guides component
const UserGuides = ({userId, setError, isMobile}) => {
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
    getGuides()

  }, [userId])

  return(
    <div className="w-full">
      {guides.length === 0 ? (
        <div className="space-y-4">
          <div className="p-6 border rounded-lg bg-white shadow-sm text-gray-700 text-center">
            <p>No Guides Uploaded!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard 
              guide = {guide}
              isMobile = {isMobile}
              setError = {setError}
              key = {guide.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// guide card component
const GuideCard = ({guide, isMobile, setError}) => {
  const [author, setAuthor] = useState(false);
  const view = guide.view
  const viewsCount = parseInt(view) || 0;
  const likesCount = guide.like ? Object.keys(guide.like).filter(key => guide.like[key] === true).length : 0
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <Link href={`/guides/guide/${guide.id}`} className="block h-full">
      {/* MOBILE VIEW - Horizontal Layout */}
        <div className="my-2 mx-2 sm:hidden h-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl group cursor-pointer flex">
          {/* Mobile Image - Left side */}
          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-200">
            {guide.img_url ? (
              <img
                src={guide.img_url}
                alt={guide.name || 'Guide image'}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <div className="text-gray-400 text-xs">No image</div>
              </div>
            )}
          </div>

          {/* Mobile Content - Right side */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            {/* Title + Description */}
            <div>
              <h3 className="text-sm font-semibold text-black line-clamp-2 mb-1">
                {guide.name || 'Untitled Guide'}
              </h3>

              {guide.description && (
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {guide.description}
                </p>
              )}
            </div>

            {/* Author + Stats + Actions */}
            <div className="mt-1 flex flex-col gap-1">
              {/* Author + stats */}
              <div className="flex items-center justify-between text-xs text-blue-400">
                <div className="flex items-center gap-2 truncate">

                  <div className="flex items-center gap-1 text-gray-500">
                    <IoEyeOutline className="w-3 h-3" />
                    <span>{formatCount(viewsCount)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <IoIosHeart className="w-3 h-3" />
                    <span>{formatCount(likesCount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* DESKTOP VIEW - Vertical Layout */}
        <div className="hidden sm:flex h-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group cursor-pointer flex-col">
          {/* Desktop Image - Top */}
          <div className="relative w-full h-48 overflow-hidden bg-gray-200">
            {guide.img_url ? (
              <img
                src={guide.img_url}
                alt={guide.name || 'Guide image'}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <div className="text-gray-400 text-sm">No image</div>
              </div>
            )}
                    
            {/* Desktop overlay with stats */}
                    <div className="absolute inset-0 transition-all duration-300">
                      
        
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                            <IoEyeOutline className="w-4 h-4" />
                            <span className="text-sm font-medium">{formatCount(viewsCount)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                            <IoIosHeart className="w-4 h-4" />
                            <span className="text-sm font-medium">{formatCount(likesCount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
        
                  {/* Desktop Content - Bottom */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black line-clamp-2 mb-2">
                        {guide.name || 'Untitled Guide'}
                      </h3>
                      
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {guide.description || 'No description available.'}
                      </p>
                    </div>
                    
                    <div className="mt-2">
                      
                      <div className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white group-hover:bg-gray-800 transition-colors">
                        Read full guide &rarr;
                      </div>
                    </div>
                  </div>
                </div>
      </Link>
  )
}

export default Profile;
