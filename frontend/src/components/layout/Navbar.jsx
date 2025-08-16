import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router';

const Navbar = () => {
  const { session, profile, signOut } = useAuth();
  return (
    <nav style={{ display: "flex", gap: "10px", padding: "10px", borderBottom: "1px solid #ccc" }}>
      <Link to="/">Home</Link>
      {session ? (
        <>
          <span>Logged in as {profile?.username}</span>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <>
          <Link to="/signin"><button>Sign In</button></Link>
          <Link to="/signup"><button>Sign Up</button></Link>
        </>
      )}
      {session && <Link to="/profile">Profile</Link>}
    </nav>
  )
}

export default Navbar