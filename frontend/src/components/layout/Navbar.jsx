import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { logout } from '../../api/endpoints'
import styles from './styles/Navbar.module.css';

/** check mobile links in the end
 * NavLinks component renders the main navigation links used in both desktop and mobile menus.
 * onClick prop is used to close mobile menu when a link is clicked.
 */
const NavLinks = ({ onClick }) => {
  const paths = ['/', '/marketplace', '/events', '/blog', '/community', '/nearby', '/guides'];

  return (
    <>
      {paths.map((path, idx) => {
        // Create label for link: "Home" for '/', otherwise capitalize first letter after slash
        const label = path === '/' ? 'Home' : path.replace('/', '').charAt(0).toUpperCase() + path.slice(2);
        return (
          <Link key={idx} to={path} className={styles.navLink} onClick={onClick}>
            {label}
          </Link>
        );
      })}
    </>
  );
};

/**
 * AuthUserMenu handles the user dropdown menu on desktop when the user is logged in.
 * Shows avatar initials, username, and menu with links + sign out button.
 * Also handles closing the dropdown when clicking outside the menu.
 */
const AuthUserMenu = () => {
  const userMenuRef = useRef(null);

  // Close dropdown if clicked outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeMenu]);

  // Get user initials from username (e.g. "FR" for "france")
  const getUserInitials = () => {
    if (userData?.username) return userData.username.substring(0, 2).toUpperCase();
    return 'U'; // Default fallback initial
  };
  const nav = useNavigate()

   const handleLogout = async () => {
        try {
            await logout()
            nav('/login')
        } catch {
            alert('error logging out')
        }
    }

  return (
    <div className="position-relative" ref={userMenuRef}>
      {/* Button that toggles the user dropdown */}
      <button
        onClick={toggleMenu}
        className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${styles.userButton}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Avatar circle with initials */}
        <div className={`${styles.avatarFallback} rounded-circle`}>getUserInitials()</div>
        {/* Show username with '@' */}
        <span>@username</span>
        {/* Dropdown arrow icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={styles.dropdownIcon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu visible only when isOpen is true */}
      {isOpen && (
        <div className={`${styles.userMenu} shadow`}>
          {/* Links inside dropdown close the menu on click */}
          <Link to={`/username`} className={styles.userMenuItem} onClick={closeMenu}>
            Your Profile
          </Link>
          <Link to="/marketplace/my" className={styles.userMenuItem} onClick={closeMenu}>
            My Listings
          </Link>
          <Link to="/settings" className={styles.userMenuItem} onClick={closeMenu}>
            Settings
          </Link>
          {/* Sign out clears user data and reloads the page */}
          <button
            // onClick={handleLogout}
            className={styles.userMenuItemBtn}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * GuestLinks component shows Log in and Sign up links when user is not authenticated.
 * Used in desktop view.
 */
const GuestLinks = () => (
  <>
    <Link to="/login" className={styles.authLink}>
      Log in
    </Link>
    <Link to="/register" className={styles.signupBtn}>
      Sign up
    </Link>
  </>
);

/**
 * MobileMenu handles the navigation and user links when viewed on mobile devices.
 * It shows either user info + menu or guest links depending on auth state.
 */
const MobileMenu = () => {
  // // Same initials and display name helpers as desktop user menu
  // const getUserInitials = () => {
  //   if (userData?.username) return userData.username.substring(0, 2).toUpperCase();
  //   return 'U';
  // };
  // const getUserDisplayName = () => {
  //   if (userData?.username) return `@${userData.username}`;
  //   return 'User';
  // };

  // // If mobile menu is closed, don't render anything
  // if (!isOpen) return null;

  
  // const nav = useNavigate()
  // const handleLogout = async () => {
  //       try {
  //           await logout()
  //           nav('/login')
  //       } catch {
  //           alert('error logging out')
  //       }
  //   }

  return (
    <div className={`d-md-none ${styles.mobileMenu}`}>
      <div className="px-2 py-3">
        {/* Main nav links with closing menu on click */}
        <NavLinks onClick={closeMenu} />

        {/* Bottom auth section separated by border */}
        <div className="mt-3 border-top pt-3">
          {/* Show loading spinner while auth state is being checked */}
          {/* {authLoading ? ( */}
            <div className="d-flex align-items-center gap-2 px-3 py-2 text-muted">
              <div className={styles.spinner}></div>
              <span>Checking auth...</span>
            </div>
          {/* ) : auth ? ( */}
            <>
              {/* Show logged-in user's info */}
              <div className="d-flex align-items-center px-3 mb-2">
                <div className={`${styles.avatarFallback} rounded-circle me-2`}>getUserInitials()</div>
                <div>
                  <div className="fw-bold text-dark">getUserDisplayName()</div>
                  <div className="text-muted">userData?.email</div>
                </div>
              </div>

              {/* User-specific links */}
              <Link to={`/userData?.username`} className={styles.mobileNavLink} onClick={closeMenu}>
                Your Profile
              </Link>
              <Link to="/marketplace/my" className={styles.mobileNavLink} onClick={closeMenu}>
                My Listings
              </Link>
              <Link to="/settings" className={styles.mobileNavLink} onClick={closeMenu}>
                Settings
              </Link>
              {/* Sign out clears user data and reloads */}
              <button
                className={styles.mobileSignOutBtn}
              >
                Sign out
              </button>
            </>
          {/* ) : ( */}
            // If user not logged in, show guest login/signup links
            <div className="d-flex flex-column gap-2 px-3">
              <Link to="/login" className={styles.mobileNavLink} onClick={closeMenu}>
                Log in
              </Link>
              <Link to="/register" className={`${styles.mobileNavLink} ${styles.mobileSignupBtn}`} onClick={closeMenu}>
                Sign up
              </Link>
            </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

/**
 * Main Navbar component that ties everything together.
 * Controls state for mobile menu and user dropdown menu.
 * Uses auth state and user data to conditionally render menus.
 */
const Navbar = () => {
  // State for toggling mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State for toggling user dropdown visibility on desktop
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Get auth info from global context
  // const { auth, authLoading } = useAuth();

  // Load user data from localStorage (saved on login)
  // const userData = JSON.parse(localStorage.getItem('userData')) || null;
  // Use username or fallback to 'User'
  // const username = userData?.username || 'User';

  // Toggles mobile menu open/close
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  // Toggles user dropdown open/close only if auth isn't loading
  // const toggleUserMenu = () => {
  //   if (!authLoading) setIsUserMenuOpen(!isUserMenuOpen);
  // };
  // Close user dropdown menu
  const closeUserMenu = () => setIsUserMenuOpen(false);
  // Close mobile menu
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <header className={`${styles.navbar} shadow-sm`}>
      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand logo/text */}
        <div className="d-flex align-items-center">
          <Link to="/" className={styles.brand}>
            KEasy
          </Link>
        </div>

        {/* Desktop navigation links (hidden on mobile) */}
        <nav className="d-none d-md-flex gap-3">
          <NavLinks />
        </nav>

        {/* Desktop authentication controls */}
        <div className="d-none d-md-flex align-items-center gap-3">
          {/* Show spinner if loading auth state */}
          {/* {authLoading ? ( */}
            <div className={`d-flex align-items-center gap-2 border rounded px-3 py-1 text-muted ${styles.loading}`}>
              <div className={styles.spinner}></div>
              <span>Checking auth...</span>
            </div>
          {/* // ) : auth ? ( */}
            {/* // Show user menu when authenticated */}
            {/* // <AuthUserMenu/> */}
          {/* // ) : ( */}
            {/* // Show login/signup links when not authenticated */}
            <GuestLinks />
          {/* // )} */}
        </div>

        {/* Mobile hamburger menu toggle button */}
        <div className="d-flex d-md-none">
          <button
            type="button"
            className={`${styles.mobileMenuBtn} btn btn-light`}
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <span className="visually-hidden">Open main menu</span>
            {/* Show hamburger icon if menu is closed */}
            {!isMenuOpen ? (
              <svg
                className="bi"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M1.5 12.5h13m-13-5h13m-13-5h13" />
              </svg>
            ) : (
              // Show close icon if menu is open
              <svg
                className="bi"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M4.5 4.5l7 7m0-7l-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu/>
    </header>
  );
};

export default Navbar;
