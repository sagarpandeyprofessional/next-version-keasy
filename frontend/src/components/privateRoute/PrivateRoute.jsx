import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"

const PrivateRoute = ({children}) => {

    const { auth, authLoading } = useAuth();

    if(authLoading) {
        return <>Loading...</>
    }

    if(auth){
        return children
    } else {
        return <Navigate to='/sign-in' />
    }
}

export default PrivateRoute