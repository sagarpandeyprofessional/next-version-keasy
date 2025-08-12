import { useEffect, useState } from 'react';
import { get_user_profile_data } from '../../api/endpoints';
import { MEDIA_SERVER_URL } from '../../api/constants';
import { Link } from 'react-router-dom';

const Profile = () => {

    // Which tab is active? 'posts' or 'reels'
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="container my-4">
      <ProfileHeader   />

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
        {activeTab === 'posts' ? <UserPosts /> : <UserReels />}
      </div>
    </div>
  )
}

const ProfileHeader = () => {

    return (
        <div className="d-flex flex-column flex-sm-row align-items-center">
            {/* Avatar */}
            <div
                className="rounded-circle bg-dark text-white d-flex justify-content-center align-items-center fw-bold fs-3 me-sm-4 mb-3 mb-sm-0"
                style={{ width: 96, height: 96, overflow: 'hidden', position: 'relative' }}
            >
                <img
                    src=""
                    alt=''
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* User Info */}
            <div className="text-center text-sm-start">
                <h1 className="h3 mb-1">@username</h1>
                <p className="mb-1 text-muted">bio</p>
                <div className="mt-3">
                            <Link className='btn btn-dark btn-sm' to='/edit-profile/'>Edit Profile</Link>
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

const UserPosts = () => {
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
      <p>Posts coming soon for @username...</p>
    </div>
    )
}

const UserReels = () => {
    return (
        <div>
            <p>Reels coming soon for @username...</p>
            {/* You can add reel videos, autoplay, scroll etc here */}
        </div>
    )
}

export default Profile