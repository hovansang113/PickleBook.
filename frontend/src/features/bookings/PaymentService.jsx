import axios from 'axios';

const PAYMENT_API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/payments`;

const confirmVnpayReturn = async (queryParams) => {
    const response = await axios.get(`${PAYMENT_API_URL}/vnpay/return`, {
        params: queryParams,
    });
    return response.data;
};

const PaymentService = {
    confirmVnpayReturn,
};

export default PaymentService;
