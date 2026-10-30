import axios from 'axios';

const API_URL = 'http://localhost:5050/api/auth/';

const register = async (userData) => {
    const response = await axios.post(API_URL + 'register', userData);
    return response.data;
};

const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData);
    return response.data;
};

const logout = async () => {
    await axios.post(API_URL + 'logout');
};

const AuthService = {
    register,
    login,
    logout,
};
export default AuthService;