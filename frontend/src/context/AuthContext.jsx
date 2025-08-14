// Core React hooks
import { createContext, useContext, useState, useEffect } from "react";
// Supabase client instance
import { supabase } from "../api/supabase-client";

// Create a context to hold authentication state and methods
const AuthContext = createContext();

/**
 * AuthProvider wraps parts of your app that need authentication.
 * It provides `auth`, `authLoading`, and `logout` to children via context.
 */
export const AuthProvider = ({ children }) => {
  // `auth` is true if user is logged in, false otherwise
  const [auth, setAuth] = useState(false);

  // `authLoading` is true while checking session state
  const [authLoading, setAuthLoading] = useState(true);

  /**
   * fetchSession checks if a user session already exists in Supabase.
   * This is called once on mount to initialize auth state.
   */
  const fetchSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      // If there’s a session, mark auth as true
      setAuth(!!data.session);

      // Optional: store session info in localStorage
      if (data.session?.user) {
        const userData = {
          id: data.session.user.id,
          email: data.session.user.email,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setAuth(false);
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * logout signs the user out from Supabase.
   * Clears auth state and optionally removes localStorage data.
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setAuth(false);
      localStorage.removeItem("userData"); // remove stored user data
      localStorage.removeItem("username"); // remove stored username
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  /**
   * useEffect runs once on mount to fetch the session.
   * It also sets up a listener for auth state changes (login/logout).
   */
  useEffect(() => {
    fetchSession();

    // Listen for changes to auth state (sign in/out)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(!!session);
      // Optional: update localStorage with session user info
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
      } else {
        localStorage.removeItem("userData");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Provide `auth`, `authLoading`, and `logout` to all children
  return (
    <AuthContext.Provider value={{ auth, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context easily in any component.
 */
export const useAuth = () => useContext(AuthContext);
