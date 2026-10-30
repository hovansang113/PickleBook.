import axios from 'axios';
import useAuthStore from '../auth/useAuthStore';

const API_URL = 'http://localhost:5050/api/admin';

const authHeader = () => {
    const token = useAuthStore.getState().user?.token;
    return { Authorization: `Bearer ${token}` };
};

const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/dashboard`, {
        headers: authHeader(),
    });
    return response.data;
};

const getAllCourts = async () => {
    const response = await axios.get(`${API_URL}/courts`, {
        headers: authHeader(),
    });
    return response.data;
};

const createCourt = async (courtData) => {
    const response = await axios.post(`${API_URL}/courts`, courtData, {
        headers: authHeader(),
    });
    return response.data;
};

const updateCourt = async (id, courtData) => {
    const response = await axios.put(`${API_URL}/courts/${id}`, courtData, {
        headers: authHeader(),
    });
    return response.data;
};

const deleteCourt = async (id) => {
    await axios.delete(`${API_URL}/courts/${id}`, {
        headers: authHeader(),
    });
};

const getAllBookings = async () => {
    const response = await axios.get(`${API_URL}/bookings`, {
        headers: authHeader(),
    });
    return response.data;
};

const cancelBooking = async (id) => {
    const response = await axios.put(`${API_URL}/bookings/${id}/cancel`, null, {
        headers: authHeader(),
    });
    return response.data;
};

const updateBookingStatus = async (id, status) => {
    const response = await axios.put(
        `${API_URL}/bookings/${id}/status`,
        { status },
        { headers: authHeader() },
    );
    return response.data;
};

const completeBooking = async (id, paymentMethod = 'CASH') => {
    const response = await axios.put(
        `${API_URL}/bookings/${id}/complete`,
        { paymentMethod },
        { headers: authHeader() },
    );
    return response.data;
};

const AdminService = {
    getDashboardStats,
    getAllCourts,
    createCourt,
    updateCourt,
    deleteCourt,
    getAllBookings,
    cancelBooking,
    updateBookingStatus,
    completeBooking,
};

export default AdminService;
