import { useEffect, useState } from "react"
import styles from './styles/Profile.module.css'
import { useNavigate, Link, useParams } from "react-router-dom"
import { supabase } from "../../api/supabase-client"

const Profile = () => {

  const { username: usernameFromUrl } = useParams()
  const [ userExist, setUserExist ] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      //Fetch user with username from database
      const { data, error } = await supabase.from('profiles').select('username').eq('username', usernameFromUrl).single();

      if(error){
        setUserExist(false)
      }
      else {
        setUserExist(true)

      }
      setLoading(false)
    };

    if(usernameFromUrl){
      checkUser()
    }
  }, [usernameFromUrl])

  //Which tab is active? 'posts' or 'reels'
  const [activeTab, setActiveTab] = useState('posts')

  return (
    <>
      {!userExist && <p>User not found</p>}
      {userExist && (
        <div className="container my-4">
        <ProfileHeader usernameFromUrl={usernameFromUrl} />

        {/* Tabs */}
        <div className="d-flex justify-content-center mt-4 border-bottom">
          <button
            className={`btn btn-link ${activeTab === 'posts' ? 'fw-bold text-dark' : 'text-muted'}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`btn btn-link ${activeTab === 'reels' ? 'fw-bold text-dark' : 'text-muted'}`}
            onClick={() => setActiveTab('reels')}
          >
            Reels
          </button>
        </div>

        {/* Content */}
        <div className="mt-3">
          {activeTab === 'posts' ? <UserPosts usernameFromUrl={usernameFromUrl} /> : <UserReels usernameFromUrl={usernameFromUrl} />}
        </div>
      </div>
      )}
    </>
  )
}

const ProfileHeader = ({usernameFromUrl}) => {

 const [profile, setProfile] = useState(null);
const [isOurProfile, setIsOurProfile] = useState(false);
const [session, setSession] = useState(null);

useEffect(() => {
  // Get profile
  const getProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, username, first_name, last_name, pfp_url, bio")
      .eq("username", usernameFromUrl)
      .single();

    if (error) {
      console.error(error);
    } else {
      setProfile(data);
    }
  };

  getProfile();

  // Get session
  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  };
  getSession();
}, [usernameFromUrl]);

// Separate effect to check ownership
useEffect(() => {
  if (session?.user?.id && profile?.user_id) {
    setIsOurProfile(session.user.id === profile.user_id);
  }
}, [session, profile]);


  
    
  

    return (
        <div className="d-flex flex-column flex-sm-row align-items-center">
            {/* Avatar */}
            <div
                className="rounded-circle bg-dark text-white d-flex justify-content-center align-items-center fw-bold fs-3 me-sm-4 mb-3 mb-sm-0"
                style={{ width: 96, height: 96, overflow: 'hidden', position: 'relative' }}
            >
                <img
                    src={profile?.pfp_url || ""}
                    alt={`${profile?.username}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* User Info */}
            <div className="text-center text-sm-start">
                <h1 className="h3 mb-1">@{usernameFromUrl}</h1>
                <p className="mb-1 text-muted">{profile?.first_name || ""} {profile?.last_name || ""}</p>
                <p className="mb-1 text-muted">{profile?.bio || ""}</p>
                <div className="mt-3">
                    {
                      isOurProfile ? 
                      <Link className='btn btn-dark btn-sm' to='/edit-profile/'>Edit Profile</Link>
                      :
                      <></>
                    }
                </div>
            </div>
        </div>
    );
}




// const Post = ({post}) => (
//     <div className="border rounded mb-4 p-3 bg-white shadow-sm">
//     <p>{post.description}</p>
//     {/* Here you can add images, likes, comments count, etc */}
//   </div>
// )

const UserPosts = ({usernameFromUrl}) => {
    // const [posts, setPosts] = useState([])
    // const [loading, setLoading] = useState(true)

    // useEffect(() => {

    //     const fetchPosts = async () => {
    //         try {
    //             const posts = await get_users_posts(username)
    //             setPosts(posts)
    //         } catch {
    //             alert('error getting users posts')
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     fetchPosts()

    // }, [username])

    return (
    <div>
      {/* {posts.map(post => (
        <Post key={post.id} post={post} />
      ))} */}
      <p>Posts coming soon for @{usernameFromUrl}...</p>
    </div>
    )
}

const UserReels = ({usernameFromUrl}) => {
    return (
        <div>
            <p>Reels coming soon for @{usernameFromUrl}...</p>
            {/* You can add reel videos, autoplay, scroll etc here */}
        </div>
    )
}

export default Profile