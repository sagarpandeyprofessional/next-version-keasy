import { Navigate } from "react-router"
import { useAuth } from "../../context/AuthContext"

const PrivateRoute = ({children}) => {

    const { session, loading } = useAuth()

    if(loading) {
        return <>Loading...</>
    }

    if(session){
        return children
    } else {
        return <Navigate to='/signin' />
    }
}

export default PrivateRoute