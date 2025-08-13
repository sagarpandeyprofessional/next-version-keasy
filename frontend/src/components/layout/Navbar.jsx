import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './styles/Navbar.module.css';

// Main nav links
const NavLinks = ({ onClick }) => {
  const paths = ['/', '/marketplace', '/events', '/blog', '/community', '/nearby', '/guides'];
  return (
    <>
      {paths.map((path, idx) => {
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

// Guest links (when user is not logged in)
const GuestLinks = () => (
  <>
    <Link to="/sign-in" className={styles.authLink}>Sign in</Link>
    <Link to="/sign-up" className={styles.signupBtn}>Sign up</Link>
  </>
);

// Desktop user menu
const AuthUserMenu = ({ username, userData, isOpen, toggleMenu, closeMenu, logout }) => {
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeMenu]);

  const getUserInitials = () => userData?.username?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="position-relative" ref={userMenuRef}>
      <button
        onClick={toggleMenu}
        className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${styles.userButton}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className={`${styles.avatarFallback} rounded-circle`}>{getUserInitials()}</div>
        <span>@{username}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={styles.dropdownIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`${styles.userMenu} shadow`}>
          <Link to={`/${username}`} className={styles.userMenuItem} onClick={closeMenu}>Your Profile</Link>
          <Link to="/marketplace/my" className={styles.userMenuItem} onClick={closeMenu}>My Listings</Link>
          <Link to="/settings" className={styles.userMenuItem} onClick={closeMenu}>Settings</Link>
          <button onClick={logout} className={styles.userMenuItemBtn}>Sign out</button>
        </div>
      )}
    </div>
  );
};

// Mobile menu
const MobileMenu = ({ isOpen, closeMenu, auth, authLoading, userData, logout }) => {
  if (!isOpen) return null;

  const getUserInitials = () => userData?.username?.substring(0, 2).toUpperCase() || 'U';
  const getUserDisplayName = () => `@${userData?.username || 'User'}`;

  return (
    <div className={`d-md-none ${styles.mobileMenu}`}>
      <div className="px-2 py-3">
        <NavLinks onClick={closeMenu} />
        <div className="mt-3 border-top pt-3">
          {authLoading ? (
            <div className="d-flex align-items-center gap-2 px-3 py-2 text-muted">
              <div className={styles.spinner}></div>
              <span>Checking auth...</span>
            </div>
          ) : auth ? (
            <>
              <div className="d-flex align-items-center px-3 mb-2">
                <div className={`${styles.avatarFallback} rounded-circle me-2`}>{getUserInitials()}</div>
                <div>
                  <div className="fw-bold text-dark">{getUserDisplayName()}</div>
                  <div className="text-muted">{userData?.email || 'No email available'}</div>
                </div>
              </div>
              <Link to={`/${userData?.username}`} className={styles.mobileNavLink} onClick={closeMenu}>Your Profile</Link>
              <Link to="/marketplace/my" className={styles.mobileNavLink} onClick={closeMenu}>My Listings</Link>
              <Link to="/settings" className={styles.mobileNavLink} onClick={closeMenu}>Settings</Link>
              <button onClick={logout} className={styles.mobileSignOutBtn}>Sign out</button>
            </>
          ) : (
            <div className="d-flex flex-column gap-2 px-3">
              <Link to="/sign-in" className={styles.mobileNavLink} onClick={closeMenu}>Sign in</Link>
              <Link to="/sign-up" className={`${styles.mobileNavLink} ${styles.mobileSignupBtn}`} onClick={closeMenu}>Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Navbar
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { auth, authLoading, logout } = useAuth();
  const userData = JSON.parse(localStorage.getItem('userData')) || null;
  const username = userData?.username || 'User';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => !authLoading && setIsUserMenuOpen(!isUserMenuOpen);
  const closeUserMenu = () => setIsUserMenuOpen(false);
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <header className={`${styles.navbar} shadow-sm`}>
      <div className="container d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Link to="/" className={styles.brand}>KEasy</Link>
        </div>

        <nav className="d-none d-md-flex gap-3">
          <NavLinks />
        </nav>

        <div className="d-none d-md-flex align-items-center gap-3">
          {authLoading ? (
            <div className={`d-flex align-items-center gap-2 border rounded px-3 py-1 text-muted ${styles.loading}`}>
              <div className={styles.spinner}></div>
              <span>Checking auth...</span>
            </div>
          ) : auth ? (
            <AuthUserMenu
              username={username}
              userData={userData}
              isOpen={isUserMenuOpen}
              toggleMenu={toggleUserMenu}
              closeMenu={closeUserMenu}
              logout={logout}
            />
          ) : (
            <GuestLinks />
          )}
        </div>

        <div className="d-flex d-md-none">
          <button type="button" className={`${styles.mobileMenuBtn} btn btn-light`} aria-controls="mobile-menu" aria-expanded={isMenuOpen} onClick={toggleMenu}>
            <span className="visually-hidden">Open main menu</span>
            {!isMenuOpen ? (
              <svg className="bi" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1.5 12.5h13m-13-5h13m-13-5h13" />
              </svg>
            ) : (
              <svg className="bi" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4.5 4.5l7 7m0-7l-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <MobileMenu isOpen={isMenuOpen} closeMenu={closeMobileMenu} auth={auth} authLoading={authLoading} userData={userData} logout={logout} />
    </header>
  );
};

export default Navbar;
