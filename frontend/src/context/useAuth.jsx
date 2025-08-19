// React core hooks for state, lifecycle, and context
import { createContext, useContext, useState, useEffect } from "react";
// Custom API calls for authentication
import { get_auth, login } from '../api/endpoints';
// For navigating programmatically in React Router
import { useNavigate } from "react-router-dom";

// Create the authentication context (a "global" store for auth-related data)
const AuthContext = createContext();

// AuthProvider wraps parts of the app that need authentication logic
export const AuthProvider = ({ children }) => {

    // Holds whether the user is logged in or not
    const [auth, setAuth] = useState(false);

    // Tracks whether authentication status is still being checked (loading state)
    const [authLoading, setAuthLoading] = useState(true);

    // Allows us to redirect the user to another page
    const navigate = useNavigate();

    /**
     * Checks if the user is authenticated by calling our backend's `get_auth` endpoint.
     * If the backend says "yes", we set `auth` to true.
     * If it fails (error or invalid), we set `auth` to false.
     * When done, we stop the loading spinner by setting `authLoading` to false.
     */
    const check_auth = async () => {
        try {
            await get_auth()
            setAuth(true)
        } catch {
            setAuth(false)
        } finally {
            setAuthLoading(false)
        }
    }


    /**
     * Handles user login.
     * Takes `username` and `password`, sends them to the backend via `login()`.
     * If login succeeds:
     *  - We store the user's profile info in localStorage
     *  - We set `auth` to true
     *  - Redirect the user to their profile page
     * If login fails:
     *  - Show an alert message
     */
    const auth_login = async (username, password) => {
        const data = await login(username, password);

        if (data.success) {
            // Mark user as authenticated
            setAuth(true);

            // Save user profile data to localStorage so we can use it later
            const userData = {
                "username": data.user.username,
                "bio": data.user.bio,
                "email": data.user.email,
                "first_name": data.user.first_name,
                "last_name": data.user.last_name
            };
            localStorage.setItem('userData', JSON.stringify(userData));

            // Redirect to the user's profile page (e.g., /john)
            navigate(`/`);//`/${username}` for sending user to their profile
        } else {
            alert('Invalid username or password');
        }
    };

    /**
     * On page load (or when the route changes),
     * check if the user is still authenticated.
     * This helps keep the login state correct across page refreshes.
     */
    useEffect(() => {
        check_auth();
    }, [window.location.pathname]); // Runs again if the URL path changes

    // Make `auth`, `authLoading`, and `auth_login` available to any component
    return (
        <AuthContext.Provider value={{ auth, authLoading, auth_login }}>
            {children}
        </AuthContext.Provider>
    );
};

// A helper hook so components can easily use the authentication context
export const useAuth = () => useContext(AuthContext);
