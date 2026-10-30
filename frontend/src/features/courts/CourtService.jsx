import axios from 'axios';

const API_URL = 'http://localhost:5050/api/courts';

const getAllCourts = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getCourtById = async (courtId) => {
    const response = await axios.get(`${API_URL}/${courtId}`);
    return response.data;
};

const getTimeSlots = async (courtId, date) => {
    const response = await axios.get(`${API_URL}/${courtId}/timeslots`, {
        params: { date },
    });
    return response.data;
};

const CourtService = {
    getAllCourts,
    getCourtById,
    getTimeSlots,
};

export default CourtService;
