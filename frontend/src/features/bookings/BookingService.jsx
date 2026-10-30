import axios from 'axios';
import useAuthStore from '../auth/useAuthStore';

const BOOKING_API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/bookings`;
const PAYMENT_API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/payments`;

const authHeader = () => {
    const token = useAuthStore.getState().user?.token;
    return { Authorization: `Bearer ${token}` };
};

const createBooking = async (bookingData) => {
    const response = await axios.post(BOOKING_API_URL, bookingData, {
        headers: authHeader(),
    });
    return response.data;
};

const createVNPayPayment = async (bookingId) => {
    const response = await axios.post(
        `${PAYMENT_API_URL}/vnpay`,
        null,
        { params: { bookingId }, headers: authHeader() },
    );
    return response.data;
};

const getMyBookings = async () => {
    const response = await axios.get(`${BOOKING_API_URL}/me`, {
        headers: authHeader(),
    });
    return response.data;
};

const cancelBooking = async (bookingId) => {
    const response = await axios.put(
        `${BOOKING_API_URL}/${bookingId}/cancel`,
        null,
        { headers: authHeader() },
    );
    return response.data;
};

const BookingService = {
    createBooking,
    createVNPayPayment,
    getMyBookings,
    cancelBooking,
};

export default BookingService;
