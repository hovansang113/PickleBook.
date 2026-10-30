import axios from 'axios';

const PAYMENT_API_URL = 'http://localhost:5050/api/payments';

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
