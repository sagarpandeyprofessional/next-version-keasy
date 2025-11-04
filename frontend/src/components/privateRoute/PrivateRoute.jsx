import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const PrivateRoute = ({ children, requireUsername = true }) => {
    const { session, profile, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading...</span>
            </div>
        )
    }

    // Not authenticated - redirect to signin
    if (!session) {
        return <Navigate to='/signin' />
    }

    // If username is required but user doesn't have profile or username
    if (requireUsername && (!profile || !profile.username)) {
        // Don't redirect if already on username registration page
        if (location.pathname !== '/username-registration') {
            return <Navigate to='/username-registration' replace />
        }
    }

    // If on username registration page but user already has username, redirect to home
    if (location.pathname === '/username-registration' && profile?.username) {
        return <Navigate to='/' replace />
    }

    return children
}

export default PrivateRoute