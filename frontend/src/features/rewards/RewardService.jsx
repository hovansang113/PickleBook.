import axios from 'axios';
import useAuthStore from '../auth/useAuthStore';

const API_URL = 'http://localhost:5050/api/rewards';

const authHeader = () => {
    const token = useAuthStore.getState().user?.token;
    return { Authorization: `Bearer ${token}` };
};

const getMySummary = async () => {
    const response = await axios.get(`${API_URL}/me/summary`, {
        headers: authHeader(),
    });
    return response.data;
};

const getActiveRewards = async () => {
    const response = await axios.get(API_URL, {
        headers: authHeader(),
    });
    return response.data;
};

const redeemReward = async (rewardId) => {
    const response = await axios.post(`${API_URL}/${rewardId}/redeem`, null, {
        headers: authHeader(),
    });
    return response.data;
};

const getMyRedemptions = async () => {
    const response = await axios.get(`${API_URL}/redemptions/me`, {
        headers: authHeader(),
    });
    return response.data;
};

const RewardService = {
    getMySummary,
    getActiveRewards,
    redeemReward,
    getMyRedemptions,
};

export default RewardService;
