import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PaymentService from '../features/bookings/PaymentService';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');

    const responseCode = searchParams.get('vnp_ResponseCode');
    const amount = searchParams.get('vnp_Amount');
    const txnRef = searchParams.get('vnp_TxnRef');
    const bookingId = txnRef ? txnRef.split('_')[0] : null;

    useEffect(() => {
        const queryParams = Object.fromEntries(searchParams.entries());
        const request =
            Object.keys(queryParams).length === 0
                ? Promise.reject(new Error('Missing VNPay return params'))
                : PaymentService.confirmVnpayReturn(queryParams);

        request.then(() => setStatus('success')).catch(() => setStatus('failed'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (status === 'loading') {
        return (
            <div className="mx-auto max-w-md px-4 py-20 text-center">
                <p className="text-neutral-500">Đang xác nhận kết quả thanh toán...</p>
            </div>
        );
    }

    const isSuccess = status === 'success' && responseCode === '00';

    return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
            <div
                className={
                    isSuccess
                        ? 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-3xl text-success'
                        : 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-bg text-3xl text-error'
                }
            >
                {isSuccess ? '✓' : '✕'}
            </div>

            <h1 className="mt-6 font-headline text-2xl font-semibold text-neutral-900">
                {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
            </h1>

            <p className="mt-2 text-neutral-500">
                {isSuccess
                    ? 'Sân của bạn đã được xác nhận. Hẹn gặp bạn tại sân!'
                    : 'Giao dịch không thành công hoặc đã bị huỷ. Booking đã được huỷ giữ chỗ.'}
            </p>

            {isSuccess && (
                <div className="mt-6 rounded-xl border border-outline bg-neutral-50 p-4 text-left text-sm">
                    {bookingId && (
                        <div className="flex justify-between py-1">
                            <span className="text-neutral-500">Mã đặt sân</span>
                            <span className="font-medium text-neutral-900">#{bookingId}</span>
                        </div>
                    )}
                    {amount && (
                        <div className="flex justify-between py-1">
                            <span className="text-neutral-500">Số tiền đã thanh toán</span>
                            <span className="font-medium text-neutral-900">
                                {formatPrice(Number(amount) / 100)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <Link
                to="/courts"
                className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover"
            >
                Về trang đặt sân
            </Link>
        </div>
    );
};

export default PaymentResultPage;
