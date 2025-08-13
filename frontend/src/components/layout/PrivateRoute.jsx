import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth"

const PrivateRoute = ({children}) => {

    const { auth, authLoading } = useAuth();

    if(authLoading) {
        return <>Loading...</>
    }

    if(auth){
        return children
    } else {
        return <Navigate to='/login' />
    }
}

export default PrivateRoute