import axios from 'axios'
import { SERVER_URL } from "./constants";

const BASE_URL = SERVER_URL;

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

// Login Endpoint
export const login = async (username, password) => {
    const response = await api.post('/auth/token/', {username, password});
    return response.data
}

// Check_Auth Endpoint
export const get_auth = async () => {
    const response = await api.get('/auth/authenticated/');
    return response.data
}

// Register Endpoint
export const register = async (username, email, firstName, lastName, password) => {
    const response = await api.post('/auth/register/', {username:username,  email:email, first_name:firstName, last_name:lastName, password:password});
    return response.data
}

// Token Refresh Endpoint
const refresh_token = async () => {
    const response = await api.post('/auth/token/refresh/');
    return response.data
}
// Creating Axios Intercepter. when user access token timeout in 5 mins and get
// 401 unauthorithed error, it will auto-takes access token and refreshes access token
api.interceptors.response.use(
    (response) => response,
    async error => {
        const original_request = error.config

        if(error.response?.status === 401 && !original_request._retry) {
            original_request._retry = true

            try {
                await refresh_token();
                return api(original_request);
            } catch (refreshError) {
                window.location.href = '/auth/login'
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

// Logout Endpoint
export const logout = async () => {
    const response = await api.post('/auth/logout/')
    return response.data
}

// Get User Data Endpoint
export const get_user_profile_data = async (username) => {
    const response = await api.get(`/auth/user_data/${username}/`);
    return response.data;
}

// Update User Data Endpoint
export const update_user = async (values) => {
    const response = await api.patch('/auth/update_user/', values, { headers: {'Content-Type': 'multipart/form-data'}})
    // last part headers lets us to upload images to backend by that content type
    return response.data
}